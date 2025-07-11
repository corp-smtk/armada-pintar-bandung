// System Configuration Service
// Manages system-level credentials and provides fallback functionality

import type { EmailSettings, TelegramSettings } from './LocalStorageService';

export interface SystemConfig {
  email: {
    enabled: boolean;
    serviceId: string;
    templateId: string;
    publicKey: string;
    fromEmail: string;
    fromName: string;
  };
  whatsapp: {
    enabled: boolean;
    apiKey: string;
    sender: string;
  };
  telegram: {
    enabled: boolean;
    botToken: string;
    defaultChatId: string;
  };
}

export interface SystemConfigStatus {
  email: 'system' | 'user' | 'none';
  whatsapp: 'system' | 'user' | 'none';
  telegram: 'system' | 'user' | 'none';
}

class SystemConfigService {
  private readonly SYSTEM_CONFIG_KEY = 'system_config';
  
  // Default system configuration (fallback) - Using working credentials
  private defaultSystemConfig: SystemConfig = {
    email: {
      enabled: true,
      serviceId: 'service_gzjclqi', // Working EmailJS service
      templateId: 'template_pt3ndpf', // Working EmailJS template  
      publicKey: '3IJlW5x9KGB1VmVr9', // Working EmailJS public key
      fromEmail: 'reminder@smarteksistem.com',
      fromName: 'GasTrax System - Smartek Sistem Indonesia'
    },
    whatsapp: {
      enabled: true,
      apiKey: 'bdya98Gl2nXJ7VAKoANO2NSHurDOrR', // Working Zapin API key
      sender: '6285691232473' // Working WhatsApp sender
    },
    telegram: {
      enabled: true,
      botToken: 'system_telegram_bot_001', // System Telegram bot token (placeholder)
      defaultChatId: '@armada_alerts' // System Telegram channel
    }
  };

  // Get system configuration (from environment or defaults)
  getSystemConfig(): SystemConfig {
    // In browser environment, use import.meta.env (Vite environment variables)
    // In production, these would come from the server-side configuration
    const systemConfig: SystemConfig = {
      email: {
        enabled: true,
        serviceId: import.meta.env.VITE_SYSTEM_EMAILJS_SERVICE_ID || this.defaultSystemConfig.email.serviceId,
        templateId: import.meta.env.VITE_SYSTEM_EMAILJS_TEMPLATE_ID || this.defaultSystemConfig.email.templateId,
        publicKey: import.meta.env.VITE_SYSTEM_EMAILJS_PUBLIC_KEY || this.defaultSystemConfig.email.publicKey,
        fromEmail: import.meta.env.VITE_SYSTEM_FROM_EMAIL || this.defaultSystemConfig.email.fromEmail,
        fromName: import.meta.env.VITE_SYSTEM_FROM_NAME || this.defaultSystemConfig.email.fromName
      },
      whatsapp: {
        enabled: true,
        apiKey: import.meta.env.VITE_SYSTEM_ZAPIN_API_KEY || this.defaultSystemConfig.whatsapp.apiKey,
        sender: import.meta.env.VITE_SYSTEM_ZAPIN_SENDER || this.defaultSystemConfig.whatsapp.sender
      },
      telegram: {
        enabled: true,
        botToken: import.meta.env.VITE_SYSTEM_TELEGRAM_BOT_TOKEN || this.defaultSystemConfig.telegram.botToken,
        defaultChatId: import.meta.env.VITE_SYSTEM_TELEGRAM_CHAT_ID || this.defaultSystemConfig.telegram.defaultChatId
      }
    };

    return systemConfig;
  }

  // Check if system has valid configuration
  hasSystemConfig(): boolean {
    const config = this.getSystemConfig();
    return config.email.enabled && config.whatsapp.enabled;
  }

  // Get configuration status for each service
  getConfigStatus(): SystemConfigStatus {
    // Access localStorage directly to avoid circular dependency
    const userEmailSettings = this.getUserEmailSettings();
    const userWhatsAppSettings = this.getUserWhatsAppSettings();
    const userTelegramSettings = this.getUserTelegramSettings();

    return {
      email: this.isUserEmailConfigured(userEmailSettings) ? 'user' : 
             this.hasSystemConfig() ? 'system' : 'none',
      whatsapp: this.isUserWhatsAppConfigured(userWhatsAppSettings) ? 'user' : 
                this.hasSystemConfig() ? 'system' : 'none',
      telegram: this.isUserTelegramConfigured(userTelegramSettings) ? 'user' : 
                this.hasSystemConfig() ? 'system' : 'none'
    };
  }

