import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { proctoringAPI } from '../services/api';

interface FaceDetectionProps {
  examId: string;
  onFlagDetected: (flagType: string, description: string) => void;
  isActive: boolean;
}

const FaceDetection: React.FC<FaceDetectionProps> = ({ examId, onFlagDetected, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [lastFlagTime, setLastFlagTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Flag cooldown period (5 seconds)
  const FLAG_COOLDOWN = 5000;

  const loadModel = useCallback(async () => {
    try {
      setIsModelLoading(true);
      await tf.ready();
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
      console.log('BlazeFace model loaded successfully');
    } catch (error) {
      console.error('Error loading BlazeFace model:', error);
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      onFlagDetected('camera_error', 'Unable to access camera');
    }
  }, [onFlagDetected]);

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

      // Draw face detection boxes (optional, for debugging)
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
    } catch (error) {
      console.error('Error during face detection:', error);
    }
  }, [model, isActive, faceDetected, lastFlagTime, onFlagDetected, uploadScreenshot]);

  // Initialize model and camera
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  useEffect(() => {
    if (isActive && !isModelLoading) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, isModelLoading, startCamera, stopCamera]);

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
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ display: 'none' }} // Hide canvas, only used for processing
        />
        
        {/* Status indicators */}
        <div className="absolute top-2 left-2 flex gap-2">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-500' : 'bg-gray-500'}`} />
          <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-yellow-500'}`} />
        </div>
        
        {/* Loading indicator */}
        {isModelLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-sm">Loading AI model...</div>
          </div>
        )}
      </div>
      
      {/* Status text */}
      <div className="mt-2 text-xs text-gray-600">
        <div>Camera: {isActive ? 'Active' : 'Inactive'}</div>
        <div>Face: {faceDetected ? 'Detected' : 'Not detected'}</div>
        <div>Model: {isModelLoading ? 'Loading...' : 'Ready'}</div>
      </div>
    </div>
  );
};

export default FaceDetection;
