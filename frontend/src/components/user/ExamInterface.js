import React, { useState, useEffect, useRef } from 'react';
import FaceDetection from './FaceDetection';
import { Modal } from '../common/Loader';
import './ExamInterface.css';
import './ExamInterface.css';

const ExamInterface = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
    const [isExamStarted, setIsExamStarted] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [examId] = useState(() => 'EXAM-' + Math.random().toString(36).substring(2, 10).toUpperCase());
    
    // Monitoring states
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [windowBlurCount, setWindowBlurCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const timerRef = useRef(null);

    const dummyQuestions = [
        {
            id: 1,
            question: "What is the primary purpose of artificial intelligence?",
            type: "multiple-choice",
            options: [
                "To replace human workers entirely",
                "To augment human capabilities and solve complex problems",
                "To create entertainment systems",
                "To develop video games"
            ],
            points: 20
        },
        {
            id: 2,
            question: "Explain the difference between supervised and unsupervised machine learning. Provide examples of each.",
            type: "text",
            points: 25
        },
        {
            id: 3,
            question: "Which of the following is NOT a fundamental principle of object-oriented programming?",
            type: "multiple-choice",
            options: [
                "Encapsulation",
                "Inheritance",
                "Polymorphism",
                "Compilation"
            ],
            points: 15
        },
        {
            id: 4,
            question: "Describe the advantages and disadvantages of cloud computing. Include at least three points for each.",
            type: "text",
            points: 30
        },
        {
            id: 5,
            question: "What is the time complexity of binary search algorithm?",
            type: "multiple-choice",
            options: [
                "O(n)",
                "O(log n)",
                "O(n²)",
                "O(1)"
            ],
            points: 10
        }
    ];

    // Timer effect
    useEffect(() => {
        if (isExamStarted && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isExamStarted, timeRemaining]);

    // Monitoring effects
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isExamStarted) {
                setTabSwitchCount(prev => prev + 1);
                // You can add screenshot capture here
                console.log('Tab switch detected!');
            }
        };

        const handleWindowBlur = () => {
            if (isExamStarted) {
                setWindowBlurCount(prev => prev + 1);
                console.log('Window blur detected!');
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [isExamStarted]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartExam = () => {
        setIsExamStarted(true);
        // Request fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestion < dummyQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleSubmitExam = () => {
        setShowConfirmSubmit(true);
    };

    const handleAutoSubmit = () => {
        console.log('Exam auto-submitted due to time limit');
        // Handle exam submission
    };

    const confirmSubmission = () => {
        console.log('Exam submitted with answers:', answers);
        setIsExamStarted(false);
        setShowConfirmSubmit(false);
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    const getProgressPercentage = () => {
        const answeredQuestions = Object.keys(answers).length;
        return (answeredQuestions / dummyQuestions.length) * 100;
    };

    if (!isExamStarted) {
        return (
            <div className="exam-start-screen">
                <div className="start-container">
                    <div className="exam-header">
                        <h1>🎓 Computer Science Exam</h1>
                        <p className="exam-id">Exam ID: {examId}</p>
                    </div>
                    
                    <div className="exam-instructions">
                        <h2>📋 Instructions</h2>
                        <ul>
                            <li>This exam contains <strong>5 questions</strong> worth <strong>100 points</strong> total</li>
                            <li>You have <strong>60 minutes</strong> to complete the exam</li>
                            <li>Your camera will be monitored throughout the exam</li>
                            <li>Do not switch tabs or minimize the window</li>
                            <li>Ensure you are in a quiet, well-lit environment</li>
                            <li>Click "Start Exam" when you are ready</li>
                        </ul>
                    </div>

                    <div className="proctoring-setup">
                        <h3>📹 Camera Setup</h3>
                        <p>Please ensure your camera is working and you are clearly visible</p>
                        <div className="camera-preview">
                            <FaceDetection 
                                examId={examId}
                                isExamActive={false}
                                showPreview={true}
                            />
                        </div>
                    </div>

                    <button 
                        className="modern-btn modern-btn-primary start-exam-btn"
                        onClick={handleStartExam}
                    >
                        <span>🚀</span>
                        Start Exam
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = dummyQuestions[currentQuestion];

    return (
        <div className="exam-interface">
            {/* Exam Header */}
            <div className="exam-header-bar">
                <div className="exam-info">
                    <h2>Computer Science Exam</h2>
                    <span className="exam-id-badge">{examId}</span>
                </div>
                
                <div className="exam-status">
                    <div className="timer">
                        <span className="timer-icon">⏰</span>
                        <span className={`timer-text ${timeRemaining < 300 ? 'timer-warning' : ''}`}>
                            {formatTime(timeRemaining)}
                        </span>
                    </div>
                    
                    <div className="monitoring-status">
                        <div className="status-item">
                            <span className={`status-indicator ${isFullscreen ? 'status-online' : 'status-danger'}`}></span>
                            <span>Fullscreen</span>
                        </div>
                        <div className="status-item">
                            <span className="status-indicator status-online"></span>
                            <span>Camera</span>
                        </div>
                        {tabSwitchCount > 0 && (
                            <div className="violation-badge">
                                ⚠️ Tab switches: {tabSwitchCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                </div>
                <span className="progress-text">
                    {Object.keys(answers).length} / {dummyQuestions.length} answered
                </span>
            </div>

            {/* Main Content */}
            <div className="exam-content">
                {/* Question Panel */}
                <div className="question-panel">
                    <div className="question-header">
                        <div className="question-number">
                            Question {currentQuestion + 1} of {dummyQuestions.length}
                        </div>
                        <div className="question-points">
                            {currentQ.points} points
                        </div>
                    </div>

                    <div className="question-content">
                        <h3>{currentQ.question}</h3>
                        
                        {currentQ.type === 'multiple-choice' ? (
                            <div className="options-container">
                                {currentQ.options.map((option, index) => (
                                    <label key={index} className="option-label">
                                        <input
                                            type="radio"
                                            name={`question-${currentQ.id}`}
                                            value={option}
                                            checked={answers[currentQ.id] === option}
                                            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                        />
                                        <span className="option-text">{option}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                className="text-answer"
                                placeholder="Type your answer here..."
                                value={answers[currentQ.id] || ''}
                                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                rows={8}
                            />
                        )}
                    </div>

                    {/* Navigation Controls */}
                    <div className="question-navigation">
                        <button
                            className="modern-btn modern-btn-secondary"
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestion === 0}
                        >
                            ← Previous
                        </button>
                        
                        <div className="question-indicators">
                            {dummyQuestions.map((_, index) => (
                                <button
                                    key={index}
                                    className={`question-indicator ${index === currentQuestion ? 'active' : ''} ${answers[dummyQuestions[index].id] ? 'answered' : ''}`}
                                    onClick={() => setCurrentQuestion(index)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        {currentQuestion === dummyQuestions.length - 1 ? (
                            <button
                                className="modern-btn modern-btn-success"
                                onClick={handleSubmitExam}
                            >
                                Submit Exam 📤
                            </button>
                        ) : (
                            <button
                                className="modern-btn modern-btn-primary"
                                onClick={handleNextQuestion}
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>

                {/* Camera Feed */}
                <div className="camera-feed-container">
                    <FaceDetection 
                        examId={examId}
                        isExamActive={isExamStarted}
                        showPreview={false}
                        compact={true}
                    />
                    <div className="camera-label">
                        📹 Proctoring Active
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showConfirmSubmit && (
                <div className="modal-overlay">
                    <div className="modal-content submit-modal">
                        <h3>🚨 Submit Exam?</h3>
                        <p>Are you sure you want to submit your exam?</p>
                        <p>You have answered <strong>{Object.keys(answers).length}</strong> out of <strong>{dummyQuestions.length}</strong> questions.</p>
                        <p>Remaining time: <strong>{formatTime(timeRemaining)}</strong></p>
                        
                        <div className="modal-actions">
                            <button
                                className="modern-btn modern-btn-secondary"
                                onClick={() => setShowConfirmSubmit(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="modern-btn modern-btn-success"
                                onClick={confirmSubmission}
                            >
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamInterface;
