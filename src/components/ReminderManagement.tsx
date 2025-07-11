import { useState, useEffect } from 'react';
import { Bell, Plus, Settings, Mail, MessageCircle, Calendar, AlertTriangle, AlertCircle, CheckCircle, Save, Users, FileText, Play, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useReminderService } from './ReminderService';
import EmailTemplateManager from './EmailTemplateManager';
import EmailTargetingManager from './EmailTargetingManager';
import ReminderSettings from './ReminderSettings';
import ReminderLogs from './ReminderLogs';

const ReminderManagement = () => {
  const { toast } = useToast();
  const reminderService = useReminderService();
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTargetingManager, setShowTargetingManager] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [selectedEmailContacts, setSelectedEmailContacts] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isRunningDailyCheck, setIsRunningDailyCheck] = useState(false);
  const [isRunningCleanup, setIsRunningCleanup] = useState(false);
  const [emailQueue, setEmailQueue] = useState<any[]>([]);
  const [whatsappQueue, setWhatsappQueue] = useState<any[]>([]);
  const [telegramQueue, setTelegramQueue] = useState<any[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [expandedReminderId, setExpandedReminderId] = useState<string | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);

  // Add contact management state and logic
  const [contacts, setContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  // Load contacts on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('fleet_contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      // Migrate from old email contacts if present
      const oldContacts = localStorage.getItem('fleet_email_contacts');
      if (oldContacts) {
        const migrated = JSON.parse(oldContacts).map((c: any) => ({
          ...c,
          whatsapp: '',
        }));
        setContacts(migrated);
        localStorage.setItem('fleet_contacts', JSON.stringify(migrated));
      } else {
        setContacts([]);
      }
    }
  }, []);

  const saveContacts = (updated: any[]) => {
    setContacts(updated);
    localStorage.setItem('fleet_contacts', JSON.stringify(updated));
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email || !newContact.whatsapp) {
      toast({ title: 'Validasi Gagal', description: 'Nama, email, dan nomor WhatsApp wajib diisi', variant: 'destructive' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newContact.email)) {
      toast({ title: 'Email tidak valid', description: 'Masukkan email yang benar', variant: 'destructive' });
      return;
    }
    const waRegex = /^\d{8,15}$/;
    if (!waRegex.test(newContact.whatsapp)) {
      toast({ title: 'Nomor WhatsApp tidak valid', description: 'Gunakan format kode negara, contoh: 6281234567890', variant: 'destructive' });
      return;
    }
    const contact = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email,
      whatsapp: newContact.whatsapp,
      createdAt: new Date().toISOString(),
    };
    const updated = [...contacts, contact];
    saveContacts(updated);
    setShowAddContact(false);
    setNewContact({ name: '', email: '', whatsapp: '' });
    toast({ title: 'Kontak Ditambahkan', description: `${contact.name} berhasil ditambahkan.` });
  };

  const handleEditContact = (contact: any) => {
    setEditingContact(contact);
    setNewContact({ name: contact.name, email: contact.email, whatsapp: contact.whatsapp });
    setShowAddContact(true);
  };

  const handleSaveEditContact = () => {
    if (!newContact.name || !newContact.email || !newContact.whatsapp) {
      toast({ title: 'Validasi Gagal', description: 'Nama, email, dan nomor WhatsApp wajib diisi', variant: 'destructive' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newContact.email)) {
      toast({ title: 'Email tidak valid', description: 'Masukkan email yang benar', variant: 'destructive' });
      return;
    }
    const waRegex = /^\d{8,15}$/;
    if (!waRegex.test(newContact.whatsapp)) {
      toast({ title: 'Nomor WhatsApp tidak valid', description: 'Gunakan format kode negara, contoh: 6281234567890', variant: 'destructive' });
      return;
    }
    const updated = contacts.map((c: any) =>
      c.id === editingContact.id ? { ...c, ...newContact } : c
    );
    saveContacts(updated);
    setShowAddContact(false);
    setEditingContact(null);
    setNewContact({ name: '', email: '', whatsapp: '' });
    toast({ title: 'Kontak Diperbarui', description: `${newContact.name} berhasil diperbarui.` });
  };

  const handleDeleteContact = (id: string) => {
    if (window.confirm('Hapus kontak ini?')) {
      const updated = contacts.filter((c: any) => c.id !== id);
      saveContacts(updated);
      toast({ title: 'Kontak Dihapus', description: 'Kontak berhasil dihapus.' });
    }
  };

  // Get real reminder data from service
  const activeReminders = reminderService.getReminderConfigs().map(reminder => ({
    ...reminder,
    // Calculate next send date based on trigger date and days before alert
    nextSend: (() => {
      const triggerDate = new Date(reminder.triggerDate);
      const today = new Date();
      const daysUntilTrigger = Math.ceil((triggerDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Find the next alert day
      const nextAlertDay = reminder.daysBeforeAlert
        .filter(day => day >= daysUntilTrigger)
        .sort((a, b) => b - a)[0]; // Get the largest day that's >= days until trigger
      
      if (nextAlertDay) {
        const nextSendDate = new Date(triggerDate);
        nextSendDate.setDate(nextSendDate.getDate() - nextAlertDay);
        return nextSendDate.toLocaleDateString('id-ID');
      }
      
      return 'No more alerts';
    })(),
    lastSent: null // We could track this in the delivery logs if needed
  }));

  // Function to manually run daily check
  const handleRunDailyCheck = async () => {
    setIsRunningDailyCheck(true);
    try {
      const remindersToCheck = await reminderService.checkDailyReminders();
      
      if (remindersToCheck.length === 0) {
        toast({
          title: "Daily Check Complete",
          description: "No reminders need to be sent today.",
        });
      } else {
        toast({
          title: "Daily Check Started",
          description: `Found ${remindersToCheck.length} reminders to send. Processing...`,
        });
        
        await reminderService.runDailyCheck();
        
        toast({
          title: "Daily Check Complete",
          description: `Successfully processed ${remindersToCheck.length} reminders.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Daily Check Failed",
        description: `Error running daily check: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsRunningDailyCheck(false);
    }
  };

  // Function to manually run cleanup of invalid reminders
  const handleCleanupInvalidReminders = async () => {
    setIsRunningCleanup(true);
    try {
      await reminderService.manualCleanupInvalidReminders();
      // Refresh the reminders list
      window.location.reload(); // Simple way to refresh the UI
    } catch (error: any) {
      toast({
        title: "Cleanup Failed",
        description: `Error cleaning up reminders: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsRunningCleanup(false);
    }
  };

  // Fetch queues for all channels (reminders due to be sent today)
  const fetchAllQueues = async () => {
    setIsLoadingQueue(true);
    try {
      const dueReminders = await reminderService.checkDailyReminders();
      
      // Filter by channel and active status
      const emailReminders = dueReminders.filter(
        (r: any) => r.channels.includes('email') && r.status === 'active'
      );
      const whatsappReminders = dueReminders.filter(
        (r: any) => r.channels.includes('whatsapp') && r.status === 'active'
      );
      const telegramReminders = dueReminders.filter(
        (r: any) => r.channels.includes('telegram') && r.status === 'active'
      );
      
      setEmailQueue(emailReminders);
      setWhatsappQueue(whatsappReminders);
      setTelegramQueue(telegramReminders);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    fetchAllQueues();
    setDeliveryLogs(reminderService.getDeliveryLogs());
  }, []);

  // useEffect(() => {
  //   setDeliveryLogs(reminderService.getDeliveryLogs());
  // }, [activeReminders]);

  const handleToggleHistory = (reminderId: string) => {
    setExpandedReminderId(expandedReminderId === reminderId ? null : reminderId);
  };

  const handleRetry = async (reminder: any, log: any) => {
    await reminderService.sendReminder(reminder);
    setDeliveryLogs(reminderService.getDeliveryLogs());
  };

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
    const { toast } = useToast();
    const reminderService = useReminderService();
    const [recipientsText, setRecipientsText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [formData, setFormData] = useState({
      title: '',
      type: '',
      vehicle: '',
      document: '',
      triggerDate: '',
      daysBeforeAlert: [] as number[],
      channels: [] as string[],
      recipients: [] as string[],
      messageTemplate: '',
      isRecurring: false,
      recurringInterval: '1',
      recurringUnit: 'month' as 'week' | 'month' | 'year'
    });

    // Validation functions
    const validateForm = () => {
      const errors: string[] = [];
      
      // Required fields validation
      if (!formData.title.trim()) errors.push('Judul reminder harus diisi');
      if (!formData.vehicle) errors.push('Kendaraan harus dipilih');
      if (!formData.triggerDate) errors.push('Tanggal target harus diisi');
      if (formData.channels.length === 0) errors.push('Minimal pilih satu channel notifikasi');
      if (recipientsText.trim() === '') errors.push('Penerima harus diisi');
      if (!formData.messageTemplate.trim()) errors.push('Template pesan harus diisi');
      if (formData.daysBeforeAlert.length === 0) errors.push('Pilih minimal satu hari untuk reminder');
      
      // Date validation
      if (formData.triggerDate) {
        const triggerDate = new Date(formData.triggerDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (triggerDate <= today) {
          errors.push('Tanggal target harus di masa depan');
        }
      }
      
      // Recipients validation
      if (recipientsText.trim()) {
        const recipients = recipientsText.split(',').map(r => r.trim()).filter(r => r);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const telegramRegex = /^@[a-zA-Z0-9_]{5,}$/;
        
        for (const recipient of recipients) {
          if (formData.channels.includes('email') && !emailRegex.test(recipient) && !recipient.startsWith('@')) {
            errors.push(`Format email tidak valid: ${recipient}`);
          }
          if (formData.channels.includes('telegram') && !telegramRegex.test(recipient) && recipient.includes('@')) {
            errors.push(`Format username Telegram tidak valid: ${recipient} (harus @username)`);
          }
        }
      }
      
      // Template variables validation
      const requiredVariables = ['{vehicle}', '{days}', '{date}'];
      const missingVariables = requiredVariables.filter(variable => 
        !formData.messageTemplate.includes(variable)
      );
      if (missingVariables.length > 0) {
        errors.push(`Template pesan harus mengandung: ${missingVariables.join(', ')}`);
      }
      
      setValidationErrors(errors);
      return errors.length === 0;
    };

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
        // Clear validation errors when template changes
        setValidationErrors([]);
      }
      setSelectedTemplate(templateType);
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        toast({
          title: "Validation Error",
          description: "Mohon perbaiki error di form sebelum menyimpan",
          variant: "destructive"
        });
        return;
      }

      setIsSubmitting(true);
      try {
        // Parse recipients - prioritize contact manager selection over manual text
        const recipients = selectedEmailContacts.length > 0 
          ? selectedEmailContacts
          : recipientsText.split(',').map(r => r.trim()).filter(r => r);
        
        const reminderConfig = {
          ...formData,
          recipients,
          status: 'active' as const
        };

        const newReminder = reminderService.addReminderConfig(reminderConfig);
        
        toast({
          title: "Reminder Created",
          description: `Reminder "${formData.title}" berhasil dibuat`,
        });

        // Reset form
        setFormData({
          title: '',
          type: '',
          vehicle: '',
          document: '',
          triggerDate: '',
          daysBeforeAlert: [],
          channels: [],
          recipients: [],
          messageTemplate: '',
          isRecurring: false,
          recurringInterval: '1',
          recurringUnit: 'month'
        });
        setRecipientsText('');
        setSelectedEmailContacts([]);
        setSelectedTemplate('');
        setValidationErrors([]);
        setShowCreateForm(false);
        
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Gagal membuat reminder: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
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
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Form Validation Errors:</strong>
                <ul className="list-disc list-inside mt-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

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
            <div className="flex items-center justify-between">
              <Label htmlFor="recipients">Penerima (Email/Telegram Username) *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTargetingManager(true)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Manage Contacts
              </Button>
            </div>
            <Textarea
              id="recipients"
              value={selectedEmailContacts.length > 0 ? selectedEmailContacts.join(', ') : recipientsText}
              onChange={(e) => {
                if (selectedEmailContacts.length === 0) {
                  setRecipientsText(e.target.value);
                }
              }}
              placeholder="Masukkan email atau username telegram, pisahkan dengan koma"
              className="min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Contoh: admin@company.com, @fleetmanager, driver@company.com
              </p>
              {selectedEmailContacts.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedEmailContacts.length} contacts selected
                </Badge>
              )}
            </div>
          </div>

          {/* Message Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="messageTemplate">Template Pesan</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateManager(true)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Browse Templates
              </Button>
            </div>
            <Textarea
              id="messageTemplate"
              value={formData.messageTemplate}
              onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
              placeholder="Template pesan reminder"
              className="min-h-[100px]"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Gunakan placeholder: {'{vehicle}'}, {'{days}'}, {'{date}'}, {'{title}'}
              </p>
              {selectedTemplate && (
                <Badge variant="secondary" className="text-xs">
                  Using: {selectedTemplate}
                </Badge>
              )}
            </div>
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

          {/* Form Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Reminder
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateForm(false);
                setValidationErrors([]);
                setFormData({
                  title: '',
                  type: '',
                  vehicle: '',
                  document: '',
                  triggerDate: '',
                  daysBeforeAlert: [],
                  channels: [],
                  recipients: [],
                  messageTemplate: '',
                  isRecurring: false,
                  recurringInterval: '1',
                  recurringUnit: 'month'
                });
                setRecipientsText('');
                setSelectedEmailContacts([]);
                setSelectedTemplate('');
              }}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Targeting Manager Dialog
  if (showTargetingManager) {
    return (
      <EmailTargetingManager
        selectedContacts={selectedEmailContacts}
        onContactsChange={(contacts) => {
          setSelectedEmailContacts(contacts);
          setRecipientsText(''); // Clear manual text when using contact manager
        }}
        onClose={() => setShowTargetingManager(false)}
      />
    );
  }

  // Template Manager Dialog
  if (showTemplateManager) {
    return (
      <EmailTemplateManager
        selectedTemplate={selectedTemplate}
        onTemplateSelect={(template) => {
          setFormData({ 
            ...formData, 
            messageTemplate: template.content 
          });
          setSelectedTemplate(template.name);
          setShowTemplateManager(false);
        }}
        onClose={() => setShowTemplateManager(false)}
      />
    );
  }

  if (showSettings) {
    return <ReminderSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Reminder</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRunDailyCheck}
            disabled={isRunningDailyCheck}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunningDailyCheck ? 'Running...' : 'Run Daily Check'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCleanupInvalidReminders}
            disabled={isRunningCleanup}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isRunningCleanup ? 'Cleaning...' : 'Cleanup Invalid'}
          </Button>
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
                <p className="text-2xl font-bold text-orange-600">
                  {emailQueue.length + whatsappQueue.length + telegramQueue.length}
                </p>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active">Reminder Aktif</TabsTrigger>
              <TabsTrigger value="logs">Log Pengiriman</TabsTrigger>
              <TabsTrigger value="templates">Template</TabsTrigger>
              <TabsTrigger value="contacts">Kontak</TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="active" className="mt-0">
                {/* Email Queue Section */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      Queue Pengiriman Email Hari Ini
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={fetchAllQueues}
                        disabled={isLoadingQueue}
                      >
                        {isLoadingQueue ? 'Memuat...' : 'Refresh'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {emailQueue.length === 0 ? (
                      <div className="text-gray-500">Tidak ada reminder email yang akan dikirim hari ini.</div>
                    ) : (
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-2 text-left">Judul</th>
                            <th className="p-2 text-left">Penerima</th>
                            <th className="p-2 text-left">Jenis</th>
                            <th className="p-2 text-left">Waktu Kirim</th>
                            <th className="p-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emailQueue.map(reminder => (
                            <tr key={reminder.id} className="border-t">
                              <td className="p-2">{reminder.title}</td>
                              <td className="p-2">{reminder.recipients.join(', ')}</td>
                              <td className="p-2">{reminder.type}</td>
                              <td className="p-2">09:00 AM</td>
                              <td className="p-2">Queued</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
                {/* End Email Queue Section */}
                
                {/* WhatsApp Queue Section */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      Queue Pengiriman WhatsApp Hari Ini
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {whatsappQueue.length === 0 ? (
                      <div className="text-gray-500">Tidak ada reminder WhatsApp yang akan dikirim hari ini.</div>
                    ) : (
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-2 text-left">Judul</th>
                            <th className="p-2 text-left">Penerima</th>
                            <th className="p-2 text-left">Jenis</th>
                            <th className="p-2 text-left">Waktu Kirim</th>
                            <th className="p-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {whatsappQueue.map(reminder => (
                            <tr key={`wa-${reminder.id}`} className="border-t">
                              <td className="p-2">{reminder.title}</td>
                              <td className="p-2">{reminder.recipients.join(', ')}</td>
                              <td className="p-2">{reminder.type}</td>
                              <td className="p-2">09:00 AM</td>
                              <td className="p-2">Queued</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
                {/* End WhatsApp Queue Section */}
                
                {/* Telegram Queue Section */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                      Queue Pengiriman Telegram Hari Ini
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {telegramQueue.length === 0 ? (
                      <div className="text-gray-500">Tidak ada reminder Telegram yang akan dikirim hari ini.</div>
                    ) : (
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-2 text-left">Judul</th>
                            <th className="p-2 text-left">Penerima</th>
                            <th className="p-2 text-left">Jenis</th>
                            <th className="p-2 text-left">Waktu Kirim</th>
                            <th className="p-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {telegramQueue.map(reminder => (
                            <tr key={`tg-${reminder.id}`} className="border-t">
                              <td className="p-2">{reminder.title}</td>
                              <td className="p-2">{reminder.recipients.join(', ')}</td>
                              <td className="p-2">{reminder.type}</td>
                              <td className="p-2">09:00 AM</td>
                              <td className="p-2">Queued</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
                {/* End Telegram Queue Section */}
                
                <div className="space-y-4">
                  {activeReminders.map((reminder) => {
                    const TypeIcon = getTypeIcon(reminder.type);
                    const logs = deliveryLogs.filter(log => log.reminderId === reminder.id);
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleToggleHistory(reminder.id)}
                            >
                              {expandedReminderId === reminder.id ? 'Hide History' : 'View History'}
                            </Button>
                          </div>
                        </div>
                        {expandedReminderId === reminder.id && (
                          <div className="mt-4 border-t pt-4">
                            <h4 className="font-semibold mb-2">Delivery History</h4>
                            {logs.length === 0 ? (
                              <div className="text-gray-500 text-sm">No delivery logs for this reminder.</div>
                            ) : (
                              <table className="w-full text-xs border">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="p-2 text-left">Date/Time</th>
                                    <th className="p-2 text-left">Channel</th>
                                    <th className="p-2 text-left">Recipient</th>
                                    <th className="p-2 text-left">Status</th>
                                    <th className="p-2 text-left">Error</th>
                                    <th className="p-2 text-left">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {logs.map((log, idx) => (
                                    <tr key={idx} className="border-t">
                                      <td className="p-2">{log.sentAt ? new Date(log.sentAt).toLocaleString('id-ID') : '-'}</td>
                                      <td className="p-2">{log.channel}</td>
                                      <td className="p-2">{log.recipient}</td>
                                      <td className="p-2">
                                        <span className={
                                          log.status === 'delivered' ? 'text-green-600' :
                                          log.status === 'failed' ? 'text-red-600' :
                                          'text-gray-600'
                                        }>
                                          {log.status}
                                        </span>
                                      </td>
                                      <td className="p-2 text-xs text-red-600">{log.errorMessage || '-'}</td>
                                      <td className="p-2">
                                        {log.status === 'failed' && (
                                          <Button
                                            variant="outline"
                                            size="xs"
                                            onClick={() => handleRetry(reminder, log)}
                                          >
                                            Retry
                                          </Button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
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

              <TabsContent value="contacts" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">Manajemen Kontak</CardTitle>
                    <Button onClick={() => { setShowAddContact(true); setEditingContact(null); }} className="mt-2" size="sm">Tambah Kontak</Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                          {contacts.map((c: any) => (
                            <tr key={c.id}>
                              <td className="px-4 py-2">{c.name}</td>
                              <td className="px-4 py-2">{c.email}</td>
                              <td className="px-4 py-2">{c.whatsapp}</td>
                              <td className="px-4 py-2 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditContact(c)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteContact(c.id)}>Hapus</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Add/Edit Contact Modal */}
                    {showAddContact && (
                      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold">{editingContact ? 'Edit Kontak' : 'Tambah Kontak'}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="contact-name">Nama</Label>
                              <Input id="contact-name" placeholder="Nama" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contact-email">Email</Label>
                              <Input id="contact-email" placeholder="Email" value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contact-wa">WhatsApp (cth: 6281234567890)</Label>
                              <Input id="contact-wa" placeholder="WhatsApp" value={newContact.whatsapp} onChange={e => setNewContact({ ...newContact, whatsapp: e.target.value.replace(/\D/g, '') })} />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button onClick={editingContact ? handleSaveEditContact : handleAddContact} className="flex-1">Simpan</Button>
                              <Button variant="outline" onClick={() => { setShowAddContact(false); setEditingContact(null); setNewContact({ name: '', email: '', whatsapp: '' }); }} className="flex-1">Batal</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderManagement;
