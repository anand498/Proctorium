import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BookOpen, Play, Clock } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { logout, user, isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || userType !== 'user') {
      navigate('/user/auth');
    }
  }, [isAuthenticated, userType, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/user/auth');
  };

  const handleStartExam = (examId: string) => {
    navigate(`/user/exam/${examId}`);
  };

  // Mock exam data - in a real app, this would come from an API
  const availableExams = [
    {
      id: 'exam-001',
      title: 'Mathematics Final Exam',
      duration: '2 hours',
      questions: 50,
      description: 'Comprehensive mathematics exam covering algebra, calculus, and statistics.',
    },
    {
      id: 'exam-002',
      title: 'Computer Science Quiz',
      duration: '1 hour',
      questions: 30,
      description: 'Programming fundamentals and data structures assessment.',
    },
    {
      id: 'exam-003',
      title: 'Physics Midterm',
      duration: '1.5 hours',
      questions: 40,
      description: 'Classical mechanics and thermodynamics examination.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <span className="ml-4 text-sm text-gray-500">Welcome, {user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Ready to take your exam?</h2>
          <p className="text-green-100">
            Select an exam below to begin. Make sure you're in a quiet environment with good lighting.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Exam Instructions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Before Starting:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Find a quiet, well-lit room</li>
                  <li>• Close all unnecessary applications</li>
                  <li>• Have your ID ready for verification</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">During the Exam:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Keep your face visible to the camera</li>
                  <li>• Do not leave the exam window</li>
                  <li>• Avoid looking away from the screen</li>
                  <li>• No external help or materials allowed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Available Exams */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Available Exams</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableExams.map((exam) => (
                <div
                  key={exam.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{exam.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Duration: {exam.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>Questions: {exam.questions}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStartExam(exam.id)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Start Exam
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testing Dashboard Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/testing')}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Go to Testing Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
