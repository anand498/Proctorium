import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Monitor, Wifi, Globe, CheckCircle, XCircle, AlertTriangle, RefreshCw, Clipboard, Volume2 } from 'lucide-react';
import FaceDetection from './FaceDetection';

interface SystemCheck {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'checking' | 'passed' | 'failed' | 'warning';
  required: boolean;
  details?: string;
  icon: React.ReactNode;
}

interface SystemVerificationProps {
  onVerificationComplete: (allPassed: boolean) => void;
  examId: string;
}

const SystemVerification: React.FC<SystemVerificationProps> = ({ onVerificationComplete, examId }) => {
  const [checks, setChecks] = useState<SystemCheck[]>([
    {
      id: 'camera',
      name: 'Camera Access',
      description: 'Camera permission and functionality test',
      status: 'pending',
      required: true,
      icon: <Camera className="w-5 h-5" />
    },
    {
      id: 'microphone',
      name: 'Microphone Access',
      description: 'Microphone permission test (optional)',
      status: 'pending',
      required: false,
      icon: <Volume2 className="w-5 h-5" />
    },
    {
      id: 'network',
      name: 'Network Connectivity',
      description: 'Internet connection and speed test',
      status: 'pending',
      required: true,
      icon: <Wifi className="w-5 h-5" />
    },
    {
      id: 'browser',
      name: 'Browser Compatibility',
      description: 'Browser features and compatibility check',
      status: 'pending',
      required: true,
      icon: <Monitor className="w-5 h-5" />
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [allChecksComplete, setAllChecksComplete] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const updateCheckStatus = useCallback((id: string, status: SystemCheck['status'], details?: string) => {
    setChecks(prev => prev.map(check => 
      check.id === id ? { ...check, status, details } : check
    ));
  }, []);

  const checkCamera = useCallback(async () => {
    updateCheckStatus('camera', 'checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      // Test if we can actually get video frames
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            resolve(true);
          } else {
            reject(new Error('Camera not providing video frames'));
          }
        };
        video.onerror = reject;
        setTimeout(() => reject(new Error('Camera test timeout')), 5000);
      });

      setCameraStream(stream);
      updateCheckStatus('camera', 'passed', `Resolution: ${video.videoWidth}x${video.videoHeight}`);
    } catch (error) {
      updateCheckStatus('camera', 'failed', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [updateCheckStatus]);

  const checkMicrophone = useCallback(async () => {
    updateCheckStatus('microphone', 'checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Test audio levels
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();
      
      updateCheckStatus('microphone', 'passed', 'Microphone access granted');
    } catch (error) {
      updateCheckStatus('microphone', 'warning', 'Microphone not available (optional)');
    }
  }, [updateCheckStatus]);

  const checkNetwork = useCallback(async () => {
    updateCheckStatus('network', 'checking');
    try {
      const startTime = performance.now();
      
      // Test basic connectivity
      const response = await fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      
      // Test connection speed with a small file
      const speedTestStart = performance.now();
      await fetch('https://httpbin.org/bytes/1024', { cache: 'no-cache' });
      const speedTestEnd = performance.now();
      const speedTestTime = speedTestEnd - speedTestStart;
      
      if (latency < 1000 && speedTestTime < 2000) {
        updateCheckStatus('network', 'passed', `Latency: ${latency}ms, Speed test: ${speedTestTime}ms`);
      } else {
        updateCheckStatus('network', 'warning', `Slow connection - Latency: ${latency}ms`);
      }
    } catch (error) {
      updateCheckStatus('network', 'failed', 'No internet connection detected');
    }
  }, [updateCheckStatus]);

  const checkBrowser = useCallback(async () => {
    updateCheckStatus('browser', 'checking');
    
    const features = {
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webRTC: !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection),
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      indexedDB: !!window.indexedDB,
      webWorkers: !!window.Worker,
      clipboard: !!(navigator.clipboard && navigator.clipboard.writeText),
      visibilityAPI: !!(document.hidden !== undefined),
      fullscreen: !!(document.fullscreenEnabled || (document as any).webkitFullscreenEnabled)
    };
    
    const requiredFeatures = ['getUserMedia', 'localStorage', 'visibilityAPI'];
    const missingRequired = requiredFeatures.filter(feature => !features[feature as keyof typeof features]);
    
    if (missingRequired.length === 0) {
      const supportedCount = Object.values(features).filter(Boolean).length;
      updateCheckStatus('browser', 'passed', `${supportedCount}/${Object.keys(features).length} features supported`);
    } else {
      updateCheckStatus('browser', 'failed', `Missing required features: ${missingRequired.join(', ')}`);
    }
  }, [updateCheckStatus]);

  const runAllChecks = useCallback(async () => {
    setIsRunning(true);
    setAllChecksComplete(false);
    
    // Reset all checks to pending
    setChecks(prev => prev.map(check => ({ ...check, status: 'pending' as const })));
    
    // Run checks in parallel for better performance
    await Promise.all([
      checkCamera(),
      checkMicrophone(),
      checkNetwork(),
      checkBrowser()
    ]);
    
    setIsRunning(false);
    setAllChecksComplete(true);
  }, [checkCamera, checkMicrophone, checkNetwork, checkBrowser]);

  // Check if all required checks have passed
  useEffect(() => {
    if (allChecksComplete) {
      const requiredChecks = checks.filter(check => check.required);
      const passedRequired = requiredChecks.filter(check => check.status === 'passed');
      const allRequiredPassed = passedRequired.length === requiredChecks.length;
      
      onVerificationComplete(allRequiredPassed);
    }
  }, [checks, allChecksComplete, onVerificationComplete]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: SystemCheck['status'], required: boolean) => {
    switch (status) {
      case 'passed':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return required ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const requiredChecks = checks.filter(check => check.required);
  const passedRequired = requiredChecks.filter(check => check.status === 'passed');
  const failedRequired = requiredChecks.filter(check => check.status === 'failed');
  const allRequiredPassed = passedRequired.length === requiredChecks.length && allChecksComplete;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">System Verification</h1>
          <p className="text-gray-600">
            Please complete the system verification before starting your exam. 
            This ensures all proctoring features are working correctly.
          </p>
        </div>

        {/* Overall Status */}
        <div className="mb-8 p-4 rounded-lg border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Verification Status</h3>
              <p className="text-sm text-gray-600">
                {allChecksComplete ? (
                  allRequiredPassed ? (
                    <span className="text-green-600">✓ All required checks passed - Ready to start exam</span>
                  ) : (
                    <span className="text-red-600">✗ {failedRequired.length} required check(s) failed</span>
                  )
                ) : (
                  <span className="text-gray-600">Click "Run System Check" to begin verification</span>
                )}
              </p>
            </div>
            <button
              onClick={runAllChecks}
              disabled={isRunning}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isRunning 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Checks...
                </span>
              ) : (
                'Run System Check'
              )}
            </button>
          </div>
        </div>

        {/* System Checks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {checks.map((check) => (
            <div
              key={check.id}
              className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(check.status, check.required)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {check.icon}
                  <div>
                    <h4 className="font-medium text-gray-900">{check.name}</h4>
                    <p className="text-sm text-gray-600">{check.description}</p>
                    {check.details && (
                      <p className="text-xs text-gray-500 mt-1">{check.details}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  {check.required && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Required</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Camera Preview - Ready Mode */}
        {checks.find(check => check.id === 'camera')?.status === 'passed' && (
          <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-2">Camera Preview</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your camera is ready for the exam. The proctoring system will activate when you start the exam.
                </p>
                <div className="text-xs text-blue-600 bg-blue-100 px-3 py-2 rounded">
                  <strong>Ready Mode:</strong> Camera is initialized but monitoring is not active yet.
                </div>
              </div>
              <div className="flex-shrink-0">
                <FaceDetection
                  examId={examId}
                  onFlagDetected={() => {}} // No flags during verification
                  isActive={false}
                  isReady={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {allChecksComplete && (
          <div className="flex justify-center gap-4">
            {allRequiredPassed ? (
              <button
                onClick={() => onVerificationComplete(true)}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Proceed to Exam
              </button>
            ) : (
              <div className="text-center">
                <p className="text-red-600 mb-4">
                  Please resolve the failed checks before proceeding to the exam.
                </p>
                <button
                  onClick={runAllChecks}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry System Check
                </button>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Troubleshooting Tips</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Camera Issues:</strong> Ensure camera permissions are granted and no other applications are using the camera.</p>
            <p><strong>Network Issues:</strong> Check your internet connection and try refreshing the page.</p>
            <p><strong>Browser Issues:</strong> Use a modern browser like Chrome, Firefox, or Safari for best compatibility.</p>
            <p><strong>Microphone Issues:</strong> Microphone access is optional but recommended. Check browser permissions if needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemVerification;
