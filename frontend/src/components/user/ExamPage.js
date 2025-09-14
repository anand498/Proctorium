import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceDetection from './FaceDetection';
import ProctorAcknowledgment from './ProctorAcknowledgment';
import ThankYou from './ThankYou';
import { generateExamId } from '../../utils/helpers';

const ExamPage = () => {
    const [examId, setExamId] = useState('');
    const [isProctoring, setIsProctoring] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [examStartTime, setExamStartTime] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const id = generateExamId();
        setExamId(id);
    }, []);

    const handleStartExam = () => {
        setIsProctoring(true);
        setExamStartTime(new Date());
    };

    const handleCompleteExam = () => {
        setIsProctoring(false);
        setIsCompleted(true);
    };

    if (isCompleted) {
        return <ThankYou />;
    }

    return (
        <div className="min-h-screen dark-exam-bg">
            {!isProctoring ? (
                <div className="container">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="card shadow-xl dark-exam-card" style={{ maxWidth: '600px' }}>
                            <div className="card-header text-center">
                                <div className="exam-icon mb-4">
                                    <svg className="w-16 h-16 text-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold text-primary mb-2 glow-text">
                                    Ready to Begin?
                                </h1>
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <span className="text-sm font-medium text-muted">Exam ID:</span>
                                    <span className="text-lg font-mono font-bold text-primary exam-id-badge px-3 py-1 rounded">
                                        {examId}
                                    </span>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="alert alert-info mb-6">
                                    <h3 className="font-semibold mb-2">Before You Start:</h3>
                                    <ul className="text-sm space-y-1 text-left">
                                        <li>• Ensure you have a stable internet connection</li>
                                        <li>• Position yourself clearly in front of the camera</li>
                                        <li>• Remove any unauthorized materials from your workspace</li>
                                        <li>• Close all unnecessary applications and browser tabs</li>
                                    </ul>
                                </div>

                                <div className="text-center">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-semibold mb-2">AI Proctoring System</h2>
                                        <p className="text-secondary">
                                            Our advanced monitoring system will track your exam session to ensure integrity.
                                            The camera will monitor for any suspicious activity during the exam.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleStartExam}
                                        className="btn btn-secondary btn-lg w-full"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Start Proctored Exam
                                    </button>
                                </div>
                            </div>

                            <div className="card-footer">
                                <div className="text-center text-sm text-muted">
                                    <p>By starting this exam, you agree to follow all exam policies and guidelines.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <FaceDetection
                    onComplete={handleCompleteExam}
                    examId={examId}
                    startTime={examStartTime}
                />
            )}

            <style jsx>{`
                .dark-exam-bg {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
                    position: relative;
                    overflow: hidden;
                }

                .dark-exam-bg::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background:
                        radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
                    pointer-events: none;
                }

                .dark-exam-card {
                    background: rgba(30, 41, 59, 0.8);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    backdrop-filter: blur(20px);
                    box-shadow:
                        0 25px 50px -12px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(255, 255, 255, 0.05);
                }

                .exam-icon {
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.05);
                        opacity: 0.8;
                    }
                }

                .glow-text {
                    text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
                }

                .exam-id-badge {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(30, 64, 175, 0.3));
                    border: 1px solid rgba(59, 130, 246, 0.5);
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
                }

                .space-y-1 > * + * {
                    margin-top: 0.25rem;
                }

                .space-y-6 > * + * {
                    margin-top: 1.5rem;
                }

                .min-h-screen {
                    min-height: 100vh;
                }

                .w-5 {
                    width: 1.25rem;
                }

                .h-5 {
                    height: 1.25rem;
                }

                .w-16 {
                    width: 4rem;
                }

                .h-16 {
                    height: 4rem;
                }

                .font-mono {
                    font-family: var(--font-family-mono);
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

                .px-3 {
                    padding-left: 0.75rem;
                    padding-right: 0.75rem;
                }

                .py-1 {
                    padding-top: 0.25rem;
                    padding-bottom: 0.25rem;
                }
            `}</style>
        </div>
    );
};

export default ExamPage;
