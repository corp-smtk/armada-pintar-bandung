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
import { ResponsiveTable, ResponsiveTableRow, ResponsiveTableCell, MobileTable, MobileTableItem } from './ResponsiveTable';
import { ResponsiveModal } from './ResponsiveDialog';
import EmailTemplateManager from './EmailTemplateManager';
import EmailTargetingManager from './EmailTargetingManager';
import ReminderSettings from './ReminderSettings';
import ReminderLogs from './ReminderLogs';
import AutomatedSchedulerStatusWidget from './AutomatedSchedulerStatusWidget';

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
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header with Control Buttons - Enhanced responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Reminder</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Kelola notifikasi otomatis untuk perawatan kendaraan</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={() => setShowCreateForm(true)} 
            className="min-h-[44px] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="truncate">Buat Reminder</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowSettings(true)}
            className="min-h-[44px] flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="truncate">Pengaturan</span>
          </Button>
        </div>
      </div>

      {/* Automated Scheduler Status Widget */}
      <AutomatedSchedulerStatusWidget />

      {/* Control Panel - Enhanced responsive grid */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Panel Kontrol Manual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            <Button 
              onClick={handleRunDailyCheck} 
              disabled={isRunningDailyCheck}
              className="min-h-[44px] flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunningDailyCheck ? 'Menjalankan...' : 'Jalankan Daily Check'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCleanupInvalidReminders}
              disabled={isRunningCleanup}
              className="min-h-[44px] flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isRunningCleanup ? 'Membersihkan...' : 'Bersihkan Invalid'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={fetchAllQueues}
              disabled={isLoadingQueue}
              className="min-h-[44px] flex items-center justify-center gap-2 sm:col-span-2 lg:col-span-1"
            >
              <Bell className="h-4 w-4" />
              {isLoadingQueue ? 'Memuat...' : 'Refresh Queue'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards - Enhanced responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base text-gray-600">Active Reminders</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">
                  {activeReminders.length}
                </p>
              </div>
              <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base text-gray-600">Queue Today</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600">
                  {emailQueue.length + whatsappQueue.length + telegramQueue.length}
                </p>
              </div>
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base text-gray-600">Success Rate</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">98%</p>
              </div>
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminder Management Tabs - Enhanced responsive design */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile-optimized tab list */}
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger value="active" className="text-xs sm:text-sm p-2 sm:p-3">
                <span className="hidden sm:inline">Reminder Aktif</span>
                <span className="sm:hidden">Aktif</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-xs sm:text-sm p-2 sm:p-3">
                <span className="hidden sm:inline">Log Pengiriman</span>
                <span className="sm:hidden">Log</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs sm:text-sm p-2 sm:p-3">Template</TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs sm:text-sm p-2 sm:p-3">Kontak</TabsTrigger>
            </TabsList>
            
            <div className="p-4 sm:p-5 md:p-6">
              <TabsContent value="active" className="mt-0 space-y-4 sm:space-y-5 md:space-y-6">
                {/* Email Queue Section - Mobile optimized */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Queue Pengiriman Email Hari Ini
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchAllQueues}
                        disabled={isLoadingQueue}
                        className="min-h-[40px] shrink-0"
                      >
                        {isLoadingQueue ? 'Memuat...' : 'Refresh'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {emailQueue.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <Mail className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm sm:text-base">Tidak ada reminder email yang akan dikirim hari ini.</p>
                      </div>
                    ) : (
                      <MobileTable>
                        {emailQueue.map(reminder => (
                          <MobileTableItem
                            key={reminder.id}
                            title={reminder.title}
                            subtitle={`Penerima: ${reminder.recipients.join(', ')}`}
                            status={<Badge variant="outline">Queued</Badge>}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis:</span>
                              <span className="text-sm text-gray-900">{reminder.type}</span>
                            </div>
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu:</span>
                              <span className="text-sm text-gray-900">09:00 AM</span>
                            </div>
                          </MobileTableItem>
                        ))}
                      </MobileTable>
                    )}
                  </CardContent>
                </Card>
                
                {/* WhatsApp Queue Section - Mobile optimized */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      Queue Pengiriman WhatsApp Hari Ini
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {whatsappQueue.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm sm:text-base">Tidak ada reminder WhatsApp yang akan dikirim hari ini.</p>
                      </div>
                    ) : (
                      <MobileTable>
                        {whatsappQueue.map(reminder => (
                          <MobileTableItem
                            key={`wa-${reminder.id}`}
                            title={reminder.title}
                            subtitle={`Penerima: ${reminder.recipients.join(', ')}`}
                            status={<Badge variant="outline">Queued</Badge>}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis:</span>
                              <span className="text-sm text-gray-900">{reminder.type}</span>
                            </div>
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu:</span>
                              <span className="text-sm text-gray-900">09:00 AM</span>
                            </div>
                          </MobileTableItem>
                        ))}
                      </MobileTable>
                    )}
                  </CardContent>
                </Card>
                
                {/* Telegram Queue Section - Mobile optimized */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      Queue Pengiriman Telegram Hari Ini
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {telegramQueue.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm sm:text-base">Tidak ada reminder Telegram yang akan dikirim hari ini.</p>
                      </div>
                    ) : (
                      <MobileTable>
                        {telegramQueue.map(reminder => (
                          <MobileTableItem
                            key={`tg-${reminder.id}`}
                            title={reminder.title}
                            subtitle={`Penerima: ${reminder.recipients.join(', ')}`}
                            status={<Badge variant="outline">Queued</Badge>}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis:</span>
                              <span className="text-sm text-gray-900">{reminder.type}</span>
                            </div>
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu:</span>
                              <span className="text-sm text-gray-900">09:00 AM</span>
                            </div>
                          </MobileTableItem>
                        ))}
                      </MobileTable>
                    )}
                  </CardContent>
                </Card>
                
                {/* Active Reminders List - Enhanced mobile layout */}
                <div className="space-y-3 sm:space-y-4">
                  {activeReminders.map((reminder) => {
                    const TypeIcon = getTypeIcon(reminder.type);
                    const logs = deliveryLogs.filter(log => log.reminderId === reminder.id);
                    return (
                      <Card key={reminder.id} className="shadow-sm hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-3 sm:gap-4 flex-1">
                              <TypeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 shrink-0 mt-1" />
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">{reminder.title}</h3>
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-600">Kendaraan: {reminder.vehicle}</p>
                                  <p className="text-sm text-gray-600">Target: {reminder.triggerDate}</p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {reminder.daysBeforeAlert.map(day => (
                                      <span key={day} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {day}d
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2 sm:gap-3 shrink-0">
                              <Badge className={getStatusBadge(reminder.status)}>
                                {reminder.status}
                              </Badge>
                              <div className="text-sm text-gray-600 sm:text-right">
                                Kirim berikutnya: {reminder.nextSend}
                              </div>
                              <div className="flex flex-wrap gap-1 sm:justify-end">
                                {reminder.channels.map(channel => (
                                  <span key={channel} className="text-xs flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                    {channel === 'email' ? <Mail className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                                    {channel}
                                  </span>
                                ))}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleHistory(reminder.id)}
                                className="min-h-[40px] w-full sm:w-auto"
                              >
                                {expandedReminderId === reminder.id ? 'Hide History' : 'View History'}
                              </Button>
                            </div>
                          </div>
                          {expandedReminderId === reminder.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <h4 className="font-semibold mb-3 text-sm sm:text-base">Delivery History</h4>
                              {logs.length === 0 ? (
                                <div className="text-gray-500 text-sm text-center py-4">No delivery logs for this reminder.</div>
                              ) : (
                                <div className="space-y-2 sm:space-y-3">
                                  {logs.map((log, idx) => (
                                    <div key={idx} className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                                        <div>
                                          <span className="font-medium text-gray-700">Date/Time:</span>
                                          <p className="text-gray-900">{log.sentAt ? new Date(log.sentAt).toLocaleString('id-ID') : '-'}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Channel:</span>
                                          <p className="text-gray-900">{log.channel}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Recipient:</span>
                                          <p className="text-gray-900 truncate">{log.recipient}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Status:</span>
                                          <span className={
                                            log.status === 'delivered' ? 'text-green-600' :
                                            log.status === 'failed' ? 'text-red-600' :
                                            'text-gray-600'
                                          }>
                                            {log.status}
                                          </span>
                                        </div>
                                        {log.errorMessage && (
                                          <div className="sm:col-span-2">
                                            <span className="font-medium text-gray-700">Error:</span>
                                            <p className="text-red-600 text-xs mt-1">{log.errorMessage}</p>
                                          </div>
                                        )}
                                      </div>
                                      {log.status === 'failed' && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRetry(reminder, log)}
                                            className="min-h-[40px]"
                                          >
                                            Retry
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="mt-0">
                <ReminderLogs />
              </TabsContent>

              <TabsContent value="templates" className="mt-0">
                <div className="space-y-3 sm:space-y-4">
                  {predefinedTemplates.map((template) => (
                    <Card key={template.type} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">{template.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500">
                                <span className="font-medium">Default alert days:</span> {template.defaultDays.join(', ')} hari sebelumnya
                              </p>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1 font-medium">Template Message:</p>
                                <p className="text-xs text-gray-700 font-mono leading-relaxed">
                                  {template.messageTemplate}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="min-h-[40px] w-full sm:w-auto"
                            >
                              Edit Template
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="mt-0">
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <CardTitle className="text-lg sm:text-xl font-semibold">Manajemen Kontak</CardTitle>
                      <Button 
                        onClick={() => { setShowAddContact(true); setEditingContact(null); }} 
                        size="sm"
                        className="min-h-[44px] w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Kontak
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {contacts.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 text-gray-500">
                        <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm sm:text-base mb-4">Belum ada kontak yang ditambahkan</p>
                        <Button 
                          onClick={() => { setShowAddContact(true); setEditingContact(null); }}
                          size="sm"
                          className="min-h-[44px]"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Kontak Pertama
                        </Button>
                      </div>
                    ) : (
                      <MobileTable>
                        {contacts.map((contact: any) => (
                          <MobileTableItem
                            key={contact.id}
                            title={contact.name}
                            subtitle={contact.email}
                            actions={
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEditContact(contact)}
                                  className="min-h-[40px] flex-1"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => handleDeleteContact(contact.id)}
                                  className="min-h-[40px] flex-1"
                                >
                                  Hapus
                                </Button>
                              </div>
                            }
                          >
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp:</span>
                              <span className="text-sm text-gray-900">{contact.whatsapp}</span>
                            </div>
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ditambahkan:</span>
                              <span className="text-sm text-gray-900">{new Date(contact.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                          </MobileTableItem>
                        ))}
                      </MobileTable>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Contact Management Modal - Enhanced responsive modal */}
      <ResponsiveModal
        open={showAddContact}
        onOpenChange={setShowAddContact}
        title={editingContact ? 'Edit Kontak' : 'Tambah Kontak'}
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <Button 
              onClick={editingContact ? handleSaveEditContact : handleAddContact} 
              className="min-h-[44px] flex-1 order-2 sm:order-1"
            >
              {editingContact ? 'Update Kontak' : 'Simpan Kontak'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { 
                setShowAddContact(false); 
                setEditingContact(null); 
                setNewContact({ name: '', email: '', whatsapp: '' }); 
              }} 
              className="min-h-[44px] flex-1 order-1 sm:order-2"
            >
              Batal
            </Button>
          </div>
        }
      >
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="text-sm font-medium">Nama Lengkap</Label>
            <Input 
              id="contact-name" 
              placeholder="Masukkan nama lengkap" 
              value={newContact.name} 
              onChange={e => setNewContact({ ...newContact, name: e.target.value })}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-sm font-medium">Email</Label>
            <Input 
              id="contact-email" 
              type="email"
              placeholder="contoh@email.com" 
              value={newContact.email} 
              onChange={e => setNewContact({ ...newContact, email: e.target.value })}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-wa" className="text-sm font-medium">Nomor WhatsApp</Label>
            <Input 
              id="contact-wa" 
              placeholder="6281234567890" 
              value={newContact.whatsapp} 
              onChange={e => setNewContact({ ...newContact, whatsapp: e.target.value.replace(/\D/g, '') })}
              className="min-h-[44px]"
            />
            <p className="text-xs text-gray-500">Gunakan format kode negara, contoh: 6281234567890</p>
          </div>
        </div>
      </ResponsiveModal>

      {/* Other modals with responsive design */}
      {showCreateForm && <CreateReminderForm />}
      {showSettings && (
        <ResponsiveModal
          open={showSettings}
          onOpenChange={setShowSettings}
          title="Pengaturan Reminder"
          size="lg"
        >
          <ReminderSettings />
        </ResponsiveModal>
      )}
      {showTemplateManager && (
        <ResponsiveModal
          open={showTemplateManager}
          onOpenChange={setShowTemplateManager}
          title="Manajemen Template"
          size="xl"
        >
          <EmailTemplateManager />
        </ResponsiveModal>
      )}
      {showTargetingManager && (
        <ResponsiveModal
          open={showTargetingManager}
          onOpenChange={setShowTargetingManager}
          title="Manajemen Target Email"
          size="lg"
        >
          <EmailTargetingManager />
        </ResponsiveModal>
      )}
    </div>
  );
};

export default ReminderManagement;
