import axios from 'axios';
import { useState, useEffect, createContext, useContext } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log('Making login request...');
            const response = await axios.post(`${API_URL}/auth/login`, { username, password });
            console.log('Login response:', response.data);
            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                setIsAuthenticated(true);
                console.log('Authentication state updated to true');
            }
            return response.data;
        } catch (error) {
            console.error('Login request failed:', error);
            throw error.response?.data || error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    const value = {
        isAuthenticated,
        setIsAuthenticated,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const isAuthenticatedCheck = () => {
    return localStorage.getItem('token') !== null;
};

export const getToken = () => {
    return localStorage.getItem('token');
};
