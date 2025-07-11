// Automated Scheduler Service
// Handles automatic daily reminder checks and scheduling

import { localStorageService } from './LocalStorageService';

class AutomatedSchedulerService {
  private dailyCheckTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastCheckDate: string | null = null;
  private reminderService: any = null;

  // Initialize the scheduler
  public initialize(reminderService: any): void {
    this.reminderService = reminderService;
    this.startDailyScheduler();
    console.log('🕒 AutomatedSchedulerService: Initialized with daily check scheduler');
  }

  // Start the daily scheduler
  private startDailyScheduler(): void {
    if (this.dailyCheckTimer) {
      clearInterval(this.dailyCheckTimer);
    }

    // Check every minute for the scheduled time
    this.dailyCheckTimer = setInterval(() => {
      this.checkIfTimeForDailyCheck();
    }, 60000); // Check every minute

    console.log('🕒 AutomatedSchedulerService: Daily scheduler started (checks every minute)');
    
    // Also check immediately on startup
    setTimeout(() => {
      this.checkIfTimeForDailyCheck();
    }, 5000); // Wait 5 seconds after app startup
  }

  // Check if it's time to run the daily check
  private async checkIfTimeForDailyCheck(): Promise<void> {
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDate = now.toISOString().split('T')[0];

      // Get the scheduled time from settings
      const generalSettings = localStorageService.getGeneralSettings();
      const scheduledTime = generalSettings?.dailyCheckTime || '09:00';

      // Check if we're at the scheduled time and haven't run today
      const shouldRun = currentTime === scheduledTime && this.lastCheckDate !== currentDate;

      if (shouldRun && !this.isRunning) {
        console.log(`🕒 AutomatedSchedulerService: Running daily check at scheduled time: ${scheduledTime}`);
        await this.runAutomatedDailyCheck();
        this.lastCheckDate = currentDate;
      }
    } catch (error) {
      console.error('❌ AutomatedSchedulerService: Error in daily check timer:', error);
    }
  }

  // Run the automated daily check
  private async runAutomatedDailyCheck(): Promise<void> {
    if (this.isRunning || !this.reminderService) {
      console.log('⏭️ AutomatedSchedulerService: Daily check already running or no reminder service');
      return;
    }

    this.isRunning = true;
    
    try {
      console.log('🚀 AutomatedSchedulerService: Starting automated daily reminder check...');
      
      // Run the daily check
      await this.reminderService.runDailyCheck();
      
      // Log the successful completion
      const timestamp = new Date().toLocaleString('id-ID');
      console.log(`✅ AutomatedSchedulerService: Daily check completed successfully at ${timestamp}`);
      
      // Store last run info for debugging
      localStorage.setItem('last_automated_check', JSON.stringify({
        timestamp: new Date().toISOString(),
        status: 'success'
      }));

    } catch (error: any) {
      console.error('❌ AutomatedSchedulerService: Daily check failed:', error);
      
      // Store error info for debugging
      localStorage.setItem('last_automated_check', JSON.stringify({
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message
      }));
    } finally {
      this.isRunning = false;
    }
  }

  // Manual trigger (for testing or immediate execution)
  public async runManualCheck(): Promise<void> {
    console.log('🔧 AutomatedSchedulerService: Running manual daily check...');
    await this.runAutomatedDailyCheck();
  }

  // Check if scheduler is active
  public isSchedulerActive(): boolean {
    return this.dailyCheckTimer !== null;
  }

  // Get scheduler status
  public getSchedulerStatus(): {
    isActive: boolean;
    isRunning: boolean;
    lastCheckDate: string | null;
    scheduledTime: string;
    nextCheckIn?: string;
  } {
    const generalSettings = localStorageService.getGeneralSettings();
    const scheduledTime = generalSettings?.dailyCheckTime || '09:00';
    
    let nextCheckIn = '';
    if (this.isSchedulerActive()) {
      const now = new Date();
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const nextCheck = new Date();
      nextCheck.setHours(hours, minutes, 0, 0);
      
      // If the scheduled time has passed today, schedule for tomorrow
      if (nextCheck <= now) {
        nextCheck.setDate(nextCheck.getDate() + 1);
      }
      
      const diffMs = nextCheck.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      nextCheckIn = `${diffHours}h ${diffMinutes}m`;
    }

    return {
      isActive: this.isSchedulerActive(),
      isRunning: this.isRunning,
      lastCheckDate: this.lastCheckDate,
      scheduledTime,
      nextCheckIn
    };
  }

  // Get last automated check info
  public getLastCheckInfo(): { timestamp: string; status: string; error?: string } | null {
    try {
      const info = localStorage.getItem('last_automated_check');
      return info ? JSON.parse(info) : null;
    } catch {
      return null;
    }
  }

  // Stop the scheduler
  public stop(): void {
    if (this.dailyCheckTimer) {
      clearInterval(this.dailyCheckTimer);
      this.dailyCheckTimer = null;
    }
    console.log('🛑 AutomatedSchedulerService: Scheduler stopped');
  }

  // Restart the scheduler (useful when settings change)
  public restart(): void {
    console.log('🔄 AutomatedSchedulerService: Restarting scheduler...');
    this.stop();
    this.startDailyScheduler();
  }
}

// Export singleton instance
export const automatedSchedulerService = new AutomatedSchedulerService(); 