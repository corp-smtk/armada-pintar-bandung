// Service to load company-specific dummy data on login
import { dummyData } from '@/data/dummyData';
import { localStorageService } from './LocalStorageService';

// Company login mapping
export const companyLogins = {
  // Company A - PT Armada Pintar Bandung
  'companyA': {
    companyId: 'company-1',
    email: 'admin1@armadapintar.com',
    name: 'PT Armada Pintar Bandung',
    vehiclePrefix: 'veh-1-'
  },
  // Company B - CV Transportasi Cerdas  
  'companyB': {
    companyId: 'company-2',
    email: 'admin2@transportasicerdas.com',
    name: 'CV Transportasi Cerdas',
    vehiclePrefix: 'veh-2-'
  },
  // Company C - UD Logistik Maju
  'companyC': {
    companyId: 'company-3',
    email: 'admin3@logistikmaju.com',
    name: 'UD Logistik Maju',
    vehiclePrefix: 'veh-3-'
  }
};

// Alternative email-based mapping
export const emailToCompany: Record<string, keyof typeof companyLogins> = {
  'admin1@armadapintar.com': 'companyA',
  'admin2@transportasicerdas.com': 'companyB', 
  'admin3@logistikmaju.com': 'companyC'
};

/**
 * Load dummy data for a specific company
 * @param companyKey - The company key (companyA, companyB, companyC)
 */
export function loadCompanyDummyData(companyKey: keyof typeof companyLogins): void {
  const company = companyLogins[companyKey];
  if (!company) {
    console.error(`Invalid company key: ${companyKey}`);
    return;
  }

  // Filter vehicles for this company
  const companyVehicles = dummyData.vehicles.filter(v => v.id.startsWith(company.vehiclePrefix));
  const vehicleIds = companyVehicles.map(v => v.id);

  // Filter related data based on vehicle IDs
  const companyDocuments = dummyData.documents.filter(d => vehicleIds.includes(d.vehicleId));
  const companyMaintenance = dummyData.maintenance.filter(m => vehicleIds.includes(m.vehicleId));
  const companyCosts = dummyData.costs.filter(c => vehicleIds.includes(c.vehicleId));
  const companyReminders = dummyData.reminders.filter(r => vehicleIds.includes(r.vehicle));

  // Save to localStorage for this company
  try {
    console.log(`🔧 Starting to save dummy data for ${company.name}...`);
    
    localStorageService.saveVehicles(companyVehicles);
    console.log(`✅ Saved ${companyVehicles.length} vehicles`);
    
    localStorageService.saveDocuments(companyDocuments);
    console.log(`✅ Saved ${companyDocuments.length} documents`);
    
    localStorageService.saveMaintenanceRecords(companyMaintenance);
    console.log(`✅ Saved ${companyMaintenance.length} maintenance records`);
    
    localStorageService.saveOperationalCosts(companyCosts);
    console.log(`✅ Saved ${companyCosts.length} operational costs`);
    
    localStorageService.saveReminderConfigs(companyReminders);
    console.log(`✅ Saved ${companyReminders.length} reminders`);

    console.log(`✅ Successfully loaded all dummy data for ${company.name}:`, {
      vehicles: companyVehicles.length,
      documents: companyDocuments.length,
      maintenance: companyMaintenance.length,
      costs: companyCosts.length,
      reminders: companyReminders.length
    });
    
    // Verify data was saved by reading it back
    const savedVehicles = localStorageService.getVehicles();
    console.log(`🔍 Verification: Found ${savedVehicles.length} vehicles in localStorage`);
    
  } catch (error) {
    console.error(`❌ Error loading dummy data for ${company.name}:`, error);
  }
}

/**
 * Load dummy data by email login
 * @param email - User email
 */
export function loadDummyDataByEmail(email: string): boolean {
  const companyKey = emailToCompany[email];
  if (companyKey) {
    loadCompanyDummyData(companyKey);
    return true;
  }
  return false;
}

/**
 * Load dummy data by username login
 * @param username - Username (companyA, companyB, companyC)
 */
export function loadDummyDataByUsername(username: string): boolean {
  if (username in companyLogins) {
    loadCompanyDummyData(username as keyof typeof companyLogins);
    return true;
  }
  return false;
}

/**
 * Get company info by login
 * @param login - Email or username
 */
export function getCompanyInfo(login: string) {
  // Try email first
  const companyKey = emailToCompany[login] || (login in companyLogins ? login as keyof typeof companyLogins : null);
  
  if (companyKey) {
    return companyLogins[companyKey];
  }
  
  return null;
}

/**
 * Check if login credentials are valid dummy company accounts
 * @param login - Email or username
 */
export function isValidCompanyLogin(login: string): boolean {
  return login in emailToCompany || login in companyLogins;
}

/**
 * Get all available company logins for testing
 */
export function getAvailableCompanyLogins() {
  return Object.entries(companyLogins).map(([key, company]) => ({
    username: key,
    email: company.email,
    name: company.name
  }));
} 