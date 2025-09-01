import { useState, useEffect } from 'react';
import { debounce } from '../utils/performance';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      screenWidth: width,
      screenHeight: height,
      orientation: height > width ? 'portrait' : 'landscape',
      isTouch: typeof window !== 'undefined' ? 
        ('ontouchstart' in window || navigator.maxTouchPoints > 0) : false,
    };
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width,
        screenHeight: height,
        orientation: height > width ? 'portrait' : 'landscape',
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      });
    };

    // Debounced update para melhor performance
    const debouncedUpdate = debounce(updateState, 150);

    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', debouncedUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', debouncedUpdate);
    };
  }, []);

  return state;
};

// Hooks simplificados baseados no useResponsive principal
export const useMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
};

export const useOrientation = (): 'portrait' | 'landscape' => {
  const { orientation } = useResponsive();
  return orientation;
};

export const useTouchDevice = (): boolean => {
  const { isTouch } = useResponsive();
  return isTouch;
};