import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminAuth from './components/AdminAuth';
import UserAuth from './components/UserAuth';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import ExamPage from './components/ExamPage';
import TestingDashboard from './components/TestingDashboard';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/user/auth" replace />} />
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/user/auth" element={<UserAuth />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/exam/:examId" element={<ExamPage />} />
            <Route path="/testing" element={<TestingDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
