import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProctorAcknowledgment = ({ onAcknowledge }) => {
    const navigate = useNavigate();

    const handleAcknowledge = () => {
        console.log('Acknowledge button clicked');
        // Call the onAcknowledge prop if it exists
        if (onAcknowledge && typeof onAcknowledge === 'function') {
            console.log('Calling onAcknowledge prop');
            onAcknowledge();
        }
        // Always navigate to the exam page after acknowledgment
        console.log('Navigating to /exam');
        navigate('/exam');
    };

    return (
        <div className="proctor-acknowledgment" style={{padding: '20px', textAlign: 'center'}}>
            <h2>Proctoring Acknowledgment</h2>
            <p>
                By clicking "Acknowledge", you consent to being proctored during this exam.
                Please ensure that you are in a suitable environment for the exam.
            </p>
            <button 
                onClick={handleAcknowledge}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '20px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
                Acknowledge
            </button>
        </div>
    );
};

export default ProctorAcknowledgment;
