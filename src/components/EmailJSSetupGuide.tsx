import { useState } from 'react';
import { Copy, Check, ExternalLink, AlertCircle, Mail, Settings, FileText, Key, TestTube, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const EmailJSSetupGuide = () => {
  const { toast } = useToast();
  const [copiedItems, setCopiedItems] = useState<string[]>([]);

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems([...copiedItems, itemId]);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
      
      // Remove the item from copied list after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => prev.filter(id => id !== itemId));
      }, 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive"
      });
    }
  };

  const emailjsTemplate = `<!DOCTYPE html>
<html>
<head>
    <title>{{subject}}</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table td { padding: 8px; border-bottom: 1px solid #eee; }
        .info-table .label { font-weight: bold; color: #333; width: 30%; }
        .urgency-high { color: #dc3545; font-weight: bold; }
        .urgency-medium { color: #fd7e14; font-weight: bold; }
        .urgency-low { color: #28a745; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🚛 Fleet Management Reminder</h1>
            <p>{{subject}}</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <p>Halo <strong>{{to_name}}</strong>,</p>
            
            <!-- Alert Message -->
            <div class="alert-box">
                <h3 style="margin-top: 0; color: #856404;">⚠️ Pengingat Penting</h3>
                <p style="margin-bottom: 0;">{{message}}</p>
            </div>
            
            <!-- Reminder Details -->
            <h3>📋 Detail Informasi:</h3>
            <table class="info-table">
                <tr>
                    <td class="label">Kendaraan:</td>
                    <td><strong>{{vehicle_info}}</strong></td>
                </tr>
                <tr>
                    <td class="label">Tanggal Jatuh Tempo:</td>
                    <td><strong>{{due_date}}</strong></td>
                </tr>
                <tr>
                    <td class="label">Sisa Waktu:</td>
                    <td>
                        <strong>{{days_remaining}} hari</strong>
                        <span class="urgency-{{urgency_level}}">
                            ({{#if (eq urgency_level 'HIGH')}}URGENT{{/if}}{{#if (eq urgency_level 'MEDIUM')}}SEGERA{{/if}}{{#if (eq urgency_level 'LOW')}}NORMAL{{/if}})
                        </span>
                    </td>
                </tr>
                <tr>
                    <td class="label">Jenis Reminder:</td>
                    <td>{{reminder_type}}</td>
                </tr>
                {{#if document_type}}
                <tr>
                    <td class="label">Dokumen:</td>
                    <td>{{document_type}}</td>
                </tr>
                {{/if}}
                <tr>
                    <td class="label">Tanggal Email:</td>
                    <td>{{current_date}}</td>
                </tr>
            </table>
            
            <!-- Action Required -->
            <div style="background: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #0066cc;">🎯 Tindakan yang Diperlukan:</h4>
                <ul style="margin-bottom: 0;">
                    <li>Segera koordinasikan dengan tim terkait</li>
                    <li>Pastikan dokumen dan persyaratan telah dipersiapkan</li>
                    <li>Jadwalkan appointment jika diperlukan</li>
                    <li>Update status di sistem setelah selesai</li>
                </ul>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>Email ini dikirim secara otomatis oleh <strong>{{company_name}}</strong></p>
            <p>Jangan membalas email ini. Untuk pertanyaan, hubungi administrator sistem.</p>
            <p style="font-size: 10px; color: #999;">Reminder ID: {{reminder_id}} | Dikirim: {{current_date}}</p>
        </div>
    </div>
</body>
</html>`;

  const setupSteps = [
    {
      id: 'account',
      title: 'Buat Akun EmailJS',
      icon: Mail,
      status: 'pending',
      description: 'Daftar di EmailJS.com untuk mendapatkan akses gratis'
    },
    {
      id: 'service',
      title: 'Konfigurasi Email Service',
      icon: Settings,
      status: 'pending',
      description: 'Setup koneksi ke penyedia email (Gmail/Outlook)'
    },
    {
      id: 'template',
      title: 'Buat Email Template',
      icon: FileText,
      status: 'pending',
      description: 'Gunakan template yang telah kami sediakan'
    },
    {
      id: 'credentials',
      title: 'Dapatkan Credentials',
      icon: Key,
      status: 'pending',
      description: 'Copy Service ID, Template ID, dan Public Key'
    },
    {
      id: 'test',
      title: 'Test Konfigurasi',
      icon: TestTube,
      status: 'pending',
      description: 'Verifikasi bahwa email dapat dikirim dengan benar'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-blue-600" />
            EmailJS Setup Guide
            <Badge variant="outline">Step-by-Step</Badge>
          </CardTitle>
          <p className="text-gray-600">
            Panduan lengkap untuk mengkonfigurasi EmailJS agar sistem reminder dapat mengirim email otomatis.
          </p>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {setupSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <Icon className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-gray-300" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Instructions */}
      <Tabs defaultValue="step1" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="step1">Step 1</TabsTrigger>
          <TabsTrigger value="step2">Step 2</TabsTrigger>
          <TabsTrigger value="step3">Step 3</TabsTrigger>
          <TabsTrigger value="step4">Step 4</TabsTrigger>
          <TabsTrigger value="step5">Step 5</TabsTrigger>
        </TabsList>

        {/* Step 1: Account Creation */}
        <TabsContent value="step1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Step 1: Buat Akun EmailJS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  EmailJS menyediakan 200 email gratis per bulan. Cukup untuk testing dan penggunaan kecil.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Langkah-langkah:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Kunjungi <a href="https://emailjs.com" target="_blank" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    EmailJS.com <ExternalLink className="h-3 w-3" />
                  </a></li>
                  <li>Klik "Sign Up" dan pilih "Free" plan</li>
                  <li>Daftar menggunakan email dan password</li>
                  <li>Verifikasi email address Anda</li>
                  <li>Login ke dashboard EmailJS</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Email Service */}
        <TabsContent value="step2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Step 2: Konfigurasi Email Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Untuk Gmail, Anda perlu mengaktifkan 2FA dan membuat App Password khusus.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Setup Gmail (Recommended):</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Di dashboard EmailJS, pilih "Email Services" → "Add New Service"</li>
                  <li>Pilih "Gmail" dari daftar provider</li>
                  <li>Di Gmail Anda:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li>Aktifkan 2-Factor Authentication</li>
                      <li>Masuk ke "Manage your Google Account" → Security</li>
                      <li>Pilih "App passwords" dan buat password baru</li>
                      <li>Pilih "Mail" dan "Other (custom name)"</li>
                      <li>Beri nama "EmailJS Fleet Management"</li>
                    </ul>
                  </li>
                  <li>Kembali ke EmailJS dan masukkan:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li>User ID: alamat Gmail Anda</li>
                      <li>AccessToken: App password yang dibuat</li>
                    </ul>
                  </li>
                  <li>Klik "Create Service" dan catat Service ID</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Template Creation */}
        <TabsContent value="step3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Step 3: Buat Email Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Gunakan template HTML yang telah kami optimalkan untuk sistem reminder fleet management.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Langkah-langkah:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Di dashboard EmailJS, pilih "Email Templates" → "Create New Template"</li>
                  <li>Beri nama template: "Fleet Management Reminder"</li>
                  <li>Copy template HTML di bawah ini dan paste ke EmailJS</li>
                  <li>Simpan template dan catat Template ID</li>
                </ol>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Template HTML:</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(emailjsTemplate, 'template')}
                      className="flex items-center gap-2"
                    >
                      {copiedItems.includes('template') ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Template
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">{emailjsTemplate}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Credentials */}
        <TabsContent value="step4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Step 4: Dapatkan Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-green-600">Service ID</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Dari halaman "Email Services", copy ID service yang telah dibuat
                  </p>
                  <Badge variant="outline" className="mt-2">Format: service_xxxxxxx</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-blue-600">Template ID</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Dari halaman "Email Templates", copy ID template yang telah dibuat
                  </p>
                  <Badge variant="outline" className="mt-2">Format: template_xxxxxxx</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-purple-600">Public Key</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Dari "Account" → "General", copy Public Key
                  </p>
                  <Badge variant="outline" className="mt-2">Format: user_xxxxxxxxxxxxxxxx</Badge>
                </div>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Simpan ketiga credentials ini dengan aman. Anda akan memasukkannya di halaman Reminder Settings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 5: Testing */}
        <TabsContent value="step5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Step 5: Test Konfigurasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Setelah memasukkan credentials di Reminder Settings, lakukan test untuk memastikan semuanya berfungsi.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Checklist Testing:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    Masukkan Service ID, Template ID, dan Public Key di Reminder Settings
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    Atur From Email dan From Name
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    Aktifkan toggle "Enable Email"
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    Klik "Test Email Connection"
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    Periksa inbox untuk test email
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    Verifikasi semua template variables tampil dengan benar
                  </li>
                </ul>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800">✅ Setup Berhasil!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Jika test email berhasil dan template tampil dengan benar, konfigurasi EmailJS Anda sudah siap digunakan untuk sistem reminder.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailJSSetupGuide; 