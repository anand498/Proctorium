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

    const navigate = useNavigate();

    useEffect(() => {
        const id = generateExamId();
        setExamId(id);
    }, []);

    const handleStartExam = () => {
        setIsProctoring(true);
    };

    const handleCompleteExam = () => {
        setIsProctoring(false);
        setIsCompleted(true);
    };

    if (isCompleted) {
        return <ThankYou />;
    }

    return (
        <div style={{padding: '20px', textAlign: 'center'}}>
            <h1>Exam Page</h1>
            <p>Your Exam ID: {examId}</p>
            {!isProctoring ? (
                <div>
                    <p>Welcome to the exam platform!</p>
                    <button 
                        onClick={handleStartExam}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '20px'
                        }}
                    >
                        Start Proctored Exam
                    </button>
                </div>
            ) : (
                <FaceDetection onComplete={handleCompleteExam} examId={examId} />
            )}
        </div>
    );
};

export default ExamPage;
