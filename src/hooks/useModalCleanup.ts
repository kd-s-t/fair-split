import { useEffect } from 'react';

export const useModalCleanup = (isOpen: boolean) => {
  useEffect(() => {
    const cleanupBodyStyles = () => {
      // Reset any body styles that might have been set by modals
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.bottom = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };

    if (!isOpen) {
      // Clean up immediately when modal closes
      cleanupBodyStyles();
    }
    
    // Cleanup function to ensure styles are reset on unmount
    return cleanupBodyStyles;
  }, [isOpen]);
};
