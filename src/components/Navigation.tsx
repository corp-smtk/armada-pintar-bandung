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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 hidden xs:block">GasTrax</span>
              <span className="text-lg sm:text-xl font-bold text-gray-900 block xs:hidden">GasTrax</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2 xl:space-x-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center px-2 xl:px-3 py-1 border-b-2 text-xs xl:text-sm font-medium transition-colors ${
                    activeModule === item.id
                      ? 'border-blue-500 text-gray-900 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
                  <span className="hidden xl:block">{item.label}</span>
                </button>
              );
            })}
            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 mx-2" />
            {/* Reset Data Button */}
            {showResetButton && onResetData && (
              <Button 
                onClick={onResetData} 
                variant="outline" 
                size="sm" 
                className="ml-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                title="Reset ke Data Demo"
              >
                <RotateCcw className="h-3 w-3 xl:h-4 xl:w-4 mr-1" />
                <span className="hidden xl:block">Reset</span>
              </Button>
            )}
            {/* Logout Button */}
            <Button onClick={onLogout} variant="outline" size="sm" className="ml-2">Logout</Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
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

      {/* Mobile Navigation Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${
        mobileMenuOpen 
          ? 'max-h-96 opacity-100 border-t border-gray-200' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="bg-white px-3 sm:px-4 py-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeModule === item.id
                    ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </button>
            );
          })}
          {/* Separator */}
          <div className="border-t border-gray-200 my-2" />
          {/* Reset Data Button */}
          {showResetButton && onResetData && (
            <Button 
              onClick={onResetData} 
              variant="outline" 
              size="sm" 
              className="w-full mb-2 text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset ke Data Demo
            </Button>
          )}
          {/* Logout Button */}
          <Button onClick={onLogout} variant="outline" size="sm" className="w-full">Logout</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
