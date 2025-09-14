// This file contains helper functions used in various components.

export const generateRandomExamId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const generateExamId = () => {
    return 'EXAM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const formatDate = (date) => {
    return new Date(date).toLocaleString();
};

export const isValidExamId = (examId) => {
    const regex = /^[A-Z0-9-]{8,}$/;
    return regex.test(examId);
};

export const handleApiError = (error) => {
    console.error("API Error:", error);
    return error.response ? error.response.data : { message: "An unexpected error occurred." };
};

export const captureScreenshot = async (videoElement, examId, flagType = 'suspicious_activity') => {
    try {
        console.log('📸 Capturing screenshot for:', flagType, 'Exam:', examId);
        
        if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
            console.error('❌ Invalid video element for screenshot');
            return null;
        }

        // Create canvas and capture video frame
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 0.8);
        });
        
        if (!blob) {
            console.error('❌ Failed to create screenshot blob');
            return null;
        }
        
        // Submit to backend
        const result = await submitScreenshot(blob, examId, flagType);
        return result;
        
    } catch (error) {
        console.error('❌ Error capturing screenshot:', error);
        return null;
    }
};

export const submitScreenshot = async (blob, examId, flagType) => {
    try {
        const formData = new FormData();
        formData.append('file', blob, `screenshot-${Date.now()}.jpg`);
        formData.append('exam_id', examId);
        formData.append('flag_type', flagType);
        formData.append('timestamp', new Date().toISOString());
        
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('❌ No authentication token found');
            return null;
        }
        
        // Construct URL properly - use relative URL when API_URL is empty
        const apiBaseUrl = process.env.REACT_APP_API_URL || '';
        const url = apiBaseUrl ? `${apiBaseUrl}/api/proctoring/screenshot` : '/api/proctoring/screenshot';
        
        console.log('📤 Submitting screenshot to:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Screenshot submission failed:', {
                status: response.status,
                error: errorText
            });
            return null;
        }
        
        const result = await response.json();
        console.log('✅ Screenshot submitted successfully');
        return result;
        
    } catch (error) {
        console.error('❌ Error submitting screenshot:', error.message);
        return null;
    }
};
