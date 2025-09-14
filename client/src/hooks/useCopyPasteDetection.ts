import { useEffect, useCallback } from 'react';
import { proctoringAPI } from '../services/api';

interface CopyPasteDetectionProps {
  onCopyDetected: (type: 'copy' | 'paste', details: string) => void;
  isActive: boolean;
  examId?: string;
}

export const useCopyPasteDetection = ({ onCopyDetected, isActive, examId }: CopyPasteDetectionProps) => {
  const submitFlagToBackend = useCallback(async (flagType: string, description: string) => {
    if (examId) {
      try {
        await proctoringAPI.submitFlag(examId, flagType, description, new Date().toISOString());
      } catch (error) {
        console.error('Failed to submit copy-paste flag to backend:', error);
      }
    }
  }, [examId]);

  const handleCopy = useCallback((event: ClipboardEvent) => {
    if (!isActive) return;
    
    const selection = window.getSelection()?.toString() || '';
    const details = selection.length > 0 
      ? `Copied text: "${selection.substring(0, 50)}${selection.length > 50 ? '...' : ''}"`
      : 'Copy operation detected';
    
    onCopyDetected('copy', details);
    submitFlagToBackend('clipboard_copy', details);
  }, [onCopyDetected, isActive, submitFlagToBackend]);

  const handlePaste = useCallback((event: ClipboardEvent) => {
    if (!isActive) return;
    
    // Try to get pasted content
    const clipboardData = event.clipboardData;
    let pastedContent = '';
    
    if (clipboardData) {
      pastedContent = clipboardData.getData('text/plain');
    }
    
    const details = pastedContent.length > 0 
      ? `Pasted text: "${pastedContent.substring(0, 50)}${pastedContent.length > 50 ? '...' : ''}"`
      : 'Paste operation detected';
    
    onCopyDetected('paste', details);
    submitFlagToBackend('clipboard_paste', details);
  }, [onCopyDetected, isActive, submitFlagToBackend]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive) return;
    
    // Detect Ctrl+C, Ctrl+V, Ctrl+X (and Cmd on Mac)
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    
    if (isCtrlOrCmd) {
      switch (event.key.toLowerCase()) {
        case 'c':
          // Copy will be handled by the copy event
          break;
        case 'v':
          // Paste will be handled by the paste event
          break;
        case 'x':
          // Cut operation
          const selection = window.getSelection()?.toString() || '';
          const details = selection.length > 0 
            ? `Cut text: "${selection.substring(0, 50)}${selection.length > 50 ? '...' : ''}"`
            : 'Cut operation detected';
          onCopyDetected('copy', details);
          submitFlagToBackend('clipboard_cut', details);
          break;
      }
    }
  }, [onCopyDetected, isActive]);

  useEffect(() => {
    if (!isActive) return;

    // Add event listeners
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCopy, handlePaste, handleKeyDown, isActive]);

  return null;
};
