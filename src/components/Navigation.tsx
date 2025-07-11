import { useState } from 'react';
import { BarChart3, Truck, FileText, Wrench, DollarSign, Bell, Menu, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  onLogout: () => void;
  onResetData?: () => void;
  showResetButton?: boolean;
}

const Navigation = ({ activeModule, setActiveModule, onLogout, onResetData, showResetButton }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'vehicles', label: 'Kendaraan', icon: Truck },
    { id: 'documents', label: 'Dokumen', icon: FileText },
    { id: 'maintenance', label: 'Perawatan', icon: Wrench },
    { id: 'costs', label: 'Biaya', icon: DollarSign },
    { id: 'reminders', label: 'Reminder', icon: Bell }
  ];

  const handleNavClick = (moduleId: string) => {
    setActiveModule(moduleId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8">
        <div className="flex justify-between h-16 sm:h-18">
          {/* Logo Section - Enhanced spacing and sizing */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Truck className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600 mr-2 sm:mr-3" />
              <span className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-gray-900">GasTrax</span>
            </div>
          </div>

          {/* Desktop Navigation - Improved responsive breakpoints */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1 xl:space-x-2 2xl:space-x-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center px-2 lg:px-3 xl:px-4 py-2 lg:py-2.5 border-b-2 text-xs lg:text-sm xl:text-sm font-medium transition-all duration-200 min-h-[44px] ${
                    activeModule === item.id
                      ? 'border-blue-500 text-gray-900 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-3 w-3 lg:h-4 lg:w-4 xl:h-4 xl:w-4 mr-1 lg:mr-1.5 xl:mr-2" />
                  <span className="hidden xl:block">{item.label}</span>
                  <span className="block xl:hidden">{item.label.slice(0, 8)}{item.label.length > 8 ? '...' : ''}</span>
                </button>
              );
            })}
            
            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 mx-2" />
            
            {/* Reset Data Button - Enhanced touch targets */}
            {showResetButton && onResetData && (
              <Button 
                onClick={onResetData} 
                variant="outline" 
                size="sm" 
                className="ml-2 text-orange-600 border-orange-300 hover:bg-orange-50 min-h-[40px] px-3 xl:px-4"
                title="Reset ke Data Demo"
              >
                <RotateCcw className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
                <span className="hidden xl:block">Reset</span>
              </Button>
            )}
            
            {/* Logout Button - Enhanced touch targets */}
            <Button 
              onClick={onLogout} 
              variant="outline" 
              size="sm" 
              className="ml-2 min-h-[40px] px-3 xl:px-4"
            >
              <span className="text-sm">Logout</span>
            </Button>
          </div>

          {/* Mobile Menu Button - Enhanced touch target */}
          <div className="lg:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] p-2.5 hover:bg-gray-100"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Enhanced animations and touch targets */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${
        mobileMenuOpen 
          ? 'max-h-96 opacity-100 border-t border-gray-200 bg-white' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-3 sm:px-4 md:px-5 py-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-lg transition-all duration-200 min-h-[48px] ${
                  activeModule === item.id
                    ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
          
          {/* Separator */}
          <div className="border-t border-gray-200 my-3" />
          
          {/* Mobile Action Buttons - Enhanced touch targets */}
          <div className="space-y-2">
            {showResetButton && onResetData && (
              <Button 
                onClick={onResetData} 
                variant="outline" 
                className="w-full text-orange-600 border-orange-300 hover:bg-orange-50 min-h-[48px] justify-start px-4"
              >
                <RotateCcw className="h-5 w-5 mr-3" />
                Reset ke Data Demo
              </Button>
            )}
            
            <Button 
              onClick={onLogout} 
              variant="outline" 
              className="w-full min-h-[48px] justify-start px-4"
            >
              <span className="ml-8">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
