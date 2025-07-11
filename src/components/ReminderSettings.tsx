import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, MessageCircle, MessageSquare, TestTube, Eye, EyeOff, Download, Upload, BookOpen, CheckCircle, AlertCircle, HelpCircle, Shield, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, EmailSettings, TelegramSettings, GeneralSettings } from '@/services/LocalStorageService';
import { systemConfigService } from '@/services/SystemConfigService';
import emailjs from '@emailjs/browser';
import EmailJSSetupGuide from './EmailJSSetupGuide';
import SystemConfigPanel from './SystemConfigPanel';
import { reminderService } from './ReminderService';
import { automatedSchedulerService } from '@/services/AutomatedSchedulerService';

interface ReminderSettingsProps {
  onBack: () => void;
}

const ReminderSettings = ({ onBack }: ReminderSettingsProps) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showSystemConfig, setShowSystemConfig] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [useSimpleTemplate, setUseSimpleTemplate] = useState(false);
  const [useUltraSimple, setUseUltraSimple] = useState(false);
  const [configValidation, setConfigValidation] = useState({
    email: { isValid: false, errors: [] as string[], warnings: [] as string[] },
    telegram: { isValid: false, errors: [] as string[], warnings: [] as string[] }
  });
  const [waTestStatus, setWaTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>("idle");
  const [waTestMessage, setWaTestMessage] = useState("");
  const [waTestRecipient, setWaTestRecipient] = useState("");

  // Load settings from localStorage
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => 
    localStorageService.getEmailSettings()
  );
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>(() => 
    localStorageService.getTelegramSettings()
  );
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

  // WhatsApp settings state
  const initialWhatsApp = localStorageService.getWhatsAppSettings();
  const [waEnabled, setWaEnabled] = useState(initialWhatsApp?.enabled || false);
  const [waApiKey, setWaApiKey] = useState(initialWhatsApp?.api_key || '');
  const [waSender, setWaSender] = useState(initialWhatsApp?.sender || '');
  const [waSaved, setWaSaved] = useState(false);

  // Validation functions
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

  // Update validation when settings change
  useEffect(() => {
    setConfigValidation({
      email: validateEmailConfig(emailSettings),
      telegram: validateTelegramConfig(telegramSettings)
    });
  }, [emailSettings, telegramSettings]);

  // Initialize test email with fromEmail when available
  useEffect(() => {
    if (emailSettings.fromEmail && !testEmail) {
      setTestEmail(emailSettings.fromEmail);
    }
  }, [emailSettings.fromEmail]);

  const handleTestEmail = async () => {
    if (!emailSettings.serviceId || !emailSettings.templateId || !emailSettings.publicKey) {
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
        from_name: emailSettings.fromName || 'GasTrax System - Smartek Sistem Indonesia',
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
        from_name: emailSettings.fromName || 'GasTrax System - Smartek Sistem Indonesia',
        from_email: emailSettings.fromEmail || 'system@fleet.com',
        
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
        company_name: emailSettings.fromName || 'GasTrax System - Smartek Sistem Indonesia',
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
        company: 'GasTrax System - Smartek Sistem Indonesia'
      };
    }

    // Debug: Log what we're sending
    console.log('EmailJS Parameters being sent:', templateParams);
    console.log('Service ID:', emailSettings.serviceId);
    console.log('Template ID:', emailSettings.templateId);
    
    try {
      await emailjs.send(
        emailSettings.serviceId,
        emailSettings.templateId,
        templateParams,
        emailSettings.publicKey
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
2. Edit your template "${emailSettings.templateId}"
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
    
    // Restart the automated scheduler to use the new scheduled time
    automatedSchedulerService.restart();
    
    toast({
      title: "Settings Saved",
      description: "Pengaturan reminder berhasil disimpan. Scheduler otomatis telah direstart dengan waktu baru.",
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan Reminder</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={exportSettings} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <input type="file" accept=".json" onChange={importSettings} className="hidden" />
          </label>
        </div>
      </div>

      {/* System Configuration Info */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Good News!</strong> This system comes pre-configured with working EmailJS and WhatsApp credentials. 
          Reminders work immediately without any setup required. You can optionally configure your own credentials 
          in the settings below if you prefer to use your own accounts.
        </AlertDescription>
      </Alert>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">System Config</h3>
                  <p className="text-sm text-gray-600">Auto Configuration</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Email Service</h3>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      const configStatus = systemConfigService.getConfigStatus();
                      return configStatus.email === 'system' ? 'System Configured' : 
                             configStatus.email === 'user' ? 'User Configured' : 'EmailJS Configuration';
                    })()}
                  </p>
                </div>
              </div>
              <Badge className={(() => {
                const configStatus = systemConfigService.getConfigStatus();
                return configStatus.email !== 'none' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
              })()}>
                {(() => {
                  const configStatus = systemConfigService.getConfigStatus();
                  return configStatus.email !== 'none' ? 'Ready' : 'Not Configured';
                })()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">WhatsApp Service</h3>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      const configStatus = systemConfigService.getConfigStatus();
                      return configStatus.whatsapp === 'system' ? 'System Configured' : 
                             configStatus.whatsapp === 'user' ? 'User Configured' : 'Zapin API Integration';
                    })()}
                  </p>
                </div>
              </div>
              <Badge className={(() => {
                const configStatus = systemConfigService.getConfigStatus();
                return configStatus.whatsapp !== 'none' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
              })()}>
                {(() => {
                  const configStatus = systemConfigService.getConfigStatus();
                  return configStatus.whatsapp !== 'none' ? 'Ready' : 'Not Configured';
                })()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Telegram Bot</h3>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      const configStatus = systemConfigService.getConfigStatus();
                      return configStatus.telegram === 'system' ? 'System Configured' : 
                             configStatus.telegram === 'user' ? 'User Configured' : 'Bot Integration';
                    })()}
                  </p>
                </div>
              </div>
              <Badge className={(() => {
                const configStatus = systemConfigService.getConfigStatus();
                return configStatus.telegram !== 'none' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
              })()}>
                {(() => {
                  const configStatus = systemConfigService.getConfigStatus();
                  return configStatus.telegram !== 'none' ? 'Ready' : 'Not Configured';
                })()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="system-config" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                System Config
              </TabsTrigger>
              <TabsTrigger value="email">Email Settings</TabsTrigger>
              <TabsTrigger value="setup-guide" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Setup Guide
              </TabsTrigger>
              <TabsTrigger value="telegram">Telegram Settings</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp Settings</TabsTrigger>
              <TabsTrigger value="general">General Settings</TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="system-config" className="mt-0">
                <SystemConfigPanel />
              </TabsContent>
              
              <TabsContent value="email" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Konfigurasi EmailJS
                      {configValidation.email.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">Setup EmailJS untuk mengirim email reminder</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSetupGuide(true)}
                      className="flex items-center gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Need Help?
                    </Button>
                    <Switch
                      checked={emailSettings.enabled}
                      onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enabled: checked })}
                    />
                  </div>
                </div>

                {/* Configuration Status */}
                {configValidation.email.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Configuration Errors:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {configValidation.email.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {configValidation.email.warnings.length > 0 && configValidation.email.errors.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Configuration Warnings:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {configValidation.email.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    📧 Quick Setup:
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-blue-900 p-0 h-auto font-normal underline"
                      onClick={() => setShowSetupGuide(true)}
                    >
                      View Detailed Guide
                    </Button>
                  </h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Create account at <a href="https://emailjs.com" target="_blank" className="underline">EmailJS.com</a></li>
                    <li>Setup email service (Gmail recommended)</li>
                    <li>Create template with our standardized variables</li>
                    <li>Get credentials and test connection</li>
                  </ol>
                  
                  <div className="mt-3 p-2 bg-white rounded border">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Required Template Variables:</p>
                    <p className="text-xs text-blue-800 font-mono">
                      {`{{to_name}}, {{to_email}}, {{from_name}}, {{message}}, {{vehicle}}, {{days}}, {{date}}, {{title}}, {{company}}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceId">Service ID *</Label>
                    <Input
                      id="serviceId"
                      value={emailSettings.serviceId}
                      onChange={(e) => setEmailSettings({ ...emailSettings, serviceId: e.target.value })}
                      placeholder="service_xxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateId">Template ID *</Label>
                    <Input
                      id="templateId"
                      value={emailSettings.templateId}
                      onChange={(e) => setEmailSettings({ ...emailSettings, templateId: e.target.value })}
                      placeholder="template_xxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publicKey">Public Key *</Label>
                    <div className="relative">
                      <Input
                        id="publicKey"
                        type={showPassword ? 'text' : 'password'}
                        value={emailSettings.publicKey}
                        onChange={(e) => setEmailSettings({ ...emailSettings, publicKey: e.target.value })}
                        placeholder="Your Public Key"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email *</Label>
                    <Input
                      id="fromEmail"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                      placeholder="fleet@yourcompany.com"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                      placeholder="GasTrax System - Smartek Sistem Indonesia"
                    />
                  </div>
                </div>

                {/* Test Email Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📧 Test Email Configuration</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="testEmail">Test Email Address *</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="bg-white"
                    />
                    <p className="text-xs text-blue-700">
                      Masukkan email tujuan untuk menguji konfigurasi EmailJS
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 bg-white rounded border">
                      <Switch
                        id="ultra-simple"
                        checked={useUltraSimple}
                        onCheckedChange={(checked) => {
                          setUseUltraSimple(checked);
                          if (checked) setUseSimpleTemplate(false);
                        }}
                      />
                      <Label htmlFor="ultra-simple" className="text-sm">
                        Use Ultra Simple Template (Debug Mode)
                      </Label>
                    </div>
                    
                    {!useUltraSimple && (
                      <div className="flex items-center space-x-2 p-3 bg-white rounded border">
                        <Switch
                          id="simple-template"
                          checked={useSimpleTemplate}
                          onCheckedChange={setUseSimpleTemplate}
                        />
                        <Label htmlFor="simple-template" className="text-sm">
                          Use Simple Template (Recommended for first test)
                        </Label>
                      </div>
                    )}
                  </div>

                  {useUltraSimple && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-xs font-semibold text-red-900 mb-1">🔧 Ultra Simple Template (Debug):</p>
                      <div className="text-xs text-red-800 font-mono bg-white p-2 rounded">
                        <p><strong>Subject:</strong> Test</p>
                        <p><strong>Body:</strong></p>
                        <p>Hello {`{{user_name}}`},</p>
                        <p>{`{{message}}`}</p>
                        <p>Sent to: {`{{user_email}}`}</p>
                      </div>
                      <p className="text-xs text-red-700 mt-2">⚠️ Use ONLY these 3 variables: user_name, user_email, message</p>
                    </div>
                  )}

                  {useSimpleTemplate && !useUltraSimple && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs font-semibold text-yellow-900 mb-1">Simple Template Format:</p>
                      <div className="text-xs text-yellow-800 font-mono bg-white p-2 rounded">
                        <p><strong>Subject:</strong> Test Email</p>
                        <p><strong>Body:</strong></p>
                        <p>Hello {`{{to_name}}`},</p>
                        <p>{`{{message}}`}</p>
                        <p>From: {`{{from_name}}`}</p>
                      </div>
                    </div>
                  )}

                  {!useSimpleTemplate && !useUltraSimple && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs font-semibold text-green-900 mb-1">Full Template Format:</p>
                      <div className="text-xs text-green-800 font-mono bg-white p-2 rounded">
                        <p><strong>Subject:</strong> {`{{title}} - Vehicle {{vehicle}}`}</p>
                        <p><strong>Body:</strong></p>
                        <p>Hello {`{{to_name}}`},</p>
                        <p>{`{{message}}`}</p>
                        <p>Vehicle: {`{{vehicle}}`} | Days: {`{{days}}`} | Date: {`{{date}}`}</p>
                        <p>From: {`{{from_name}}`}, {`{{company}}`}</p>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleTestEmail} 
                    disabled={testingEmail || !testEmail}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    {testingEmail ? 'Mengirim Test Email...' : `Test ${useUltraSimple ? 'Ultra Simple' : useSimpleTemplate ? 'Simple' : 'Full'} Template`}
                  </Button>
                </div>
              </TabsContent>

              {/* Setup Guide Tab */}
              <TabsContent value="setup-guide" className="mt-0">
                <EmailJSSetupGuide />
              </TabsContent>

              <TabsContent value="telegram" className="mt-0 space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Konfigurasi Telegram Bot</h3>
                    <p className="text-sm text-gray-600">Setup bot Telegram untuk mengirim reminder</p>
                  </div>
                  <Switch
                    checked={telegramSettings.enabled}
                    onCheckedChange={(checked) => setTelegramSettings({ ...telegramSettings, enabled: checked })}
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">🤖 Cara Setup Telegram Bot:</h4>
                  <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                    <li>Chat dengan <strong>@BotFather</strong> di Telegram</li>
                    <li>Ketik <code>/newbot</code> dan ikuti instruksi</li>
                    <li>Salin <strong>Bot Token</strong> yang diberikan</li>
                    <li>Tambahkan bot ke group atau chat dengan bot secara private</li>
                    <li>Dapatkan <strong>Chat ID</strong> dengan mengirim pesan ke bot</li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="botToken">Bot Token *</Label>
                    <Input
                      id="botToken"
                      value={telegramSettings.botToken}
                      onChange={(e) => setTelegramSettings({ ...telegramSettings, botToken: e.target.value })}
                      placeholder="123456789:ABCDefGhIJKLMnoPQRSTUVWXYZ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chatId">Default Chat ID</Label>
                    <Input
                      id="chatId"
                      value={telegramSettings.chatId}
                      onChange={(e) => setTelegramSettings({ ...telegramSettings, chatId: e.target.value })}
                      placeholder="-123456789 atau 123456789"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleTestTelegram} 
                  disabled={testingTelegram}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {testingTelegram ? 'Mengirim Test Message...' : 'Test Telegram Connection'}
                </Button>
              </TabsContent>

              <TabsContent value="whatsapp" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Konfigurasi WhatsApp Reminder
                      {waEnabled && waApiKey && waSender ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">Setup WhatsApp untuk mengirim pengingat otomatis via Zapin API</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={waEnabled}
                      onCheckedChange={setWaEnabled}
                    />
                    <Button variant="outline" size="sm" onClick={handleSaveWhatsApp}>
                      Simpan
                    </Button>
                    {waSaved && <span className="text-green-600 text-xs ml-2">Tersimpan!</span>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="waApiKey">API Key *</Label>
                    <Input
                      id="waApiKey"
                      value={waApiKey}
                      onChange={e => setWaApiKey(e.target.value)}
                      placeholder="API Key dari Zapin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waSender">Sender Number *</Label>
                    <Input
                      id="waSender"
                      value={waSender}
                      onChange={e => setWaSender(e.target.value)}
                      placeholder="628xxxxxxxxxx"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:w-1/2">
                  <Label htmlFor="waTestRecipient">Test Recipient (WhatsApp Number)</Label>
                  <Input
                    id="waTestRecipient"
                    value={waTestRecipient}
                    onChange={e => setWaTestRecipient(e.target.value)}
                    placeholder="628xxxxxxxxxx"
                  />
                  <Button variant="default" className="mt-2" onClick={handleTestWhatsApp} disabled={waTestStatus === 'sending'}>
                    {waTestStatus === 'sending' ? 'Mengirim...' : 'Kirim Pesan Tes'}
                  </Button>
                  {waTestStatus !== 'idle' && (
                    <div className={`mt-2 text-sm ${waTestStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>{waTestMessage}</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="general" className="mt-0 space-y-6">
                
                <div>
                  <h3 className="text-lg font-semibold">Pengaturan Umum</h3>
                  <p className="text-sm text-gray-600">Konfigurasi umum sistem reminder</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={generalSettings.timezone}
                      onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                        <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                        <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyCheckTime">Waktu Cek Harian</Label>
                    <Input
                      id="dailyCheckTime"
                      type="time"
                      value={generalSettings.dailyCheckTime}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, dailyCheckTime: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} className="px-8">
          Simpan Semua Pengaturan
        </Button>
      </div>
    </div>
  );
};

export default ReminderSettings;
