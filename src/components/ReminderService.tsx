
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

      const templateParams = {
        to_email: recipient,
        to_name: recipient.split('@')[0], // Simple name extraction
        subject: subject,
        message: message,
        from_name: emailSettings.fromName,
        from_email: emailSettings.fromEmail
      };

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
      await this.logDelivery({
        reminderId,
        recipient,
        channel: 'email',
        status: 'failed',
        subject,
        message,
        errorMessage: error.text || error.message
      });
      return { success: false, error: error.text || error.message };
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
    channel: 'email' | 'telegram';
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

  // Fungsi untuk menjalankan cron job harian
  async runDailyCheck(): Promise<void> {
    console.log('Running daily reminder check...');
    
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
