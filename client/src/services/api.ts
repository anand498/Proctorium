import axios from 'axios';
import { LoginCredentials, AuthResponse, ExamData, Flag } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getAllExams: async (): Promise<ExamData[]> => {
    const response = await api.get('/api/admin/exams');
    return response.data;
  },

  getExamById: async (examId: string): Promise<ExamData> => {
    const response = await api.get(`/api/admin/exams/${examId}`);
    return response.data;
  },

  deleteExam: async (examId: string): Promise<void> => {
    await api.delete(`/api/admin/exams/${examId}`);
  },

  getExamFlags: async (examId: string): Promise<{ exam_id: string; flags: Flag[]; screenshots: string[] }> => {
    const response = await api.get(`/api/admin/flags/${examId}`);
    return response.data;
  },
};

// Proctoring API
export const proctoringAPI = {
  submitProctoringData: async (data: { exam_id: string; flags: { flag_name: string; screenshot_url: string }[] }) => {
    const response = await api.post('/api/proctoring/data', data);
    return response.data;
  },

  getProctoringData: async (examId: string) => {
    const response = await api.get(`/api/proctoring/data/${examId}`);
    return response.data;
  },

  uploadScreenshot: async (file: File, examId: string, flagType: string, timestamp: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('exam_id', examId);
    formData.append('flag_type', flagType);
    formData.append('timestamp', timestamp);

    const response = await api.post('/api/proctoring/screenshot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
