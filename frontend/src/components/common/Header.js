import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import './Header.css';

const Header = () => {
    const { isAuthenticated, logout } = useAuth();
    const [userRole, setUserRole] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if user is logged in and get their role
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserRole(payload.role);
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        setUserRole(null);
        setShowProfileMenu(false);
        navigate('/');
    };

    const getOppositeRoleLink = () => {
        if (userRole === 'admin') {
            return { path: '/user', label: 'Take Exam', icon: '📝' };
        } else if (userRole === 'user') {
            return { path: '/admin', label: 'Admin Panel', icon: '⚙️' };
        }
        return null;
    };

    const oppositeRole = getOppositeRoleLink();

    return (
        <header className="modern-header">
            <div className="header-container">
                {/* Logo Section */}
                <div className="header-logo">
                    <Link to="/" className="logo-link">
                        <div className="logo-icon">🎓</div>
                        <span className="logo-text">ExamProctor</span>
                    </Link>
                </div>

                {/* Navigation Section */}
                <nav className="header-nav">
                    {!isAuthenticated ? (
                        /* Not logged in - show login options */
                        <div className="nav-items">
                            <Link 
                                to="/admin" 
                                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                            >
                                <span className="nav-icon">⚙️</span>
                                <span>Admin Login</span>
                            </Link>
                            <Link 
                                to="/user" 
                                className={`nav-link ${location.pathname === '/user' ? 'active' : ''}`}
                            >
                                <span className="nav-icon">📝</span>
                                <span>Take Exam</span>
                            </Link>
                        </div>
                    ) : (
                        /* Logged in - show role-based navigation */
                        <div className="nav-items">
                            {/* Current Role Section */}
                            <div className="current-role">
                                <span className="role-badge">
                                    {userRole === 'admin' ? '👨‍💼' : '👨‍🎓'} {userRole?.toUpperCase()}
                                </span>
                            </div>

                            {/* Opposite Role Link */}
                            {oppositeRole && (
                                <Link 
                                    to={oppositeRole.path} 
                                    className="nav-link opposite-role"
                                    title={`Switch to ${oppositeRole.label}`}
                                >
                                    <span className="nav-icon">{oppositeRole.icon}</span>
                                    <span>{oppositeRole.label}</span>
                                </Link>
                            )}

                            {/* Profile Menu */}
                            <div className="profile-menu">
                                <button 
                                    className="profile-button"
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                >
                                    <div className="avatar">
                                        {userRole === 'admin' ? 'A' : 'U'}
                                    </div>
                                    <span className="dropdown-arrow">▼</span>
                                </button>

                                {showProfileMenu && (
                                    <div className="profile-dropdown">
                                        <div className="dropdown-item profile-info">
                                            <div className="user-details">
                                                <div className="user-name">
                                                    {userRole === 'admin' ? 'Administrator' : 'Student'}
                                                </div>
                                                <div className="user-email">
                                                    {userRole}@examproctor.com
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <button 
                                            className="dropdown-item logout-item"
                                            onClick={handleLogout}
                                        >
                                            <span className="item-icon">🚪</span>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
