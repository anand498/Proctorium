import { useEffect, useRef } from 'react';
import { proctoringAPI } from '../services/api';

interface TabSwitchDetectionOptions {
  onTabSwitch: (type: 'tab_switch' | 'window_blur', description: string) => void;
  isActive: boolean;
  examId?: string;
}

export const useTabSwitchDetection = ({ onTabSwitch, isActive, examId }: TabSwitchDetectionOptions) => {
  const tabSwitchCount = useRef(0);
  const lastVisibilityChange = useRef<number>(0);

  const submitFlagToBackend = async (flagType: string, description: string) => {
    if (examId) {
      try {
        await proctoringAPI.submitFlag(examId, flagType, description, new Date().toISOString());
      } catch (error) {
        console.error('Failed to submit flag to backend:', error);
      }
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      const now = Date.now();
      
      // Prevent rapid fire events (debounce for 1 second)
      if (now - lastVisibilityChange.current < 1000) {
        return;
      }
      
      lastVisibilityChange.current = now;

      if (document.hidden) {
        tabSwitchCount.current += 1;
        const description = `Tab switch detected (Count: ${tabSwitchCount.current}). User switched away from exam tab.`;
        onTabSwitch('tab_switch', description);
        submitFlagToBackend('tab_switch', description);
      }
    };

    const handleWindowBlur = () => {
      const now = Date.now();
      
      // Prevent rapid fire events (debounce for 1 second)
      if (now - lastVisibilityChange.current < 1000) {
        return;
      }
      
      lastVisibilityChange.current = now;

      const description = `Window focus lost. User may have switched to another application.`;
      onTabSwitch('window_blur', description);
      submitFlagToBackend('window_blur', description);
    };

    const handleWindowFocus = () => {
      // Reset the debounce timer when window regains focus
      lastVisibilityChange.current = Date.now();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [onTabSwitch, isActive]);

  // Additional keyboard shortcut detection for common tab switching
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Detect common tab switching shortcuts
      const isTabSwitch = 
        (event.ctrlKey && event.key === 'Tab') ||
        (event.altKey && event.key === 'Tab') ||
        (event.metaKey && event.key === 'Tab') ||
        (event.ctrlKey && (event.key >= '1' && event.key <= '9')) ||
        (event.metaKey && (event.key >= '1' && event.key <= '9'));

      if (isTabSwitch) {
        event.preventDefault(); // Try to prevent the action
        const description = `Attempted tab switch using keyboard shortcut: ${event.ctrlKey ? 'Ctrl+' : ''}${event.altKey ? 'Alt+' : ''}${event.metaKey ? 'Cmd+' : ''}${event.key}`;
        onTabSwitch('tab_switch', description);
        submitFlagToBackend('tab_switch', description);
      }

      // Detect F11 (fullscreen toggle)
      if (event.key === 'F11') {
        event.preventDefault();
        const description = 'Attempted to toggle fullscreen mode';
        onTabSwitch('window_blur', description);
        submitFlagToBackend('window_blur', description);
      }

      // Detect Alt+F4 (close window)
      if (event.altKey && event.key === 'F4') {
        event.preventDefault();
        const description = 'Attempted to close window';
        onTabSwitch('window_blur', description);
        submitFlagToBackend('window_blur', description);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onTabSwitch, isActive]);

  return { tabSwitchCount: tabSwitchCount.current };
};
