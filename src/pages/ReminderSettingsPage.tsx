import ReminderSettings from '../components/ReminderSettings';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';

const ReminderSettingsPage = () => {
  const navigate = useNavigate();
  // Tab definitions
  const tabs = [
    { label: 'Manajemen', path: '/reminder' },
    { label: 'Log', path: '/reminder/logs' },
    { label: 'Template', path: '/reminder/templates' },
    { label: 'Kontak', path: '/reminder/contacts' },
    { label: 'Pengaturan', path: '/reminder-settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeModule="reminders" setActiveModule={() => {}} onLogout={() => {}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        {/* Reminder Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b">
            {tabs.map(tab => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 ${tab.path === '/reminder-settings' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300'}`}
                aria-current={tab.path === '/reminder-settings' ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Settings Content */}
        <ReminderSettings onBack={() => navigate('/reminder')} />
      </div>
    </div>
  );
};

export default ReminderSettingsPage; 