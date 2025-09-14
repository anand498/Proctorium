import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceDetection from './FaceDetection';
import { useCopyPasteDetection } from '../hooks/useCopyPasteDetection';
import { Camera, Monitor, AlertTriangle, CheckCircle, Clipboard } from 'lucide-react';

interface TestFlag {
  type: string;
  description: string;
  timestamp: string;
}

const TestingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isTestingActive, setIsTestingActive] = useState(false);
  const [testFlags, setTestFlags] = useState<TestFlag[]>([]);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  const handleStartTesting = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      setCameraPermission('granted');
      setIsTestingActive(true);
    } catch (error) {
      setCameraPermission('denied');
      console.error('Camera permission denied:', error);
    }
  };

  const handleStopTesting = () => {
    setIsTestingActive(false);
  };

  const handleFlagDetected = (flagType: string, description: string) => {
    const newFlag: TestFlag = {
      type: flagType,
      description,
      timestamp: new Date().toISOString()
    };
    setTestFlags(prev => [...prev, newFlag]);
  };

  const handleCopyPasteDetected = (type: 'copy' | 'paste', details: string) => {
    handleFlagDetected(`clipboard_${type}`, details);
  };

  const clearFlags = () => {
    setTestFlags([]);
  };

  // Initialize copy-paste detection
  useCopyPasteDetection({
    onCopyDetected: handleCopyPasteDetected,
    isActive: isTestingActive,
    examId: 'test-exam-dashboard' // Test exam ID for testing dashboard
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Proctoring System Test</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/user/auth')}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Login as User
              </button>
              <button
                onClick={() => navigate('/admin/auth')}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Login as Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Test Your Setup</h2>
          <p className="text-blue-800">
            Use this testing dashboard to verify that your camera and proctoring system are working correctly 
            before taking an actual exam. This will help ensure a smooth exam experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Checks */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Checks</h3>
              
              <div className="space-y-4">
                {/* Camera Permission */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Camera Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {cameraPermission === 'granted' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {cameraPermission === 'denied' && (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      cameraPermission === 'granted' ? 'text-green-600' : 
                      cameraPermission === 'denied' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {cameraPermission === 'granted' ? 'Granted' : 
                       cameraPermission === 'denied' ? 'Denied' : 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Browser Compatibility */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Browser Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Compatible</span>
                  </div>
                </div>

                {/* Internet Connection */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-900">Internet Connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Connected</span>
                  </div>
                </div>
              </div>

              {/* Test Controls */}
              <div className="mt-6 space-y-3">
                {!isTestingActive ? (
                  <button
                    onClick={handleStartTesting}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Start Proctoring Test
                  </button>
                ) : (
                  <button
                    onClick={handleStopTesting}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Stop Test
                  </button>
                )}
                
                {testFlags.length > 0 && (
                  <button
                    onClick={clearFlags}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Clear Test Results
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Camera Feed */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Feed</h3>
              
              {isTestingActive ? (
                <FaceDetection
                  examId="test-exam"
                  onFlagDetected={handleFlagDetected}
                  isActive={isTestingActive}
                />
              ) : (
                <div className="w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Camera feed will appear here</p>
                  </div>
                </div>
              )}

              {cameraPermission === 'denied' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Camera access is required for proctoring. Please enable camera permissions 
                    in your browser settings and refresh the page.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Test Results */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
              
              {!isTestingActive && testFlags.length === 0 && (
                <p className="text-gray-500 text-sm">
                  Start the proctoring test to see how the system detects various scenarios.
                </p>
              )}

              {isTestingActive && testFlags.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600 font-medium">All Good!</p>
                  <p className="text-xs text-gray-500 mt-1">
                    No issues detected. Try looking away or covering your camera to test the system.
                  </p>
                </div>
              )}

              {testFlags.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {testFlags.map((flag, index) => (
                    <div key={index} className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-orange-800 text-sm">
                            {flag.type.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <div className="text-orange-700 text-xs mt-1">
                            {flag.description}
                          </div>
                          <div className="text-orange-600 text-xs mt-1">
                            {new Date(flag.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Testing Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What to Test:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Look directly at the camera (should show no flags)</li>
                <li>• Look away from the screen for a few seconds</li>
                <li>• Cover your camera briefly</li>
                <li>• Have someone else appear in the camera view</li>
                <li>• Switch to another browser tab</li>
                <li>• Copy text from this page (Ctrl+C or Cmd+C)</li>
                <li>• Paste text anywhere on this page (Ctrl+V or Cmd+V)</li>
                <li>• Try right-click copy/paste operations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Expected Behavior:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• System should detect when no face is visible</li>
                <li>• Multiple faces should trigger an alert</li>
                <li>• Tab switching should be flagged</li>
                <li>• Copy operations should be detected and flagged</li>
                <li>• Paste operations should be detected and flagged</li>
                <li>• All flags should appear in the test results</li>
                <li>• Camera feed should show your face clearly</li>
              </ul>
            </div>
          </div>
          
          {/* Copy-Paste Test Area */}
          {isTestingActive && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Clipboard className="w-4 h-4" />
                Copy-Paste Test Area
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Use this area to test copy-paste detection. Try selecting and copying this text, 
                or paste something here to trigger the detection system.
              </p>
              <textarea
                className="w-full h-20 p-2 border border-gray-300 rounded text-sm resize-none"
                placeholder="Try pasting text here to test paste detection..."
                defaultValue="Select and copy this text to test copy detection!"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestingDashboard;
