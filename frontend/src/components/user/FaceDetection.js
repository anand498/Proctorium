import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { captureScreenshot } from '../../utils/helpers';

const FaceDetection = ({ examId, onFlagsDetected, onComplete }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const isRunningRef = useRef(false); // Use ref for detection loop state
    const lastScreenshotRef = useRef({}); // Track last screenshot time for each flag type
    const [model, setModel] = useState(null);
    const [isProctoring, setIsProctoring] = useState(false);
    const [flags, setFlags] = useState([]);
    const [faceCount, setFaceCount] = useState(0);
    const [isModelLoading, setIsModelLoading] = useState(true);

    // Screenshot throttling - minimum 5 seconds between screenshots of same type
    const SCREENSHOT_THROTTLE_MS = 5000;

    useEffect(() => {
        const loadModel = async () => {
            try {
                console.log('🔄 Loading BlazeFace model...');
                await tf.ready();
                const loadedModel = await blazeface.load();
                console.log('✅ BlazeFace model loaded successfully:', loadedModel);
                setModel(loadedModel);
                setIsModelLoading(false);
            } catch (error) {
                console.error('❌ Error loading BlazeFace model:', error);
                setIsModelLoading(false);
            }
        };
        loadModel();
    }, []);

    useEffect(() => {
        console.log('🔍 Model effect triggered:', { 
            model: !!model, 
            isProctoring, 
            isModelLoading 
        });
        if (model && !isProctoring && !isModelLoading) {
            console.log('🚀 Model loaded, starting proctoring system...');
            startProctoring();
        }
    }, [model, isModelLoading]); // Removed isProctoring dependency

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            console.log('🧹 FaceDetection component unmounting, cleaning up...');
            isRunningRef.current = false; // Stop detection loop
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const startProctoring = async () => {
        try {
            console.log('🎥 Starting proctoring...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 640 }, 
                    height: { ideal: 480 } 
                },
                audio: false
            });
            console.log('📹 Camera stream obtained:', stream);
            videoRef.current.srcObject = stream;
            
            // Wait for video to be ready and play
            await videoRef.current.play();
            console.log('▶️ Video play() called');
            
            await new Promise((resolve) => {
                if (videoRef.current.readyState >= 2) {
                    console.log('✅ Video already ready, readyState:', videoRef.current.readyState);
                    return resolve();
                }
                console.log('⏳ Waiting for video metadata...');
                videoRef.current.onloadedmetadata = () => {
                    console.log('✅ Video metadata loaded, readyState:', videoRef.current.readyState);
                    resolve();
                };
            });
            
            console.log('🎬 Video is ready, starting face detection monitoring...');
            
            console.log('🔄 Setting states and starting detection...');
            isRunningRef.current = true; // Set ref immediately
            setIsProctoring(true);
            
            // Start detection immediately
            console.log('🔁 Face detection monitoring started');
            detectFaces();
        } catch (error) {
            console.error('❌ Error starting camera:', error);
        }
    };

    const detectFaces = async () => {
        if (!isRunningRef.current) {
            return;
        }
        
        if (!model) {
            console.log('❌ Early return: no model');
            return;
        }
        
        if (!videoRef.current) {
            console.log('❌ Early return: no video element');
            return;
        }
        
        try {
            // Check if video is ready
            if (!videoRef.current.videoWidth || !videoRef.current.videoHeight || videoRef.current.readyState < 2) {
                if (isRunningRef.current) {
                    requestAnimationFrame(detectFaces);
                }
                return;
            }
            
            const predictions = await model.estimateFaces(videoRef.current, false);
            
            // Only log when there are issues (no face or multiple faces)
            if (predictions.length === 0) {
                console.log('⚠️ No face detected');
            } else if (predictions.length > 1) {
                console.log(`⚠️ Multiple faces detected: ${predictions.length}`);
            }
            
            handlePredictions(predictions);
            drawBoundingBoxes(predictions);
        } catch (error) {
            console.error('❌ Error during face detection:', error);
        }
        
        if (isRunningRef.current) {
            requestAnimationFrame(detectFaces);
        }
    };

    const handlePredictions = (predictions) => {
        const currentFaceCount = predictions.length;
        
        // Only update and log if face count changed and it's a problematic situation
        if (currentFaceCount !== faceCount) {
            setFaceCount(currentFaceCount);
            
            // Only log when there are issues
            if (currentFaceCount === 0) {
                console.log('🚨 No face detected - triggering alert');
            } else if (currentFaceCount > 1) {
                console.log(`🚨 Multiple faces detected (${currentFaceCount}) - triggering alert`);
            }
        }
        
        const newFlags = [];
        
        if (currentFaceCount === 0) {
            newFlags.push('No face detected');
        } else if (currentFaceCount === 1) {
            newFlags.push('Face detected - Normal');
        } else if (currentFaceCount > 1) {
            newFlags.push(`Multiple faces detected: ${currentFaceCount}`);
        }
        
        // Update flags
        setFlags(newFlags);
        
        // Call callback if provided
        if (onFlagsDetected && typeof onFlagsDetected === 'function') {
            onFlagsDetected(newFlags);
        }
        
        // Capture screenshot if suspicious activity
        if (currentFaceCount === 0 || currentFaceCount > 1) {
            const flagType = currentFaceCount === 0 ? 'no_face_detected' : 'multiple_faces_detected';
            const now = Date.now();
            const lastScreenshot = lastScreenshotRef.current[flagType] || 0;
            
            // Throttle screenshots - only capture if enough time has passed
            if (now - lastScreenshot > SCREENSHOT_THROTTLE_MS) {
                console.log(`📸 Capturing screenshot for suspicious activity: ${flagType}`);
                lastScreenshotRef.current[flagType] = now;
                
                if (typeof captureScreenshot === 'function') {
                    captureScreenshot(videoRef.current, examId, flagType)
                        .then(result => {
                            if (result) {
                                console.log('✅ Screenshot submitted successfully for:', flagType);
                            } else {
                                console.log('❌ Screenshot submission failed for:', flagType);
                            }
                        })
                        .catch(error => {
                            console.error('❌ Screenshot error for', flagType, ':', error);
                        });
                } else {
                    console.error('❌ captureScreenshot function not available');
                }
            } else {
                console.log(`⏰ Screenshot throttled for ${flagType} (last: ${Math.round((now - lastScreenshot)/1000)}s ago)`);
            }
        }
    };

    const drawBoundingBoxes = (predictions) => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const video = videoRef.current;
            
            // Ensure canvas matches video dimensions
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            predictions.forEach((prediction, idx) => {
                const [x1, y1] = prediction.topLeft;
                const [x2, y2] = prediction.bottomRight;
                const x = x1, y = y1, w = x2 - x1, h = y2 - y1;
                
                // Set color based on face count
                ctx.strokeStyle = predictions.length > 1 ? '#f59e0b' : '#22c55e';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, w, h);
                
                // Label background
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(x, y - 18, 70, 18);
                
                // Label text
                ctx.fillStyle = '#fff';
                ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
                ctx.fillText(`Face ${idx + 1}`, x + 6, y - 5);
            });
        }
    };

    const stopProctoring = () => {
        console.log('🛑 Stopping proctoring...');
        isRunningRef.current = false; // Stop the detection loop
        setIsProctoring(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (onComplete && typeof onComplete === 'function') {
            onComplete();
        }
    };

    if (isModelLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <h3>Loading face detection model...</h3>
                <p>Please wait while we initialize the AI model for proctoring.</p>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Proctoring Active</h3>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    style={{ 
                        width: '640px', 
                        height: '480px',
                        border: '2px solid #ccc',
                        borderRadius: '8px'
                    }} 
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '640px',
                        height: '480px',
                        pointerEvents: 'none'
                    }}
                />
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <p><strong>Faces detected:</strong> {faceCount}</p>
                <p><strong>Status:</strong> {isProctoring ? 'Monitoring...' : 'Stopped'}</p>
                <p><strong>Model:</strong> {model ? '✅ Loaded' : '❌ Not loaded'}</p>
                <p><strong>Video:</strong> {videoRef.current?.videoWidth ? `✅ ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}` : '❌ Not ready'}</p>
                <p><strong>Video State:</strong> {videoRef.current?.readyState || 'Unknown'}</p>
            </div>
            
            <div style={{ marginTop: '15px' }}>
                <button 
                    onClick={isProctoring ? stopProctoring : startProctoring}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: isProctoring ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    {isProctoring ? 'Stop Proctoring' : 'Start Proctoring'}
                </button>
                
                {onComplete && (
                    <button 
                        onClick={onComplete}
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Complete Exam
                    </button>
                )}
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <h4>Detected Issues:</h4>
                {flags.length > 0 ? (
                    <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                        {flags.map((flag, index) => (
                            <li key={index} style={{ 
                                padding: '5px',
                                color: flag.includes('Normal') ? 'green' : 'red'
                            }}>
                                {flag}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No issues detected</p>
                )}
            </div>
        </div>
    );
};

export default FaceDetection;
