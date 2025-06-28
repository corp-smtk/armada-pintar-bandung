
import { useState } from 'react';
import { Bell, Plus, Settings, Mail, MessageCircle, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import ReminderSettings from './ReminderSettings';
import ReminderLogs from './ReminderLogs';

const ReminderManagement = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Mock data for active reminders
  const activeReminders = [
    {
      id: 1,
      title: 'Service Rutin - B 1234 AB',
      type: 'service',
      vehicle: 'B 1234 AB',
      triggerDate: '2025-01-15',
      daysBeforeAlert: [30, 14, 7, 1],
      channels: ['email', 'telegram'],
      recipients: ['fleet@company.com', 'driver1@company.com'],
      status: 'active',
      lastSent: '2024-12-15',
      nextSend: '2025-01-08'
    },
    {
      id: 2,
      title: 'STNK Kadaluarsa - B 5678 CD',
      type: 'document',
      vehicle: 'B 5678 CD',
      document: 'STNK',
      triggerDate: '2025-02-20',
      daysBeforeAlert: [60, 30, 14, 7],
      channels: ['email', 'telegram'],
      recipients: ['admin@company.com'],
      status: 'active',
      lastSent: null,
      nextSend: '2024-12-21'
    },
    {
      id: 3,
      title: 'KIR Renewal - B 9101 EF',
      type: 'document',
      vehicle: 'B 9101 EF',
      document: 'KIR',
      triggerDate: '2025-03-01',
      daysBeforeAlert: [45, 30, 15, 7],
      channels: ['telegram'],
      recipients: ['fleet@company.com'],
      status: 'active',
      lastSent: null,
      nextSend: '2025-01-15'
    }
  ];

  const predefinedTemplates = [
    {
      type: 'service',
      title: 'Service Rutin',
      description: 'Reminder untuk jadwal service berkala',
      defaultDays: [30, 14, 7, 1],
      messageTemplate: 'Kendaraan {vehicle} perlu service dalam {days} hari. Jadwal: {date}'
    },
    {
      type: 'document_stnk',
      title: 'STNK Kadaluarsa',
      description: 'Reminder perpanjangan STNK',
      defaultDays: [60, 30, 14, 7],
      messageTemplate: 'STNK kendaraan {vehicle} akan kadaluarsa dalam {days} hari. Tanggal: {date}'
    },
    {
      type: 'document_kir',
      title: 'KIR Kadaluarsa',
      description: 'Reminder perpanjangan KIR',
      defaultDays: [45, 30, 15, 7],
      messageTemplate: 'KIR kendaraan {vehicle} akan kadaluarsa dalam {days} hari. Tanggal: {date}'
    },
    {
      type: 'insurance',
      title: 'Asuransi Kadaluarsa',
      description: 'Reminder perpanjangan asuransi',
      defaultDays: [60, 30, 14, 7],
      messageTemplate: 'Asuransi kendaraan {vehicle} akan kadaluarsa dalam {days} hari. Tanggal: {date}'
    },
    {
      type: 'custom',
      title: 'Custom Reminder',
      description: 'Reminder kustom sesuai kebutuhan',
      defaultDays: [30, 14, 7],
      messageTemplate: 'Reminder: {title} untuk kendaraan {vehicle} dalam {days} hari'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'expired': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'service': Calendar,
      'document': AlertTriangle,
      'insurance': AlertTriangle,
      'custom': Bell
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  const CreateReminderForm = () => {
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [formData, setFormData] = useState({
      title: '',
      type: '',
      vehicle: '',
      document: '',
      triggerDate: '',
      daysBeforeAlert: [],
      channels: [] as string[],
      recipients: [] as string[],
      messageTemplate: '',
      isRecurring: false,
      recurringInterval: '1',
      recurringUnit: 'month'
    });

    const handleTemplateSelect = (templateType: string) => {
      const template = predefinedTemplates.find(t => t.type === templateType);
      if (template) {
        setFormData({
          ...formData,
          type: template.type,
          title: template.title,
          daysBeforeAlert: template.defaultDays,
          messageTemplate: template.messageTemplate
        });
      }
      setSelectedTemplate(templateType);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Buat Reminder Baru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Pilih Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {predefinedTemplates.map((template) => (
                <div
                  key={template.type}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTemplateSelect(template.type)}
                >
                  <h4 className="font-semibold text-sm">{template.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Reminder *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul reminder"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Kendaraan *</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, vehicle: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kendaraan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B1234AB">B 1234 AB - Mitsubishi Canter</SelectItem>
                  <SelectItem value="B5678CD">B 5678 CD - Toyota Hilux</SelectItem>
                  <SelectItem value="B9101EF">B 9101 EF - Isuzu Elf</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(selectedTemplate.includes('document') || selectedTemplate === 'insurance') && (
              <div className="space-y-2">
                <Label htmlFor="document">Jenis Dokumen</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, document: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stnk">STNK</SelectItem>
                    <SelectItem value="kir">KIR</SelectItem>
                    <SelectItem value="asuransi">Asuransi</SelectItem>
                    <SelectItem value="sim">SIM Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="triggerDate">Tanggal Target *</Label>
              <Input
                id="triggerDate"
                type="date"
                value={formData.triggerDate}
                onChange={(e) => setFormData({ ...formData, triggerDate: e.target.value })}
              />
            </div>
          </div>

          {/* Days Before Alert */}
          <div className="space-y-2">
            <Label>Kirim Reminder Berapa Hari Sebelumnya</Label>
            <div className="flex flex-wrap gap-2">
              {[60, 45, 30, 21, 14, 7, 3, 1].map((day) => (
                <label key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.daysBeforeAlert.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          daysBeforeAlert: [...formData.daysBeforeAlert, day].sort((a, b) => b - a)
                        });
                      } else {
                        setFormData({
                          ...formData,
                          daysBeforeAlert: formData.daysBeforeAlert.filter(d => d !== day)
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{day} hari</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notification Channels */}
          <div className="space-y-2">
            <Label>Channel Notifikasi</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.channels.includes('email')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, channels: [...formData.channels, 'email'] });
                    } else {
                      setFormData({ ...formData, channels: formData.channels.filter(c => c !== 'email') });
                    }
                  }}
                  className="rounded"
                />
                <Mail className="h-4 w-4" />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.channels.includes('telegram')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, channels: [...formData.channels, 'telegram'] });
                    } else {
                      setFormData({ ...formData, channels: formData.channels.filter(c => c !== 'telegram') });
                    }
                  }}
                  className="rounded"
                />
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Telegram</span>
              </label>
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="recipients">Penerima (Email/Telegram Username)</Label>
            <Textarea
              id="recipients"
              placeholder="Masukkan email atau username telegram, pisahkan dengan koma"
              className="min-h-[80px]"
            />
          </div>

          {/* Message Template */}
          <div className="space-y-2">
            <Label htmlFor="messageTemplate">Template Pesan</Label>
            <Textarea
              id="messageTemplate"
              value={formData.messageTemplate}
              onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
              placeholder="Template pesan reminder"
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500">
              Gunakan placeholder: {'{vehicle}'}, {'{days}'}, {'{date}'}, {'{title}'}
            </p>
          </div>

          {/* Recurring Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
              />
              <Label htmlFor="recurring">Reminder Berulang</Label>
            </div>
            {formData.isRecurring && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={formData.recurringInterval}
                  onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value })}
                  className="w-20"
                  min="1"
                />
                <Select
                  value={formData.recurringUnit}
                  onValueChange={(value) => setFormData({ ...formData, recurringUnit: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Minggu</SelectItem>
                    <SelectItem value="month">Bulan</SelectItem>
                    <SelectItem value="year">Tahun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1">Simpan Reminder</Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (showSettings) {
    return <ReminderSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Reminder</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettings(true)} className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Pengaturan
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat Reminder
          </Button>
        </div>
      </div>

      {showCreateForm && <CreateReminderForm />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reminder</p>
                <p className="text-2xl font-bold text-blue-600">{activeReminders.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeReminders.filter(r => r.status === 'active').length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kirim Hari Ini</p>
                <p className="text-2xl font-bold text-orange-600">2</p>
              </div>
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">98%</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminder Management Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Reminder Aktif</TabsTrigger>
              <TabsTrigger value="logs">Log Pengiriman</TabsTrigger>
              <TabsTrigger value="templates">Template</TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="active" className="mt-0">
                <div className="space-y-4">
                  {activeReminders.map((reminder) => {
                    const TypeIcon = getTypeIcon(reminder.type);
                    return (
                      <div key={reminder.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <TypeIcon className="h-8 w-8 text-blue-600" />
                            <div>
                              <h3 className="font-semibold">{reminder.title}</h3>
                              <p className="text-sm text-gray-600">Kendaraan: {reminder.vehicle}</p>
                              <p className="text-sm text-gray-600">Target: {reminder.triggerDate}</p>
                              <div className="flex gap-1 mt-1">
                                {reminder.daysBeforeAlert.map(day => (
                                  <span key={day} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {day}d
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusBadge(reminder.status)}>
                              {reminder.status}
                            </Badge>
                            <div className="text-sm text-gray-600 mt-1">
                              Kirim berikutnya: {reminder.nextSend}
                            </div>
                            <div className="flex gap-1 mt-2">
                              {reminder.channels.map(channel => (
                                <span key={channel} className="text-xs flex items-center gap-1">
                                  {channel === 'email' ? <Mail className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                                  {channel}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="mt-0">
                <ReminderLogs />
              </TabsContent>

              <TabsContent value="templates" className="mt-0">
                <div className="space-y-4">
                  {predefinedTemplates.map((template) => (
                    <div key={template.type} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{template.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Default alert days: {template.defaultDays.join(', ')} hari sebelumnya
                          </p>
                          <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded">
                            {template.messageTemplate}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderManagement;
