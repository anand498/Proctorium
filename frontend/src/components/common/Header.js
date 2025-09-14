import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-brand">
                    <div className="header-logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.01C14.8 6.7 14.6 6.4 14.3 6.1L16.5 3.9L15.1 2.5L12.9 4.7C12.6 4.4 12.3 4.2 12 4.03V2H10V4.03C9.7 4.2 9.4 4.4 9.1 4.7L6.9 2.5L5.5 3.9L7.7 6.1C7.4 6.4 7.2 6.7 7.01 7L1 7V9L7.01 9C7.2 9.3 7.4 9.6 7.7 9.9L5.5 12.1L6.9 13.5L9.1 11.3C9.4 11.6 9.7 11.8 10 11.97V14H12V11.97C12.3 11.8 12.6 11.6 12.9 11.3L15.1 13.5L16.5 12.1L14.3 9.9C14.6 9.6 14.8 9.3 15 9H21Z"/>
                        </svg>
                    </div>
                    <h1>Proctorium</h1>
                </div>

                <nav className="header-nav">
                    <ul>
                        <li>
                            <Link
                                to="/"
                                className={isActive('/') ? 'active' : ''}
                            >
                                <svg className="header-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2z" />
                                </svg>
                                Exam
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin"
                                className={isActive('/admin') ? 'active' : ''}
                            >
                                <svg className="header-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/login"
                                className={isActive('/login') ? 'active' : ''}
                            >
                                <svg className="header-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Login
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
