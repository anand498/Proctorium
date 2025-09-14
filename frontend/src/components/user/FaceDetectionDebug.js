import React, { useEffect, useRef, useState } from 'react';

const FaceDetectionDebug = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [logs, setLogs] = useState([]);
    const [model, setModel] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [faceCount, setFaceCount] = useState(0);

    const addLog = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
        console.log(message);
    };

    const loadTensorFlow = async () => {
        try {
            addLog('🔄 Loading TensorFlow.js...');
            
            // Try to load TensorFlow from CDN instead
            if (!window.tf) {
                addLog('❌ TensorFlow.js not found in window.tf');
                return false;
            }
            
            await window.tf.ready();
            addLog('✅ TensorFlow.js ready');
            addLog(`📊 TensorFlow version: ${window.tf.version.tfjs}`);
            addLog(`🏃‍♂️ Backend: ${window.tf.getBackend()}`);
            
            return true;
        } catch (error) {
            addLog(`❌ TensorFlow error: ${error.message}`);
            return false;
        }
    };

    const loadBlazeFace = async () => {
        try {
            addLog('🔄 Loading BlazeFace model...');
            
            if (!window.blazeface) {
                addLog('❌ BlazeFace not found in window.blazeface');
                return null;
            }
            
            const model = await window.blazeface.load();
            addLog('✅ BlazeFace model loaded successfully');
            return model;
        } catch (error) {
            addLog(`❌ BlazeFace error: ${error.message}`);
            return null;
        }
    };

    const startCamera = async () => {
        try {
            addLog('🎥 Starting camera...');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            
            addLog('📹 Camera stream obtained');
            videoRef.current.srcObject = stream;
            
            await videoRef.current.play();
            addLog('▶️ Video playing');
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                if (videoRef.current.readyState >= 2) {
                    resolve();
                } else {
                    videoRef.current.onloadedmetadata = resolve;
                }
            });
            
            addLog(`🎬 Video ready: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
            return true;
        } catch (error) {
            addLog(`❌ Camera error: ${error.message}`);
            return false;
        }
    };

    const detectFaces = async () => {
        addLog('🔍 detectFaces() called');
        
        if (!isRunning) {
            addLog('❌ Detection loop stopped (isRunning = false)');
            return;
        }
        
        if (!model) {
            addLog('❌ No model available');
            return;
        }
        
        if (!videoRef.current) {
            addLog('❌ No video element');
            return;
        }

        try {
            if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
                addLog('⏳ Video dimensions not ready, retrying...');
                requestAnimationFrame(detectFaces);
                return;
            }

            addLog(`🎯 Running face detection on ${videoRef.current.videoWidth}x${videoRef.current.videoHeight} video`);
            
            const predictions = await model.estimateFaces(videoRef.current, false);
            
            addLog(`👥 Detection result: ${predictions.length} faces found`);
            if (predictions.length > 0) {
                addLog(`📍 Face details: ${JSON.stringify(predictions.map(p => ({ 
                    topLeft: p.topLeft, 
                    bottomRight: p.bottomRight 
                })))}`);
            }
            
            if (predictions.length !== faceCount) {
                setFaceCount(predictions.length);
                addLog(`� Face count updated: ${predictions.length}`);
            }

            // Draw bounding boxes
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                predictions.forEach((prediction, idx) => {
                    const [x1, y1] = prediction.topLeft;
                    const [x2, y2] = prediction.bottomRight;
                    
                    ctx.strokeStyle = predictions.length > 1 ? '#f59e0b' : '#22c55e';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                    
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.fillRect(x1, y1 - 20, 80, 20);
                    ctx.fillStyle = '#fff';
                    ctx.font = '14px Arial';
                    ctx.fillText(`Face ${idx + 1}`, x1 + 5, y1 - 5);
                });
                
                addLog(`🎨 Drew ${predictions.length} bounding boxes on canvas`);
            }

        } catch (error) {
            addLog(`❌ Detection error: ${error.message}`);
            console.error('Full detection error:', error);
        }

        if (isRunning) {
            addLog('🔁 Scheduling next detection frame...');
            requestAnimationFrame(detectFaces);
        } else {
            addLog('⏹️ Detection loop ending');
        }
    };

    const handleStart = async () => {
        addLog('🚀 Starting face detection test...');
        
        // Load TensorFlow
        const tfReady = await loadTensorFlow();
        if (!tfReady) return;
        
        // Load BlazeFace
        const blazeModel = await loadBlazeFace();
        if (!blazeModel) return;
        
        setModel(blazeModel);
        addLog('📝 Model state updated');
        
        // Start camera
        const cameraReady = await startCamera();
        if (!cameraReady) return;
        
        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Start detection
        addLog('🔄 Setting isRunning to true...');
        setIsRunning(true);
        
        // Wait a bit for state to update
        setTimeout(() => {
            addLog('🔁 Starting detection loop...');
            detectFaces();
        }, 100);
    };

    const handleStop = () => {
        setIsRunning(false);
        setFaceCount(0);
        
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        
        addLog('⏹️ Stopped');
    };

    // Load TensorFlow and BlazeFace from CDN
    useEffect(() => {
        const loadScripts = () => {
            // Check if scripts are already loaded
            if (window.tf && window.blazeface) {
                addLog('✅ TensorFlow.js and BlazeFace already loaded');
                return;
            }

            addLog('📥 Loading TensorFlow.js and BlazeFace from CDN...');
            
            // Load TensorFlow.js
            const tfScript = document.createElement('script');
            tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js';
            tfScript.onload = () => {
                addLog('✅ TensorFlow.js script loaded');
                
                // Load BlazeFace
                const blazeScript = document.createElement('script');
                blazeScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface/dist/blazeface.min.js';
                blazeScript.onload = () => {
                    addLog('✅ BlazeFace script loaded');
                };
                blazeScript.onerror = () => {
                    addLog('❌ Failed to load BlazeFace script');
                };
                document.head.appendChild(blazeScript);
            };
            tfScript.onerror = () => {
                addLog('❌ Failed to load TensorFlow.js script');
            };
            document.head.appendChild(tfScript);
        };

        loadScripts();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Face Detection Debug Tool</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={isRunning ? handleStop : handleStart}
                    disabled={isRunning && !model}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: isRunning ? '#dc3545' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    {isRunning ? 'Stop' : 'Start'} Detection
                </button>
                
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    Faces: {faceCount}
                </span>
            </div>

            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        width: '640px',
                        height: '480px',
                        border: '2px solid #ccc',
                        borderRadius: '8px',
                        display: 'block'
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
                <h3>Debug Logs:</h3>
                <div style={{
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '10px',
                    height: '300px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                }}>
                    {logs.map((log, index) => (
                        <div key={index} style={{ marginBottom: '2px' }}>
                            {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FaceDetectionDebug;
