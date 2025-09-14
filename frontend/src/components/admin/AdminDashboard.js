import React, { useEffect, useState } from 'react';
import { fetchExamData } from '../../services/api';
import ExamTable from './ExamTable';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
    const [examData, setExamData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [examId, setExamId] = useState('');
    const [error, setError] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!examId.trim()) {
                setExamData(null);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const data = await fetchExamData(examId);
                setExamData(data);

                // Add to search history
                setSearchHistory(prev => {
                    const newHistory = [examId, ...prev.filter(id => id !== examId)].slice(0, 5);
                    return newHistory;
                });
            } catch (error) {
                console.error('Error fetching exam data:', error);
                setError('Failed to fetch exam data. Please check the exam ID and try again.');
                setExamData(null);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchData, 500);
        return () => clearTimeout(debounceTimer);
    }, [examId]);

    const handleExamIdChange = (e) => {
        setExamId(e.target.value);
    };

    const handleHistoryClick = (id) => {
        setExamId(id);
    };

    const clearSearch = () => {
        setExamId('');
        setExamData(null);
        setError('');
    };

    return (
        <div className="min-h-screen dark-admin-bg">
            <div className="container py-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="admin-header-card">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="admin-icon">
                                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-primary mb-2 glow-text">Admin Dashboard</h1>
                                <p className="text-secondary">Monitor and review exam sessions and AI proctoring data</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="card mb-6">
                    <div className="card-header">
                        <h2 className="text-xl font-semibold">Search Exam Sessions</h2>
                        <p className="text-sm text-secondary">Enter an exam ID to view detailed proctoring data and analysis</p>
                    </div>

                    <div className="card-body">
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <label htmlFor="examId" className="form-label">
                                    Exam ID
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="examId"
                                        className="form-control pr-10"
                                        placeholder="Enter exam ID (e.g., EXAM-2024-001)"
                                        value={examId}
                                        onChange={handleExamIdChange}
                                        disabled={loading}
                                    />
                                    {examId && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Search History */}
                        {searchHistory.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-secondary mb-2">Recent Searches</h3>
                                <div className="flex flex-wrap gap-2">
                                    {searchHistory.map((id, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleHistoryClick(id)}
                                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            {id}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                <div className="loading-spinner-sm"></div>
                                <span className="text-sm text-primary">Searching for exam data...</span>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="alert alert-danger">
                                <strong>Error:</strong> {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                {examData && !loading && (
                    <div className="card">
                        <div className="card-header">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold">Exam Session Details</h2>
                                    <p className="text-sm text-secondary">Exam ID: {examId}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="btn btn-outline btn-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export Report
                                    </button>
                                    <button className="btn btn-ghost btn-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card-body">
                            <ExamTable examData={examData} />
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!examData && !loading && !error && (
                    <div className="card">
                        <div className="card-body text-center py-12">
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Exam Selected</h3>
                            <p className="text-gray-500 mb-4">Enter an exam ID above to view detailed proctoring data and session information.</p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .dark-admin-bg {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
                    position: relative;
                    overflow: hidden;
                }

                .dark-admin-bg::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background:
                        radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
                    pointer-events: none;
                }

                .admin-header-card {
                    background: rgba(30, 41, 59, 0.8);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: var(--border-radius-lg);
                    padding: var(--spacing-xl);
                    backdrop-filter: blur(20px);
                    box-shadow:
                        0 20px 25px -5px rgba(0, 0, 0, 0.4),
                        0 0 30px rgba(59, 130, 246, 0.2);
                }

                .admin-icon {
                    animation: pulse 2s ease-in-out infinite;
                }

                .glow-text {
                    text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
                }

                .w-12 {
                    width: 3rem;
                }

                .h-12 {
                    height: 3rem;
                }

                .min-h-screen {
                    min-height: 100vh;
                }

                .py-6 {
                    padding-top: 1.5rem;
                    padding-bottom: 1.5rem;
                }

                .py-12 {
                    padding-top: 3rem;
                    padding-bottom: 3rem;
                }

                .mb-8 {
                    margin-bottom: 2rem;
                }

                .mb-6 {
                    margin-bottom: 1.5rem;
                }

                .mb-4 {
                    margin-bottom: 1rem;
                }

                .mb-2 {
                    margin-bottom: 0.5rem;
                }

                .flex-1 {
                    flex: 1;
                }

                .flex-wrap {
                    flex-wrap: wrap;
                }

                .gap-4 {
                    gap: 1rem;
                }

                .gap-3 {
                    gap: 0.75rem;
                }

                .gap-2 {
                    gap: 0.5rem;
                }

                .relative {
                    position: relative;
                }

                .absolute {
                    position: absolute;
                }

                .right-3 {
                    right: 0.75rem;
                }

                .top-1\\/2 {
                    top: 50%;
                }

                .transform {
                    transform: var(--tw-transform);
                }

                .-translate-y-1\\/2 {
                    --tw-translate-y: -50%;
                    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
                }

                .pr-10 {
                    padding-right: 2.5rem;
                }

                .px-3 {
                    padding-left: 0.75rem;
                    padding-right: 0.75rem;
                }

                .py-1 {
                    padding-top: 0.25rem;
                    padding-bottom: 0.25rem;
                }

                .p-4 {
                    padding: 1rem;
                }

                .w-5 {
                    width: 1.25rem;
                }

                .h-5 {
                    height: 1.25rem;
                }

                .w-4 {
                    width: 1rem;
                }

                .h-4 {
                    height: 1rem;
                }

                .w-16 {
                    width: 4rem;
                }

                .h-16 {
                    height: 4rem;
                }

                .bg-blue-50 {
                    background-color: #eff6ff;
                }

                .bg-gray-100 {
                    background-color: var(--color-gray-100);
                }

                .bg-gray-200 {
                    background-color: var(--color-gray-200);
                }

                .text-gray-400 {
                    color: var(--color-gray-400);
                }

                .text-gray-500 {
                    color: var(--color-gray-500);
                }

                .text-gray-600 {
                    color: var(--color-gray-600);
                }

                .text-gray-700 {
                    color: var(--color-gray-700);
                }

                .text-gray-900 {
                    color: var(--color-gray-900);
                }

                .rounded-lg {
                    border-radius: var(--border-radius-lg);
                }

                .rounded-full {
                    border-radius: 9999px;
                }

                .hover\\:bg-gray-200:hover {
                    background-color: var(--color-gray-200);
                }

                .hover\\:text-gray-600:hover {
                    color: var(--color-gray-600);
                }

                .transition-colors {
                    transition: var(--transition-colors);
                }

                .loading-spinner-sm {
                    width: 16px;
                    height: 16px;
                    border: 2px solid var(--color-gray-200);
                    border-top: 2px solid var(--color-primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;