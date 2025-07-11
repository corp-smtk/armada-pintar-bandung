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
  channels: ('email' | 'telegram' | 'whatsapp')[];
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

// New interfaces for additional modules
export interface VehiclePhoto {
  id: string;
  vehicleId: string;
  category: 'front' | 'side' | 'rear' | 'interior' | 'document' | 'damage' | 'other';
  fileName: string;
  fileType: string;
  fileData: string; // base64 encoded image
  title?: string;
  description?: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  platNomor: string;
  jenisKendaraan: string;
  merek: string;
  model: string;
  tahunPembuatan: number;
  nomorRangka: string;
  nomorMesin: string;
  kapasitasMusatan?: string;
  jenisBahanBakar: string;
  warna?: string;
  tanggalPerolehan: string;
  statusKepemilikan: string;
  lokasiPool: string;
  status: 'Aktif' | 'Tidak Aktif' | 'Dalam Perbaikan';
  statusDokumen: string;
  servisBerikutnya?: string;
  catatan?: string;
  photos?: VehiclePhoto[]; // Add photos field
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  vehicleId: string;
  platNomor: string;
  jenisDokumen: string;
  nomorDokumen: string;
  tanggalTerbit: string;
  tanggalKadaluarsa: string;
  penerbitDokumen?: string;
  fileData?: string; // base64 encoded file
  fileName?: string;
  fileType?: string;
  status: 'Valid' | 'Akan Kadaluarsa' | 'Kritis' | 'Kadaluarsa';
  hariTersisa: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  platNomor: string;
  tanggal: string;
  jenisPerawatan: string;
  deskripsi: string;
  kilometer: number;
  biaya: number;
  bengkel?: string;
  teknisi?: string;
  spareParts: {
    nama: string;
    jumlah: number;
    harga: number;
  }[];
  status: 'Selesai' | 'Dalam Progress' | 'Dijadwalkan';
  nextServiceKm?: number;
  nextServiceDate?: string;
  catatan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationalCost {
  id: string;
  vehicleId: string;
  platNomor: string;
  tanggal: string;
  jenisBiaya: string;
  deskripsi: string;
  jumlah: number;
  lokasi?: string;
  kategori: 'Operasional' | 'Perawatan' | 'Administrasi';
  receipt?: string; // base64 encoded receipt image
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppSettings {
  enabled: boolean;
  api_key: string;
  sender: string;
}

class LocalStorageService {
  private getPrefix() {
    const user = localStorage.getItem('session_user');
    return user ? user + '_' : '';
  }

  private readonly KEYS = {
    EMAIL_SETTINGS: 'fleet_email_settings',
    TELEGRAM_SETTINGS: 'fleet_telegram_settings',
    GENERAL_SETTINGS: 'fleet_general_settings',
    REMINDER_CONFIGS: 'fleet_reminder_configs',
    DELIVERY_LOGS: 'fleet_delivery_logs',
    VEHICLES: 'fleet_vehicles',
    DOCUMENTS: 'fleet_documents',
    MAINTENANCE_RECORDS: 'fleet_maintenance_records',
    OPERATIONAL_COSTS: 'fleet_operational_costs',
    WHATSAPP_SETTINGS: 'fleet_whatsapp_settings'
  };

  // Email Settings
  saveEmailSettings(settings: EmailSettings): void {
    localStorage.setItem(this.getPrefix() + this.KEYS.EMAIL_SETTINGS, JSON.stringify(settings));
  }

  getEmailSettings(): EmailSettings {
    const saved = localStorage.getItem(this.getPrefix() + this.KEYS.EMAIL_SETTINGS);
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
    localStorage.setItem(this.getPrefix() + this.KEYS.TELEGRAM_SETTINGS, JSON.stringify(settings));
  }

  getTelegramSettings(): TelegramSettings {
    const saved = localStorage.getItem(this.getPrefix() + this.KEYS.TELEGRAM_SETTINGS);
    return saved ? JSON.parse(saved) : {
      enabled: false,
      botToken: '',
      chatId: '',
      webhookUrl: ''
    };
  }

  // General Settings
  saveGeneralSettings(settings: GeneralSettings): void {
    localStorage.setItem(this.getPrefix() + this.KEYS.GENERAL_SETTINGS, JSON.stringify(settings));
  }

  getGeneralSettings(): GeneralSettings {
    const saved = localStorage.getItem(this.getPrefix() + this.KEYS.GENERAL_SETTINGS);
    return saved ? JSON.parse(saved) : {
      timezone: 'Asia/Jakarta',
      dailyCheckTime: '09:00',
      maxRetryAttempts: 3,
      retryInterval: 30,
      enableAutoRetry: true,
      enableDeliveryReports: true
    };
  }

  // Reminder Configs
  saveReminderConfigs(configs: ReminderConfig[]): void {
    localStorage.setItem(this.getPrefix() + this.KEYS.REMINDER_CONFIGS, JSON.stringify(configs));
  }

  getReminderConfigs(): ReminderConfig[] {
    const saved = localStorage.getItem(this.getPrefix() + this.KEYS.REMINDER_CONFIGS);
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
    localStorage.setItem(this.getPrefix() + this.KEYS.DELIVERY_LOGS, JSON.stringify(logs));
  }

  getDeliveryLogs(): DeliveryLog[] {
    const saved = localStorage.getItem(this.getPrefix() + this.KEYS.DELIVERY_LOGS);
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

  // Vehicle Management
  saveVehicles(vehicles: Vehicle[]): void {
    localStorage.setItem(this.getPrefix() + this.KEYS.VEHICLES, JSON.stringify(vehicles));
  }

  getVehicles(): Vehicle[] {
    const saved = localStorage.getItem(this.getPrefix() + this.KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : [];
  }

  addVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Vehicle {
    const vehicles = this.getVehicles();
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    vehicles.push(newVehicle);
    this.saveVehicles(vehicles);
    return newVehicle;
  }

  updateVehicle(id: string, updates: Partial<Vehicle>): void {
    const vehicles = this.getVehicles();
    const index = vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      vehicles[index] = { ...vehicles[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveVehicles(vehicles);
    }
  }

  deleteVehicle(id: string): void {
    const vehicles = this.getVehicles();
    const filtered = vehicles.filter(v => v.id !== id);
    this.saveVehicles(filtered);
    
    // Also delete related documents, maintenance records, and costs
    this.deleteDocumentsByVehicle(id);
    this.deleteMaintenanceByVehicle(id);
    this.deleteCostsByVehicle(id);
  }

  getVehicleById(id: string): Vehicle | undefined {
    const vehicles = this.getVehicles();
    return vehicles.find(v => v.id === id);
  }

  // Vehicle Photo Management
  addVehiclePhoto(vehicleId: string, photo: Omit<VehiclePhoto, 'id' | 'createdAt' | 'updatedAt'>): VehiclePhoto {
    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const newPhoto: VehiclePhoto = {
      ...photo,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const photos = vehicle.photos || [];
    photos.push(newPhoto);
    
    this.updateVehicle(vehicleId, { photos });
    return newPhoto;
  }

  getVehiclePhotos(vehicleId: string): VehiclePhoto[] {
    const vehicle = this.getVehicleById(vehicleId);
    return vehicle?.photos || [];
  }

  updateVehiclePhoto(vehicleId: string, photoId: string, updates: Partial<VehiclePhoto>): void {
    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle || !vehicle.photos) {
      throw new Error('Vehicle or photos not found');
    }

    const photoIndex = vehicle.photos.findIndex(p => p.id === photoId);
    if (photoIndex === -1) {
      throw new Error('Photo not found');
    }

    vehicle.photos[photoIndex] = {
      ...vehicle.photos[photoIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.updateVehicle(vehicleId, { photos: vehicle.photos });
  }

  deleteVehiclePhoto(vehicleId: string, photoId: string): void {
    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle || !vehicle.photos) {
      throw new Error('Vehicle or photos not found');
    }

    const updatedPhotos = vehicle.photos.filter(p => p.id !== photoId);
    this.updateVehicle(vehicleId, { photos: updatedPhotos });
  }

  deleteAllVehiclePhotos(vehicleId: string): void {
    this.updateVehicle(vehicleId, { photos: [] });
  }

  // Document Management
  saveDocuments(documents: Document[]): void {
    localStorage.setItem(this.getPrefix() + this.KEYS.DOCUMENTS, JSON.stringify(documents));
  }

  getDocuments(): Document[] {
    const saved = localStorage.getItem(this.getPrefix() + this.KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : [];
  }

  addDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'hariTersisa' | 'status'>): Document {
    const documents = this.getDocuments();
    const hariTersisa = this.calculateDaysRemaining(document.tanggalKadaluarsa);
    const status = this.calculateDocumentStatus(hariTersisa);
    
    const newDocument: Document = {
      ...document,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      hariTersisa,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    documents.push(newDocument);
    this.saveDocuments(documents);
    return newDocument;
  }

  updateDocument(id: string, updates: Partial<Document>): void {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === id);
    if (index !== -1) {
      const updatedDoc = { ...documents[index], ...updates, updatedAt: new Date().toISOString() };
      if (updates.tanggalKadaluarsa) {
        updatedDoc.hariTersisa = this.calculateDaysRemaining(updates.tanggalKadaluarsa);
        updatedDoc.status = this.calculateDocumentStatus(updatedDoc.hariTersisa);
      }
      documents[index] = updatedDoc;
      this.saveDocuments(documents);
    }
  }

  deleteDocument(id: string): void {
    const documents = this.getDocuments();
    const filtered = documents.filter(d => d.id !== id);
    this.saveDocuments(filtered);
  }

  deleteDocumentsByVehicle(vehicleId: string): void {
    const documents = this.getDocuments();
    const filtered = documents.filter(d => d.vehicleId !== vehicleId);
    this.saveDocuments(filtered);
  }

  getDocumentsByVehicle(vehicleId: string): Document[] {
    const documents = this.getDocuments();
    return documents.filter(d => d.vehicleId === vehicleId);
  }

  // Maintenance Management
  saveMaintenanceRecords(records: MaintenanceRecord[]): void {
    localStorage.setItem(this.getPrefix() + this.KEYS.MAINTENANCE_RECORDS, JSON.stringify(records));
  }

  getMaintenanceRecords(): MaintenanceRecord[] {
    const saved = localStorage.getItem(this.getPrefix() + this.KEYS.MAINTENANCE_RECORDS);
    return saved ? JSON.parse(saved) : [];
  }

  addMaintenanceRecord(record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): MaintenanceRecord {
    const records = this.getMaintenanceRecords();
    const newRecord: MaintenanceRecord = {
      ...record,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    records.push(newRecord);
    this.saveMaintenanceRecords(records);
    return newRecord;
  }

  updateMaintenanceRecord(id: string, updates: Partial<MaintenanceRecord>): void {
    const records = this.getMaintenanceRecords();
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveMaintenanceRecords(records);
    }
  }

  deleteMaintenanceRecord(id: string): void {
    const records = this.getMaintenanceRecords();
    const filtered = records.filter(r => r.id !== id);
    this.saveMaintenanceRecords(filtered);
  }

  deleteMaintenanceByVehicle(vehicleId: string): void {
    const records = this.getMaintenanceRecords();
    const filtered = records.filter(r => r.vehicleId !== vehicleId);
    this.saveMaintenanceRecords(filtered);
  }

  getMaintenanceByVehicle(vehicleId: string): MaintenanceRecord[] {
    const records = this.getMaintenanceRecords();
    return records.filter(r => r.vehicleId === vehicleId);
  }

  // Operational Costs Management
  saveOperationalCosts(costs: OperationalCost[]): void {
    localStorage.setItem(this.getPrefix() + this.KEYS.OPERATIONAL_COSTS, JSON.stringify(costs));
  }

  getOperationalCosts(): OperationalCost[] {
    const saved = localStorage.getItem(this.getPrefix() + this.KEYS.OPERATIONAL_COSTS);
    return saved ? JSON.parse(saved) : [];
  }

  addOperationalCost(cost: Omit<OperationalCost, 'id' | 'createdAt' | 'updatedAt'>): OperationalCost {
    const costs = this.getOperationalCosts();
    const newCost: OperationalCost = {
      ...cost,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    costs.push(newCost);
    this.saveOperationalCosts(costs);
    return newCost;
  }

  updateOperationalCost(id: string, updates: Partial<OperationalCost>): void {
    const costs = this.getOperationalCosts();
    const index = costs.findIndex(c => c.id === id);
    if (index !== -1) {
      costs[index] = { ...costs[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveOperationalCosts(costs);
    }
  }

  deleteOperationalCost(id: string): void {
    const costs = this.getOperationalCosts();
    const filtered = costs.filter(c => c.id !== id);
    this.saveOperationalCosts(filtered);
  }

  deleteCostsByVehicle(vehicleId: string): void {
    const costs = this.getOperationalCosts();
    const filtered = costs.filter(c => c.vehicleId !== vehicleId);
    this.saveOperationalCosts(filtered);
  }

  getCostsByVehicle(vehicleId: string): OperationalCost[] {
    const costs = this.getOperationalCosts();
    return costs.filter(c => c.vehicleId === vehicleId);
  }

  // WhatsApp Settings
  saveWhatsAppSettings(settings: WhatsAppSettings): void {
    localStorage.setItem(this.getPrefix() + this.KEYS.WHATSAPP_SETTINGS, JSON.stringify(settings));
  }
  getWhatsAppSettings(): WhatsAppSettings {
    const saved = localStorage.getItem(this.getPrefix() + this.KEYS.WHATSAPP_SETTINGS);
    return saved ? JSON.parse(saved) : {
      enabled: false,
      api_key: '',
      sender: ''
    };
  }

  // Utility methods
  private calculateDaysRemaining(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateDocumentStatus(daysRemaining: number): 'Valid' | 'Akan Kadaluarsa' | 'Kritis' | 'Kadaluarsa' {
    if (daysRemaining < 0) return 'Kadaluarsa';
    if (daysRemaining <= 14) return 'Kritis';
    if (daysRemaining <= 30) return 'Akan Kadaluarsa';
    return 'Valid';
  }

  clearAllData(): void {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(this.getPrefix() + key);
    });
  }

  exportData(): string {
    const data = {
      emailSettings: this.getEmailSettings(),
      telegramSettings: this.getTelegramSettings(),
      generalSettings: this.getGeneralSettings(),
      reminderConfigs: this.getReminderConfigs(),
      deliveryLogs: this.getDeliveryLogs(),
      vehicles: this.getVehicles(),
      documents: this.getDocuments(),
      maintenanceRecords: this.getMaintenanceRecords(),
      operationalCosts: this.getOperationalCosts(),
      whatsAppSettings: this.getWhatsAppSettings(),
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
      if (data.vehicles) this.saveVehicles(data.vehicles);
      if (data.documents) this.saveDocuments(data.documents);
      if (data.maintenanceRecords) this.saveMaintenanceRecords(data.maintenanceRecords);
      if (data.operationalCosts) this.saveOperationalCosts(data.operationalCosts);
      if (data.whatsAppSettings) this.saveWhatsAppSettings(data.whatsAppSettings);
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }

  // Initialize with sample data if empty
  initializeSampleData(): void {
    if (this.getVehicles().length === 0) {
      this.initializeVehicleSampleData();
    }
    if (this.getDocuments().length === 0) {
      this.initializeDocumentSampleData();
    }
    if (this.getMaintenanceRecords().length === 0) {
      this.initializeMaintenanceSampleData();
    }
    if (this.getOperationalCosts().length === 0) {
      this.initializeCostSampleData();
    }
  }

  private initializeVehicleSampleData(): void {
    const sampleVehicles: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        platNomor: 'B 1234 AB',
        jenisKendaraan: 'Truk',
        merek: 'Mitsubishi',
        model: 'Canter',
        tahunPembuatan: 2020,
        nomorRangka: 'MHK123456789012345',
        nomorMesin: '4M40T123456',
        kapasitasMusatan: '3 Ton',
        jenisBahanBakar: 'Solar',
        warna: 'Putih',
        tanggalPerolehan: '2020-03-15',
        statusKepemilikan: 'Milik Sendiri',
        lokasiPool: 'Pool Utama Bandung',
        status: 'Aktif',
        statusDokumen: 'Lengkap',
        servisBerikutnya: '2024-08-15'
      },
      {
        platNomor: 'B 5678 CD',
        jenisKendaraan: 'Pickup',
        merek: 'Toyota',
        model: 'Hilux',
        tahunPembuatan: 2019,
        nomorRangka: 'MHR987654321098765',
        nomorMesin: '2KD789012345',
        kapasitasMusatan: '1 Ton',
        jenisBahanBakar: 'Solar',
        warna: 'Silver',
        tanggalPerolehan: '2019-06-20',
        statusKepemilikan: 'Milik Sendiri',
        lokasiPool: 'Pool Utama Bandung',
        status: 'Aktif',
        statusDokumen: 'Ada yang Kadaluarsa',
        servisBerikutnya: '2024-07-20'
      }
    ];

    sampleVehicles.forEach(vehicle => this.addVehicle(vehicle));
  }

  private initializeDocumentSampleData(): void {
    const vehicles = this.getVehicles();
    if (vehicles.length === 0) return;

    const sampleDocuments: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'hariTersisa' | 'status'>[] = [
      {
        vehicleId: vehicles[0].id,
        platNomor: vehicles[0].platNomor,
        jenisDokumen: 'STNK',
        nomorDokumen: 'B1234AB2024',
        tanggalTerbit: '2024-01-15',
        tanggalKadaluarsa: '2025-01-15',
        penerbitDokumen: 'Samsat Bandung'
      },
      {
        vehicleId: vehicles[0].id,
        platNomor: vehicles[0].platNomor,
        jenisDokumen: 'KIR',
        nomorDokumen: 'KIR567890',
        tanggalTerbit: '2024-01-20',
        tanggalKadaluarsa: '2024-07-20',
        penerbitDokumen: 'Dishub Bandung'
      }
    ];

    sampleDocuments.forEach(doc => this.addDocument(doc));
  }

  private initializeMaintenanceSampleData(): void {
    const vehicles = this.getVehicles();
    if (vehicles.length === 0) return;

    const sampleMaintenance: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        vehicleId: vehicles[0].id,
        platNomor: vehicles[0].platNomor,
        tanggal: '2024-06-15',
        jenisPerawatan: 'Service Rutin',
        deskripsi: 'Ganti oli mesin dan filter',
        kilometer: 45000,
        biaya: 350000,
        bengkel: 'Bengkel Resmi Mitsubishi',
        teknisi: 'Pak Budi',
        spareParts: [
          { nama: 'Oli Mesin', jumlah: 4, harga: 200000 },
          { nama: 'Filter Oli', jumlah: 1, harga: 50000 }
        ],
        status: 'Selesai',
        nextServiceKm: 50000,
        nextServiceDate: '2024-09-15'
      }
    ];

    sampleMaintenance.forEach(record => this.addMaintenanceRecord(record));
  }

  private initializeCostSampleData(): void {
    const vehicles = this.getVehicles();
    if (vehicles.length === 0) return;

    const sampleCosts: Omit<OperationalCost, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        vehicleId: vehicles[0].id,
        platNomor: vehicles[0].platNomor,
        tanggal: '2024-06-25',
        jenisBiaya: 'Bahan Bakar',
        deskripsi: 'Isi solar di SPBU Shell',
        jumlah: 450000,
        lokasi: 'SPBU Shell Pasteur',
        kategori: 'Operasional'
      },
      {
        vehicleId: vehicles[0].id,
        platNomor: vehicles[0].platNomor,
        tanggal: '2024-06-24',
        jenisBiaya: 'Tol',
        deskripsi: 'Tol Jakarta-Bandung PP',
        jumlah: 85000,
        lokasi: 'Tol Cipularang',
        kategori: 'Operasional'
      }
    ];

    sampleCosts.forEach(cost => this.addOperationalCost(cost));
  }
}

export const localStorageService = new LocalStorageService();
