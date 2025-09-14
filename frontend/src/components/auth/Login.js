import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('Attempting login...');
            const result = await login(username, password);
            console.log('Login successful:', result);
            console.log('Navigating to /exam');
            navigate('/exam');
        } catch (err) {
            console.error('Login error:', err);
            setError('Invalid username or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center dark-gradient">
            <div className="container-sm">
                <div className="card shadow-xl dark-card">
                    <div className="card-header text-center">
                        <div className="login-logo mb-4">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.01C14.8 6.7 14.6 6.4 14.3 6.1L16.5 3.9L15.1 2.5L12.9 4.7C12.6 4.4 12.3 4.2 12 4.03V2H10V4.03C9.7 4.2 9.4 4.4 9.1 4.7L6.9 2.5L5.5 3.9L7.7 6.1C7.4 6.4 7.2 6.7 7.01 7L1 7V9L7.01 9C7.2 9.3 7.4 9.6 7.7 9.9L5.5 12.1L6.9 13.5L9.1 11.3C9.4 11.6 9.7 11.8 10 11.97V14H12V11.97C12.3 11.8 12.6 11.6 12.9 11.3L15.1 13.5L16.5 12.1L14.3 9.9C14.6 9.6 14.8 9.3 15 9H21Z"/>
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-primary mb-2 glow-text">
                            Welcome to Proctorium
                        </h1>
                        <p className="text-secondary text-lg">
                            Secure AI-Powered Exam Platform
                        </p>
                    </div>

                    <div className="card-body">
                        {error && (
                            <div className="alert alert-danger">
                                <strong>Login Failed:</strong> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="form-group">
                                <label htmlFor="username" className="form-label">
                                    Username or Email
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    className="form-control"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full btn-lg"
                                disabled={isLoading || !username.trim() || !password.trim()}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                                strokeDasharray="32"
                                                strokeDashoffset="32"
                                                style={{
                                                    animation: 'spin 1s linear infinite, dash 1.5s ease-in-out infinite'
                                                }}
                                            />
                                        </svg>
                                        Signing In...
                                    </span>
                                ) : (
                                    'Sign In to Continue'
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="card-footer">
                        <div className="alert alert-info">
                            <strong>Important:</strong> Make sure you have a stable internet connection and
                            camera access enabled for the proctoring system.
                        </div>

                        <div className="text-center text-sm text-muted">
                            <p>Need help? Contact your exam administrator</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dark-gradient {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
                    position: relative;
                    overflow: hidden;
                }

                .dark-gradient::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background:
                        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
                    pointer-events: none;
                }

                .dark-card {
                    position: relative;
                    background: rgba(30, 41, 59, 0.7);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    backdrop-filter: blur(20px);
                    box-shadow:
                        0 20px 25px -5px rgba(0, 0, 0, 0.4),
                        0 10px 10px -5px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }

                .login-logo {
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                .glow-text {
                    text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes dash {
                    0% {
                        stroke-dasharray: 1, 150;
                        stroke-dashoffset: 0;
                    }
                    50% {
                        stroke-dasharray: 90, 150;
                        stroke-dashoffset: -35;
                    }
                    100% {
                        stroke-dasharray: 90, 150;
                        stroke-dashoffset: -124;
                    }
                }

                .space-y-6 > * + * {
                    margin-top: 1.5rem;
                }

                .min-h-screen {
                    min-height: 100vh;
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                .h-5 {
                    height: 1.25rem;
                }

                .w-5 {
                    width: 1.25rem;
                }

                .mb-4 {
                    margin-bottom: 1rem;
                }
            `}</style>
        </div>
    );
};

export default Login;
