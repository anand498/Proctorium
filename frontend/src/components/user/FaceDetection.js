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
            <div className="container text-center">
                <div className="card shadow-lg" style={{ maxWidth: '500px', margin: '2rem auto' }}>
                    <div className="card-body">
                        <div className="flex flex-col items-center gap-4">
                            <div className="loading-spinner"></div>
                            <h3 className="text-xl font-semibold text-primary">Initializing AI Proctoring</h3>
                            <p className="text-secondary">
                                Please wait while we load the face detection model for secure monitoring.
                            </p>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    .loading-spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid var(--color-gray-200);
                        border-top: 4px solid var(--color-primary);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen dark-proctoring-bg">
            {/* Header with exam info */}
            <div className="dark-header border-b border-gray-600 px-4 py-3">
                <div className="container flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-primary glow-text">Exam in Progress</h2>
                        <div className="flex items-center gap-2">
                            <div className="status-indicator active"></div>
                            <span className="text-sm font-medium text-success">AI Monitoring Active</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-xs text-muted">Exam ID</div>
                            <div className="font-mono font-bold text-primary">{examId}</div>
                        </div>

                        {onComplete && (
                            <button
                                onClick={onComplete}
                                className="btn btn-primary"
                            >
                                Complete Exam
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="container py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video feed */}
                    <div className="lg:col-span-2">
                        <div className="card" style={{ background: 'transparent', boxShadow: 'none' }}>
                            <div className="card-header" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="camera-icon">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary">Camera Feed</h3>
                                        <p className="text-sm text-secondary">Ensure you remain visible and centered</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body" style={{ background: 'transparent', padding: '0' }}>
                                <div className="video-container" style={{
                                    position: 'relative',
                                    width: '100%',
                                    maxWidth: '640px',
                                    margin: '0 auto',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    backgroundColor: 'transparent'
                                }}>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block',
                                            backgroundColor: 'transparent',
                                            filter: 'none'
                                        }}
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            pointerEvents: 'none',
                                            backgroundColor: 'transparent'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status panel */}
                    <div className="space-y-4">
                        {/* Detection status */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold">Status</h3>
                            </div>

                            <div className="card-body space-y-3">
                                <div className="status-item">
                                    <span className="status-label">Detection Status</span>
                                    <span className={`status-value ${faceCount === 1 ? 'success' : 'warning'}`}>
                                        {faceCount === 1 ? 'Normal' : faceCount === 0 ? 'No Face' : 'Multiple Faces'}
                                    </span>
                                </div>

                                <div className="status-item">
                                    <span className="status-label">Faces Detected</span>
                                    <span className="status-value">{faceCount}</span>
                                </div>

                                <div className="status-item">
                                    <span className="status-label">AI Model</span>
                                    <span className={`status-value ${model ? 'success' : 'error'}`}>
                                        {model ? 'Active' : 'Loading'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent flags */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold">Monitoring Log</h3>
                            </div>

                            <div className="card-body">
                                {flags.length > 0 ? (
                                    <div className="space-y-2">
                                        {flags.slice(-5).map((flag, index) => (
                                            <div key={index} className={`flag-item ${flag.includes('Normal') ? 'normal' : 'warning'}`}>
                                                <div className="flag-dot"></div>
                                                <span className="flag-text">{flag}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted text-sm">All systems normal</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dark-proctoring-bg {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
                    position: relative;
                    overflow: hidden;
                }

                .dark-proctoring-bg::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background:
                        radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 40%),
                        radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 40%);
                    pointer-events: none;
                }

                .dark-header {
                    background: rgba(30, 41, 59, 0.9);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(75, 85, 99, 0.3);
                }

                .glow-text {
                    text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
                }

.camera-icon {
                    animation: pulse 2s ease-in-out infinite;
                }

                .video-frame {                .video-frame {
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    border: 2px solid transparent;
                    border-radius: var(--border-radius-lg);
                    background: linear-gradient(45deg,
                        rgba(59, 130, 246, 0.5),
                        rgba(16, 185, 129, 0.5),
                        rgba(245, 158, 11, 0.3)
                    );
                    background-size: 200% 200%;
                    animation: borderGlow 3s linear infinite;
                    pointer-events: none;
                    z-index: 1;
                }

                @keyframes borderGlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .min-h-screen {
                    min-height: 100vh;
                }

                .bg-white {
                    background-color: var(--color-white);
                }

                .border-b {
                    border-bottom: 1px solid var(--color-gray-200);
                }

                .border-gray-200 {
                    border-color: var(--color-gray-200);
                }

                .px-4 {
                    padding-left: 1rem;
                    padding-right: 1rem;
                }

                .py-3 {
                    padding-top: 0.75rem;
                    padding-bottom: 0.75rem;
                }

                .py-6 {
                    padding-top: 1.5rem;
                    padding-bottom: 1.5rem;
                }

                .grid {
                    display: grid;
                }

                .grid-cols-1 {
                    grid-template-columns: repeat(1, minmax(0, 1fr));
                }

                .gap-6 {
                    gap: 1.5rem;
                }

                .gap-4 {
                    gap: 1rem;
                }

                .gap-2 {
                    gap: 0.5rem;
                }

                .space-y-4 > * + * {
                    margin-top: 1rem;
                }

                .space-y-3 > * + * {
                    margin-top: 0.75rem;
                }

                .space-y-2 > * + * {
                    margin-top: 0.5rem;
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: var(--color-gray-400);
                }

                .status-indicator.active {
                    background-color: var(--color-secondary);
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }

                .video-container {
                    position: relative;
                    width: 100%;
                    max-width: 640px;
                    margin: 0 auto;
                    border-radius: var(--border-radius-lg);
                    overflow: hidden;
                    background-color: var(--color-gray-900);
                }

                .video-feed {
                    width: 100%;
                    height: auto;
                    display: block;
                }

                .video-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                .status-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .status-label {
                    font-size: var(--font-size-sm);
                    color: var(--text-secondary);
                }

                .status-value {
                    font-size: var(--font-size-sm);
                    font-weight: var(--font-weight-medium);
                    color: var(--text-primary);
                }

                .status-value.success {
                    color: var(--color-secondary);
                }

                .status-value.warning {
                    color: var(--color-warning);
                }

                .status-value.error {
                    color: var(--color-danger);
                }

                .flag-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    border-radius: var(--border-radius-sm);
                    background-color: var(--color-gray-50);
                }

                .flag-item.warning {
                    background-color: var(--color-warning-light);
                }

                .flag-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background-color: var(--color-secondary);
                }

                .flag-item.warning .flag-dot {
                    background-color: var(--color-warning);
                }

                .flag-text {
                    font-size: var(--font-size-xs);
                    color: var(--text-primary);
                }

                @media (min-width: 1024px) {
                    .lg\:col-span-2 {
                        grid-column: span 2 / span 2;
                    }

                    .grid-cols-1.lg\:grid-cols-3 {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }
            `}</style>
        </div>
    );
};

export default FaceDetection;
