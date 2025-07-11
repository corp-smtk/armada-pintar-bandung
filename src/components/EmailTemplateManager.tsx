import { useState, useEffect } from 'react';
import { FileText, Plus, Copy, Eye, Edit3, Trash2, TestTube, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { reminderService } from './ReminderService';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'service' | 'document' | 'insurance' | 'custom' | 'document_expired';
  variables: string[];
  isDefault: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
  channel: 'email' | 'whatsapp' | 'telegram';
}

interface EmailTemplateManagerProps {
  selectedTemplate?: string;
  onTemplateSelect: (template: EmailTemplate) => void;
  onClose?: () => void;
}

const EmailTemplateManager = ({ selectedTemplate, onTemplateSelect, onClose }: EmailTemplateManagerProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [recipient, setRecipient] = useState('');
  const [sending, setSending] = useState(false);
  
  // Create/Edit Template Form
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'custom' as const,
    description: '',
    channel: 'email' as const, // Added channel field
  });

  // Channel selection state
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'whatsapp' | 'telegram'>('email');

  // Template Variables
  const availableVariables = [
    { key: '{vehicle}', description: 'Nomor polisi kendaraan' },
    { key: '{days}', description: 'Jumlah hari hingga tanggal jatuh tempo' },
    { key: '{date}', description: 'Tanggal jatuh tempo (format otomatis)' },
    { key: '{title}', description: 'Judul pengingat' },
    { key: '{document}', description: 'Jenis dokumen (STNK, KIR, dll)' },
    { key: '{company}', description: 'Nama perusahaan' },
    { key: '{urgency}', description: 'Tingkat urgensi (TINGGI/SEDANG/RENDAH)' },
    { key: '{today}', description: 'Tanggal hari ini (otomatis)' },
  ];

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Migrate templates to include channel if missing
  const migrateTemplates = (templates: any[]): EmailTemplate[] => {
    return templates.map(t => ({
      ...t,
      channel: t.channel || (t.id.startsWith('wa_') ? 'whatsapp' : t.id.startsWith('tg_') ? 'telegram' : 'email')
    }));
  };

  const loadTemplates = () => {
    const savedTemplates = localStorage.getItem('fleet_email_templates');
    if (savedTemplates) {
      const parsed = JSON.parse(savedTemplates);
      setTemplates(migrateTemplates(parsed));
    } else {
      initializeDefaultTemplates();
    }
  };

  const initializeDefaultTemplates = () => {
    // Add default WhatsApp/Telegram templates for each category
    const defaultTemplates: EmailTemplate[] = [
      {
        id: '1',
        name: 'Service Reminder - Standard',
        subject: 'Reminder: Service Kendaraan {vehicle}',
        content: `Halo,

Ini adalah pengingat bahwa kendaraan {vehicle} memerlukan service dalam {days} hari.

Detail:
- Kendaraan: {vehicle}
- Tanggal Service: {date}
- Sisa Waktu: {days} hari
- Tingkat Urgency: {urgency}

Mohon segera koordinasikan dengan tim maintenance untuk:
1. Mempersiapkan kendaraan
2. Menjadwalkan appointment dengan bengkel
3. Memastikan spare parts tersedia

Terima kasih atas perhatiannya.

Salam,
{company}`,
        category: 'service',
        variables: ['{vehicle}', '{days}', '{date}', '{urgency}', '{company}'],
        isDefault: true,
        description: 'Standard template for vehicle service reminders',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'email', // Default to email
      },
      {
        id: '2',
        name: 'Document Expiry - Urgent',
        subject: 'URGENT: {document} Kendaraan {vehicle} Akan Kadaluarsa',
        content: `PEMBERITAHUAN PENTING!

{document} untuk kendaraan {vehicle} akan kadaluarsa dalam {days} hari.

⚠️ INFORMASI KRITIS:
- Kendaraan: {vehicle}
- Dokumen: {document}
- Tanggal Kadaluarsa: {date}
- Sisa Waktu: {days} hari
- Status: {urgency}

🚨 TINDAKAN SEGERA DIPERLUKAN:
1. Segera persiapkan dokumen yang dibutuhkan
2. Kunjungi kantor terkait untuk perpanjangan
3. Pastikan kendaraan tidak beroperasi setelah tanggal kadaluarsa
4. Update status di sistem setelah perpanjangan

Abaikan pesan ini jika perpanjangan sudah dilakukan.

Tim {company}`,
        category: 'document',
        variables: ['{vehicle}', '{document}', '{days}', '{date}', '{urgency}', '{company}'],
        isDefault: true,
        description: 'Urgent template for document expiry notifications',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'email', // Default to email
      },
      {
        id: '3',
        name: 'Insurance Renewal',
        subject: 'Reminder: Perpanjangan Asuransi {vehicle}',
        content: `Reminder Perpanjangan Asuransi

Asuransi kendaraan {vehicle} akan berakhir dalam {days} hari.

Informasi Asuransi:
- Nomor Kendaraan: {vehicle}
- Tanggal Berakhir: {date}
- Sisa Waktu: {days} hari

Langkah Perpanjangan:
1. Hubungi agen asuransi
2. Siapkan dokumen kendaraan
3. Lakukan pembayaran premi
4. Update polis baru di sistem

Untuk informasi lebih lanjut, silakan hubungi tim administrasi.

Best regards,
{company}`,
        category: 'insurance',
        variables: ['{vehicle}', '{days}', '{date}', '{company}'],
        isDefault: true,
        description: 'Template for insurance renewal reminders',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'email', // Default to email
      },
      {
        id: 'wa_service',
        name: 'WhatsApp - Service Reminder',
        subject: '',
        content: `🔔 [PENGINGAT SERVIS KENDARAAN]\n\nHalo,\n\nIni adalah pengingat untuk servis kendaraan {vehicle}.\nJenis servis: {title}\nTanggal servis: {date} ({days} hari lagi)\nTanggal hari ini: {today}\n\nMohon segera lakukan tindakan yang diperlukan.\n\nTerima kasih.\n\nPowered by GasTrax System - Smartek Sistem Indonesia`,
        category: 'service',
        variables: ['{vehicle}', '{title}', '{date}', '{days}', '{today}'],
        isDefault: true,
        description: 'Template WhatsApp default untuk pengingat servis kendaraan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'whatsapp',
      },
      {
        id: 'wa_doc_expiry',
        name: 'WhatsApp - Document Expiry Reminder',
        subject: '',
        content: `📄 [PENGINGAT DOKUMEN KADALUARSA]\n\nDokumen {document} untuk kendaraan {vehicle} akan kadaluarsa pada {date} ({days} hari lagi).\nTanggal hari ini: {today}\n\nSegera lakukan perpanjangan untuk menghindari masalah operasional.\n\nTerima kasih.\n\nPowered by GasTrax System - Smartek Sistem Indonesia`,
        category: 'document',
        variables: ['{vehicle}', '{document}', '{date}', '{days}', '{today}'],
        isDefault: true,
        description: 'Template WhatsApp default untuk pengingat dokumen kadaluarsa',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'whatsapp',
      },
      {
        id: 'wa_doc_expired',
        name: 'WhatsApp - Expired Document Daily Reminder',
        subject: '',
        content: `⚠️ [DOKUMEN SUDAH KADALUARSA]\n\nDokumen {document} untuk kendaraan {vehicle} telah KADALUARSA sejak {date} ({days} hari yang lalu).\nTanggal hari ini: {today}\n\nSegera lakukan perpanjangan dokumen untuk menghindari sanksi atau gangguan operasional.\n\nTerima kasih.\n\nPowered by GasTrax System - Smartek Sistem Indonesia`,
        category: 'document_expired',
        variables: ['{vehicle}', '{document}', '{date}', '{days}', '{today}'],
        isDefault: true,
        description: 'Template WhatsApp default untuk pengingat dokumen sudah kadaluarsa',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'whatsapp',
      },
      {
        id: 'wa_insurance',
        name: 'WhatsApp - Insurance Expiry Reminder',
        subject: '',
        content: `🛡️ [PENGINGAT ASURANSI KADALUARSA]\n\nAsuransi kendaraan {vehicle} akan kadaluarsa pada {date} ({days} hari lagi).\nTanggal hari ini: {today}\n\nSegera lakukan perpanjangan untuk perlindungan kendaraan Anda.\n\nTerima kasih.\n\nPowered by GasTrax System - Smartek Sistem Indonesia`,
        category: 'insurance',
        variables: ['{vehicle}', '{date}', '{days}', '{today}'],
        isDefault: true,
        description: 'Template WhatsApp default untuk pengingat asuransi kadaluarsa',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'whatsapp',
      },
      {
        id: 'wa_custom',
        name: 'WhatsApp - Custom Reminder',
        subject: '',
        content: `🔔 [PENGINGAT]\n\n{title}\nKendaraan: {vehicle}\nTanggal: {date}\nSisa waktu: {days} hari\nTanggal hari ini: {today}\n\n{custom_message}\n\nTerima kasih.\n\nPowered by GasTrax System - Smartek Sistem Indonesia`,
        category: 'custom',
        variables: ['{vehicle}', '{title}', '{date}', '{days}', '{today}', '{custom_message}'],
        isDefault: true,
        description: 'Template WhatsApp default untuk pengingat custom',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'whatsapp',
      },
      {
        id: 'tg_service',
        name: 'Telegram - Service Reminder',
        subject: 'Reminder: Service Kendaraan {vehicle}',
        content: `🔔 [REMINDER SERVICE KENDARAAN]\n\nKendaraan {vehicle} dijadwalkan untuk servis {service} pada {date} ({days} hari lagi).\n\nMohon pastikan kendaraan siap untuk perawatan tepat waktu.\n\nDetail:\n- Kendaraan: {vehicle}\n- Jenis Servis: {service}\n- Tanggal Servis: {date}\n\nTerima kasih.`,
        category: 'service',
        variables: ['{vehicle}', '{service}', '{date}', '{days}'],
        isDefault: true,
        description: 'Telegram template for service reminders',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'telegram', // Explicitly set to telegram
      },
      {
        id: 'tg_doc_expiry',
        name: 'Telegram - Document Expiry Reminder',
        subject: 'URGENT: {document} Kendaraan {vehicle} Akan Kadaluarsa',
        content: `📄 [PENGINGAT DOKUMEN KADALUARSA]\n\nDokumen {document} untuk kendaraan {vehicle} akan kadaluarsa pada {date} ({days} hari lagi).\n\nSegera lakukan perpanjangan untuk menghindari masalah operasional.\n\nDetail:\n- Kendaraan: {vehicle}\n- Jenis Dokumen: {document}\n- Tanggal Kadaluarsa: {date}\n\nTerima kasih.`,
        category: 'document',
        variables: ['{vehicle}', '{document}', '{date}', '{days}'],
        isDefault: true,
        description: 'Telegram template for document expiry reminders',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'telegram', // Explicitly set to telegram
      },
      {
        id: 'tg_doc_expired',
        name: 'Telegram - Expired Document Daily Reminder',
        subject: '⚠️ [DOKUMEN SUDAH KADALUARSA]',
        content: `⚠️ [DOKUMEN SUDAH KADALUARSA]\n\nDokumen {document} untuk kendaraan {vehicle} telah KADALUARSA sejak {date} ({days} hari yang lalu).\n\nSegera lakukan perpanjangan dokumen untuk menghindari sanksi atau gangguan operasional.\n\nDetail:\n- Kendaraan: {vehicle}\n- Jenis Dokumen: {document}\n- Tanggal Kadaluarsa: {date}\n- Sudah kadaluarsa selama: {days} hari\n\nTerima kasih.`,
        category: 'document_expired',
        variables: ['{vehicle}', '{document}', '{date}', '{days}'],
        isDefault: true,
        description: 'Telegram template for expired document daily reminders',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'telegram', // Explicitly set to telegram
      },
      {
        id: 'tg_insurance',
        name: 'Telegram - Insurance Expiry Reminder',
        subject: 'Reminder: Perpanjangan Asuransi {vehicle}',
        content: `🛡️ [PENGINGAT ASURANSI KADALUARSA]\n\nAsuransi kendaraan {vehicle} akan kadaluarsa pada {date} ({days} hari lagi).\n\nSegera lakukan perpanjangan untuk perlindungan kendaraan Anda.\n\nDetail:\n- Kendaraan: {vehicle}\n- Tanggal Kadaluarsa: {date}\n\nTerima kasih.`,
        category: 'insurance',
        variables: ['{vehicle}', '{date}', '{days}'],
        isDefault: true,
        description: 'Telegram template for insurance renewal reminders',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'telegram', // Explicitly set to telegram
      },
      {
        id: 'tg_custom',
        name: 'Telegram - Custom Reminder',
        subject: '🔔 [PENGINGAT]',
        content: `🔔 [PENGINGAT]\n\n{title}\n\nKendaraan: {vehicle}\nTanggal: {date}\nSisa waktu: {days} hari\n\n{custom_message}\n\nTerima kasih.`,
        category: 'custom',
        variables: ['{vehicle}', '{title}', '{date}', '{days}', '{custom_message}'],
        isDefault: true,
        description: 'Telegram template for custom reminders',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        channel: 'telegram', // Explicitly set to telegram
      }
    ];

    setTemplates(defaultTemplates);
    localStorage.setItem('fleet_email_templates', JSON.stringify(defaultTemplates));
  };

  const saveTemplate = () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast({
        title: "Validation Error",
        description: "Name, subject, and content are required",
        variant: "destructive"
      });
      return;
    }

    // Extract variables from template content
    const variableRegex = /\{([^}]+)\}/g;
    const variables = Array.from(new Set(
      (templateForm.content.match(variableRegex) || [])
        .concat(templateForm.subject.match(variableRegex) || [])
    ));

    const template: EmailTemplate = {
      id: Date.now().toString(),
      name: templateForm.name,
      subject: templateForm.subject,
      content: templateForm.content,
      category: templateForm.category,
      variables,
      isDefault: false,
      description: templateForm.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      channel: templateForm.channel || selectedChannel, // Use templateForm.channel or selectedChannel
    };

    const updatedTemplates = [...templates, template];
    setTemplates(updatedTemplates);
    localStorage.setItem('fleet_email_templates', JSON.stringify(updatedTemplates));

    // Reset form
    setTemplateForm({
      name: '',
      subject: '',
      content: '',
      category: 'custom',
      description: '',
      channel: 'email', // Reset channel
    });
    setShowCreateForm(false);

    toast({
      title: "Template Saved",
      description: `Template "${template.name}" has been created`,
    });
  };

  const deleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default templates cannot be deleted",
        variant: "destructive"
      });
      return;
    }

    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('fleet_email_templates', JSON.stringify(updatedTemplates));

    toast({
      title: "Template Deleted",
      description: "Template has been removed",
    });
  };

  const copyTemplate = (template: EmailTemplate) => {
    setTemplateForm({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      content: template.content,
      category: template.category,
      description: template.description,
      channel: template.channel, // Copy channel
    });
    setActiveTab('create');
    setShowCreateForm(true);
  };

  const previewTemplateWithData = (template: EmailTemplate) => {
    // Sample data for preview
    const sampleData = {
      '{vehicle}': 'B 1234 AB',
      '{days}': '7',
      '{date}': '15 Januari 2025',
      '{title}': 'Service Rutin',
      '{document}': 'STNK',
              '{company}': 'GasTrax System - Smartek Sistem Indonesia',
      '{urgency}': 'SEDANG',
      '{today}': new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    };

    let previewSubject = template.subject;
    let previewContent = template.content;

    // Replace variables with sample data
    Object.entries(sampleData).forEach(([variable, value]) => {
      previewSubject = previewSubject.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
      previewContent = previewContent.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return { subject: previewSubject, content: previewContent };
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = templateForm.content;
      const newContent = content.substring(0, start) + variable + content.substring(end);
      
      setTemplateForm({ ...templateForm, content: newContent });
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Template Manager
          </CardTitle>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Create and manage templates for different types of reminders (Email, WhatsApp, Telegram)
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Templates</TabsTrigger>
            <TabsTrigger value="create">Create Template</TabsTrigger>
            <TabsTrigger value="variables">Variables Guide</TabsTrigger>
          </TabsList>

          {/* Browse Templates Tab */}
          <TabsContent value="browse" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Label>Channel:</Label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4">
              {templates.filter(t => t.channel === selectedChannel).map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant={template.isDefault ? "default" : "secondary"}>
                            {template.isDefault ? 'Default' : 'Custom'}
                          </Badge>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <p className="text-sm font-medium mb-1">Subject: {template.subject}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPreviewTemplate(template);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyTemplate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onTemplateSelect(template)}
                        >
                          Select
                        </Button>
                        {!template.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create Template Tab */}
          <TabsContent value="create" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Create New Template</h3>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? 'Cancel' : 'New Template'}
              </Button>
            </div>

            {showCreateForm && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name *</Label>
                      <Input
                        id="template-name"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        placeholder="e.g., Service Reminder - Weekly"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-category">Category</Label>
                      <Select
                        value={templateForm.category}
                        onValueChange={(value) => setTemplateForm({ ...templateForm, category: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-description">Description</Label>
                    <Input
                      id="template-description"
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                      placeholder="Brief description of when to use this template"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Channel:</Label>
                    <Select value={templateForm.channel || selectedChannel} onValueChange={v => setTemplateForm({ ...templateForm, channel: v as any })}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(templateForm.channel || selectedChannel) === 'email' && (
                    <div className="space-y-2">
                      <Label htmlFor="template-subject">Email Subject *</Label>
                      <Input
                        id="template-subject"
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                        placeholder="e.g., Reminder: Service Kendaraan {vehicle}"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-2">
                      <Label htmlFor="template-content">Email Content *</Label>
                      <Textarea
                        id="template-content"
                        value={templateForm.content}
                        onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                        placeholder="Enter your email template content here..."
                        className="min-h-[300px] font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Available Variables</Label>
                      <div className="space-y-1">
                        {availableVariables.map((variable) => (
                          <Button
                            key={variable.key}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-2"
                            onClick={() => insertVariable(variable.key)}
                          >
                            <div>
                              <p className="font-mono text-xs">{variable.key}</p>
                              <p className="text-xs text-gray-600">{variable.description}</p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={saveTemplate} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Template
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (templateForm.name || templateForm.content) {
                          const preview = previewTemplateWithData({
                            ...templateForm,
                            id: 'preview',
                            variables: [],
                            isDefault: false,
                            createdAt: '',
                            updatedAt: '',
                            channel: templateForm.channel || selectedChannel, // Use templateForm.channel or selectedChannel
                          });
                          setPreviewTemplate({
                            ...templateForm,
                            id: 'preview',
                            variables: [],
                            isDefault: false,
                            createdAt: '',
                            updatedAt: '',
                            channel: templateForm.channel || selectedChannel, // Use templateForm.channel or selectedChannel
                          });
                          setShowPreview(true);
                        }
                      }}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Variables Guide Tab */}
          <TabsContent value="variables" className="space-y-4">
            <Alert>
              <AlertDescription>
                Use these variables in your templates. They will be automatically replaced with actual data when sending emails.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              {availableVariables.map((variable) => (
                <Card key={variable.key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono font-semibold">{variable.key}</p>
                        <p className="text-sm text-gray-600">{variable.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(variable.key);
                          toast({
                            title: "Copied!",
                            description: `${variable.key} copied to clipboard`,
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Subject Line Examples:</h4>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm space-y-1">
                    <p>Reminder: Service Kendaraan {'{vehicle}'}</p>
                    <p>URGENT: {'{document}'} Akan Kadaluarsa dalam {'{days}'} Hari</p>
                    <p>{'{title}'} - Kendaraan {'{vehicle}'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Content Examples:</h4>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                    <p>Kendaraan {'{vehicle}'} memerlukan {'{title}'} dalam {'{days}'} hari.</p>
                    <p>Tanggal target: {'{date}'}</p>
                    <p>Tingkat urgency: {'{urgency}'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Template Preview Modal */}
        {showPreview && previewTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Template Preview</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => { setShowPreview(false); setRecipient(''); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const preview = previewTemplateWithData(previewTemplate);
                  const isEmail = (previewTemplate.channel || 'email') === 'email';
                  const isWhatsApp = (previewTemplate.channel || '') === 'whatsapp';
                  const isTelegram = (previewTemplate.channel || '') === 'telegram';
                  let label = 'Recipient';
                  let placeholder = '';
                  if (isEmail) {
                    label = 'Recipient Email';
                    placeholder = 'e.g. user@email.com';
                  } else if (isWhatsApp) {
                    label = 'WhatsApp Number';
                    placeholder = 'e.g. 6281234567890';
                  } else if (isTelegram) {
                    label = 'Telegram Username';
                    placeholder = 'e.g. @username';
                  }
                  return (
                    <div className="space-y-4">
                      <div>
                        <Label className="font-semibold">Subject:</Label>
                        <p className="p-2 bg-gray-100 rounded mt-1">{preview.subject}</p>
                      </div>
                      <div>
                        <Label className="font-semibold">Content:</Label>
                        <div className="p-4 bg-gray-100 rounded mt-1 whitespace-pre-wrap">
                          {preview.content}
                        </div>
                      </div>
                      <Alert>
                        <AlertDescription>
                          This preview uses sample data. Actual emails or WhatsApp messages will use real reminder data.
                        </AlertDescription>
                      </Alert>
                      {/* Recipient Form and Test Preview Button */}
                      <form
                        className="flex flex-col gap-2 pt-2"
                        onSubmit={async e => {
                          e.preventDefault();
                          if (!recipient) return;
                          setSending(true);
                          let result;
                          if ((previewTemplate.channel || 'email') === 'whatsapp') {
                            result = await reminderService.sendWhatsApp(recipient, preview.content, 'test-preview');
                            toast({
                              title: result.success ? 'Test WhatsApp Sent' : 'WhatsApp Test Failed',
                              description: result.success ? `Test WhatsApp sent to ${recipient}` : result.error,
                              variant: result.success ? 'default' : 'destructive',
                            });
                          } else if ((previewTemplate.channel || 'email') === 'email') {
                            result = await reminderService.sendEmail(recipient, preview.subject, preview.content, 'test-preview');
                            toast({
                              title: result.success ? 'Test Email Sent' : 'Email Test Failed',
                              description: result.success ? `Test email sent to ${recipient}` : result.error,
                              variant: result.success ? 'default' : 'destructive',
                            });
                          } else {
                            toast({
                              title: 'Not Supported',
                              description: 'Test preview sending is not supported for this channel.',
                              variant: 'destructive',
                            });
                          }
                          setSending(false);
                        }}
                      >
                        <Label>{label}:</Label>
                        <Input
                          type="text"
                          value={recipient}
                          onChange={e => setRecipient(e.target.value)}
                          placeholder={placeholder}
                          required
                        />
                        <div className="flex justify-end">
                          <Button type="submit" variant="default" disabled={sending}>
                            {sending ? 'Sending...' : 'Test Preview'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailTemplateManager; 