import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FaceDetection from './FaceDetection';
import { proctoringAPI } from '../services/api';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  type: 'multiple-choice' | 'text';
}

interface Flag {
  type: string;
  description: string;
  timestamp: string;
}

const ExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [flags, setFlags] = useState<Flag[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(7200); // 2 hours in seconds
  const [examSubmitted, setExamSubmitted] = useState(false);

  // Mock exam questions - in a real app, these would come from an API
  const questions: Question[] = [
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      type: "multiple-choice"
    },
    {
      id: 2,
      question: "Solve: 2 + 2 = ?",
      options: ["3", "4", "5", "6"],
      type: "multiple-choice"
    },
    {
      id: 3,
      question: "Explain the concept of recursion in programming.",
      options: [],
      type: "text"
    },
    {
      id: 4,
      question: "What is the largest planet in our solar system?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      type: "multiple-choice"
    },
    {
      id: 5,
      question: "Describe the process of photosynthesis.",
      options: [],
      type: "text"
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/user/auth');
      return;
    }

    if (!examId) {
      navigate('/user/dashboard');
      return;
    }
  }, [isAuthenticated, examId, navigate]);

  // Timer effect
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examSubmitted]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamStarted(true);
  };

  const handleFlagDetected = (flagType: string, description: string) => {
    const newFlag: Flag = {
      type: flagType,
      description,
      timestamp: new Date().toISOString()
    };
    setFlags(prev => [...prev, newFlag]);
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    try {
      // Submit proctoring data
      const proctoringData = {
        exam_id: examId!,
        flags: flags.map(flag => ({
          flag_name: flag.type,
          screenshot_url: '' // Screenshots are uploaded separately
        }))
      };

      await proctoringAPI.submitProctoringData(proctoringData);
      setExamSubmitted(true);
      
      // Navigate to thank you page after a delay
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  if (!examId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Exam</h2>
          <button
            onClick={() => navigate('/user/dashboard')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (examSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam Submitted Successfully!</h2>
          <p className="text-gray-600 mb-4">Your exam has been submitted and is being processed.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Exam Instructions</h1>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Camera Monitoring</h3>
                <p className="text-sm text-gray-600">Your camera will be active throughout the exam to ensure academic integrity.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Time Limit</h3>
                <p className="text-sm text-gray-600">You have 2 hours to complete this exam. The exam will auto-submit when time expires.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Prohibited Actions</h3>
                <p className="text-sm text-gray-600">Switching tabs, multiple faces in camera, or looking away will be flagged.</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Once you start the exam, you cannot pause or restart it. 
              Make sure you're ready and have a stable internet connection.
            </p>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Exam: {examId}</h1>
              <div className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {flags.length > 0 && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{flags.length} flags</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main exam content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Question {currentQuestion + 1}
              </h2>
              
              <div className="mb-8">
                <p className="text-gray-800 mb-6">{currentQ.question}</p>
                
                {currentQ.type === 'multiple-choice' ? (
                  <div className="space-y-3">
                    {currentQ.options.map((option, index) => (
                      <label key={index} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${currentQ.id}`}
                          value={option}
                          checked={answers[currentQ.id] === option}
                          onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Type your answer here..."
                  />
                )}
              </div>
              
              {/* Navigation buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-3">
                  {currentQuestion === questions.length - 1 ? (
                    <button
                      onClick={handleSubmitExam}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Submit Exam
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar with camera and flags */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Face detection */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Proctoring Camera</h3>
                <FaceDetection
                  examId={examId}
                  onFlagDetected={handleFlagDetected}
                  isActive={examStarted && !examSubmitted}
                />
              </div>
              
              {/* Flags */}
              {flags.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Proctoring Alerts</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {flags.slice(-5).map((flag, index) => (
                      <div key={index} className="text-xs bg-orange-50 border border-orange-200 rounded p-2">
                        <div className="font-medium text-orange-800">{flag.type}</div>
                        <div className="text-orange-600">{flag.description}</div>
                        <div className="text-orange-500 mt-1">
                          {new Date(flag.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
