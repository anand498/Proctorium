import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import AdminDashboard from './components/admin/AdminDashboard';
import ExamPage from './components/user/ExamPage';
import ProctorAcknowledgment from './components/user/ProctorAcknowledgment';
import ThankYou from './components/user/ThankYou';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FaceDetectionDebug from './components/user/FaceDetectionDebug';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/exam" 
          element={<ExamPage />}
        />
        <Route 
          path="/acknowledgment" 
          element={
            <ProtectedRoute>
              <ProctorAcknowledgment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/thank-you" 
          element={
            <ProtectedRoute>
              <ThankYou />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user" 
          element={<ProctorAcknowledgment />}
        />
        <Route 
          path="/debug" 
          element={<FaceDetectionDebug />}
        />
        <Route path="/" element={<ExamPage />} />
      </Routes>
    </Router>
  );
}

export default App;
