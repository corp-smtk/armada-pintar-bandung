import { useToast } from '@/hooks/use-toast';
import { localStorageService, ReminderConfig, DeliveryLog } from '@/services/LocalStorageService';
import { systemConfigService } from '@/services/SystemConfigService';
import emailjs from '@emailjs/browser';

// Default fallback recipients when no contacts are configured
const DEFAULT_RECIPIENTS = {
  email: 'irwansyahmirza60@gmail.com',
  whatsapp: '6285720153141'
};

class ReminderService {
  private toast: any;
  private emailQueue: ReminderConfig[] = [];
  private telegramQueue: ReminderConfig[] = [];
  private whatsappQueue: ReminderConfig[] = [];

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
      // Use system configuration as fallback
      const emailSettings = systemConfigService.getEffectiveEmailConfig();
      
      if (!emailSettings.enabled || !emailSettings.serviceId || !emailSettings.templateId || !emailSettings.publicKey) {
        throw new Error('Email configuration not complete');
      }

      // Validate email format with detailed logging
      console.log(`[EMAIL_DEBUG] Validating recipient email: "${recipient}"`);
      console.log(`[EMAIL_DEBUG] Recipient type: ${typeof recipient}`);
      console.log(`[EMAIL_DEBUG] Recipient length: ${recipient?.length}`);
      console.log(`[EMAIL_DEBUG] Reminder ID: ${reminderId}`);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient)) {
        console.error(`[EMAIL_DEBUG] VALIDATION FAILED for: "${recipient}"`);
        console.error(`[EMAIL_DEBUG] Email regex test result: ${emailRegex.test(recipient)}`);
        console.error(`[EMAIL_DEBUG] Contains whitespace: ${/\s/.test(recipient)}`);
        console.error(`[EMAIL_DEBUG] Contains @: ${recipient.includes('@')}`);
        console.error(`[EMAIL_DEBUG] Contains .: ${recipient.includes('.')}`);
        throw new Error('Invalid email format');
      }
      
      console.log(`[EMAIL_DEBUG] ✅ Email validation passed for: "${recipient}"`);

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
        
        // Enhanced message content - separate HTML and plain text
        message: this.htmlToPlainText(message), // Clean plain text version
        html_message: this.formatHtmlEmail(message), // Properly formatted HTML
        plain_message: this.htmlToPlainText(message), // Plain text fallback
        
        // Detailed reminder information
        vehicle_info: reminder?.vehicle || 'N/A',
        due_date: formattedDate,
        days_remaining: daysUntilTrigger.toString(),
        urgency_text: daysUntilTrigger <= 3 ? '(URGENT)' : daysUntilTrigger <= 7 ? '(SEGERA)' : '(NORMAL)', // Simplified urgency text
        reminder_type: reminder?.type || 'custom',
        document_type: reminder?.document || '',
        
        // Additional context
        company_name: emailSettings.fromName,
        current_date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        
        // System info
        reminder_id: reminderId,
        
        // Legacy compatibility fields (for backward compatibility)
        vehicle: reminder?.vehicle || 'N/A',
        days: daysUntilTrigger.toString(),
        date: formattedDate,
        title: reminder?.title || subject,
        company: emailSettings.fromName
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
      // Use system configuration as fallback
      const telegramSettings = systemConfigService.getEffectiveTelegramConfig();
      
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
      // Use system configuration as fallback
      const whatsappSettings = systemConfigService.getEffectiveWhatsAppConfig();
      if (!whatsappSettings.enabled || !whatsappSettings.api_key || !whatsappSettings.sender) {
        throw new Error('WhatsApp configuration not complete');
      }

      // Check if WhatsApp is enabled in build configuration
      if (!__ENABLE_WHATSAPP__) {
        throw new Error('WhatsApp functionality is disabled in this deployment');
      }

      // Use configurable API base URL instead of hardcoded localhost
      const apiUrl = `${__API_BASE_URL__}/api/zapin`;
      const response = await fetch(apiUrl, {
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

  // Helper function to convert HTML to plain text for email fallback
  private htmlToPlainText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
      .replace(/<\/p>/gi, '\n\n') // Convert </p> to double newlines
      .replace(/<p[^>]*>/gi, '') // Remove <p> tags
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1') // Remove <b> tags but keep content
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1') // Remove <strong> tags
      .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1') // Remove <span> tags
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)') // Convert links to "text (url)"
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize multiple newlines
      .trim();
  }

  // Helper function to ensure proper HTML email formatting
  private formatHtmlEmail(html: string): string {
    // Ensure the HTML is properly formatted for email clients
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fleet Management Reminder</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: #ffffff; padding: 20px; border-radius: 8px; }
    .button { background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin: 10px 0; }
    .stop-link { color: #ef4444; font-weight: bold; text-decoration: none; }
    .expired { color: #dc2626; font-weight: bold; }
  </style>
</head>
<body>
  <div class="content">
    ${html}
  </div>
</body>
</html>`;
  }

  // Fungsi untuk mengirim reminder ke semua channel dan recipient
  async sendReminder(reminder: ReminderConfig): Promise<void> {
    console.log(`[SEND_DEBUG] 📧 Sending reminder: ${reminder.title}`);
    console.log(`[SEND_DEBUG] Reminder ID: ${reminder.id}`);
    console.log(`[SEND_DEBUG] Channels: ${reminder.channels.join(', ')}`);
    console.log(`[SEND_DEBUG] Recipients:`, reminder.recipients);
    console.log(`[SEND_DEBUG] Recipients count: ${reminder.recipients?.length || 0}`);
    
    const today = new Date();
    const triggerDate = new Date(reminder.triggerDate);
    const daysUntilTrigger = Math.ceil((triggerDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const htmlMessage = this.processMessageTemplate(reminder.messageTemplate, reminder, daysUntilTrigger);
    const plainMessage = this.htmlToPlainText(htmlMessage); // Convert HTML to plain text for WhatsApp/Telegram
    const subject = `Reminder: ${reminder.title}`;

    let successCount = 0;
    let totalSent = 0;

    // Filter recipients by type for each channel
    const emailRecipients = reminder.recipients.filter(r => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r));
    const whatsappRecipients = reminder.recipients.filter(r => /^\d{8,15}$/.test(r));
    const telegramRecipients = reminder.recipients.filter(r => /^@[a-zA-Z0-9_]{5,}$/.test(r));
    
    console.log(`[SEND_DEBUG] Filtered recipients - Email: ${emailRecipients.length}, WhatsApp: ${whatsappRecipients.length}, Telegram: ${telegramRecipients.length}`);

    for (const channel of reminder.channels) {
      console.log(`[SEND_DEBUG] Processing channel: ${channel}`);
      
      let channelRecipients: string[] = [];
      if (channel === 'email') {
        channelRecipients = emailRecipients;
      } else if (channel === 'whatsapp') {
        channelRecipients = whatsappRecipients;
      } else if (channel === 'telegram') {
        channelRecipients = telegramRecipients;
      }
      
      console.log(`[SEND_DEBUG] Channel ${channel} has ${channelRecipients.length} valid recipients:`, channelRecipients);
      
      if (channelRecipients.length === 0) {
        console.warn(`[SEND_DEBUG] ⚠️ No valid recipients for ${channel} channel, skipping`);
        continue;
      }
      
      for (const recipient of channelRecipients) {
        totalSent++;
        console.log(`[SEND_DEBUG] Sending to recipient #${totalSent}: "${recipient}" via ${channel}`);
        
        if (channel === 'email') {
          const result = await this.sendEmail(recipient, subject, htmlMessage, reminder.id);
          if (result.success) {
            successCount++;
            console.log(`[SEND_DEBUG] ✅ Email sent successfully to: ${recipient}`);
          } else {
            console.error(`[SEND_DEBUG] ❌ Email failed to: ${recipient}, error: ${result.error}`);
          }
        } else if (channel === 'telegram') {
          const result = await this.sendTelegram(recipient, plainMessage, reminder.id);
          if (result.success) {
            successCount++;
            console.log(`[SEND_DEBUG] ✅ Telegram sent successfully to: ${recipient}`);
          } else {
            console.error(`[SEND_DEBUG] ❌ Telegram failed to: ${recipient}, error: ${result.error}`);
          }
        } else if (channel === 'whatsapp') {
          const result = await this.sendWhatsApp(recipient, plainMessage, reminder.id);
          if (result.success) {
            successCount++;
            console.log(`[SEND_DEBUG] ✅ WhatsApp sent successfully to: ${recipient}`);
          } else {
            console.error(`[SEND_DEBUG] ❌ WhatsApp failed to: ${recipient}, error: ${result.error}`);
          }
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
    // Use system configuration as fallback
    const emailSettings = systemConfigService.getEffectiveEmailConfig();
    
    try {
      const testResult = await this.sendEmail(
        emailSettings.fromEmail,
        'Test Email Connection',
        'This is a test email from GasTrax System - Smartek Sistem Indonesia.',
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
        '🤖 Test message from GasTrax System - Smartek Sistem Indonesia!',
        'test'
      );
      return testResult;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up existing reminders with invalid recipients
   */
  async cleanupInvalidReminders() {
    const reminderConfigs = localStorageService.getReminderConfigs();
    const emailSettings = localStorageService.getEmailSettings();
    let cleanedCount = 0;
    
    for (const reminder of reminderConfigs) {
      // Check if reminder has invalid recipients (empty strings, invalid emails)
      const validRecipients = reminder.recipients.filter(email => 
        email && 
        email.trim().length > 0 && 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      );
      
      // Check if reminder is using fromEmail as recipient (wrong behavior)
      const isUsingFromEmailAsRecipient = reminder.recipients.includes(emailSettings.fromEmail);
      
      if (isUsingFromEmailAsRecipient) {
        console.log(`[CLEANUP_DEBUG] Found reminder using fromEmail as recipient: ${reminder.title}`);
        console.log(`[CLEANUP_DEBUG] FromEmail being used as recipient: ${emailSettings.fromEmail}`);
        
        // Get proper recipients from contacts
        const contacts = JSON.parse(localStorage.getItem('fleet_contacts') || '[]');
        const validContactEmails = contacts
          .filter((contact: any) => contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))
          .map((contact: any) => contact.email);
        
        if (validContactEmails.length > 0) {
          // Replace with contact emails
          this.updateReminderConfig(reminder.id, {
            recipients: validContactEmails
          });
          console.log(`[CLEANUP_DEBUG] ✅ Fixed reminder recipients from fromEmail to contacts:`, validContactEmails);
          cleanedCount++;
        } else {
          // No valid contacts, use default email as fallback
          this.updateReminderConfig(reminder.id, {
            recipients: [DEFAULT_RECIPIENTS.email]
          });
          console.log(`[CLEANUP_DEBUG] ✅ No contacts found, using default email recipient: ${DEFAULT_RECIPIENTS.email}`);
          cleanedCount++;
        }
      } else if (validRecipients.length === 0 && reminder.recipients.length > 0) {
        // This reminder has recipients but they're all invalid
        console.log(`[CLEANUP_DEBUG] Found invalid reminder: ${reminder.title}`);
        console.log(`[CLEANUP_DEBUG] Invalid recipients:`, reminder.recipients);
        
        // Pause the reminder instead of deleting it
        this.updateReminderConfig(reminder.id, { 
          status: 'paused',
          recipients: [] // Clear invalid recipients
        });
        cleanedCount++;
        
        console.log(`[CLEANUP_DEBUG] ✅ Paused reminder with invalid recipients: ${reminder.title}`);
      } else if (validRecipients.length !== reminder.recipients.length) {
        // Some recipients are invalid, clean them up
        console.log(`[CLEANUP_DEBUG] Cleaning invalid recipients for: ${reminder.title}`);
        console.log(`[CLEANUP_DEBUG] Before:`, reminder.recipients);
        console.log(`[CLEANUP_DEBUG] After:`, validRecipients);
        
        this.updateReminderConfig(reminder.id, { 
          recipients: validRecipients
        });
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`[CLEANUP_DEBUG] ✅ Cleaned up ${cleanedCount} reminders with invalid recipients`);
    } else {
      console.log(`[CLEANUP_DEBUG] ✅ No invalid reminders found`);
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
      console.log(`[REMINDER_DEBUG] Processing document: ${doc.jenisDokumen} - ${doc.platNomor}`);
      console.log(`[REMINDER_DEBUG] Document ID: ${doc.id}`);
      
      // Determine which channels to enable based on settings
      const emailSettings = localStorageService.getEmailSettings();
      const whatsappSettings = localStorageService.getWhatsAppSettings();
      const telegramSettings = localStorageService.getTelegramSettings();
      
      const enabledChannels: string[] = [];
      if (emailSettings.enabled) enabledChannels.push('email');
      if (whatsappSettings.enabled) enabledChannels.push('whatsapp');
      if (telegramSettings.enabled) enabledChannels.push('telegram');
      
      // Default to email if no channels are enabled
      if (enabledChannels.length === 0) {
        enabledChannels.push('email');
      }
      
      console.log(`[REMINDER_DEBUG] Enabled channels for auto-reminder: ${enabledChannels.join(', ')}`);
      console.log(`[REMINDER_DEBUG] Email settings fromEmail: "${emailSettings.fromEmail}"`);
      console.log(`[REMINDER_DEBUG] Existing reminder recipients:`, existing?.recipients);
      
      let recipients: string[] = [];
      
      // Always refresh recipients from contacts when multiple channels are enabled
      // This ensures we get both email addresses AND WhatsApp numbers
      const shouldRefreshRecipients = enabledChannels.length > 1 || !existing?.recipients?.length;
      
      if (shouldRefreshRecipients) {
        console.log(`[REMINDER_DEBUG] Refreshing recipients from contacts (multiple channels: ${enabledChannels.length > 1}, no existing: ${!existing?.recipients?.length})`);
        const contacts = JSON.parse(localStorage.getItem('fleet_contacts') || '[]');
        console.log(`[REMINDER_DEBUG] Available contacts:`, contacts);
        
        // Get email recipients if email channel is enabled
        let allRecipients: string[] = [];
        
        if (enabledChannels.includes('email')) {
          const validEmailContacts = contacts
            .filter((contact: any) => {
              const isValid = contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
              console.log(`[REMINDER_DEBUG] Contact "${contact.name}" email "${contact.email}" valid: ${isValid}`);
              return isValid;
            })
            .map((contact: any) => contact.email);
          
          console.log(`[REMINDER_DEBUG] Valid email contacts found:`, validEmailContacts);
          
          if (validEmailContacts.length > 0) {
            allRecipients.push(...validEmailContacts);
          } else {
            // No email contacts found, use default email
            allRecipients.push(DEFAULT_RECIPIENTS.email);
            console.log(`[REMINDER_DEBUG] ✅ No email contacts found, using default email: ${DEFAULT_RECIPIENTS.email}`);
          }
        }
        
        // Get WhatsApp recipients if WhatsApp channel is enabled
        if (enabledChannels.includes('whatsapp')) {
          const validWhatsAppContacts = contacts
            .filter((contact: any) => {
              const isValid = contact.whatsapp && /^\d{8,15}$/.test(contact.whatsapp);
              console.log(`[REMINDER_DEBUG] Contact "${contact.name}" whatsapp "${contact.whatsapp}" valid: ${isValid}`);
              return isValid;
            })
            .map((contact: any) => contact.whatsapp);
          
          console.log(`[REMINDER_DEBUG] Valid WhatsApp contacts found:`, validWhatsAppContacts);
          
          if (validWhatsAppContacts.length > 0) {
            allRecipients.push(...validWhatsAppContacts);
          } else {
            // No WhatsApp contacts found, use default WhatsApp
            allRecipients.push(DEFAULT_RECIPIENTS.whatsapp);
            console.log(`[REMINDER_DEBUG] ✅ No WhatsApp contacts found, using default WhatsApp: ${DEFAULT_RECIPIENTS.whatsapp}`);
          }
        }
        
        // Get Telegram recipients if Telegram channel is enabled
        if (enabledChannels.includes('telegram')) {
          const validTelegramContacts = contacts
            .filter((contact: any) => {
              const isValid = contact.telegram && /^@[a-zA-Z0-9_]{5,}$/.test(contact.telegram);
              console.log(`[REMINDER_DEBUG] Contact "${contact.name}" telegram "${contact.telegram}" valid: ${isValid}`);
              return isValid;
            })
            .map((contact: any) => contact.telegram);
          
          console.log(`[REMINDER_DEBUG] Valid Telegram contacts found:`, validTelegramContacts);
          allRecipients.push(...validTelegramContacts);
        }
        
        // Now we always have recipients (either from contacts or defaults)
        recipients = allRecipients;
        console.log(`[REMINDER_DEBUG] ✅ Using recipients for auto-reminder (${recipients.length} total):`, recipients);
      } else {
        // Single channel and existing recipients exist, use them
        recipients = existing?.recipients || [];
        console.log(`[REMINDER_DEBUG] Using existing recipients (single channel):`, recipients);
      }
      
      // Final validation: ensure no empty strings and validate different formats
      const validatedRecipients = recipients.filter(recipient => {
        if (!recipient || recipient.trim().length === 0) return false;
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(recipient)) return true;
        
        // WhatsApp number validation (8-15 digits)
        const whatsappRegex = /^\d{8,15}$/;
        if (whatsappRegex.test(recipient)) return true;
        
        // Telegram username validation (@username)
        const telegramRegex = /^@[a-zA-Z0-9_]{5,}$/;
        if (telegramRegex.test(recipient)) return true;
        
        console.log(`[REMINDER_DEBUG] Invalid recipient format: "${recipient}"`);
        return false;
      });
      
      recipients = validatedRecipients;
      console.log(`[REMINDER_DEBUG] Final recipients after format validation:`, recipients);
      
      // We should always have recipients now (either from contacts or defaults)
      if (recipients.length === 0) {
        console.error(`[REMINDER_DEBUG] ❌ UNEXPECTED: No recipients after validation and defaults! This should not happen.`);
        console.error(`[REMINDER_DEBUG] Debug info - Document: ${doc.jenisDokumen} - ${doc.platNomor}, Enabled channels: ${enabledChannels.join(', ')}`);
        continue;
      }
      
      const updateLink = `${window.location.origin}/update-document/${doc.id}`;
      const stopLink = `${window.location.origin}/stop-reminder/${doc.id}`;
      const messageTemplate = `<p>Halo,</p>

<p>Dokumen <strong>{document}</strong> untuk kendaraan <strong>{vehicle}</strong> telah <span class="expired">KADALUARSA</span> sejak <strong>{date}</strong> ({days} hari yang lalu).</p>

<p>Mohon segera lakukan perpanjangan dokumen untuk menghindari masalah operasional.</p>

<p><strong>Detail Dokumen:</strong><br>
- Kendaraan: {vehicle}<br>
- Jenis Dokumen: {document}<br>
- Tanggal Kadaluarsa: {date}<br>
- Sudah kadaluarsa selama: {days} hari</p>

<p><a href="${updateLink}" class="button">Perbarui Dokumen Sekarang</a></p>

<p>Jika Anda sudah memperbarui dokumen atau ingin menghentikan pengingat ini, klik di bawah ini:<br>
<a href="${stopLink}" class="stop-link">Stop Reminder untuk Dokumen Ini</a></p>

<p>Terima kasih,<br>Tim GasTrax System - Smartek Sistem Indonesia</p>`;
      const title = `[AUTO] Reminder Kadaluarsa: ${doc.jenisDokumen} - ${doc.platNomor}`;
      
      if (!existing) {
        const newReminder = {
          title,
          type: 'document',
          vehicle: doc.platNomor,
          document: doc.id,
          triggerDate: new Date().toISOString(),
          daysBeforeAlert: [0],
          channels: enabledChannels,
          recipients,
          messageTemplate,
          isRecurring: true,
          recurringInterval: 1,
          recurringUnit: 'day',
          status: 'active',
        };
        this.addReminderConfig(newReminder);
        console.log('[DEBUG] Created new auto-reminder for expired document:', { docId: doc.id, reminderTitle: title, channels: enabledChannels });
      } else {
        this.updateReminderConfig(existing.id, {
          recipients,
          channels: enabledChannels, // Update channels based on current settings
          messageTemplate,
          status: 'active',
        });
        console.log('[DEBUG] Updated existing auto-reminder for expired document:', { docId: doc.id, reminderId: existing.id, channels: enabledChannels });
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
    
    // Step 1: Clean up any existing reminders with invalid recipients
    await this.cleanupInvalidReminders();
    
    // Step 2: Ensure daily reminders for expired documents are created/updated
    await this.ensureDailyRemindersForExpiredDocuments();
    
    // Step 3: Send reminders that are due
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

  // Manually trigger cleanup of invalid reminders
  async manualCleanupInvalidReminders(): Promise<{ cleaned: number; total: number }> {
    console.log('[MANUAL_CLEANUP] Starting manual cleanup of invalid reminders...');
    
    const reminderConfigs = localStorageService.getReminderConfigs();
    const emailSettings = localStorageService.getEmailSettings();
    let cleanedCount = 0;
    let fixedFromEmailCount = 0;
    
    for (const reminder of reminderConfigs) {
      // Check if reminder has invalid recipients (empty strings, invalid emails)
      const validRecipients = reminder.recipients.filter(email => 
        email && 
        email.trim().length > 0 && 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      );
      
      // Check if reminder is using fromEmail as recipient (wrong behavior)
      const isUsingFromEmailAsRecipient = reminder.recipients.includes(emailSettings.fromEmail);
      
      if (isUsingFromEmailAsRecipient) {
        console.log(`[MANUAL_CLEANUP] Found reminder using fromEmail as recipient: ${reminder.title}`);
        console.log(`[MANUAL_CLEANUP] FromEmail being used as recipient: ${emailSettings.fromEmail}`);
        
        // Get proper recipients from contacts
        const contacts = JSON.parse(localStorage.getItem('fleet_contacts') || '[]');
        const validContactEmails = contacts
          .filter((contact: any) => contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))
          .map((contact: any) => contact.email);
        
        if (validContactEmails.length > 0) {
          // Replace with contact emails
          this.updateReminderConfig(reminder.id, {
            recipients: validContactEmails
          });
          console.log(`[MANUAL_CLEANUP] ✅ Fixed reminder recipients from fromEmail to contacts:`, validContactEmails);
          fixedFromEmailCount++;
          cleanedCount++;
        } else {
          // No valid contacts, use default email as fallback
          this.updateReminderConfig(reminder.id, {
            recipients: [DEFAULT_RECIPIENTS.email]
          });
          console.log(`[MANUAL_CLEANUP] ✅ No contacts found, using default email recipient: ${DEFAULT_RECIPIENTS.email}`);
          cleanedCount++;
        }
      } else if (validRecipients.length === 0 && reminder.recipients.length > 0) {
        // This reminder has recipients but they're all invalid
        console.log(`[MANUAL_CLEANUP] Found invalid reminder: ${reminder.title}`);
        console.log(`[MANUAL_CLEANUP] Invalid recipients:`, reminder.recipients);
        
        // Pause the reminder instead of deleting it
        this.updateReminderConfig(reminder.id, { 
          status: 'paused',
          recipients: [] // Clear invalid recipients
        });
        cleanedCount++;
        
        console.log(`[MANUAL_CLEANUP] ✅ Paused reminder with invalid recipients: ${reminder.title}`);
      } else if (validRecipients.length !== reminder.recipients.length) {
        // Some recipients are invalid, clean them up
        console.log(`[MANUAL_CLEANUP] Cleaning invalid recipients for: ${reminder.title}`);
        console.log(`[MANUAL_CLEANUP] Before:`, reminder.recipients);
        console.log(`[MANUAL_CLEANUP] After:`, validRecipients);
        
        this.updateReminderConfig(reminder.id, { 
          recipients: validRecipients
        });
        cleanedCount++;
      }
    }
    
    const result = { cleaned: cleanedCount, total: reminderConfigs.length };
    
    if (cleanedCount > 0) {
      console.log(`[MANUAL_CLEANUP] ✅ Cleaned up ${cleanedCount} reminders with invalid recipients`);
      
      let message = `Cleaned up ${cleanedCount} reminders with invalid recipients out of ${reminderConfigs.length} total reminders.`;
      if (fixedFromEmailCount > 0) {
        message += ` Fixed ${fixedFromEmailCount} reminders that were incorrectly using sender email as recipient.`;
      }
      
      if (this.toast) {
        this.toast({
          title: "Cleanup Complete",
          description: message,
          variant: "default"
        });
      }
    } else {
      console.log(`[MANUAL_CLEANUP] ✅ No invalid reminders found`);
      if (this.toast) {
        this.toast({
          title: "No Issues Found",
          description: `All ${reminderConfigs.length} reminders have valid recipients.`,
          variant: "default"
        });
      }
    }
    
    return result;
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
