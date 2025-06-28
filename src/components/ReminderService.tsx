
import { useToast } from '@/hooks/use-toast';

// Interface untuk reminder configuration
export interface ReminderConfig {
  id: string;
  title: string;
  type: 'service' | 'document' | 'insurance' | 'custom';
  vehicle: string;
  document?: string;
  triggerDate: string;
  daysBeforeAlert: number[];
  channels: ('email' | 'telegram')[];
  recipients: string[];
  messageTemplate: string;
  isRecurring: boolean;
  recurringInterval?: number;
  recurringUnit?: 'week' | 'month' | 'year';
  status: 'active' | 'paused' | 'expired';
}

// Interface untuk delivery log
export interface DeliveryLog {
  id: string;
  reminderId: string;
  reminderTitle: string;
  recipient: string;
  channel: 'email' | 'telegram';
  status: 'delivered' | 'failed' | 'pending';
  sentAt: string;
  deliveredAt?: string;
  subject?: string;
  message: string;
  attempts: number;
  errorMessage?: string;
}

// Configuration yang perlu diganti sesuai environment
const EMAIL_CONFIG = {
  smtpHost: 'smtp.gmail.com', // GANTI: SMTP server Anda
  smtpPort: 587,
  smtpUsername: 'your-email@gmail.com', // GANTI: Email username
  smtpPassword: 'your-app-password', // GANTI: App password
  fromEmail: 'fleet@yourcompany.com', // GANTI: Email pengirim
  fromName: 'Fleet Management System'
};

const TELEGRAM_CONFIG = {
  botToken: 'YOUR_BOT_TOKEN_HERE', // GANTI: Token dari @BotFather
  apiUrl: 'https://api.telegram.org/bot'
};

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
    // TODO: Implement logic untuk query database/storage
    // Sementara return mock data
    const mockReminders: ReminderConfig[] = [
      {
        id: '1',
        title: 'Service Rutin - B 1234 AB',
        type: 'service',
        vehicle: 'B 1234 AB',
        triggerDate: '2025-01-15',
        daysBeforeAlert: [30, 14, 7, 1],
        channels: ['email', 'telegram'],
        recipients: ['fleet@company.com', '@johndoe'],
        messageTemplate: 'Kendaraan {vehicle} perlu service dalam {days} hari. Jadwal: {date}',
        isRecurring: true,
        recurringInterval: 3,
        recurringUnit: 'month',
        status: 'active'
      }
    ];

    const today = new Date();
    const remindersToSend: ReminderConfig[] = [];

    for (const reminder of mockReminders) {
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

  // Fungsi untuk mengirim email
  async sendEmail(
    recipient: string, 
    subject: string, 
    message: string,
    reminderId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Implement actual email sending
      // Menggunakan nodemailer atau service email lainnya
      
      // Simulasi pengiriman email
      console.log('Sending email:', {
        to: recipient,
        subject: subject,
        body: message,
        from: EMAIL_CONFIG.fromEmail
      });

      // Simulasi delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulasi success rate 90%
      if (Math.random() > 0.1) {
        await this.logDelivery({
          reminderId,
          recipient,
          channel: 'email',
          status: 'delivered',
          subject,
          message
        });
        return { success: true };
      } else {
        throw new Error('SMTP connection failed');
      }
    } catch (error: any) {
      await this.logDelivery({
        reminderId,
        recipient,
        channel: 'email',
        status: 'failed',
        subject,
        message,
        errorMessage: error.message
      });
      return { success: false, error: error.message };
    }
  }

  // Fungsi untuk mengirim pesan Telegram
  async sendTelegram(
    recipient: string, 
    message: string,
    reminderId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Implement actual Telegram API call
      
      const telegramMessage = {
        chat_id: recipient.startsWith('@') ? recipient : recipient,
        text: message,
        parse_mode: 'Markdown'
      };

      // Simulasi API call ke Telegram
      console.log('Sending telegram message:', telegramMessage);

      // Simulasi delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simulasi success rate 95%
      if (Math.random() > 0.05) {
        await this.logDelivery({
          reminderId,
          recipient,
          channel: 'telegram',
          status: 'delivered',
          message
        });
        return { success: true };
      } else {
        throw new Error('Telegram API rate limit exceeded');
      }
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
    // TODO: Implement actual logging to database/storage
    
    const deliveryLog: DeliveryLog = {
      id: Date.now().toString(),
      reminderTitle: 'Reminder Title', // TODO: Get from reminder data
      sentAt: new Date().toISOString(),
      deliveredAt: logData.status === 'delivered' ? new Date().toISOString() : undefined,
      attempts: 1, // TODO: Implement retry logic
      ...logData
    };

    console.log('Delivery log:', deliveryLog);
    
    // TODO: Save to database or localStorage
    // await saveDeliveryLog(deliveryLog);
  }

  // Fungsi untuk test koneksi email
  async testEmailConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testResult = await this.sendEmail(
        EMAIL_CONFIG.fromEmail,
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
