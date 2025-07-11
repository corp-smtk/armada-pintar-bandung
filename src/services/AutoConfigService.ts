// Auto Configuration Service
// Automatically initializes system configurations on application startup

import { systemConfigService } from './SystemConfigService';
import { localStorageService } from './LocalStorageService';

class AutoConfigService {
  private readonly INIT_FLAG_KEY = 'system_auto_configured';
  
  // Initialize system configurations automatically
  public async initializeSystemConfigurations(): Promise<void> {
    try {
      console.log('🔧 AutoConfigService: Initializing system configurations...');

      // Check if already initialized
      const alreadyInitialized = localStorage.getItem(this.INIT_FLAG_KEY);
      if (alreadyInitialized) {
        console.log('✅ AutoConfigService: System already configured');
        
        // Check if current configuration uses outdated dummy values
        if (this.hasOutdatedConfiguration()) {
          console.log('🔄 AutoConfigService: Detected outdated configuration, updating...');
          await this.setupDefaultConfigurations();
          localStorage.setItem(this.INIT_FLAG_KEY, new Date().toISOString());
        }
        
        this.verifyConfigurations();
        return;
      }

      // Initialize system configurations if user hasn't configured them
      await this.setupDefaultConfigurations();
      
      // Mark as initialized
      localStorage.setItem(this.INIT_FLAG_KEY, new Date().toISOString());
      
      console.log('✅ AutoConfigService: System auto-configuration completed');
    } catch (error) {
      console.error('❌ AutoConfigService: Failed to initialize:', error);
    }
  }

  // Set up default configurations using system config
  private async setupDefaultConfigurations(): Promise<void> {
    const systemConfig = systemConfigService.getSystemConfig();
    
    // Auto-configure email - always update to ensure working credentials
    console.log('📧 AutoConfigService: Setting up default email configuration...');
    
    const defaultEmailSettings = {
      enabled: true,
      serviceId: systemConfig.email.serviceId,
      templateId: systemConfig.email.templateId,
      publicKey: systemConfig.email.publicKey,
      fromEmail: systemConfig.email.fromEmail,
      fromName: systemConfig.email.fromName
    };
    
    localStorageService.saveEmailSettings(defaultEmailSettings);
    console.log('✅ AutoConfigService: Email configuration set up successfully');

    // Auto-configure WhatsApp - always update to ensure working credentials
    console.log('📱 AutoConfigService: Setting up default WhatsApp configuration...');
    
    const defaultWhatsAppSettings = {
      enabled: true,
      api_key: systemConfig.whatsapp.apiKey,
      sender: systemConfig.whatsapp.sender
    };
    
    localStorageService.saveWhatsAppSettings(defaultWhatsAppSettings);
    console.log('✅ AutoConfigService: WhatsApp configuration set up successfully');

    // Auto-configure Telegram if not set by user
    const currentTelegramSettings = localStorageService.getTelegramSettings();
    if (!currentTelegramSettings.enabled || !currentTelegramSettings.botToken) {
      console.log('💬 AutoConfigService: Setting up default Telegram configuration...');
      
      const defaultTelegramSettings = {
        enabled: true,
        botToken: systemConfig.telegram.botToken,
        chatId: systemConfig.telegram.defaultChatId
      };
      
      localStorageService.saveTelegramSettings(defaultTelegramSettings);
      console.log('✅ AutoConfigService: Telegram configuration set up successfully');
    }

    // Set up default general settings
    const currentGeneralSettings = localStorageService.getGeneralSettings();
    if (!currentGeneralSettings) {
      console.log('⚙️ AutoConfigService: Setting up default general settings...');
      
      const defaultGeneralSettings = {
        timezone: 'Asia/Jakarta',
        dailyCheckTime: '09:00',
        maxRetryAttempts: 3,
        retryInterval: 30,
        enableAutoRetry: true,
        enableDeliveryReports: true
      };
      
      localStorageService.saveGeneralSettings(defaultGeneralSettings);
      console.log('✅ AutoConfigService: General settings configured successfully');
    }
  }

  // Check if current configuration uses outdated dummy values
  private hasOutdatedConfiguration(): boolean {
    const currentEmailSettings = localStorageService.getEmailSettings();
    const currentWhatsAppSettings = localStorageService.getWhatsAppSettings();
    
    // Check for outdated EmailJS dummy values
    const hasOutdatedEmail = currentEmailSettings.serviceId === 'service_gastrax_001' ||
                            currentEmailSettings.templateId === 'template_gastrax_001' ||
                            currentEmailSettings.publicKey === 'gastrax_public_key_001' ||
                            currentEmailSettings.fromEmail === 'noreply@gastrax.smartek.co.id' ||
                            currentEmailSettings.fromName === 'Armada Pintar Bandung - Fleet Management System';
    
    // Check for outdated WhatsApp dummy values  
    const hasOutdatedWhatsApp = currentWhatsAppSettings.api_key === 'system_zapin_key_001' ||
                               currentWhatsAppSettings.sender === '6285720156766';
    
    return hasOutdatedEmail || hasOutdatedWhatsApp;
  }

  // Verify that configurations are working
  private verifyConfigurations(): void {
    const configStatus = systemConfigService.getConfigStatus();
    const systemReady = systemConfigService.isSystemReady();
    
    console.log('🔍 AutoConfigService: Configuration Status:', {
      email: configStatus.email,
      whatsapp: configStatus.whatsapp,
      telegram: configStatus.telegram,
      systemReady: systemReady.ready,
      missing: systemReady.missing
    });

    // Show status in console for debugging
    if (systemReady.ready) {
      console.log('🟢 AutoConfigService: All communication services are ready!');
    } else {
      console.warn('🟡 AutoConfigService: Some services need attention:', systemReady.missing);
    }
  }

  // Reset auto-configuration (for debugging or re-initialization)
  public resetAutoConfiguration(): void {
    localStorage.removeItem(this.INIT_FLAG_KEY);
    console.log('🔄 AutoConfigService: Auto-configuration reset');
  }

  // Check if system is properly configured
  public getSystemStatus(): {
    autoConfigured: boolean;
    emailReady: boolean;
    whatsappReady: boolean;
    telegramReady: boolean;
    lastConfigured: string | null;
  } {
    const configStatus = systemConfigService.getConfigStatus();
    const initFlag = localStorage.getItem(this.INIT_FLAG_KEY);
    
    return {
      autoConfigured: !!initFlag,
      emailReady: configStatus.email !== 'none',
      whatsappReady: configStatus.whatsapp !== 'none',
      telegramReady: configStatus.telegram !== 'none',
      lastConfigured: initFlag
    };
  }

  // Force re-configuration
  public async forceReconfigure(): Promise<void> {
    console.log('🔄 AutoConfigService: Force reconfiguring system...');
    this.resetAutoConfiguration();
    await this.initializeSystemConfigurations();
  }
}

export const autoConfigService = new AutoConfigService();
export default autoConfigService; 