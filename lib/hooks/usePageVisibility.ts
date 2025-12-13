'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to detect browser tab visibility
 * Uses the Page Visibility API to determine if the tab is active or inactive
 * 
 * @returns boolean - true if tab is visible, false if hidden
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if Page Visibility API is supported
    if (typeof document === 'undefined' || !('hidden' in document)) {
      return;
    }

    // Set initial visibility state
    setIsVisible(!document.hidden);

    // Handler for visibility change
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
