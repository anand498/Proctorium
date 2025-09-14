import axios from 'axios';
import { getToken } from './auth';

// Use empty string for relative URLs when deployed with nginx proxy
// or fallback to direct backend URL for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

// Set up axios interceptor to include auth token
axios.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const startExam = async (examId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/proctoring/start`, { examId });
        return response.data;
    } catch (error) {
        throw new Error('Error starting the exam: ' + error.message);
    }
};

export const submitFlagsAndScreenshots = async (examId, flags, screenshots) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/proctoring/submit`, {
            examId,
            flags,
            screenshots
        });
        return response.data;
    } catch (error) {
        throw new Error('Error submitting flags and screenshots: ' + error.message);
    }
};

export const fetchExamDataForAdmin = async (examId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/exams/${examId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching exam data: ' + error.message);
    }
};

// Alias for backward compatibility
export const fetchExamData = fetchExamDataForAdmin;

export const fetchAllExams = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/exams`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching all exams: ' + error.message);
    }
};

export const deleteExam = async (examId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/admin/exams/${examId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error deleting exam: ' + error.message);
    }
};
