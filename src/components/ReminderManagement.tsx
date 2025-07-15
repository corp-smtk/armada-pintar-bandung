import { useState, useEffect, useMemo, useRef } from 'react';
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
import { localStorageService, Vehicle } from '@/services/LocalStorageService';
import { useNavigate } from 'react-router-dom';

// 🔧 DEBUG CONFIGURATION - Toggle to enable/disable all debug logs
const DEBUG_ENABLED = false; // Set to true to enable debug logs, false to disable

// Debug utility function
const debugLog = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    debugLog(...args);
  }
};

const ReminderManagement = () => {
  const { toast } = useToast();
  const reminderService = useReminderService();
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Add refresh trigger to force re-render when reminders change
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Move form state to parent level to survive component unmount/remount
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
  
  const [recipientsText, setRecipientsText] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Form reset function
  const resetForm = () => {
    debugLog('🔥 [DEBUG] FORM RESET FUNCTION CALLED');
    setFormData({
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
  };
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

  // Get real reminder data from service - use useMemo to depend on refreshTrigger
  const activeReminders = useMemo(() => {
    // Include refreshTrigger to force recalculation when reminders change
    debugLog('🔥 [DEBUG] Recalculating activeReminders - refreshTrigger:', refreshTrigger);
    
    const reminders = reminderService.getReminderConfigs().map(reminder => ({
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
    
    debugLog('🔥 [DEBUG] activeReminders loaded:', reminders.length, 'reminders');
    debugLog('🔥 [DEBUG] activeReminders data:', reminders);
    
    return reminders;
  }, [reminderService, refreshTrigger]); // Depend on refreshTrigger to force recalculation

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
        
        // Refresh reminders list and queues after daily check
        debugLog('🔥 [DEBUG] TRIGGERING REFRESH AFTER DAILY CHECK');
        setRefreshTrigger(prev => prev + 1);
        fetchAllQueues();
        
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
      debugLog('🔥 [DEBUG] TRIGGERING REFRESH AFTER CLEANUP');
      setRefreshTrigger(prev => prev + 1);
      
      toast({
        title: "Cleanup Complete",
        description: "Invalid reminders have been cleaned up successfully.",
      });
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
    debugLog('🔥 [DEBUG] useEffect triggered - refreshing queues and logs');
    fetchAllQueues();
    setDeliveryLogs(reminderService.getDeliveryLogs());
  }, [refreshTrigger]); // Depend on refreshTrigger to refresh when reminders change

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
      messageTemplate: 'Halo, kendaraan {vehicle} perlu service dalam {days} hari.\n\nJadwal service: {date}\n\nMohon persiapkan kendaraan untuk service rutin. Terima kasih.\n\n- GasTrax System - Smartek Sistem Indonesia'
    },
    {
      type: 'document_stnk',
      title: 'STNK Kadaluarsa',
      description: 'Reminder perpanjangan STNK',
      defaultDays: [60, 30, 14, 7],
      messageTemplate: 'Perhatian! STNK kendaraan {vehicle} akan kadaluarsa dalam {days} hari.\n\nTanggal kadaluarsa: {date}\n\nSegera lakukan perpanjangan STNK untuk menghindari masalah hukum.\n\n- GasTrax System - Smartek Sistem Indonesia'
    },
    {
      type: 'document_kir',
      title: 'KIR Kadaluarsa',
      description: 'Reminder perpanjangan KIR',
      defaultDays: [45, 30, 15, 7],
      messageTemplate: 'Penting! KIR kendaraan {vehicle} akan kadaluarsa dalam {days} hari.\n\nTanggal kadaluarsa: {date}\n\nSegera urus perpanjangan KIR sebelum masa berlaku habis.\n\n- GasTrax System - Smartek Sistem Indonesia'
    },
    {
      type: 'insurance',
      title: 'Asuransi Kadaluarsa',
      description: 'Reminder perpanjangan asuransi',
      defaultDays: [60, 30, 14, 7],
      messageTemplate: 'Reminder asuransi kendaraan {vehicle} akan berakhir dalam {days} hari.\n\nTanggal berakhir: {date}\n\nHarap segera perpanjang asuransi untuk perlindungan optimal.\n\n- GasTrax System - Smartek Sistem Indonesia'
    },
    {
      type: 'custom',
      title: 'Custom Reminder',
      description: 'Reminder kustom sesuai kebutuhan',
      defaultDays: [30, 14, 7],
      messageTemplate: 'Reminder: {title}\n\nKendaraan: {vehicle}\nTenggat waktu: dalam {days} hari ({date})\n\nMohon segera ditindaklanjuti.\n\n- GasTrax System - Smartek Sistem Indonesia'
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

  const CreateReminderForm = ({ contacts, onReminderCreated, onClose }) => {
    // Form fields
    const [formData, setFormData] = useState({
      title: '',
      type: '',
      vehicle: '',
      document: '',
      triggerDate: '',
      daysBeforeAlert: [] as number[],
      channels: [] as string[],
      selectedTemplateId: '',
      isRecurring: false,
      recurringInterval: '1',
      recurringUnit: 'month' as 'week' | 'month' | 'year'
    });
    // Recipients by channel
    const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
    const [whatsappRecipients, setWhatsappRecipients] = useState<string[]>([]);
    const [telegramRecipients, setTelegramRecipients] = useState<string[]>([]);
    // Validation errors
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    // Other state
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // --- Add missing refs for field focus ---
    const titleRef = useRef(null);
    const vehicleRef = useRef(null);
    const dateRef = useRef(null);
    const emailRef = useRef(null);
    const waRef = useRef(null);
    const telegramRef = useRef(null);
    // --- End missing refs ---
    // --- Add daysBeforeAlertText for raw input ---
    const [daysBeforeAlertText, setDaysBeforeAlertText] = useState('');
    // Sync text with formData on mount/template select
    useEffect(() => {
      setDaysBeforeAlertText(formData.daysBeforeAlert.length > 0 ? formData.daysBeforeAlert.join(',') : '');
    }, [formData.daysBeforeAlert]);
    // --- End daysBeforeAlertText ---

    // Helper: filter contacts by channel
    const emailContacts = contacts.filter(c => c.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email));
    const whatsappContacts = contacts.filter(c => c.whatsapp && /^\d{8,15}$/.test(c.whatsapp));

    // ...handlers for adding/removing recipients, manual entry, etc. will be added...

    // Predefined templates (move or import as needed)
    const quickTemplates = [
      {
        type: 'service',
        title: 'Service Rutin',
        description: 'Reminder untuk jadwal service berkala',
        defaultDays: [30, 14, 7, 1],
        messageTemplate: 'Halo, kendaraan {vehicle} perlu service dalam {days} hari.\n\nJadwal service: {date}\n\nMohon persiapkan kendaraan untuk service rutin. Terima kasih.\n\n- GasTrax System - Smartek Sistem Indonesia'
      },
      {
        type: 'document_stnk',
        title: 'STNK Kadaluarsa',
        description: 'Reminder perpanjangan STNK',
        defaultDays: [60, 30, 14, 7],
        messageTemplate: 'Perhatian! STNK kendaraan {vehicle} akan kadaluarsa dalam {days} hari.\n\nTanggal kadaluarsa: {date}\n\nSegera lakukan perpanjangan STNK untuk menghindari masalah hukum.\n\n- GasTrax System - Smartek Sistem Indonesia'
      },
      {
        type: 'document_kir',
        title: 'KIR Kadaluarsa',
        description: 'Reminder perpanjangan KIR',
        defaultDays: [45, 30, 15, 7],
        messageTemplate: 'Penting! KIR kendaraan {vehicle} akan kadaluarsa dalam {days} hari.\n\nTanggal kadaluarsa: {date}\n\nSegera urus perpanjangan KIR sebelum masa berlaku habis.\n\n- GasTrax System - Smartek Sistem Indonesia'
      },
      {
        type: 'insurance',
        title: 'Asuransi Kadaluarsa',
        description: 'Reminder perpanjangan asuransi',
        defaultDays: [60, 30, 14, 7],
        messageTemplate: 'Reminder asuransi kendaraan {vehicle} akan berakhir dalam {days} hari.\n\nTanggal berakhir: {date}\n\nHarap segera perpanjang asuransi untuk perlindungan optimal.\n\n- GasTrax System - Smartek Sistem Indonesia'
      },
      {
        type: 'custom',
        title: 'Custom Reminder',
        description: 'Reminder kustom sesuai kebutuhan',
        defaultDays: [30, 14, 7],
        messageTemplate: 'Reminder: {title}\n\nKendaraan: {vehicle}\nTenggat waktu: dalam {days} hari ({date})\n\nMohon segera ditindaklanjuti.\n\n- GasTrax System - Smartek Sistem Indonesia'
      }
    ];

    // Template selection handler
    const handleTemplateSelect = (templateType) => {
      const template = quickTemplates.find(t => t.type === templateType);
      if (template) {
        setFormData(prev => ({
          ...prev,
          type: template.type,
          title: template.title,
          daysBeforeAlert: template.defaultDays,
          selectedTemplateId: template.type
        }));
        setSelectedTemplate(templateType);
      }
    };

    // Preview message logic
    const previewMessage = (() => {
      const template = quickTemplates.find(t => t.type === formData.selectedTemplateId);
      if (!template) return '';
      const vehicle = formData.vehicle || '[Kendaraan]';
      const title = formData.title || template.title;
      const document = formData.document || 'dokumen';
      let targetDate, daysUntilTarget;
      if (formData.triggerDate) {
        targetDate = new Date(formData.triggerDate);
        const today = new Date();
        daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 30);
        daysUntilTarget = 30;
      }
      return template.messageTemplate
        .replace('{vehicle}', vehicle)
        .replace('{title}', title)
        .replace('{date}', targetDate.toLocaleDateString('id-ID'))
        .replace('{days}', daysUntilTarget.toString())
        .replace('{document}', document)
        .replace('{company}', 'PT. Armada Pintar')
        .replace('{today}', new Date().toLocaleDateString('id-ID'));
    })();

    // --- Robust Validation and Submission Logic ---
    const validateForm = () => {
      const errors: string[] = [];
      // Template selection
      if (!formData.selectedTemplateId) {
        errors.push('Template harus dipilih.');
      }
      // At least one recipient in any channel
      if (
        emailRecipients.length === 0 &&
        whatsappRecipients.length === 0 &&
        (!formData.channels.includes('telegram') || telegramRecipients.length === 0)
      ) {
        errors.push('Minimal satu penerima (Email, WhatsApp, atau Telegram) harus diisi.');
      }
      // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emailRecipients.filter(e => !emailRegex.test(e));
      if (invalidEmails.length > 0) {
        errors.push(`Email tidak valid: ${invalidEmails.join(', ')}`);
      }
      // WhatsApp validation
      const waRegex = /^\d{8,15}$/;
      const invalidWAs = whatsappRecipients.filter(w => !waRegex.test(w));
      if (invalidWAs.length > 0) {
        errors.push(`Nomor WhatsApp tidak valid: ${invalidWAs.join(', ')}`);
      }
      // Telegram validation (if enabled)
      if (formData.channels.includes('telegram')) {
        const tgRegex = /^@\w{5,}$/;
        const invalidTGs = telegramRecipients.filter(tg => !tgRegex.test(tg));
        if (invalidTGs.length > 0) {
          errors.push(`Username Telegram tidak valid: ${invalidTGs.join(', ')}`);
        }
      }
      // Duplicates per channel
      const hasDuplicate = (arr: string[]) => new Set(arr).size !== arr.length;
      if (hasDuplicate(emailRecipients)) errors.push('Terdapat email duplikat.');
      if (hasDuplicate(whatsappRecipients)) errors.push('Terdapat nomor WhatsApp duplikat.');
      if (formData.channels.includes('telegram') && hasDuplicate(telegramRecipients)) errors.push('Terdapat username Telegram duplikat.');
      // Other required fields (example: vehicle, triggerDate)
      if (!formData.vehicle) errors.push('Kendaraan harus diisi.');
      if (!formData.triggerDate) errors.push('Tanggal pengingat harus diisi.');
      return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setValidationErrors([]);
      // Parse daysBeforeAlertText before validation/submission
      const arr = daysBeforeAlertText.split(',').map(x => parseInt(x.trim(), 10)).filter(x => !isNaN(x));
      setFormData(prev => ({ ...prev, daysBeforeAlert: arr }));
      const errors = validateForm();
      if (errors.length > 0) {
        setValidationErrors(errors);
        // Field focus logic
        if (!formData.selectedTemplateId && titleRef.current) titleRef.current.focus();
        else if (!formData.vehicle && vehicleRef.current) vehicleRef.current.focus();
        else if (!formData.triggerDate && dateRef.current) dateRef.current.focus();
        else if (emailRecipients.length === 0 && emailRef.current) emailRef.current.focus();
        else if (whatsappRecipients.length === 0 && waRef.current) waRef.current.focus();
        else if (formData.channels.includes('telegram') && telegramRecipients.length === 0 && telegramRef.current) telegramRef.current.focus();
        toast({ title: 'Validasi Gagal', description: 'Mohon perbaiki data yang belum lengkap.', variant: 'destructive' });
        return;
      }
      setIsSubmitting(true);
      try {
        // Construct payload
        const payload = {
          ...formData,
          recipients: {
            email: Array.from(new Set(emailRecipients)),
            whatsapp: Array.from(new Set(whatsappRecipients)),
            telegram: formData.channels.includes('telegram') ? Array.from(new Set(telegramRecipients)) : [],
          },
        };
        // Simulate API/service call (replace with real call as needed)
        await new Promise(res => setTimeout(res, 800));
        // Call parent callback
        if (onReminderCreated) onReminderCreated(payload);
        toast({ title: 'Reminder berhasil dibuat!', description: 'Reminder baru telah disimpan dan akan dikirim sesuai jadwal.', variant: 'success' });
        // Reset form
        setFormData({
          title: '',
          type: '',
          vehicle: '',
          document: '',
          triggerDate: '',
          daysBeforeAlert: [],
          channels: [],
          selectedTemplateId: '',
          isRecurring: false,
          recurringInterval: '1',
          recurringUnit: 'month',
        });
        setEmailRecipients([]);
        setWhatsappRecipients([]);
        setTelegramRecipients([]);
        setSelectedTemplate('');
        setValidationErrors([]);
        if (onClose) onClose();
      } catch (err) {
        toast({ title: 'Gagal membuat reminder', description: 'Terjadi kesalahan saat menyimpan reminder. Silakan coba lagi.', variant: 'destructive' });
        setValidationErrors(['Gagal menyimpan reminder. Silakan coba lagi.']);
      } finally {
        setIsSubmitting(false);
      }
    };

    // --- END Robust Validation and Submission Logic ---

    // Load vehicles for dropdown
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    useEffect(() => {
      setVehicles(localStorageService.getVehicles());
    }, []);

    return (
      <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
              <strong>Mohon perbaiki hal berikut sebelum menyimpan:</strong>
              <ul className="list-none mt-2 space-y-1">
                  {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="text-sm">{error}</span>
                  </li>
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
              return (
                <div
                  key={template.type}
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => handleTemplateSelect(template.type)}
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
            �� Template akan otomatis disesuaikan untuk channel Email dan WhatsApp
          </p>
        </div>
        {/* Title, Vehicle, Document, Date, Days Before, Channels, Recurring fields here... */}
        {/* Title Field */}
            <div className="space-y-2">
          <Label htmlFor="reminder-title">Judul Reminder</Label>
              <Input
            id="reminder-title"
            placeholder="Judul reminder (opsional, otomatis dari template jika kosong)"
                value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            ref={titleRef}
              />
            </div>
        {/* Vehicle Field */}
            <div className="space-y-2">
          <Label htmlFor="reminder-vehicle">Kendaraan *</Label>
          {vehicles.length > 0 ? (
            <Select
              value={formData.vehicle}
              onValueChange={val => setFormData(prev => ({ ...prev, vehicle: val }))}
              required
            >
              <SelectTrigger id="reminder-vehicle" ref={vehicleRef}>
                  <SelectValue placeholder="Pilih kendaraan" />
                </SelectTrigger>
                <SelectContent>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.platNomor}>
                    {vehicle.platNomor} - {vehicle.merek} {vehicle.model}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
          ) : (
            <div className="text-sm text-gray-500">Belum ada kendaraan terdaftar. Tambahkan kendaraan di modul Manajemen Kendaraan.</div>
          )}
            </div>
        {/* Document Field (optional, for document reminders) */}
        {formData.type && formData.type.startsWith('document') && (
              <div className="space-y-2">
            <Label htmlFor="reminder-document">Dokumen (opsional)</Label>
            <Input
              id="reminder-document"
              placeholder="Nama dokumen (STNK, KIR, dll)"
              value={formData.document}
              onChange={e => setFormData(prev => ({ ...prev, document: e.target.value }))}
            />
              </div>
            )}
        {/* Target Service Date Field */}
            <div className="space-y-2">
          <Label htmlFor="reminder-date">Tanggal Pengingat *</Label>
              <Input
            id="reminder-date"
                type="date"
                value={formData.triggerDate}
            onChange={e => setFormData(prev => ({ ...prev, triggerDate: e.target.value }))}
            required
            ref={dateRef}
              />
            </div>
        {/* Days Before Alert Field */}
        <div className="space-y-2">
          <Label htmlFor="reminder-days">Hari Sebelum Pengingat (opsional)</Label>
          <Input
            id="reminder-days"
            placeholder="Contoh: 30,14,7,1"
            value={daysBeforeAlertText}
            onChange={e => setDaysBeforeAlertText(e.target.value)}
            onBlur={() => {
              const arr = daysBeforeAlertText.split(',').map(x => parseInt(x.trim(), 10)).filter(x => !isNaN(x));
              setFormData(prev => ({ ...prev, daysBeforeAlert: arr }));
            }}
          />
          <p className="text-xs text-gray-500">Pisahkan dengan koma. Reminder akan dikirim pada hari-hari ini sebelum tanggal target.</p>
          </div>
        {/* Channel Selection Field */}
          <div className="space-y-2">
          <Label>Channel Pengiriman *</Label>
          <div className="flex gap-3 flex-wrap">
            <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                checked={formData.channels.includes('email')}
                onChange={e => {
                  setFormData(prev => ({
                    ...prev,
                    channels: e.target.checked
                      ? [...prev.channels, 'email']
                      : prev.channels.filter(c => c !== 'email'),
                  }));
                }}
              />
              Email
                </label>
            <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                checked={formData.channels.includes('whatsapp')}
                onChange={e => {
                  setFormData(prev => ({
                    ...prev,
                    channels: e.target.checked
                      ? [...prev.channels, 'whatsapp']
                      : prev.channels.filter(c => c !== 'whatsapp'),
                  }));
                }}
              />
              WhatsApp
              </label>
            <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={formData.channels.includes('telegram')}
                onChange={e => {
                  setFormData(prev => ({
                    ...prev,
                    channels: e.target.checked
                      ? [...prev.channels, 'telegram']
                      : prev.channels.filter(c => c !== 'telegram'),
                  }));
                }}
              />
              Telegram
              </label>
            </div>
          </div>
        {/* Recurring Option */}
          <div className="space-y-2">
          <Label>Pengulangan</Label>
          <div className="flex items-center gap-2">
              <Switch
                checked={formData.isRecurring}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, isRecurring: checked }))}
              />
            <span className="text-sm">Aktifkan pengulangan</span>
            {formData.isRecurring && (
              <>
                <Input
                  type="number"
                  min={1}
                  value={formData.recurringInterval}
                  onChange={e => setFormData(prev => ({ ...prev, recurringInterval: e.target.value }))}
                  className="w-16 ml-2"
                />
                <Select
                  value={formData.recurringUnit}
                  onValueChange={val => setFormData(prev => ({ ...prev, recurringUnit: val }))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Minggu</SelectItem>
                    <SelectItem value="month">Bulan</SelectItem>
                    <SelectItem value="year">Tahun</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm ml-1">sekali</span>
              </>
            )}
          </div>
        </div>
        {/* Email Recipients Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Label>Email Recipients</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEmailRecipients(emailContacts.map(c => c.email))}
              disabled={emailContacts.length === 0}
            >
              Pilih dari Kontak ({emailContacts.length})
            </Button>
          </div>
          <Input
            placeholder="Masukkan email, pisahkan dengan koma"
            value={emailRecipients.join(', ')}
            onChange={e => setEmailRecipients(e.target.value.split(',').map(x => x.trim()).filter(Boolean))}
            ref={emailRef}
          />
          <div className="flex flex-wrap gap-1 mt-1">
            {emailRecipients.map((email, idx) => (
              <Badge key={email} variant="secondary" className="flex items-center gap-1">
                {email}
                <span onClick={() => setEmailRecipients(emailRecipients.filter((_, i) => i !== idx))} style={{ cursor: 'pointer' }}>×</span>
              </Badge>
            ))}
          </div>
        </div>
        {/* WhatsApp Recipients Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Label>WhatsApp Recipients</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setWhatsappRecipients(whatsappContacts.map(c => c.whatsapp))}
              disabled={whatsappContacts.length === 0}
            >
              Pilih dari Kontak ({whatsappContacts.length})
            </Button>
          </div>
          <Input
            placeholder="Masukkan nomor WhatsApp, pisahkan dengan koma"
            value={whatsappRecipients.join(', ')}
            onChange={e => setWhatsappRecipients(e.target.value.split(',').map(x => x.trim()).filter(Boolean))}
            ref={waRef}
          />
          <div className="flex flex-wrap gap-1 mt-1">
            {whatsappRecipients.map((wa, idx) => (
              <Badge key={wa} variant="secondary" className="flex items-center gap-1">
                {wa}
                <span onClick={() => setWhatsappRecipients(whatsappRecipients.filter((_, i) => i !== idx))} style={{ cursor: 'pointer' }}>×</span>
              </Badge>
            ))}
          </div>
        </div>
        {/* Telegram Recipients Section (if channel selected) */}
        {formData.channels.includes('telegram') && (
          <div className="space-y-2">
            <Label>Telegram Recipients</Label>
            <Input
              placeholder="Masukkan username Telegram (@username), pisahkan dengan koma"
              value={telegramRecipients.join(', ')}
              onChange={e => setTelegramRecipients(e.target.value.split(',').map(x => x.trim()).filter(Boolean))}
              ref={telegramRef}
            />
            <div className="flex flex-wrap gap-1 mt-1">
              {telegramRecipients.map((tg, idx) => (
                <Badge key={tg} variant="secondary" className="flex items-center gap-1">
                  {tg}
                  <span onClick={() => setTelegramRecipients(telegramRecipients.filter((_, i) => i !== idx))} style={{ cursor: 'pointer' }}>×</span>
                </Badge>
              ))}
            </div>
              </div>
            )}
        {/* Preview Message */}
        <div className="space-y-2">
          <Label>Preview Pesan yang Akan Dikirim</Label>
          <Textarea
            value={previewMessage}
            readOnly
            className="min-h-[80px] bg-gray-50 text-gray-700"
          />
          </div>
        {/* Submit/Cancel Buttons */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan Reminder'}</Button>
        </div>
      </form>
    );
  };

  const navigate = useNavigate();

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
            onClick={() => {
              debugLog('🔥 [DEBUG] OPENING CREATE REMINDER FORM');
              resetForm(); // Reset form to clean state
              setShowCreateForm(true);
            }} 
            className="min-h-[44px] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="truncate">Buat Reminder</span>
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
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
              <TabsTrigger value="settings" className="text-xs sm:text-sm p-2 sm:p-3">
                <span className="hidden sm:inline">Pengaturan</span>
                <span className="sm:hidden">Pengaturan</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="p-4 sm:p-5 md:p-6">
              {debugLog('🔥 [DEBUG] CURRENT ACTIVE TAB:', activeTab)}
              <TabsContent value="active" className="mt-0 space-y-4 sm:space-y-5 md:space-y-6">
                {debugLog('🔥 [DEBUG] RENDERING ACTIVE TAB CONTENT')}
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
                  {debugLog('🔥 [DEBUG] RENDERING REMINDER LIST - activeReminders.length:', activeReminders.length)}
                  {debugLog('🔥 [DEBUG] RENDERING REMINDER LIST - activeReminders:', activeReminders)}
                  {activeReminders.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                      <Bell className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm sm:text-base mb-4">Belum ada reminder yang dibuat</p>
                    </div>
                  ) : (
                    activeReminders.map((reminder, index) => {
                      debugLog(`🔥 [DEBUG] RENDERING REMINDER ${index + 1}:`, reminder);
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
                              </div>
                            </div>
                            {/* Delivery History Toggle */}
                            {logs.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                            <Button
                                  variant="ghost"
                              size="sm"
                              onClick={() => handleToggleHistory(reminder.id)}
                                  className="text-xs"
                            >
                                  {expandedReminderId === reminder.id ? 'Sembunyikan' : 'Lihat'} Riwayat Pengiriman ({logs.length})
                            </Button>
                                {expandedReminderId === reminder.id && (
                                  <div className="mt-3 space-y-2">
                                    {logs.map((log, logIndex) => (
                                      <div key={logIndex} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                          <div>
                                            <span className="font-medium text-gray-700">Channel:</span> {log.channel}
                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Waktu:</span> {new Date(log.timestamp).toLocaleString('id-ID')}
                        </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Penerima:</span> {log.recipient}
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
                    })
                  )}
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
                    debugLog('Template selected:', template.name);
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

              <TabsContent value="settings" className="mt-0">
                <ReminderSettings onBack={() => setActiveTab('active')} />
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
          onOpenChange={(open) => {
            setShowCreateForm(open);
          }}
          title="Buat Reminder Baru"
          size="lg"
        >
          <CreateReminderForm 
            contacts={contacts}
            onReminderCreated={() => setRefreshTrigger(prev => prev + 1)}
            onClose={() => setShowCreateForm(false)}
          />
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
              setRecipientsText(contacts.join(', ')); // Update textarea with selected contacts
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
