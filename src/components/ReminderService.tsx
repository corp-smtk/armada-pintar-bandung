import { useToast } from '@/hooks/use-toast';
import { localStorageService, ReminderConfig, DeliveryLog } from '@/services/LocalStorageService';
import emailjs from '@emailjs/browser';

class ReminderService {
  private toast: any;

  constructor() {
    // Toast akan di-inject dari component yang menggunakan service ini
  }

  setToast(toast: any) {
    this.toast = toast;
  }

  // Fungsi untuk mengecek reminder yang perlu dikirim hari ini
  async checkDailyReminders(): Promise<ReminderConfig[]> {
    const allReminders = localStorageService.getReminderConfigs();
    const today = new Date();
    const remindersToSend: ReminderConfig[] = [];

    for (const reminder of allReminders) {
      if (reminder.status !== 'active') continue;

      const triggerDate = new Date(reminder.triggerDate);
      const daysUntilTrigger = Math.ceil((triggerDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Cek apakah hari ini perlu mengirim reminder
      if (reminder.daysBeforeAlert.includes(daysUntilTrigger)) {
        remindersToSend.push(reminder);
      }
    }

    return remindersToSend;
  }

  // Fungsi untuk mengirim email menggunakan EmailJS
  async sendEmail(
    recipient: string, 
    subject: string, 
    message: string,
    reminderId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const emailSettings = localStorageService.getEmailSettings();
      
      if (!emailSettings.enabled || !emailSettings.serviceId || !emailSettings.templateId || !emailSettings.publicKey) {
        throw new Error('Email configuration not complete');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient)) {
        throw new Error('Invalid email format');
      }

      // Get reminder details for enhanced template variables
      const reminderConfigs = localStorageService.getReminderConfigs();
      const reminder = reminderConfigs.find(r => r.id === reminderId);
      
      const triggerDate = reminder ? new Date(reminder.triggerDate) : new Date();
      const today = new Date();
      const daysUntilTrigger = reminder ? 
        Math.ceil((triggerDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      const formattedDate = triggerDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Enhanced template parameters matching our standardized EmailJS template
      const templateParams = {
        // Basic template variables
        subject: subject,
        to_name: recipient.split('@')[0], // Extract name from email
        to_email: recipient,
        from_name: emailSettings.fromName,
        from_email: emailSettings.fromEmail,
        
        // Enhanced message content
        message: message,
        
        // Detailed reminder information
        vehicle_info: reminder?.vehicle || 'N/A',
        due_date: formattedDate,
        days_remaining: daysUntilTrigger.toString(),
        reminder_type: reminder?.type || 'custom',
        document_type: reminder?.document || '',
        
        // Additional context
        company_name: emailSettings.fromName,
        current_date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        
        // Status and priority indicators
        urgency_level: daysUntilTrigger <= 3 ? 'HIGH' : daysUntilTrigger <= 7 ? 'MEDIUM' : 'LOW',
        reminder_id: reminderId
      };

      // Enhanced logging before sending
      console.log('Sending email with parameters:', {
        serviceId: emailSettings.serviceId,
        templateId: emailSettings.templateId,
        recipient: recipient,
        subject: subject
      });

      await emailjs.send(
        emailSettings.serviceId,
        emailSettings.templateId,
        templateParams,
        emailSettings.publicKey
      );

      await this.logDelivery({
        reminderId,
        recipient,
        channel: 'email',
        status: 'delivered',
        subject,
        message
      });

      return { success: true };
    } catch (error: any) {
      // Enhanced error handling with specific error types
      let errorMessage = 'Unknown error occurred';
      let errorType = 'UNKNOWN_ERROR';

      if (error.text) {
        errorMessage = error.text;
        if (error.text.includes('Invalid')) {
          errorType = 'INVALID_CONFIGURATION';
        } else if (error.text.includes('Network')) {
          errorType = 'NETWORK_ERROR';
        } else if (error.text.includes('Template')) {
          errorType = 'TEMPLATE_ERROR';
        }
      } else if (error.message) {
        errorMessage = error.message;
        if (error.message.includes('configuration')) {
          errorType = 'CONFIGURATION_INCOMPLETE';
        } else if (error.message.includes('format')) {
          errorType = 'INVALID_RECIPIENT';
        }
      }

      await this.logDelivery({
        reminderId,
        recipient,
        channel: 'email',
        status: 'failed',
        subject,
        message,
        errorMessage: `[${errorType}] ${errorMessage}`
      });

      return { success: false, error: `[${errorType}] ${errorMessage}` };
    }
  }

  // Fungsi untuk mengirim pesan Telegram
  async sendTelegram(
    recipient: string, 
    message: string,
    reminderId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const telegramSettings = localStorageService.getTelegramSettings();
      
      if (!telegramSettings.enabled || !telegramSettings.botToken) {
        throw new Error('Telegram configuration not complete');
      }

      const chatId = recipient.startsWith('@') ? recipient : recipient;
      
      const response = await fetch(`https://api.telegram.org/bot${telegramSettings.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Telegram API error');
      }

      await this.logDelivery({
        reminderId,
        recipient,
        channel: 'telegram',
        status: 'delivered',
        message
      });

      return { success: true };
    } catch (error: any) {
      await this.logDelivery({
        reminderId,
        recipient,
        channel: 'telegram',
        status: 'failed',
        message,
        errorMessage: error.message
      });
      return { success: false, error: error.message };
    }
  }

  // Fungsi untuk mengirim pesan WhatsApp via Zapin
  async sendWhatsApp(
    recipient: string,
    message: string,
    reminderId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const whatsappSettings = localStorageService.getWhatsAppSettings();
      if (!whatsappSettings.enabled || !whatsappSettings.api_key || !whatsappSettings.sender) {
        throw new Error('WhatsApp configuration not complete');
      }
      // Use local proxy for development
      const response = await fetch('http://localhost:3001/api/zapin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: whatsappSettings.api_key,
          sender: whatsappSettings.sender,
          number: recipient,
          message: message,
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Zapin proxy/API error');
      }
      const data = await response.json();
      if (!data.status) {
        throw new Error(data.msg || 'Zapin API returned error');
      }
      await this.logDelivery({
        reminderId,
        recipient,
        channel: 'whatsapp',
        status: 'delivered',
        message
      });
      return { success: true };
    } catch (error: any) {
      await this.logDelivery({
        reminderId,
        recipient,
        channel: 'whatsapp',
        status: 'failed',
        message,
        errorMessage: error.message
      });
      return { success: false, error: error.message };
    }
  }

  // Fungsi untuk memproses template pesan
  private processMessageTemplate(
    template: string, 
    reminder: ReminderConfig, 
    daysUntilTrigger: number
  ): string {
    const triggerDate = new Date(reminder.triggerDate);
    const formattedDate = triggerDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return template
      .replace(/{vehicle}/g, reminder.vehicle)
      .replace(/{days}/g, daysUntilTrigger.toString())
      .replace(/{date}/g, formattedDate)
      .replace(/{title}/g, reminder.title)
      .replace(/{document}/g, reminder.document || '');
  }

  // Fungsi untuk mengirim reminder ke semua channel dan recipient
  async sendReminder(reminder: ReminderConfig): Promise<void> {
    const today = new Date();
    const triggerDate = new Date(reminder.triggerDate);
    const daysUntilTrigger = Math.ceil((triggerDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const message = this.processMessageTemplate(reminder.messageTemplate, reminder, daysUntilTrigger);
    const subject = `Reminder: ${reminder.title}`;

    let successCount = 0;
    let totalSent = 0;

    for (const channel of reminder.channels) {
      for (const recipient of reminder.recipients) {
        totalSent++;
        
        if (channel === 'email') {
          const result = await this.sendEmail(recipient, subject, message, reminder.id);
          if (result.success) successCount++;
        } else if (channel === 'telegram') {
          const result = await this.sendTelegram(recipient, message, reminder.id);
          if (result.success) successCount++;
        } else if (channel === 'whatsapp') {
          const result = await this.sendWhatsApp(recipient, message, reminder.id);
          if (result.success) successCount++;
        }
      }
    }

    // Show toast notification
    if (this.toast) {
      this.toast({
        title: "Reminder Sent",
        description: `${successCount}/${totalSent} pesan berhasil dikirim untuk ${reminder.title}`,
        variant: successCount === totalSent ? "default" : "destructive"
      });
    }
  }

  // Fungsi untuk menyimpan log pengiriman
  private async logDelivery(logData: {
    reminderId: string;
    recipient: string;
    channel: 'email' | 'telegram' | 'whatsapp';
    status: 'delivered' | 'failed' | 'pending';
    subject?: string;
    message: string;
    errorMessage?: string;
  }): Promise<void> {
    const reminderConfigs = localStorageService.getReminderConfigs();
    const reminder = reminderConfigs.find(r => r.id === logData.reminderId);
    
    const deliveryLog: DeliveryLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      reminderTitle: reminder?.title || 'Unknown Reminder',
      sentAt: new Date().toISOString(),
      deliveredAt: logData.status === 'delivered' ? new Date().toISOString() : undefined,
      attempts: 1,
      ...logData
    };

    localStorageService.addDeliveryLog(deliveryLog);
  }

  // Fungsi untuk test koneksi email
  async testEmailConnection(): Promise<{ success: boolean; error?: string }> {
    const emailSettings = localStorageService.getEmailSettings();
    
    try {
      const testResult = await this.sendEmail(
        emailSettings.fromEmail,
        'Test Email Connection',
        'This is a test email from Fleet Management System.',
        'test'
      );
      return testResult;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Fungsi untuk test koneksi Telegram
  async testTelegramConnection(chatId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const testResult = await this.sendTelegram(
        chatId,
        '🤖 Test message from Fleet Management System!',
        'test'
      );
      return testResult;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Scan for expired documents and create/update daily reminders for each.
   * Should be called before sending daily reminders.
   */
  async ensureDailyRemindersForExpiredDocuments() {
    const documents = localStorageService.getDocuments();
    const reminderConfigs = localStorageService.getReminderConfigs();
    const expiredDocuments = documents.filter(doc => doc.status === 'Kadaluarsa');

    console.log('[DEBUG] Found expired documents:', expiredDocuments.map(doc => ({ id: doc.id, platNomor: doc.platNomor, jenisDokumen: doc.jenisDokumen, tanggalKadaluarsa: doc.tanggalKadaluarsa })));

    for (const doc of expiredDocuments) {
      // Check if a daily reminder for this document already exists and is active
      const existing = reminderConfigs.find(r =>
        r.type === 'document' &&
        r.document === doc.id &&
        r.status === 'active' &&
        r.title.startsWith('[AUTO] Reminder Kadaluarsa')
      );
      // Compose recipients (for now, fallback to a default or empty)
      const recipients = existing?.recipients?.length ? existing.recipients : [localStorageService.getEmailSettings().fromEmail];
      const updateLink = `${window.location.origin}/update-document/${doc.id}`;
      const stopLink = `${window.location.origin}/stop-reminder/${doc.id}`;
      const messageTemplate = `Halo,<br/><br/>
Dokumen <b>{document}</b> untuk kendaraan <b>{vehicle}</b> telah <span style="color:red;"><b>KADALUARSA</b></span> sejak <b>{date}</b> ({days} hari yang lalu).<br/><br/>
Mohon segera lakukan perpanjangan dokumen untuk menghindari masalah operasional.<br/><br/>
<b>Detail Dokumen:</b><br/>
- Kendaraan: {vehicle}<br/>
- Jenis Dokumen: {document}<br/>
- Tanggal Kadaluarsa: {date}<br/>
- Sudah kadaluarsa selama: {days} hari<br/><br/>
<a href="${updateLink}" style="background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Perbarui Dokumen Sekarang</a><br/><br/>
Jika Anda sudah memperbarui dokumen atau ingin menghentikan pengingat ini, klik di bawah ini:<br/>
<a href="${stopLink}" style="color:#ef4444;font-weight:bold;">Stop Reminder untuk Dokumen Ini</a><br/><br/>
Terima kasih,<br/>Tim Armada Pintar`;
      const title = `[AUTO] Reminder Kadaluarsa: ${doc.jenisDokumen} - ${doc.platNomor}`;
      if (!existing) {
        const newReminder = {
          title,
          type: 'document',
          vehicle: doc.platNomor,
          document: doc.id,
          triggerDate: new Date().toISOString(),
          daysBeforeAlert: [0],
          channels: ['email'],
          recipients,
          messageTemplate,
          isRecurring: true,
          recurringInterval: 1,
          recurringUnit: 'day',
          status: 'active',
        };
        this.addReminderConfig(newReminder);
        console.log('[DEBUG] Created new auto-reminder for expired document:', { docId: doc.id, reminderTitle: title });
      } else {
        this.updateReminderConfig(existing.id, {
          recipients,
          messageTemplate,
          status: 'active',
        });
        console.log('[DEBUG] Updated existing auto-reminder for expired document:', { docId: doc.id, reminderId: existing.id });
      }
    }
    // Deactivate reminders for documents that are no longer expired
    for (const reminder of reminderConfigs) {
      if (
        reminder.type === 'document' &&
        reminder.title.startsWith('[AUTO] Reminder Kadaluarsa') &&
        reminder.document &&
        !expiredDocuments.find(doc => doc.id === reminder.document)
      ) {
        this.updateReminderConfig(reminder.id, { status: 'paused' });
        console.log('[DEBUG] Paused auto-reminder for document no longer expired:', { reminderId: reminder.id, documentId: reminder.document });
      }
    }
  }

  // Fungsi untuk menjalankan cron job harian
  async runDailyCheck(): Promise<void> {
    console.log('Running daily reminder check...');
    // Ensure daily reminders for expired documents are created/updated
    await this.ensureDailyRemindersForExpiredDocuments();
    const remindersToSend = await this.checkDailyReminders();
    for (const reminder of remindersToSend) {
      await this.sendReminder(reminder);
      // Add delay between reminders to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log(`Daily check completed. Processed ${remindersToSend.length} reminders.`);
  }

  // Get reminder configs
  getReminderConfigs(): ReminderConfig[] {
    return localStorageService.getReminderConfigs();
  }

  // Add reminder config
  addReminderConfig(config: Omit<ReminderConfig, 'id' | 'createdAt' | 'updatedAt'>): ReminderConfig {
    const newConfig: ReminderConfig = {
      ...config,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorageService.addReminderConfig(newConfig);
    return newConfig;
  }

  // Update reminder config
  updateReminderConfig(id: string, updates: Partial<ReminderConfig>): void {
    localStorageService.updateReminderConfig(id, updates);
  }

  // Delete reminder config
  deleteReminderConfig(id: string): void {
    localStorageService.deleteReminderConfig(id);
  }

  // Get delivery logs
  getDeliveryLogs(): DeliveryLog[] {
    return localStorageService.getDeliveryLogs();
  }
}

// Export singleton instance
export const reminderService = new ReminderService();

// Hook untuk menggunakan reminder service dengan toast
export const useReminderService = () => {
  const { toast } = useToast();
  
  // Inject toast ke service
  reminderService.setToast(toast);
  
  return reminderService;
};
