import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import { ExamData, Flag } from '../types';
import { LogOut, Eye, Trash2, AlertTriangle, Calendar, User, Camera } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [exams, setExams] = useState<ExamData[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamData | null>(null);
  const [examFlags, setExamFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout, user, isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || userType !== 'admin') {
      navigate('/admin/auth');
      return;
    }
    fetchExams();
  }, [isAuthenticated, userType, navigate]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const examData = await adminAPI.getAllExams();
      setExams(examData);
    } catch (err) {
      setError('Failed to fetch exams');
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewExam = async (exam: ExamData) => {
    try {
      setSelectedExam(exam);
      const response = await adminAPI.getExamFlags(exam.exam_id);
      const flags = response.flags || [];
      setExamFlags(Array.isArray(flags) ? flags : []);
    } catch (err) {
      console.error('Error fetching exam flags:', err);
      setExamFlags([]);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await adminAPI.deleteExam(examId);
        setExams(exams.filter(exam => exam.exam_id !== examId));
        if (selectedExam?.exam_id === examId) {
          setSelectedExam(null);
          setExamFlags([]);
        }
      } catch (err) {
        setError('Failed to delete exam');
        console.error('Error deleting exam:', err);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Sourcing Admin Dashboard</h1>
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
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Exams List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Exam Sessions</h2>
            </div>
            <div className="p-6">
              {exams.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No exam sessions found</p>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div
                      key={exam.exam_id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              Exam ID: {exam.exam_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              User: {exam.user_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-gray-600">
                              Flags: {exam.flags?.length || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewExam(exam)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.exam_id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Exam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Exam Details */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedExam ? `Exam Details - ${selectedExam.exam_id}` : 'Select an Exam'}
              </h2>
            </div>
            <div className="p-6">
              {selectedExam ? (
                <div className="space-y-6">
  

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Proctoring Flags</h3>
                    {examFlags.length === 0 ? (
                      <p className="text-gray-500 text-sm">No flags recorded for this exam</p>
                    ) : (
                      <div className="space-y-3">
                        {Array.isArray(examFlags) && examFlags.map((flag, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {flag.flag_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(flag.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {flag.description && (
                              <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                            )}
                            {flag.screenshot_url && (
                              <div className="mt-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Camera className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">Screenshot:</span>
                                </div>
                                <img
                                  src={flag.screenshot_url}
                                  alt={`Screenshot for ${flag.flag_name}`}
                                  className="max-w-xs max-h-48 h-auto rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors object-cover"
                                  onClick={() => window.open(flag.screenshot_url, '_blank')}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Select an exam from the list to view details
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
