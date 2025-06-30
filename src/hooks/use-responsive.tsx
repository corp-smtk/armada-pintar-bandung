
import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  breakpoint: Breakpoint;
  width: number;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isWide: false,
    breakpoint: 'desktop',
    width: typeof window !== 'undefined' ? window.innerWidth : 1024
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024 && width < 1280;
      const isWide = width >= 1280;

      let breakpoint: Breakpoint = 'desktop';
      if (isMobile) breakpoint = 'mobile';
      else if (isTablet) breakpoint = 'tablet';
      else if (isDesktop) breakpoint = 'desktop';
      else if (isWide) breakpoint = 'wide';

      setState({
        isMobile,
        isTablet,
        isDesktop,
        isWide,
        breakpoint,
        width
      });
    };

    updateState();
    window.addEventListener('resize', updateState);
    return () => window.removeEventListener('resize', updateState);
  }, []);

  return state;
};

// Utility function for responsive classes
export const responsiveClasses = {
  container: 'w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8',
  grid: {
    '1-2-3-4': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6',
    '1-2-4': 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6',
    '1-2': 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6',
    '1-3': 'grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'
  },
  spacing: {
    section: 'space-y-4 sm:space-y-6',
    stack: 'space-y-2 sm:space-y-3',
    items: 'space-y-1 sm:space-y-2'
  },
  text: {
    heading: 'text-xl sm:text-2xl lg:text-3xl font-bold',
    subheading: 'text-lg sm:text-xl font-semibold',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm'
  },
  padding: {
    section: 'p-4 sm:p-6',
    card: 'p-3 sm:p-4 lg:p-6',
    button: 'px-3 py-2 sm:px-4 sm:py-2'
  }
};
