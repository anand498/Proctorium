import React from 'react';
import './ImagePreviewModal.css';

const ImagePreviewModal = ({ isOpen, onClose, image, allImages = [], currentIndex = 0, onNavigate }) => {
  if (!isOpen || !image) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && onNavigate && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && onNavigate && currentIndex < allImages.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return timestamp;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'var(--accent-danger)';
      case 'medium':
        return 'var(--accent-warning)';
      case 'low':
        return 'var(--accent-info)';
      default:
        return 'var(--text-secondary)';
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex, allImages.length]);

  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="image-preview-header">
          <div className="image-info">
            <h3>Screenshot Details</h3>
            {allImages.length > 1 && (
              <span className="image-counter">
                {currentIndex + 1} of {allImages.length}
              </span>
            )}
          </div>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Image Container */}
        <div className="image-container">
          <img 
            src={image.url || image.screenshot_url} 
            alt="Screenshot" 
            className="preview-image"
          />
          
          {/* Navigation buttons */}
          {onNavigate && allImages.length > 1 && (
            <>
              <button 
                className="nav-button nav-previous" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentIndex > 0) onNavigate(currentIndex - 1);
                }}
                disabled={currentIndex === 0}
              >
                ‹
              </button>
              <button 
                className="nav-button nav-next" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentIndex < allImages.length - 1) onNavigate(currentIndex + 1);
                }}
                disabled={currentIndex === allImages.length - 1}
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Image Details */}
        <div className="image-details">
          <div className="detail-grid">
            <div className="detail-item">
              <label>Timestamp</label>
              <span>{formatTimestamp(image.timestamp || image.created_at)}</span>
            </div>
            
            {image.flag_type && (
              <div className="detail-item">
                <label>Flag Type</label>
                <span className="flag-type">{image.flag_type}</span>
              </div>
            )}
            
            {image.severity && (
              <div className="detail-item">
                <label>Severity</label>
                <span 
                  className="severity-badge"
                  style={{ color: getSeverityColor(image.severity) }}
                >
                  {image.severity}
                </span>
              </div>
            )}
            
            {image.confidence && (
              <div className="detail-item">
                <label>Confidence</label>
                <span>{Math.round(image.confidence * 100)}%</span>
              </div>
            )}
            
            {image.description && (
              <div className="detail-item full-width">
                <label>Description</label>
                <span>{image.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer with actions */}
        <div className="image-preview-footer">
          <div className="footer-actions">
            <a 
              href={image.url || image.screenshot_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="action-button primary"
            >
              Open Original
            </a>
            <button 
              className="action-button secondary"
              onClick={() => {
                const link = document.createElement('a');
                link.href = image.url || image.screenshot_url;
                link.download = `screenshot_${image.timestamp || Date.now()}.jpg`;
                link.click();
              }}
            >
              Download
            </button>
          </div>
          
          {allImages.length > 1 && (
            <div className="navigation-hint">
              Use arrow keys or buttons to navigate
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
