import React, { useState } from 'react';
import ImagePreviewModal from '../common/ImagePreviewModal';
import './ExamDetailsView.css';

const ExamDetailsView = ({ examData }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    if (!examData) return null;

    // Get all screenshots for navigation
    const allScreenshots = examData.flags?.filter(flag => flag.screenshot_url) || [];

    // Calculate statistics
    const totalFlags = examData.flags ? examData.flags.length : 0;
    const flagCounts = {};
    const flagLabels = {
        'no_face_detected': 'No Face Detected',
        'multiple_faces': 'Multiple Faces',
        'suspicious_activity': 'Suspicious Activity', 
        'no_person_detected': 'No Person Detected',
        'tab_switched': 'Tab Switched',
        'noise_detected': 'Noise Detected'
    };

    // Count flags by type
    examData.flags?.forEach(flag => {
        const flagType = flag.flag_name;
        flagCounts[flagType] = (flagCounts[flagType] || 0) + 1;
    });

    // Calculate trust score (simple algorithm: 100 - (violations * 10), min 0)
    const trustScore = Math.max(0, 100 - (totalFlags * 15));

    // Format timestamp
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short'
        });
    };

    // Handle image preview
    const openImagePreview = (flag) => {
        const imageIndex = allScreenshots.findIndex(s => s.screenshot_url === flag.screenshot_url);
        setCurrentImageIndex(imageIndex >= 0 ? imageIndex : 0);
        setSelectedImage({
            url: flag.screenshot_url,
            timestamp: flag.timestamp,
            flag_type: flagLabels[flag.flag_name] || flag.flag_name,
            severity: getSeverityFromFlag(flag.flag_name),
            description: `Violation detected: ${flagLabels[flag.flag_name] || flag.flag_name}`
        });
        setIsModalOpen(true);
    };

    const getSeverityFromFlag = (flagName) => {
        const severityMap = {
            'no_face_detected': 'High',
            'multiple_faces': 'High', 
            'suspicious_activity': 'Medium',
            'tab_switched': 'Medium',
            'noise_detected': 'Low',
            'no_person_detected': 'High'
        };
        return severityMap[flagName] || 'Medium';
    };

    const handleImageNavigation = (newIndex) => {
        if (newIndex >= 0 && newIndex < allScreenshots.length) {
            setCurrentImageIndex(newIndex);
            const newFlag = allScreenshots[newIndex];
            setSelectedImage({
                url: newFlag.screenshot_url,
                timestamp: newFlag.timestamp,
                flag_type: flagLabels[newFlag.flag_name] || newFlag.flag_name,
                severity: getSeverityFromFlag(newFlag.flag_name),
                description: `Violation detected: ${flagLabels[newFlag.flag_name] || newFlag.flag_name}`
            });
        }
    };

    return (
        <div className="exam-details-view">
            {/* Header Section */}
            <div className="exam-header">
                <div className="participant-info">
                    <div className="avatar">
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: '#6f42c1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: 'bold'
                        }}>
                            {examData.exam_id ? examData.exam_id.charAt(0).toUpperCase() : 'E'}
                        </div>
                    </div>
                    <div className="info">
                        <h2 className="participant-name">Exam Participant</h2>
                        <p className="participant-email">{examData.exam_id}@exam.local</p>
                    </div>
                </div>
                
                <div className="trust-score-container">
                    <div className="trust-score">
                        <span className="score">{trustScore}%</span>
                        <span className="label">TRUST SCORE</span>
                    </div>
                </div>
                
                <div className="exam-meta">
                    <div className="meta-item">
                        <span className="label">STARTED AT</span>
                        <span className="value">
                            {examData.created_at ? formatDate(examData.created_at) : 'N/A'} {examData.created_at ? formatTime(examData.created_at) : ''}
                        </span>
                    </div>
                    <div className="meta-item">
                        <span className="label">SUBMITTED AT</span>
                        <span className="value">
                            {examData.completed_at ? formatDate(examData.completed_at) : 'N/A'} {examData.completed_at ? formatTime(examData.completed_at) : 'In Progress'}
                        </span>
                    </div>
                    <div className="meta-item">
                        <span className="label">DEVICE</span>
                        <span className="value">DESKTOP</span>
                    </div>
                </div>
            </div>

            {/* Tracking Indicators */}
            <div className="tracking-indicators">
                <div className="indicator active">
                    <span className="icon">📹</span>
                </div>
                <div className="indicator active">
                    <span className="icon">🎤</span>
                </div>
                <div className="indicator active">
                    <span className="icon">🖥️</span>
                </div>
                <div className="indicator">
                    <span className="icon">⏱️</span>
                </div>
            </div>

            {/* Statistics Summary */}
            <div className="statistics-summary">
                <div className="stat-item">
                    <span className="icon">📱</span>
                    <div className="stat-content">
                        <span className="label">TAB SWITCHED</span>
                        <span className="count">{flagCounts['tab_switched'] || 0}</span>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="icon">👤</span>
                    <div className="stat-content">
                        <span className="label">NO FACE DETECTED</span>
                        <span className="count">{flagCounts['no_face_detected'] || 0}</span>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="icon">👥</span>
                    <div className="stat-content">
                        <span className="label">MULTIPLE FACES</span>
                        <span className="count">{flagCounts['multiple_faces'] || 0}</span>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="icon">🔊</span>
                    <div className="stat-content">
                        <span className="label">NOISE DETECTED</span>
                        <span className="count">{flagCounts['noise_detected'] || 0}</span>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="icon">🖥️</span>
                    <div className="stat-content">
                        <span className="label">MULTIPLE MONITORS</span>
                        <span className="count">No</span>
                    </div>
                </div>
            </div>

            {/* Violations Table */}
            <div className="violations-section">
                <div className="section-header">
                    <h3>Violations Timeline</h3>
                    <div className="filter-section">
                        <label>Filter</label>
                        <select className="filter-select">
                            <option value="">None</option>
                            <option value="no_face_detected">No Face Detected</option>
                            <option value="multiple_faces">Multiple Faces</option>
                            <option value="suspicious_activity">Suspicious Activity</option>
                        </select>
                    </div>
                </div>

                <div className="violations-table">
                    <div className="table-header">
                        <div className="col-violation">VIOLATION TYPE</div>
                        <div className="col-time">OCCURRED AT</div>
                        <div className="col-evidence">EVIDENCE</div>
                    </div>
                    
                    <div className="table-body">
                        {examData.flags && examData.flags.length > 0 ? (
                            examData.flags.map((flag, index) => (
                                <div key={index} className="table-row">
                                    <div className="col-violation">
                                        <span className="violation-icon">⚠️</span>
                                        <span className="violation-text">
                                            {flagLabels[flag.flag_name] || flag.flag_name}
                                        </span>
                                    </div>
                                    <div className="col-time">
                                        {formatTime(flag.timestamp)}
                                    </div>
                                    <div className="col-evidence">
                                        {flag.screenshot_url && (
                                            <img 
                                                src={flag.screenshot_url} 
                                                alt={`Evidence for ${flag.flag_name}`}
                                                className="evidence-image"
                                                onClick={() => openImagePreview(flag)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="table-row no-violations">
                                <div className="col-full">
                                    <span className="no-violations-text">✅ No violations detected</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                image={selectedImage}
                allImages={allScreenshots}
                currentIndex={currentImageIndex}
                onNavigate={handleImageNavigation}
            />
        </div>
    );
};

export default ExamDetailsView;
