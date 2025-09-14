import React from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYou = () => {
    const navigate = useNavigate();

    const handleReturnHome = () => {
        navigate('/'); // Redirect to home or exam page
    };

    return (
        <div className="thank-you-container">
            <h1>Thank You!</h1>
            <p>Your exam has been successfully submitted.</p>
            <button onClick={handleReturnHome} className="btn">Return to Home</button>
        </div>
    );
};

export default ThankYou;
