import { useState, useEffect, useMemo } from 'react';
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

  // Predefined templates optimized for Email and WhatsApp
  const quickTemplates = [
    {
      type: 'service',
      title: 'Service Rutin',
      description: 'Reminder untuk jadwal service berkala',
      defaultDays: [30, 14, 7, 1],
      messageTemplate: 'Halo, kendaraan {vehicle} perlu service dalam {days} hari.\n\nJadwal service: {date}\n\nMohon persiapkan kendaraan untuk service rutin. Terima kasih.\n\n- Tim Fleet Management'
    },
    {
      type: 'document_stnk',
      title: 'STNK Kadaluarsa',
      description: 'Reminder perpanjangan STNK',
      defaultDays: [60, 30, 14, 7],
      messageTemplate: 'Perhatian! STNK kendaraan {vehicle} akan kadaluarsa dalam {days} hari.\n\nTanggal kadaluarsa: {date}\n\nSegera lakukan perpanjangan STNK untuk menghindari masalah hukum.\n\n- Tim Fleet Management'
    },
    {
      type: 'document_kir',
      title: 'KIR Kadaluarsa',
      description: 'Reminder perpanjangan KIR',
      defaultDays: [45, 30, 15, 7],
      messageTemplate: 'Penting! KIR kendaraan {vehicle} akan kadaluarsa dalam {days} hari.\n\nTanggal kadaluarsa: {date}\n\nSegera urus perpanjangan KIR sebelum masa berlaku habis.\n\n- Tim Fleet Management'
    },
    {
      type: 'insurance',
      title: 'Asuransi Kadaluarsa',
      description: 'Reminder perpanjangan asuransi',
      defaultDays: [60, 30, 14, 7],
      messageTemplate: 'Reminder asuransi kendaraan {vehicle} akan berakhir dalam {days} hari.\n\nTanggal berakhir: {date}\n\nHarap segera perpanjang asuransi untuk perlindungan optimal.\n\n- Tim Fleet Management'
    },
    {
      type: 'custom',
      title: 'Custom Reminder',
      description: 'Reminder kustom sesuai kebutuhan',
      defaultDays: [30, 14, 7],
      messageTemplate: 'Reminder: {title}\n\nKendaraan: {vehicle}\nTenggat waktu: dalam {days} hari ({date})\n\nMohon segera ditindaklanjuti.\n\n- Tim Fleet Management'
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
    console.log('🔥 [DEBUG] CreateReminderForm RENDER - Component Mounted/Re-rendered');
    
    // Track component lifecycle
    useEffect(() => {
      console.log('🔥 [DEBUG] CreateReminderForm MOUNTED');
      return () => {
        console.log('🔥 [DEBUG] CreateReminderForm UNMOUNTED - This could cause state loss!');
      };
    }, []);
    
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
      selectedTemplateId: '', // Store template ID instead of manual template
      isRecurring: false,
      recurringInterval: '1',
      recurringUnit: 'month' as 'week' | 'month' | 'year'
    });
    
    console.log('🔥 [DEBUG] Current FormData State:', formData);

    // Enhanced logging wrapper for setFormData
    const setFormDataWithLogging = (updater: any) => {
      if (typeof updater === 'function') {
        setFormData(prev => {
          const newState = updater(prev);
          console.log('🔥 [DEBUG] FORM STATE CHANGE:');
          console.log('  Previous:', prev);
          console.log('  New:', newState);
          console.log('  Changes detected in:', Object.keys(newState).filter(key => 
            JSON.stringify(prev[key]) !== JSON.stringify(newState[key])
          ));
          return newState;
        });
      } else {
        console.log('🔥 [DEBUG] FORM STATE RESET:');
        console.log('  Setting to:', updater);
        setFormData(updater);
      }
    };

    // Monitor formData.selectedTemplateId changes
    useEffect(() => {
      console.log('🔥 [DEBUG] useEffect triggered - selectedTemplateId changed to:', formData.selectedTemplateId);
      if (formData.selectedTemplateId) {
        const template = quickTemplates.find(t => t.type === formData.selectedTemplateId);
        console.log('🔥 [DEBUG] useEffect - Found template for selectedTemplateId:', template);
      }
    }, [formData.selectedTemplateId]);

    // Validation functions
    const validateForm = () => {
      const errors: string[] = [];
      
      // Required fields validation
      if (!formData.title.trim()) errors.push('Judul reminder harus diisi');
      if (!formData.vehicle) errors.push('Kendaraan harus dipilih');
      if (!formData.triggerDate) errors.push('Tanggal target harus diisi');
      if (formData.channels.length === 0) errors.push('Minimal pilih satu channel notifikasi');
      if (recipientsText.trim() === '' && selectedEmailContacts.length === 0) errors.push('Penerima harus diisi');
      if (!formData.selectedTemplateId) errors.push('Template harus dipilih');
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
        const whatsappRegex = /^\d{8,15}$/;
        
        for (const recipient of recipients) {
          // Email validation
          if (formData.channels.includes('email') && !emailRegex.test(recipient) && !recipient.startsWith('@') && !whatsappRegex.test(recipient)) {
            errors.push(`Format email tidak valid: ${recipient}`);
          }
          // WhatsApp validation  
          if (formData.channels.includes('whatsapp') && !whatsappRegex.test(recipient) && !emailRegex.test(recipient) && !recipient.startsWith('@')) {
            errors.push(`Format nomor WhatsApp tidak valid: ${recipient} (gunakan format kode negara, contoh: 6281234567890)`);
          }
          // Telegram validation
          if (formData.channels.includes('telegram') && !telegramRegex.test(recipient) && !emailRegex.test(recipient) && !whatsappRegex.test(recipient)) {
            errors.push(`Format username Telegram tidak valid: ${recipient} (harus @username)`);
          }
        }
      }
      
      // Template selection validation
      if (formData.selectedTemplateId && !quickTemplates.find(t => t.type === formData.selectedTemplateId)) {
        errors.push('Template yang dipilih tidak valid');
      }
      
      setValidationErrors(errors);
      return errors.length === 0;
    };

    const handleTemplateSelect = (templateType: string) => {
      console.log('🔥 [DEBUG] Template Selection Started:', templateType);
      
      const template = quickTemplates.find(t => t.type === templateType);
      console.log('🔥 [DEBUG] Found Template:', template);
      
      if (template) {
        // Update multiple state pieces separately to ensure they all trigger
        console.log('🔥 [DEBUG] Updating selectedTemplateId from:', formData.selectedTemplateId, 'to:', template.type);
        
        setFormDataWithLogging(prev => ({
          ...prev,
          type: template.type,
          title: template.title,
          daysBeforeAlert: template.defaultDays,
          selectedTemplateId: template.type
        }));
        
        // Clear validation errors when template changes
        setValidationErrors([]);
        
        // Show immediate feedback
        toast({
          title: "Template Dipilih",
          description: `Template "${template.title}" berhasil dipilih. Preview akan diperbarui.`,
        });
        
        // Force a re-render by updating selectedTemplate state as well
        setTimeout(() => {
          console.log('🔥 [DEBUG] Post-update formData check, selectedTemplateId should be:', template.type);
        }, 100);
        
      } else {
        console.log('🔥 [DEBUG] Template not found for type:', templateType);
      }
      
      setSelectedTemplate(templateType);
      console.log('🔥 [DEBUG] Selected template state set to:', templateType);
    };

    // Generate preview message based on selected template and form data
    const previewMessage = useMemo(() => {
      console.log('🔥 [DEBUG] Preview Message Generation Started');
      console.log('🔥 [DEBUG] FormData.selectedTemplateId:', formData.selectedTemplateId);
      console.log('🔥 [DEBUG] FormData.vehicle:', formData.vehicle);
      console.log('🔥 [DEBUG] FormData.title:', formData.title);
      console.log('🔥 [DEBUG] FormData.triggerDate:', formData.triggerDate);
      console.log('🔥 [DEBUG] FormData.document:', formData.document);
      
      const selectedTemplateObj = quickTemplates.find(t => t.type === formData.selectedTemplateId);
      console.log('🔥 [DEBUG] Selected Template Object:', selectedTemplateObj);
      
      if (!selectedTemplateObj) {
        console.log('🔥 [DEBUG] No template selected, returning placeholder');
        return 'Pilih template untuk melihat preview pesan...';
      }

      // Use actual data if available, otherwise use placeholders
      const vehicle = formData.vehicle || '[Kendaraan]';
      const title = formData.title || selectedTemplateObj.title;
      const document = formData.document || 'dokumen';
      
      let targetDate, daysUntilTarget;
      if (formData.triggerDate) {
        targetDate = new Date(formData.triggerDate);
        const today = new Date();
        daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        // Use placeholder date (30 days from now)
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 30);
        daysUntilTarget = 30;
      }
      
      const today = new Date();
      
      let message = selectedTemplateObj.messageTemplate
        .replace('{vehicle}', vehicle)
        .replace('{title}', title)
        .replace('{date}', targetDate.toLocaleDateString('id-ID'))
        .replace('{days}', daysUntilTarget.toString())
        .replace('{document}', document)
        .replace('{company}', 'PT. Armada Pintar')
        .replace('{today}', today.toLocaleDateString('id-ID'));

      console.log('🔥 [DEBUG] Generated Preview Message:', message);
      return message;
    }, [formData.selectedTemplateId, formData.vehicle, formData.title, formData.triggerDate, formData.document]);

    // Generate channel-specific preview messages
    const emailPreview = useMemo(() => {
      if (!formData.channels.includes('email')) return '';
      return previewMessage;
    }, [previewMessage, formData.channels]);

    const whatsappPreview = useMemo(() => {
      if (!formData.channels.includes('whatsapp')) return '';
      
      let message = previewMessage;
      
      // Add WhatsApp-specific formatting
      message = `🚗 ${message}`;
      
      // Add urgency if close to deadline
      if (formData.triggerDate) {
        const targetDate = new Date(formData.triggerDate);
        const today = new Date();
        const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilTarget <= 7) {
          message = `⚠️ URGENT - ${message}`;
        }
      }
      
      return message;
    }, [previewMessage, formData.channels, formData.triggerDate]);

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
        
        // Get the selected template and generate message
        const selectedTemplateObj = quickTemplates.find(t => t.type === formData.selectedTemplateId);
        const messageTemplate = selectedTemplateObj ? selectedTemplateObj.messageTemplate : '';
        
        const reminderConfig = {
          ...formData,
          recipients,
          messageTemplate,
          status: 'active' as const,
          createdBy: 'user', // Tag as user-created
          createdAt: new Date().toISOString()
        };

        const newReminder = reminderService.addReminderConfig(reminderConfig);
        
        toast({
          title: "Reminder Berhasil Dibuat",
          description: `Reminder "${formData.title}" berhasil dibuat dan akan aktif sesuai jadwal`,
        });

        // Reset form
        console.log('🔥 [DEBUG] FORM RESET AFTER SUCCESSFUL SUBMIT');
        setFormDataWithLogging({
          title: '',
          type: '',
          vehicle: '',
          document: '',
          triggerDate: '',
          daysBeforeAlert: [],
          channels: [],
          recipients: [],
          selectedTemplateId: '',
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
      <div className="space-y-6">
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Pilih Template *</Label>
              {formData.selectedTemplateId && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ {quickTemplates.find(t => t.type === formData.selectedTemplateId)?.title}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickTemplates.map((template) => {
                const isSelected = formData.selectedTemplateId === template.type;
                console.log(`🔥 [DEBUG] Template "${template.type}" - isSelected:`, isSelected, 'formData.selectedTemplateId:', formData.selectedTemplateId);
                
                return (
                  <div
                    key={template.type}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => {
                      console.log('🔥 [DEBUG] Template clicked:', template.type);
                      handleTemplateSelect(template.type);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{template.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.defaultDays.map(day => (
                            <span key={day} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                              {day}d
                            </span>
                          ))}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500">
              💡 Template akan otomatis disesuaikan untuk channel Email dan WhatsApp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Reminder *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormDataWithLogging(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Masukkan judul reminder"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Kendaraan *</Label>
              <Select 
                value={formData.vehicle} 
                onValueChange={(value) => setFormDataWithLogging(prev => ({ ...prev, vehicle: value }))}
              >
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
                <Select 
                  value={formData.document}
                  onValueChange={(value) => setFormDataWithLogging(prev => ({ ...prev, document: value }))}
                >
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
                onChange={(e) => setFormDataWithLogging(prev => ({ ...prev, triggerDate: e.target.value }))}
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
                        setFormDataWithLogging(prev => ({
                          ...prev,
                          daysBeforeAlert: [...prev.daysBeforeAlert, day].sort((a, b) => b - a)
                        }));
                      } else {
                        setFormDataWithLogging(prev => ({
                          ...prev,
                          daysBeforeAlert: prev.daysBeforeAlert.filter(d => d !== day)
                        }));
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
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.channels.includes('email')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormDataWithLogging(prev => ({ ...prev, channels: [...prev.channels, 'email'] }));
                    } else {
                      setFormDataWithLogging(prev => ({ ...prev, channels: prev.channels.filter(c => c !== 'email') }));
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
                  checked={formData.channels.includes('whatsapp')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormDataWithLogging(prev => ({ ...prev, channels: [...prev.channels, 'whatsapp'] }));
                    } else {
                      setFormDataWithLogging(prev => ({ ...prev, channels: prev.channels.filter(c => c !== 'whatsapp') }));
                    }
                  }}
                  className="rounded"
                />
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">WhatsApp</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.channels.includes('telegram')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormDataWithLogging(prev => ({ ...prev, channels: [...prev.channels, 'telegram'] }));
                    } else {
                      setFormDataWithLogging(prev => ({ ...prev, channels: prev.channels.filter(c => c !== 'telegram') }));
                    }
                  }}
                  className="rounded"
                />
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Telegram</span>
              </label>
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="recipients">Penerima *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🔥 [DEBUG] "Gunakan Kontak" button clicked');
                    console.log('🔥 [DEBUG] Current formData before contact selection:', formData);
                    
                    // Auto-select contacts from the Kontak tab
                    const contactEmails = contacts.map((c: any) => c.email);
                    const contactWhatsApp = contacts.map((c: any) => c.whatsapp);
                    
                    let selectedRecipients = [];
                    if (formData.channels.includes('email')) {
                      selectedRecipients.push(...contactEmails);
                    }
                    if (formData.channels.includes('whatsapp')) {
                      selectedRecipients.push(...contactWhatsApp);
                    }
                    
                    console.log('🔥 [DEBUG] Selected recipients:', selectedRecipients);
                    
                    setSelectedEmailContacts(selectedRecipients);
                    setRecipientsText('');
                    
                    toast({
                      title: "Kontak Dipilih",
                      description: `${selectedRecipients.length} kontak dari tab Kontak berhasil dipilih`,
                    });
                    
                    console.log('🔥 [DEBUG] Contact selection completed');
                  }}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Gunakan Kontak
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTargetingManager(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Kelola
                </Button>
              </div>
            </div>
            <Textarea
              id="recipients"
              value={selectedEmailContacts.length > 0 ? selectedEmailContacts.join(', ') : recipientsText}
              onChange={(e) => {
                if (selectedEmailContacts.length === 0) {
                  setRecipientsText(e.target.value);
                }
              }}
              placeholder="Masukkan email, nomor WhatsApp, atau username telegram. Pisahkan dengan koma. Atau gunakan tombol 'Gunakan Kontak' untuk memilih dari kontak yang tersimpan."
              className="min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Contoh: admin@company.com, 6281234567890, @fleetmanager
              </p>
              {selectedEmailContacts.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedEmailContacts.length} kontak dipilih
                </Badge>
              )}
            </div>
            {contacts.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium">
                  💡 Ada {contacts.length} kontak tersimpan di tab Kontak. Klik "Gunakan Kontak" untuk memilih otomatis.
                </p>
              </div>
            )}
          </div>

          {/* Preview Pesan yang Akan Dikirim */}
          <div className="space-y-3">
            <Label>Preview Pesan yang Akan Dikirim</Label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-3">
                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-red-100 border border-red-300 rounded p-2 text-xs">
                    <strong>🔥 DEBUG:</strong><br/>
                    selectedTemplateId: {formData.selectedTemplateId || 'null'}<br/>
                    previewMessage length: {previewMessage.length}<br/>
                    previewMessage: {previewMessage.substring(0, 50)}...<br/>
                    Form Data Hash: {JSON.stringify(formData).substring(0, 30)}...<br/>
                    Render Count: {Math.random().toString(36).substring(7)}<br/>
                    <button 
                      onClick={() => {
                        console.log('🔥 [DEBUG] === MANUAL DEBUG DUMP ===');
                        console.log('🔥 [DEBUG] Current formData:', formData);
                        console.log('🔥 [DEBUG] Available templates:', quickTemplates.map(t => t.type));
                        console.log('🔥 [DEBUG] Current previewMessage:', previewMessage);
                        console.log('🔥 [DEBUG] selectedTemplate state:', selectedTemplate);
                        console.log('🔥 [DEBUG] recipientsText:', recipientsText);
                        console.log('🔥 [DEBUG] selectedEmailContacts:', selectedEmailContacts);
                        console.log('🔥 [DEBUG] === END DEBUG DUMP ===');
                      }}
                      className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Log Debug Info
                    </button>
                    <button 
                      onClick={() => {
                        console.log('🔥 [DEBUG] === FORCE TEMPLATE SELECTION TEST ===');
                        setFormDataWithLogging(prev => ({
                          ...prev,
                          selectedTemplateId: 'service',
                          title: 'Service Rutin',
                          type: 'service'
                        }));
                      }}
                      className="mt-2 ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      Force Select Service Template
                    </button>
                  </div>
                )}
                
                {/* Konfigurasi Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Template:</span>
                    <span className="text-gray-900">
                      {(() => {
                        console.log('🔥 [DEBUG] Template Summary - selectedTemplateId:', formData.selectedTemplateId);
                        const foundTemplate = quickTemplates.find(t => t.type === formData.selectedTemplateId);
                        console.log('🔥 [DEBUG] Template Summary - foundTemplate:', foundTemplate);
                        return formData.selectedTemplateId ? 
                          foundTemplate?.title || 'Unknown' 
                          : 'Belum dipilih';
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Channel:</span>
                    <span className="text-gray-900">
                      {formData.channels.length > 0 ? formData.channels.join(', ') : 'Belum dipilih'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Kendaraan:</span>
                    <span className="text-gray-900">{formData.vehicle || 'Belum dipilih'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Tanggal Target:</span>
                    <span className="text-gray-900">
                      {formData.triggerDate ? new Date(formData.triggerDate).toLocaleDateString('id-ID') : 'Belum dipilih'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Hari Alert:</span>
                    <span className="text-gray-900">
                      {formData.daysBeforeAlert.length > 0 ? 
                        formData.daysBeforeAlert.sort((a, b) => b - a).join(', ') + ' hari sebelumnya' 
                        : 'Belum dipilih'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Penerima:</span>
                    <span className="text-gray-900">
                      {selectedEmailContacts.length > 0 ? 
                        `${selectedEmailContacts.length} kontak` : 
                        recipientsText ? `${recipientsText.split(',').length} penerima` : 'Belum diisi'}
                    </span>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-600 text-sm">Preview Pesan:</span>
                    {formData.channels.length > 0 && (
                      <div className="flex gap-1">
                        {formData.channels.includes('email') && (
                          <Badge variant="outline" className="text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Badge>
                        )}
                        {formData.channels.includes('whatsapp') && (
                          <Badge variant="outline" className="text-xs">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Email Preview */}
                  {formData.channels.includes('email') && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">📧 Email Version:</div>
                      <div className="p-3 bg-white border rounded text-sm">
                        <pre className="whitespace-pre-wrap font-sans text-gray-800">
                          {emailPreview}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {/* WhatsApp Preview */}
                  {formData.channels.includes('whatsapp') && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">📱 WhatsApp Version:</div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                        <pre className="whitespace-pre-wrap font-sans text-gray-800">
                          {whatsappPreview}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Default preview if no channels selected */}
                  {formData.channels.length === 0 && (
                    <div className="p-3 bg-gray-50 border rounded text-sm">
                      <pre className="whitespace-pre-wrap font-sans text-gray-600">
                        {previewMessage}
                      </pre>
                      <p className="text-xs text-gray-500 mt-2">Pilih channel notifikasi untuk melihat preview yang disesuaikan</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              💡 Preview ini akan dikirim kepada penerima sesuai channel dan jadwal yang dipilih
            </p>
          </div>

          {/* Recurring Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormDataWithLogging(prev => ({ ...prev, isRecurring: checked }))}
              />
              <Label htmlFor="recurring">Reminder Berulang</Label>
            </div>
            {formData.isRecurring && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={formData.recurringInterval}
                  onChange={(e) => setFormDataWithLogging(prev => ({ ...prev, recurringInterval: e.target.value }))}
                  className="w-20"
                  min="1"
                />
                <Select
                  value={formData.recurringUnit}
                                      onValueChange={(value) => setFormDataWithLogging(prev => ({ ...prev, recurringUnit: value }))}
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
                        console.log('🔥 [DEBUG] FORM RESET FROM CANCEL BUTTON');
        setFormDataWithLogging({
          title: '',
          type: '',
          vehicle: '',
          document: '',
          triggerDate: '',
          daysBeforeAlert: [],
          channels: [],
          recipients: [],
          selectedTemplateId: '',
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
        </div>
    );
  };

  // Targeting Manager Dialog - Removed early return to fix modal issues

  // Template Manager Dialog - Removed early return to fix modal issues

  // Settings Dialog - Removed early return to fix modal issues

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
              <TabsTrigger value="templates" className="text-xs sm:text-sm p-2 sm:p-3">
                <span className="hidden sm:inline">Template Manager</span>
                <span className="sm:hidden">Template</span>
              </TabsTrigger>
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
                            status={
                              <div className="flex gap-1">
                                <Badge variant="outline">Queued</Badge>
                                {reminder.createdBy === 'user' && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                    User
                                  </Badge>
                                )}
                                {reminder.createdBy === 'system' && (
                                  <Badge variant="outline" className="border-green-200 text-green-700 text-xs">
                                    Auto
                                  </Badge>
                                )}
                              </div>
                            }
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
                            status={
                              <div className="flex gap-1">
                                <Badge variant="outline">Queued</Badge>
                                {reminder.createdBy === 'user' && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                    User
                                  </Badge>
                                )}
                                {reminder.createdBy === 'system' && (
                                  <Badge variant="outline" className="border-green-200 text-green-700 text-xs">
                                    Auto
                                  </Badge>
                                )}
                              </div>
                            }
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
                            status={
                              <div className="flex gap-1">
                                <Badge variant="outline">Queued</Badge>
                                {reminder.createdBy === 'user' && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                    User
                                  </Badge>
                                )}
                                {reminder.createdBy === 'system' && (
                                  <Badge variant="outline" className="border-green-200 text-green-700 text-xs">
                                    Auto
                                  </Badge>
                                )}
                              </div>
                            }
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
                              <div className="flex flex-wrap gap-1 sm:justify-end">
                                <Badge className={getStatusBadge(reminder.status)}>
                                  {reminder.status}
                                </Badge>
                                {reminder.createdBy === 'user' && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    User Created
                                  </Badge>
                                )}
                                {reminder.createdBy === 'system' && (
                                  <Badge variant="outline" className="border-green-200 text-green-700">
                                    Auto Generated
                                  </Badge>
                                )}
                              </div>
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
                <EmailTemplateManager 
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={(template) => {
                    // This is used when browsing templates in the reminder creation flow
                    // For the standalone template tab, we don't need to do anything special
                    console.log('Template selected:', template.name);
                    toast({
                      title: "Template Info",
                      description: `Template "${template.name}" dapat digunakan saat membuat reminder baru.`,
                    });
                  }}
                />
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
      {showCreateForm && (
        <ResponsiveModal
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          title="Buat Reminder Baru"
          size="lg"
        >
          <CreateReminderForm />
        </ResponsiveModal>
      )}
      {showSettings && (
        <ResponsiveModal
          open={showSettings}
          onOpenChange={setShowSettings}
          title="Pengaturan Reminder"
          size="lg"
        >
          <ReminderSettings onBack={() => setShowSettings(false)} />
        </ResponsiveModal>
      )}

      {showTargetingManager && (
        <ResponsiveModal
          open={showTargetingManager}
          onOpenChange={setShowTargetingManager}
          title="Manajemen Target Email"
          size="lg"
        >
          <EmailTargetingManager
            selectedContacts={selectedEmailContacts}
            onContactsChange={(contacts) => {
              setSelectedEmailContacts(contacts);
              setRecipientsText(''); // Clear manual text when using contact manager
            }}
            onClose={() => setShowTargetingManager(false)}
          />
        </ResponsiveModal>
      )}

      {/* Template Manager Modal - Fixed to preserve form data */}
      {showTemplateManager && (
        <ResponsiveModal
          open={showTemplateManager}
          onOpenChange={setShowTemplateManager}
          title="Browse Templates"
          size="lg"
        >
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
        </ResponsiveModal>
      )}
    </div>
  );
};

export default ReminderManagement;
