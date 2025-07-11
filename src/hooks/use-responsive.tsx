
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

// Enhanced utility function for responsive classes
export const responsiveClasses = {
  container: 'w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8',
  
  // Enhanced grid patterns with better tablet support
  grid: {
    // 1->2->3->4 progression with tablet optimization
    '1-2-3-4': 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6',
    // 1->2->4 with tablet as 2
    '1-2-4': 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6',
    // 1->2 with responsive gap
    '1-2': 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6',
    // 1->2->3 with tablet support
    '1-2-3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6',
    // Auto-fit columns with min widths
    'auto-fit-cards': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6',
    'auto-fit-wide': 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6'
  },
  
  // Enhanced spacing with better tablet support
  spacing: {
    section: 'space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8',
    stack: 'space-y-2 sm:space-y-3 md:space-y-4',
    items: 'space-y-1 sm:space-y-2 md:space-y-2',
    compact: 'space-y-2 sm:space-y-3',
    list: 'space-y-1.5 sm:space-y-2 md:space-y-3'
  },
  
  // Enhanced typography with better scaling
  text: {
    heading: 'text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold',
    subheading: 'text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold',
    cardTitle: 'text-base sm:text-lg md:text-lg lg:text-xl font-semibold',
    body: 'text-sm sm:text-base md:text-base',
    small: 'text-xs sm:text-sm md:text-sm',
    tiny: 'text-xs'
  },
  
  // Enhanced padding with tablet optimization
  padding: {
    section: 'p-4 sm:p-5 md:p-6 lg:p-8',
    card: 'p-3 sm:p-4 md:p-5 lg:p-6',
    cardCompact: 'p-3 sm:p-4 md:p-4',
    button: 'px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-2.5',
    buttonCompact: 'px-2 py-1.5 sm:px-3 sm:py-2',
    modal: 'p-4 sm:p-5 md:p-6'
  },
  
  // Touch-friendly button sizes
  button: {
    // Minimum 44px height for good touch targets
    touch: 'min-h-[44px] px-4 py-2.5 sm:px-5 sm:py-3',
    touchCompact: 'min-h-[40px] px-3 py-2 sm:px-4 sm:py-2.5',
    icon: 'min-h-[44px] min-w-[44px] p-2.5',
    iconCompact: 'min-h-[40px] min-w-[40px] p-2'
  },
  
  // Responsive flex patterns
  flex: {
    responsive: 'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4',
    responsiveReverse: 'flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4',
    between: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3',
    wrap: 'flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4'
  },
  
  // Enhanced card patterns
  card: {
    default: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    compact: 'rounded-md border bg-card text-card-foreground shadow-sm',
    interactive: 'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer',
    highlighted: 'rounded-lg border-2 bg-card text-card-foreground shadow-sm'
  },
  
  // Mobile-optimized list patterns
  list: {
    mobile: 'flex flex-col space-y-2 sm:space-y-3',
    mobileCompact: 'flex flex-col space-y-1.5 sm:space-y-2',
    responsive: 'hidden md:block', // Hide on mobile, show on tablet+
    mobileOnly: 'block md:hidden'  // Show on mobile, hide on tablet+
  }
};
