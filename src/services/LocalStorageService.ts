// Service untuk mengelola localStorage dengan type safety
export interface EmailSettings {
  enabled: boolean;
  serviceId: string;
  templateId: string;
  publicKey: string;
  fromEmail: string;
  fromName: string;
}

export interface TelegramSettings {
  enabled: boolean;
  botToken: string;
  chatId: string;
  webhookUrl?: string;
}

export interface GeneralSettings {
  timezone: string;
  dailyCheckTime: string;
  maxRetryAttempts: number;
  retryInterval: number;
  enableAutoRetry: boolean;
  enableDeliveryReports: boolean;
}

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
  createdAt: string;
  updatedAt: string;
}

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

class LocalStorageService {
  private readonly KEYS = {
    EMAIL_SETTINGS: 'fleet_email_settings',
    TELEGRAM_SETTINGS: 'fleet_telegram_settings',
    GENERAL_SETTINGS: 'fleet_general_settings',
    REMINDER_CONFIGS: 'fleet_reminder_configs',
    DELIVERY_LOGS: 'fleet_delivery_logs'
  };

  // Email Settings
  saveEmailSettings(settings: EmailSettings): void {
    localStorage.setItem(this.KEYS.EMAIL_SETTINGS, JSON.stringify(settings));
  }

  getEmailSettings(): EmailSettings {
    const saved = localStorage.getItem(this.KEYS.EMAIL_SETTINGS);
    return saved ? JSON.parse(saved) : {
      enabled: false,
      serviceId: '',
      templateId: '',
      publicKey: '',
      fromEmail: '',
      fromName: 'Fleet Management System'
    };
  }

  // Telegram Settings
  saveTelegramSettings(settings: TelegramSettings): void {
    localStorage.setItem(this.KEYS.TELEGRAM_SETTINGS, JSON.stringify(settings));
  }

  getTelegramSettings(): TelegramSettings {
    const saved = localStorage.getItem(this.KEYS.TELEGRAM_SETTINGS);
    return saved ? JSON.parse(saved) : {
      enabled: false,
      botToken: '',
      chatId: '',
      webhookUrl: ''
    };
  }

  // General Settings
  saveGeneralSettings(settings: GeneralSettings): void {
    localStorage.setItem(this.KEYS.GENERAL_SETTINGS, JSON.stringify(settings));
  }

  getGeneralSettings(): GeneralSettings {
    const saved = localStorage.getItem(this.KEYS.GENERAL_SETTINGS);
    return saved ? JSON.parse(saved) : {
      timezone: 'Asia/Jakarta',
      dailyCheckTime: '08:00',
      maxRetryAttempts: 3,
      retryInterval: 60,
      enableAutoRetry: true,
      enableDeliveryReports: true
    };
  }

  // Reminder Configs
  saveReminderConfigs(configs: ReminderConfig[]): void {
    localStorage.setItem(this.KEYS.REMINDER_CONFIGS, JSON.stringify(configs));
  }

  getReminderConfigs(): ReminderConfig[] {
    const saved = localStorage.getItem(this.KEYS.REMINDER_CONFIGS);
    return saved ? JSON.parse(saved) : [];
  }

  addReminderConfig(config: ReminderConfig): void {
    const configs = this.getReminderConfigs();
    configs.push(config);
    this.saveReminderConfigs(configs);
  }

  updateReminderConfig(id: string, updates: Partial<ReminderConfig>): void {
    const configs = this.getReminderConfigs();
    const index = configs.findIndex(c => c.id === id);
    if (index !== -1) {
      configs[index] = { ...configs[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveReminderConfigs(configs);
    }
  }

  deleteReminderConfig(id: string): void {
    const configs = this.getReminderConfigs();
    const filtered = configs.filter(c => c.id !== id);
    this.saveReminderConfigs(filtered);
  }

  // Delivery Logs
  saveDeliveryLogs(logs: DeliveryLog[]): void {
    localStorage.setItem(this.KEYS.DELIVERY_LOGS, JSON.stringify(logs));
  }

  getDeliveryLogs(): DeliveryLog[] {
    const saved = localStorage.getItem(this.KEYS.DELIVERY_LOGS);
    return saved ? JSON.parse(saved) : [];
  }

  addDeliveryLog(log: DeliveryLog): void {
    const logs = this.getDeliveryLogs();
    logs.unshift(log); // Add to beginning for latest first
    // Keep only last 1000 logs to prevent localStorage bloat
    if (logs.length > 1000) {
      logs.splice(1000);
    }
    this.saveDeliveryLogs(logs);
  }

  // Utility methods
  clearAllData(): void {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  exportData(): string {
    const data = {
      emailSettings: this.getEmailSettings(),
      telegramSettings: this.getTelegramSettings(),
      generalSettings: this.getGeneralSettings(),
      reminderConfigs: this.getReminderConfigs(),
      deliveryLogs: this.getDeliveryLogs(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      if (data.emailSettings) this.saveEmailSettings(data.emailSettings);
      if (data.telegramSettings) this.saveTelegramSettings(data.telegramSettings);
      if (data.generalSettings) this.saveGeneralSettings(data.generalSettings);
      if (data.reminderConfigs) this.saveReminderConfigs(data.reminderConfigs);
      if (data.deliveryLogs) this.saveDeliveryLogs(data.deliveryLogs);
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }
}

export const localStorageService = new LocalStorageService();
