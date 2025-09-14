import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { proctoringAPI } from '../services/api';

interface FaceDetectionProps {
  examId: string;
  onFlagDetected: (flagType: string, description: string) => void;
  isActive: boolean;
  isReady?: boolean; // New prop for verification phase
}

const FaceDetection: React.FC<FaceDetectionProps> = ({ examId, onFlagDetected, isActive, isReady = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [lastFlagTime, setLastFlagTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Flag cooldown period (5 seconds)
  const FLAG_COOLDOWN = 5000;

  const loadModel = useCallback(async () => {
    try {
      setIsModelLoading(true);
      setModelError(null);

      console.log('Initializing TensorFlow.js...');
      await tf.ready();

      console.log('Loading BlazeFace model...');
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
      console.log('BlazeFace model loaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading BlazeFace model:', error);
      setModelError(errorMessage);
      setModel(null);

      // Retry loading after 3 seconds
      setTimeout(() => {
        console.log('Retrying model load...');
        loadModel();
      }, 3000);
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      // Stop existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      setStream(mediaStream);

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;

        // Add event listeners for better stream management
        video.onloadedmetadata = () => {
          console.log('Video metadata loaded');
        };

        video.oncanplay = () => {
          console.log('Video can start playing');
        };

        video.onerror = (error) => {
          console.error('Video error:', error);
        };

        // Ensure video plays and handles loading
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video started playing successfully');
            })
            .catch(error => {
              console.error('Error playing video:', error);
            });
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      onFlagDetected('camera_error', 'Unable to access camera');
    }
  }, [onFlagDetected, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureScreenshot = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
  }, []);

  const uploadScreenshot = useCallback(async (flagType: string) => {
    try {
      const screenshot = await captureScreenshot();
      if (!screenshot) return null;

      const timestamp = new Date().toISOString();
      const file = new File([screenshot], `${flagType}_${timestamp}.jpg`, { type: 'image/jpeg' });
      
      const response = await proctoringAPI.uploadScreenshot(file, examId, flagType, timestamp);
      return response.screenshot_url;
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      return null;
    }
  }, [examId, captureScreenshot]);

  const detectFaces = useCallback(async () => {
    if (!model || !videoRef.current || !isActive) return;

    try {
      const video = videoRef.current;
      if (video.readyState !== 4) return;

      const predictions = await model.estimateFaces(video, false);
      const currentTime = Date.now();
      
      if (predictions.length === 0) {
        // No face detected
        if (faceDetected && currentTime - lastFlagTime > FLAG_COOLDOWN) {
          setFaceDetected(false);
          setLastFlagTime(currentTime);
          
          const screenshotUrl = await uploadScreenshot('no_face_detected');
          onFlagDetected('no_face_detected', 'No face detected in the camera feed');
        }
      } else if (predictions.length === 1) {
        // Single face detected (normal)
        setFaceDetected(true);
      } else if (predictions.length > 1) {
        // Multiple faces detected
        if (currentTime - lastFlagTime > FLAG_COOLDOWN) {
          setLastFlagTime(currentTime);
          
          const screenshotUrl = await uploadScreenshot('multiple_faces');
          onFlagDetected('multiple_faces', `${predictions.length} faces detected in the camera feed`);
        }
      }

      // Optional: Draw face detection boxes for debugging (disabled to prevent blinking)
      // Uncomment the block below if you need visual debugging
      /*
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          predictions.forEach((prediction) => {
            const start = prediction.topLeft as [number, number];
            const end = prediction.bottomRight as [number, number];
            const size = [end[0] - start[0], end[1] - start[1]];

            ctx.strokeStyle = faceDetected ? '#00ff00' : '#ff0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(start[0], start[1], size[0], size[1]);
          });
        }
      }
      */
    } catch (error) {
      console.error('Error during face detection:', error);
    }
  }, [model, isActive, faceDetected, lastFlagTime, onFlagDetected, uploadScreenshot]);

  // Initialize model and camera
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  // Initialize camera when component becomes ready or active
  useEffect(() => {
    if ((isReady || isActive) && model && !stream) {
      startCamera();
    }
  }, [isReady, isActive, model, stream, startCamera]);

  // Cleanup when component unmounts or becomes inactive
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Face detection loop
  useEffect(() => {
    if (!isActive || !model) return;

    const interval = setInterval(detectFaces, 1000); // Check every second
    return () => clearInterval(interval);
  }, [isActive, model, detectFaces]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        const currentTime = Date.now();
        if (currentTime - lastFlagTime > FLAG_COOLDOWN) {
          setLastFlagTime(currentTime);
          onFlagDetected('tab_switch', 'User switched away from the exam tab');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, lastFlagTime, onFlagDetected]);

  return (
    <div className="relative">
      <div className="relative w-64 h-48 bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          controls={false}
          preload="auto"
          style={{ backgroundColor: '#000' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0"
          style={{ zIndex: -1 }}
        />
        
        {/* Status indicators */}
        <div className="absolute top-2 left-2 flex gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-red-500' : 
            isReady ? 'bg-blue-500' : 
            'bg-gray-500'
          }`} />
          <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-yellow-500'}`} />
        </div>
        
        {/* Ready/Active status overlay */}
        {isReady && !isActive && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Ready
          </div>
        )}
        {isActive && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">
            Recording
          </div>
        )}
        
        {/* Loading indicator */}
        {isModelLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-sm flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading AI model...
            </div>
          </div>
        )}

        {/* Error indicator */}
        {modelError && !isModelLoading && (
          <div className="absolute inset-0 bg-red-900 bg-opacity-75 flex items-center justify-center">
            <div className="text-white text-xs text-center p-2">
              <div>Model Error</div>
              <div className="text-red-200">{modelError}</div>
              <div className="mt-1">Retrying...</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Status text */}
      <div className="mt-2 text-xs text-gray-600">
        <div>Camera: {isActive ? 'Active' : 'Inactive'}</div>
        <div>Face: {faceDetected ? 'Detected' : 'Not detected'}</div>
        <div>Model: {
          isModelLoading ? 'Loading...' :
          modelError ? 'Error (retrying)' :
          model ? 'Ready' : 'Initializing'
        }</div>
      </div>
    </div>
  );
};

export default FaceDetection;
