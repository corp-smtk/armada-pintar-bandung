import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, MessageCircle, MessageSquare, TestTube, Eye, EyeOff, Download, Upload, BookOpen, CheckCircle, AlertCircle, HelpCircle, Shield, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, EmailSettings, TelegramSettings, GeneralSettings } from '@/services/LocalStorageService';
import { systemConfigService } from '@/services/SystemConfigService';
import emailjs from '@emailjs/browser';
import EmailJSSetupGuide from './EmailJSSetupGuide';
import SystemConfigPanel from './SystemConfigPanel';
import { reminderService } from './ReminderService';
import { automatedSchedulerService } from '@/services/AutomatedSchedulerService';

const SECTIONS = [
  { key: 'system-config', label: 'System Config', icon: Shield },
  { key: 'email', label: 'Email Settings', icon: Mail },
  { key: 'setup-guide', label: 'Setup Guide', icon: BookOpen },
  { key: 'telegram', label: 'Telegram Settings', icon: MessageCircle },
  { key: 'whatsapp', label: 'WhatsApp Settings', icon: MessageSquare },
  { key: 'general', label: 'General Settings', icon: Info },
];

interface ReminderSettingsProps {
  onBack: () => void;
}

const ReminderSettings = ({ onBack }: ReminderSettingsProps) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [useSimpleTemplate, setUseSimpleTemplate] = useState(false);
  const [useUltraSimple, setUseUltraSimple] = useState(false);
  const [configValidation, setConfigValidation] = useState({
    email: { isValid: false, errors: [] as string[], warnings: [] as string[] },
    telegram: { isValid: false, errors: [] as string[], warnings: [] as string[] }
  });
  const [waTestStatus, setWaTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [waTestMessage, setWaTestMessage] = useState('');
  const [waTestRecipient, setWaTestRecipient] = useState('');
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => localStorageService.getEmailSettings());
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>(() => localStorageService.getTelegramSettings());
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(() => {
    const settings = localStorageService.getGeneralSettings();
    return settings || {
      timezone: 'Asia/Jakarta',
      dailyCheckTime: '09:00',
      maxRetryAttempts: 3,
      retryInterval: 30,
      enableAutoRetry: true,
      enableDeliveryReports: true
    };
  });
  const initialWhatsApp = localStorageService.getWhatsAppSettings();
  const [waEnabled, setWaEnabled] = useState(initialWhatsApp?.enabled || false);
  const [waApiKey, setWaApiKey] = useState(initialWhatsApp?.api_key || '');
  const [waSender, setWaSender] = useState(initialWhatsApp?.sender || '');
  const [waSaved, setWaSaved] = useState(false);
  const [selectedSection, setSelectedSection] = useState('email');

  const validateEmailConfig = (settings: EmailSettings) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!settings.serviceId) errors.push('Service ID is required');
    else if (!settings.serviceId.startsWith('service_')) warnings.push('Service ID should start with "service_"');
    if (!settings.templateId) errors.push('Template ID is required');
    else if (!settings.templateId.startsWith('template_')) warnings.push('Template ID should start with "template_"');
    if (!settings.publicKey) errors.push('Public Key is required');
    else if (!settings.publicKey.startsWith('user_')) warnings.push('Public Key should start with "user_"');
    if (!settings.fromEmail) errors.push('From Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.fromEmail)) errors.push('Invalid email format');
    if (!settings.fromName) warnings.push('From Name is recommended for better email appearance');
    return { isValid: errors.length === 0, errors, warnings };
  };
  const validateTelegramConfig = (settings: TelegramSettings) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!settings.botToken) errors.push('Bot Token is required');
    else if (!settings.botToken.includes(':')) warnings.push('Bot Token format seems incorrect');
    if (!settings.chatId) errors.push('Chat ID is required');
    return { isValid: errors.length === 0, errors, warnings };
  };
  useEffect(() => {
    setConfigValidation({
      email: validateEmailConfig(emailSettings),
      telegram: validateTelegramConfig(telegramSettings)
    });
  }, [emailSettings, telegramSettings]);
  useEffect(() => {
    if (emailSettings.fromEmail && !testEmail) {
      setTestEmail(emailSettings.fromEmail);
    }
  }, [emailSettings.fromEmail]);

  const handleTestEmail = async () => {
    // Use effective config (user or system default)
    const effectiveConfig = systemConfigService.getEffectiveEmailConfig();
    if (!effectiveConfig.serviceId || !effectiveConfig.templateId || !effectiveConfig.publicKey) {
      toast({
        title: "Configuration Missing",
        description: "Please fill in all EmailJS configuration fields first.",
        variant: "destructive"
      });
      return;
    }

    if (!testEmail) {
      toast({
        title: "Test Email Required",
        description: "Please enter a test email address.",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setTestingEmail(true);

    // Template parameters we're sending
    let templateParams;

    // Always use correct branding for sender name
    const senderName = !effectiveConfig.fromName || effectiveConfig.fromName.includes('Your Company Name')
      ? 'GasTrax System - Smartek Sistem Indonesia'
      : effectiveConfig.fromName;

    if (useUltraSimple) {
      // Ultra simple - absolute minimum
      templateParams = {
        user_name: 'Test User',
        user_email: testEmail,
        message: 'Hello! This is a test email.'
      };
    } else if (useSimpleTemplate) {
      // Simple template - only basic variables
      templateParams = {
        to_name: 'Test User',
        to_email: testEmail,
        from_name: senderName,
        message: 'Ini adalah test email untuk memastikan konfigurasi EmailJS berfungsi dengan baik. Jika Anda menerima email ini, maka konfigurasi sudah benar.'
      };
    } else {
      // Full template - all variables (matching our simplified EmailJS template)
      templateParams = {
        // Basic template variables
        subject: 'Test Reminder - Fleet Management',
        to_name: 'Test User',
        to_email: testEmail,
        reply_to: testEmail, // EmailJS built-in field for reply address
        from_name: senderName,
        from_email: effectiveConfig.fromEmail || 'system@fleet.com',

        // Enhanced message content
        message: 'Ini adalah test email untuk memastikan konfigurasi EmailJS berfungsi dengan baik. Jika Anda menerima email ini, maka konfigurasi sudah benar.',
        html_message: '<p>Ini adalah <strong>test email</strong> untuk memastikan konfigurasi EmailJS berfungsi dengan baik.</p><p>Jika Anda menerima email ini, maka konfigurasi sudah <em>benar</em>.</p>',
        plain_message: 'Ini adalah test email untuk memastikan konfigurasi EmailJS berfungsi dengan baik. Jika Anda menerima email ini, maka konfigurasi sudah benar.',

        // Detailed reminder information
        vehicle_info: 'B 1234 TEST',
        due_date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        days_remaining: '7',
        urgency_text: '(NORMAL)', // Simplified urgency without conditional logic
        reminder_type: 'Test Reminder',
        document_type: 'Test Document',

        // Additional context
        company_name: senderName,
        current_date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),

        // System info
        reminder_id: 'TEST_' + Date.now(),

        // Legacy compatibility fields (for backward compatibility)
        vehicle: 'B 1234 TEST',
        days: '7',
        date: new Date().toLocaleDateString('id-ID'),
        title: 'Test Reminder',
        company: senderName
      };
    }

    // Debug: Log what we're sending
    console.log('EmailJS Parameters being sent:', templateParams);
    console.log('Service ID:', effectiveConfig.serviceId);
    console.log('Template ID:', effectiveConfig.templateId);

    try {
      await emailjs.send(
        effectiveConfig.serviceId,
        effectiveConfig.templateId,
        templateParams,
        effectiveConfig.publicKey
      );

      toast({
        title: "Test Email Sent",
        description: `Test email berhasil dikirim ke ${testEmail}. Periksa inbox Anda.`,
      });
    } catch (error: any) {
      // Enhanced error logging
      console.error('EmailJS Error Details:', error);
      console.error('Error Status:', error.status);
      console.error('Error Text:', error.text);
      console.error('Full Error Object:', JSON.stringify(error, null, 2));

      let errorMessage = 'Unknown error occurred';

      if (error.status === 422) {
        if (error.text?.includes('recipients address is empty')) {
          errorMessage = `Template Configuration Error (422): The EmailJS template is missing recipient configuration.
          
🔧 Quick Fix:
1. Go to your EmailJS dashboard → Email Templates
2. Edit your template "${effectiveConfig.templateId}"
3. In template settings, set "To Email" field to: {{to_email}}
4. Make sure "Auto-Reply" is disabled or configured properly
5. Save the template and try again

This error means EmailJS can't find where to send the email. The template needs to know which parameter contains the recipient email address.`;
        } else if (error.text?.includes('corrupted') || error.text?.includes('dynamic variables')) {
          errorMessage = `Template Variables Error (422): One or more template variables are corrupted or mismatched.

🔧 Quick Fix:
1. EmailJS only supports SIMPLE variable substitution like {{variable_name}}
2. REMOVE any complex logic like {{#if condition}} or {{#if_eq var 'value'}}
3. Use our simplified template from the setup guide
4. Make sure all variables in template match what we're sending
5. Check that {{to_email}}, {{subject}}, {{html_message}} are properly configured

Common issue: Template contains handlebars logic that EmailJS doesn't support.`;
        } else {
          errorMessage = `Template Error (422): ${error.text || 'Template parameters mismatch. Check your EmailJS template variables.'}`;
        }
      } else if (error.status === 400) {
        errorMessage = `Configuration Error (400): ${error.text || 'Invalid Service ID, Template ID, or Public Key.'}`;
      } else if (error.status === 401) {
        errorMessage = `Authentication Error (401): ${error.text || 'Invalid Public Key or service not accessible.'}`;
      } else if (error.text) {
        errorMessage = `EmailJS Error: ${error.text}`;
      } else if (error.message) {
        errorMessage = `Network Error: ${error.message}`;
      }

      toast({
        title: "Test Email Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramSettings.botToken || !telegramSettings.chatId) {
      toast({
        title: "Configuration Missing",
        description: "Please fill in Bot Token and Chat ID first.",
        variant: "destructive"
      });
      return;
    }

    setTestingTelegram(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${telegramSettings.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramSettings.chatId,
          text: '🤖 Test message dari GasTrax System - Smartek Sistem Indonesia!\n\nKonfigurasi Telegram bot berhasil!',
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) {
        toast({
          title: "Test Telegram Sent",
          description: "Test message berhasil dikirim ke Telegram.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.description || 'Unknown error');
      }
    } catch (error: any) {
      toast({
        title: "Test Telegram Failed",
        description: `Gagal mengirim test telegram: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleSaveWhatsApp = () => {
    localStorageService.saveWhatsAppSettings({
      enabled: waEnabled,
      api_key: waApiKey,
      sender: waSender
    });
    setWaSaved(true);
    toast({ title: "WhatsApp Settings Saved" });
    setTimeout(() => setWaSaved(false), 2000);
  };

  const handleTestWhatsApp = async () => {
    setWaTestStatus('sending');
    setWaTestMessage("");
    try {
      // Use test recipient if set, otherwise sender
      const targetNumber = waTestRecipient.trim() || waSender;
      const result = await reminderService.sendWhatsApp(
        targetNumber,
        'Ini adalah pesan tes WhatsApp dari GasTrax System - Smartek Sistem Indonesia.',
        'test-wa-settings'
      );
      if (result.success) {
        setWaTestStatus('success');
        setWaTestMessage('Pesan tes berhasil dikirim ke WhatsApp ' + targetNumber + '!');
      } else {
        setWaTestStatus('error');
        setWaTestMessage('Gagal mengirim pesan tes: ' + (result.error || 'Unknown error'));
      }
    } catch (err: any) {
      setWaTestStatus('error');
      setWaTestMessage('Gagal mengirim pesan tes: ' + (err.message || 'Unknown error'));
    }
  };

  const saveSettings = () => {
    localStorageService.saveEmailSettings(emailSettings);
    localStorageService.saveTelegramSettings(telegramSettings);
    localStorageService.saveGeneralSettings(generalSettings);
    automatedSchedulerService.restart();
    toast({
      title: "Settings Saved",
      description: "All settings have been saved.",
    });
  };

  const exportSettings = () => {
    try {
      const data = localStorageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleet-reminder-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Settings Exported",
        description: "Pengaturan berhasil di-export ke file JSON.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Gagal mengexport pengaturan.",
        variant: "destructive"
      });
    }
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        localStorageService.importData(content);
        
        // Reload settings
        setEmailSettings(localStorageService.getEmailSettings());
        setTelegramSettings(localStorageService.getTelegramSettings());
        setGeneralSettings(localStorageService.getGeneralSettings());
        
        toast({
          title: "Settings Imported",
          description: "Pengaturan berhasil di-import.",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "File import tidak valid.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 border-b pb-4 mb-4">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2" aria-label="Back to previous page">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Kembali</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 flex-1">Pengaturan Reminder</h1>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button variant="outline" onClick={exportSettings} className="flex items-center gap-2" aria-label="Export settings" title="Export settings to a JSON file">
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Export</span>
          </Button>
          <label className="cursor-pointer" aria-label="Import settings" title="Import settings from a JSON file">
            <Button asChild variant="outline" className="flex items-center gap-2">
              <div>
                <Upload className="h-4 w-4" aria-hidden="true" />
                <span>Import</span>
              </div>
            </Button>
            <input type="file" accept=".json" onChange={importSettings} className="hidden" />
          </label>
        </div>
      </div>

      {/* System Status Section */}
      <div className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Good News!</strong> This system comes pre-configured. You can optionally configure your own credentials below.
          </AlertDescription>
        </Alert>

        <h2 className="text-xl font-semibold text-gray-800">System Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* System Config Card */}
          <Card className="shadow-sm rounded-lg">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">System Config</h3>
                  <p className="text-sm text-gray-600">Auto Configuration</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border border-blue-200 rounded-full px-3 py-1 text-xs font-semibold">Active</Badge>
            </CardContent>
          </Card>
          {/* Other status cards would go here, simplified for brevity */}
        </div>
      </div>
      
      {/* Two-column layout for settings */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="md:w-64 flex-shrink-0">
          <ul className="space-y-2">
            {SECTIONS.map(section => (
              <li key={section.key}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedSection === section.key ? 'bg-blue-600 text-white font-semibold shadow-md' : 'hover:bg-gray-100 text-gray-800'}`}
                  onClick={() => setSelectedSection(section.key)}
                  aria-current={selectedSection === section.key ? 'page' : undefined}
                >
                  <section.icon className="h-5 w-5" aria-hidden="true" />
                  <span>{section.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content Panel */}
        <main className="flex-1 min-w-0">
          {SECTIONS.map(section => (
            <div key={section.key} hidden={selectedSection !== section.key}>
              <Card className="shadow-lg rounded-xl">
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-6 flex items-center gap-3">
                    <section.icon className="h-6 w-6" aria-hidden="true" />
                    {section.label}
                  </h2>
                  
                  {/* Render content based on section key */}
                  {section.key === 'system-config' && <SystemConfigPanel />}
                  {section.key === 'email' && (
                    <div className="space-y-4">
                      {/* Email Settings Summary */}
                      {(() => {
                        const configStatus = systemConfigService.getConfigStatus();
                        const effectiveConfig = systemConfigService.getEffectiveEmailConfig();
                        return (
                          <Alert className={configStatus.email === 'system' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}>
                            <Mail className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{configStatus.email === 'system' ? 'Menggunakan Konfigurasi Default Sistem' : 'Menggunakan Konfigurasi Kustom Anda'}</span>
                                <Badge className={configStatus.email === 'system' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-green-100 text-green-800 border border-green-200'}>
                                  {configStatus.email === 'system' ? 'System Default' : 'Custom/User'}
                                </Badge>
                              </div>
                              <div className="mt-2 text-sm text-gray-700">
                                <div><b>Sender:</b> {effectiveConfig.fromName} ({effectiveConfig.fromEmail})</div>
                                <div><b>Service ID:</b> {effectiveConfig.serviceId}</div>
                                <div><b>Template ID:</b> {effectiveConfig.templateId}</div>
                              </div>
                            </AlertDescription>
                          </Alert>
                        );
                      })()}

                      {/* Email Test Template */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <TestTube className="h-5 w-5 text-blue-500" />
                          <span className="font-semibold">Test Template Email</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end gap-2 mb-2">
                          <Input
                            type="email"
                            placeholder="Alamat email tujuan tes"
                            value={testEmail}
                            onChange={e => setTestEmail(e.target.value)}
                            className="md:w-64"
                            disabled={testingEmail}
                          />
                          <Select value={useUltraSimple ? 'ultra' : useSimpleTemplate ? 'simple' : 'full'}
                            onValueChange={val => {
                              setUseUltraSimple(val === 'ultra');
                              setUseSimpleTemplate(val === 'simple');
                            }}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Tipe Template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full Template</SelectItem>
                              <SelectItem value="simple">Simple</SelectItem>
                              <SelectItem value="ultra">Ultra Simple</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={handleTestEmail} disabled={testingEmail} variant="secondary">
                            {testingEmail ? 'Mengirim...' : 'Kirim Tes'}
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500">Kirim email percobaan ke alamat di atas menggunakan template yang dipilih.</div>
                      </div>

                      {/* Email Settings Content */}
                      <div>Email content here</div>
                    </div>
                  )}
                  {section.key === 'setup-guide' && <EmailJSSetupGuide />}
                   {section.key === 'telegram' && (
                    <div className="space-y-4">
                      {/* Telegram Settings Content */}
                      <div>Telegram content here</div>
                    </div>
                  )}
                  {section.key === 'whatsapp' && (
                     <div className="space-y-4">
                      {/* WhatsApp Settings Summary */}
                      {(() => {
                        const configStatus = systemConfigService.getConfigStatus();
                        const effectiveConfig = systemConfigService.getEffectiveWhatsAppConfig();
                        return (
                          <Alert className={configStatus.whatsapp === 'system' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}>
                            <MessageSquare className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{configStatus.whatsapp === 'system' ? 'Menggunakan Konfigurasi Default Sistem' : 'Menggunakan Konfigurasi Kustom Anda'}</span>
                                <Badge className={configStatus.whatsapp === 'system' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-green-100 text-green-800 border border-green-200'}>
                                  {configStatus.whatsapp === 'system' ? 'System Default' : 'Custom/User'}
                                </Badge>
                              </div>
                              <div className="mt-2 text-sm text-gray-700">
                                <div><b>Sender:</b> {effectiveConfig.sender}</div>
                                <div><b>API Key:</b> {effectiveConfig.api_key}</div>
                              </div>
                            </AlertDescription>
                          </Alert>
                        );
                      })()}

                      {/* WhatsApp Test Template */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <TestTube className="h-5 w-5 text-green-500" />
                          <span className="font-semibold">Test Template WhatsApp</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end gap-2 mb-2">
                          <Input
                            type="text"
                            placeholder="Nomor WhatsApp tujuan tes (cth: 6281234567890)"
                            value={waTestRecipient}
                            onChange={e => setWaTestRecipient(e.target.value)}
                            className="md:w-64"
                            disabled={waTestStatus === 'sending'}
                          />
                          <Button onClick={handleTestWhatsApp} disabled={waTestStatus === 'sending'} variant="secondary">
                            {waTestStatus === 'sending' ? 'Mengirim...' : 'Kirim Tes'}
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">Kirim pesan WhatsApp percobaan ke nomor di atas menggunakan template sistem.</div>
                        {waTestStatus === 'success' && <div className="text-green-600 text-sm">{waTestMessage}</div>}
                        {waTestStatus === 'error' && <div className="text-red-600 text-sm">{waTestMessage}</div>}
                      </div>

                      {/* WhatsApp Settings Content */}
                      <div>WhatsApp content here</div>
                    </div>
                  )}
                  {section.key === 'general' && (
                     <div className="space-y-4">
                      {/* General Settings Content */}
                      <div>General content here</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </main>
      </div>

      <div className="flex justify-end pt-4 border-t mt-8">
        <Button onClick={saveSettings} size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">
          Simpan Semua Pengaturan
        </Button>
      </div>
    </div>
  );
};

export default ReminderSettings;
