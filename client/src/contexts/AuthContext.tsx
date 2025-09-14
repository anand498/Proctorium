import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, LoginCredentials, User } from '../types';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'user' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          setUserType(userData.role);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          setUser(null);
          setUserType(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (type: 'admin' | 'user', credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await authAPI.login(credentials);
      
      // Verify the user type matches what was requested
      if (response.user.role !== type) {
        throw new Error('Invalid user type');
      }
      
      localStorage.setItem('token', response.access_token);
      setUser(response.user);
      setUserType(response.user.role);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    userType,
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
