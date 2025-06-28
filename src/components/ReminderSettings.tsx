
import { useState } from 'react';
import { ArrowLeft, Mail, MessageCircle, TestTube, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ReminderSettingsProps {
  onBack: () => void;
}

const ReminderSettings = ({ onBack }: ReminderSettingsProps) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);

  // Mock current settings - Ini yang perlu diganti dengan data real
  const [emailSettings, setEmailSettings] = useState({
    enabled: true,
    smtpHost: 'smtp.gmail.com', // GANTI: SMTP server Anda
    smtpPort: '587',
    smtpSecurity: 'tls',
    smtpUsername: 'your-email@gmail.com', // GANTI: Email username
    smtpPassword: 'your-app-password', // GANTI: App password atau SMTP password
    fromEmail: 'fleet@yourcompany.com', // GANTI: Email pengirim
    fromName: 'Fleet Management System'
  });

  const [telegramSettings, setTelegramSettings] = useState({
    enabled: true,
    botToken: 'YOUR_BOT_TOKEN_HERE', // GANTI: Token bot Telegram dari @BotFather
    chatId: 'YOUR_CHAT_ID_HERE', // GANTI: Chat ID untuk testing
    webhookUrl: '' // Optional untuk webhook
  });

  const [generalSettings, setGeneralSettings] = useState({
    timezone: 'Asia/Jakarta',
    dailyCheckTime: '08:00',
    maxRetryAttempts: 3,
    retryInterval: 60, // dalam menit
    enableAutoRetry: true,
    enableDeliveryReports: true
  });

  const handleTestEmail = async () => {
    setTestingEmail(true);
    // Simulasi test email
    setTimeout(() => {
      setTestingEmail(false);
      toast({
        title: "Test Email Sent",
        description: "Test email berhasil dikirim. Periksa inbox Anda.",
      });
    }, 2000);
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    // Simulasi test telegram
    setTimeout(() => {
      setTestingTelegram(false);
      toast({
        title: "Test Telegram Sent",
        description: "Test message berhasil dikirim ke Telegram.",
      });
    }, 2000);
  };

  const saveSettings = () => {
    // TODO: Implement save to backend/localStorage
    toast({
      title: "Settings Saved",
      description: "Pengaturan reminder berhasil disimpan.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan Reminder</h1>
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
                  <p className="text-sm text-gray-600">SMTP Configuration</p>
                </div>
              </div>
              <Badge className={emailSettings.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {emailSettings.enabled ? 'Connected' : 'Disconnected'}
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
              <Badge className={telegramSettings.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {telegramSettings.enabled ? 'Connected' : 'Disconnected'}
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
                    <h3 className="text-lg font-semibold">Konfigurasi Email SMTP</h3>
                    <p className="text-sm text-gray-600">Pengaturan server email untuk mengirim reminder</p>
                  </div>
                  <Switch
                    checked={emailSettings.enabled}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enabled: checked })}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📧 Kredensial yang Perlu Diisi:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>SMTP Host:</strong> Server SMTP Anda (contoh: smtp.gmail.com, smtp.outlook.com)</li>
                    <li>• <strong>Username & Password:</strong> Kredensial email atau App Password</li>
                    <li>• <strong>Port:</strong> 587 (TLS) atau 465 (SSL)</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host *</Label>
                    <Input
                      id="smtpHost"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port *</Label>
                    <Select
                      value={emailSettings.smtpPort}
                      onValueChange={(value) => setEmailSettings({ ...emailSettings, smtpPort: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="587">587 (TLS)</SelectItem>
                        <SelectItem value="465">465 (SSL)</SelectItem>
                        <SelectItem value="25">25 (Plain)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">Username/Email *</Label>
                    <Input
                      id="smtpUsername"
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">Password *</Label>
                    <div className="relative">
                      <Input
                        id="smtpPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                        placeholder="App Password"
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
                  <div className="space-y-2">
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
                    <p className="text-sm text-gray-600">Pengaturan bot Telegram untuk mengirim reminder</p>
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
                    <p className="text-xs text-gray-500">
                      Dapatkan dari @BotFather setelah membuat bot
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chatId">Default Chat ID</Label>
                    <Input
                      id="chatId"
                      value={telegramSettings.chatId}
                      onChange={(e) => setTelegramSettings({ ...telegramSettings, chatId: e.target.value })}
                      placeholder="-123456789 atau 123456789"
                    />
                    <p className="text-xs text-gray-500">
                      Chat ID untuk testing. Bisa group (-123456789) atau personal (123456789)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                    <Input
                      id="webhookUrl"
                      value={telegramSettings.webhookUrl}
                      onChange={(e) => setTelegramSettings({ ...telegramSettings, webhookUrl: e.target.value })}
                      placeholder="https://yourapp.com/telegram/webhook"
                    />
                    <p className="text-xs text-gray-500">
                      Untuk receive updates dari Telegram (opsional)
                    </p>
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
                    <p className="text-xs text-gray-500">Waktu sistem mengecek reminder yang perlu dikirim</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxRetryAttempts">Max Retry Attempts</Label>
                    <Input
                      id="maxRetryAttempts"
                      type="number"
                      min="1"
                      max="10"
                      value={generalSettings.maxRetryAttempts}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, maxRetryAttempts: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retryInterval">Retry Interval (menit)</Label>
                    <Input
                      id="retryInterval"
                      type="number"
                      min="5"
                      max="1440"
                      value={generalSettings.retryInterval}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, retryInterval: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Auto Retry pada Kegagalan</h4>
                      <p className="text-sm text-gray-600">Otomatis coba kirim ulang jika gagal</p>
                    </div>
                    <Switch
                      checked={generalSettings.enableAutoRetry}
                      onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, enableAutoRetry: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Delivery Reports</h4>
                      <p className="text-sm text-gray-600">Simpan log detail pengiriman</p>
                    </div>
                    <Switch
                      checked={generalSettings.enableDeliveryReports}
                      onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, enableDeliveryReports: checked })}
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
