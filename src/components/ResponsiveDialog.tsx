
import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  description?: string;
}

export const ResponsiveDialog = ({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  className = '',
  size = 'md',
  description
}: ResponsiveDialogProps) => {
  const isMobile = useIsMobile();

  // Size mappings for different screen sizes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl md:max-w-2xl',
    xl: 'max-w-xl sm:max-w-2xl md:max-w-4xl',
    full: 'max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl'
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className={`max-h-[95vh] overflow-y-auto rounded-t-xl border-t ${className}`}
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-semibold text-left">
              {title}
            </SheetTitle>
          </SheetHeader>
          <div className="pb-6">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${sizeClasses[size]} max-h-[90vh] overflow-y-auto ${className}`}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {description || `${title} dialog`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced responsive modal for complex forms and content
interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  description?: string;
}

export const ResponsiveModal = ({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  footer,
  className = '',
  size = 'md',
  showCloseButton = true,
  description
}: ResponsiveModalProps) => {
  const isMobile = useIsMobile();

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl md:max-w-2xl',
    xl: 'max-w-xl sm:max-w-2xl md:max-w-4xl',
    full: 'max-w-[95vw] sm:max-w-[90vw] md:max-w-6xl'
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className={`max-h-[95vh] flex flex-col rounded-t-xl border-t ${className}`}
        >
          <SheetHeader className="shrink-0 pb-4 border-b border-gray-100">
            <SheetTitle className="text-lg font-semibold text-left">
              {title}
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            {children}
          </div>
          
          {footer && (
            <div className="shrink-0 pt-4 border-t border-gray-100 bg-gray-50/50">
              {footer}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${sizeClasses[size]} max-h-[90vh] flex flex-col ${className}`}
      >
        <DialogHeader className="shrink-0 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {description || `${title} modal`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          {children}
        </div>
        
        {footer && (
          <div className="shrink-0 pt-4 border-t border-gray-100">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
