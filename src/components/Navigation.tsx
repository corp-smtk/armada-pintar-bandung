import { BarChart3, Truck, FileText, Wrench, DollarSign, Bell } from 'lucide-react';

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

const Navigation = ({ activeModule, setActiveModule }: NavigationProps) => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Truck className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Fleet Manager</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => setActiveModule('dashboard')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeModule === 'dashboard'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveModule('vehicles')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeModule === 'vehicles'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Truck className="h-4 w-4 mr-2" />
                Kendaraan
              </button>
              <button
                onClick={() => setActiveModule('documents')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeModule === 'documents'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Dokumen
              </button>
              <button
                onClick={() => setActiveModule('maintenance')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeModule === 'maintenance'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Perawatan
              </button>
              <button
                onClick={() => setActiveModule('costs')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeModule === 'costs'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Biaya
              </button>
              <button
                onClick={() => setActiveModule('reminders')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeModule === 'reminders'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Bell className="h-4 w-4 mr-2" />
                Reminder
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
