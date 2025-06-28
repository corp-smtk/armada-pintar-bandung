import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, MessageCircle, TestTube, Eye, EyeOff, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, EmailSettings, TelegramSettings, GeneralSettings } from '@/services/LocalStorageService';
import emailjs from '@emailjs/browser';

interface ReminderSettingsProps {
  onBack: () => void;
}

const ReminderSettings = ({ onBack }: ReminderSettingsProps) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);

  // Load settings from localStorage
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => 
    localStorageService.getEmailSettings()
  );
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>(() => 
    localStorageService.getTelegramSettings()
  );
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(() => 
    localStorageService.getGeneralSettings()
  );

  const handleTestEmail = async () => {
    if (!emailSettings.serviceId || !emailSettings.templateId || !emailSettings.publicKey) {
      toast({
        title: "Configuration Missing",
        description: "Please fill in all EmailJS configuration fields first.",
        variant: "destructive"
      });
      return;
    }

    setTestingEmail(true);
    try {
      await emailjs.send(
        emailSettings.serviceId,
        emailSettings.templateId,
        {
          to_email: emailSettings.fromEmail,
          to_name: 'Test User',
          subject: 'Test Email dari Fleet Management System',
          message: 'Ini adalah test email untuk memastikan konfigurasi SMTP berfungsi dengan baik.',
          from_name: emailSettings.fromName,
          from_email: emailSettings.fromEmail
        },
        emailSettings.publicKey
      );

      toast({
        title: "Test Email Sent",
        description: "Test email berhasil dikirim. Periksa inbox Anda.",
      });
    } catch (error: any) {
      toast({
        title: "Test Email Failed",
        description: `Gagal mengirim test email: ${error.text || error.message}`,
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
          text: '🤖 Test message dari Fleet Management System!\n\nKonfigurasi Telegram bot berhasil!',
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

  const saveSettings = () => {
    localStorageService.saveEmailSettings(emailSettings);
    localStorageService.saveTelegramSettings(telegramSettings);
    localStorageService.saveGeneralSettings(generalSettings);
    
    toast({
      title: "Settings Saved",
      description: "Pengaturan reminder berhasil disimpan.",
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

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Email Service</h3>
                  <p className="text-sm text-gray-600">EmailJS Configuration</p>
                </div>
              </div>
              <Badge className={emailSettings.enabled && emailSettings.serviceId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {emailSettings.enabled && emailSettings.serviceId ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold">Telegram Bot</h3>
                  <p className="text-sm text-gray-600">Bot Integration</p>
                </div>
              </div>
              <Badge className={telegramSettings.enabled && telegramSettings.botToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {telegramSettings.enabled && telegramSettings.botToken ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">Email Settings</TabsTrigger>
              <TabsTrigger value="telegram">Telegram Settings</TabsTrigger>
              <TabsTrigger value="general">General Settings</TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="email" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Konfigurasi EmailJS</h3>
                    <p className="text-sm text-gray-600">Setup EmailJS untuk mengirim email reminder</p>
                  </div>
                  <Switch
                    checked={emailSettings.enabled}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enabled: checked })}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📧 Setup EmailJS:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Daftar di <a href="https://emailjs.com" target="_blank" className="underline">EmailJS.com</a></li>
                    <li>Buat Email Service (Gmail, Outlook, dll)</li>
                    <li>Buat Email Template dengan variables: to_email, to_name, subject, message, from_name</li>
                    <li>Copy Service ID, Template ID, dan Public Key</li>
                  </ol>
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
                      placeholder="Fleet Management System"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleTestEmail} 
                  disabled={testingEmail}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {testingEmail ? 'Mengirim Test Email...' : 'Test Email Connection'}
                </Button>
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