  // Direct localStorage access methods to avoid circular dependency
  private getUserEmailSettings(): EmailSettings {
    try {
      const settings = localStorage.getItem('email_settings');
      return settings ? JSON.parse(settings) : {
        enabled: false,
        serviceId: '',
        templateId: '',
        publicKey: '',
        fromEmail: '',
        fromName: ''
      };
    } catch {
      return {
        enabled: false,
        serviceId: '',
        templateId: '',
        publicKey: '',
        fromEmail: '',
        fromName: ''
      };
    }
  }

  private getUserWhatsAppSettings(): any {
    try {
      const settings = localStorage.getItem('whatsapp_settings');
      return settings ? JSON.parse(settings) : {
        enabled: false,
        api_key: '',
        sender: ''
      };
    } catch {
      return {
        enabled: false,
        api_key: '',
        sender: ''
      };
    }
  }

  private getUserTelegramSettings(): TelegramSettings {
    try {
      const settings = localStorage.getItem('telegram_settings');
      return settings ? JSON.parse(settings) : {
        enabled: false,
        botToken: '',
        chatId: ''
      };
    } catch {
      return {
        enabled: false,
        botToken: '',
        chatId: ''
      };
    }
  }

  // Check if user has configured their own email settings
  private isUserEmailConfigured(settings: any): boolean {
    return settings.enabled && 
           settings.serviceId && 
           settings.templateId && 
           settings.publicKey &&
           settings.fromEmail;
  }

  // Check if user has configured their own WhatsApp settings
  private isUserWhatsAppConfigured(settings: any): boolean {
    return settings.enabled && 
           settings.api_key && 
           settings.sender;
  }

  // Check if user has configured their own Telegram settings
  private isUserTelegramConfigured(settings: any): boolean {
    return settings.enabled && 
           settings.botToken && 
           settings.chatId;
  }

  // Get effective email configuration (user config or system fallback)
  getEffectiveEmailConfig(): any {
    const userSettings = this.getUserEmailSettings();
    
    if (this.isUserEmailConfigured(userSettings)) {
      return userSettings;
    }

    // Return system configuration
    const systemConfig = this.getSystemConfig();
    return {
      enabled: systemConfig.email.enabled,
      serviceId: systemConfig.email.serviceId,
      templateId: systemConfig.email.templateId,
      publicKey: systemConfig.email.publicKey,
      fromEmail: systemConfig.email.fromEmail,
      fromName: systemConfig.email.fromName
    };
  }

  // Get effective WhatsApp configuration (user config or system fallback)
  getEffectiveWhatsAppConfig(): any {
    const userSettings = this.getUserWhatsAppSettings();
    
    if (this.isUserWhatsAppConfigured(userSettings)) {
      return userSettings;
    }

    // Return system configuration
    const systemConfig = this.getSystemConfig();
    return {
      enabled: systemConfig.whatsapp.enabled,
      api_key: systemConfig.whatsapp.apiKey,
      sender: systemConfig.whatsapp.sender
    };
  }

  // Get effective Telegram configuration (user config or system fallback)
  getEffectiveTelegramConfig(): any {
    const userSettings = this.getUserTelegramSettings();
    
    if (this.isUserTelegramConfigured(userSettings)) {
      return userSettings;
    }

    // Return system configuration
    const systemConfig = this.getSystemConfig();
    return {
      enabled: systemConfig.telegram.enabled,
      botToken: systemConfig.telegram.botToken,
      chatId: systemConfig.telegram.defaultChatId
    };
  }



  // Check if system is ready to send notifications
  isSystemReady(): { ready: boolean; missing: string[] } {
    const config = this.getSystemConfig();
    const missing: string[] = [];

    if (!config.email.enabled || !config.email.serviceId) {
      missing.push('Email Service');
    }
    if (!config.whatsapp.enabled || !config.whatsapp.apiKey) {
      missing.push('WhatsApp Service');
    }

    return {
      ready: missing.length === 0,
      missing
    };
  }

  // Get system information for display
  getSystemInfo(): {
    version: string;
    services: {
      email: { status: string; provider: string };
      whatsapp: { status: string; provider: string };
      telegram: { status: string; provider: string };
    };
  } {
    const configStatus = this.getConfigStatus();
    
    return {
      version: '1.0.0',
      services: {
        email: {
          status: configStatus.email === 'system' ? 'System Configured' : 
                 configStatus.email === 'user' ? 'User Configured' : 'Not Configured',
          provider: 'EmailJS'
        },
        whatsapp: {
          status: configStatus.whatsapp === 'system' ? 'System Configured' : 
                 configStatus.whatsapp === 'user' ? 'User Configured' : 'Not Configured',
          provider: 'Zapin API'
        },
        telegram: {
          status: configStatus.telegram === 'system' ? 'System Configured' : 
                 configStatus.telegram === 'user' ? 'User Configured' : 'Not Configured',
          provider: 'Telegram Bot API'
        }
      }
    };
  }
}

export const systemConfigService = new SystemConfigService();
export default systemConfigService; 