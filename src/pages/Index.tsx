
import { useState, useEffect } from 'react';
import { 
  Truck, 
  FileText, 
  Wrench, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  Plus,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import VehicleManagement from '@/components/VehicleManagement';
import DocumentManagement from '@/components/DocumentManagement';
import MaintenanceManagement from '@/components/MaintenanceManagement';
import CostReporting from '@/components/CostReporting';
import ReminderManagement from '@/components/ReminderManagement';
import { localStorageService, Vehicle, Document, MaintenanceRecord, OperationalCost } from '@/services/LocalStorageService';
import { loadDummyDataByEmail, loadDummyDataByUsername, isValidCompanyLogin } from '@/services/DummyDataLoader';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/components/Login';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [operationalCosts, setOperationalCosts] = useState<OperationalCost[]>([]);
  const [sessionUser, setSessionUser] = useState<string | null>(localStorage.getItem('session_user'));

  useEffect(() => {
    if (sessionUser) {
      loadDashboardData();
    }
  }, [activeModule, sessionUser]);

  const handleLogin = (username: string) => {
    // Set session user FIRST so LocalStorageService can use proper prefix
    localStorage.setItem('session_user', username);
    setSessionUser(username);
    
    // Check if user already has existing data
    const existingVehicles = localStorageService.getVehicles();
    
    if (existingVehicles.length > 0) {
      console.log(`👤 Welcome back! Loading existing data for: ${username} (${existingVehicles.length} vehicles found)`);
      toast({
        title: "Selamat datang kembali!",
        description: `Data Anda telah dimuat (${existingVehicles.length} kendaraan ditemukan)`,
      });
      // User has existing data, just load it
      setTimeout(() => {
        loadDashboardData();
      }, 100);
    } else if (isValidCompanyLogin(username)) {
      // New user - load dummy data for first-time login
      console.log(`🆕 First-time login detected for: ${username}. Loading demo data...`);
      const loaded = loadDummyDataByUsername(username) || loadDummyDataByEmail(username);
      
      if (loaded) {
        console.log(`🎯 Pre-filled dummy data loaded for: ${username}`);
        toast({
          title: "Data demo telah dimuat!",
          description: "Akun baru Anda telah diisi dengan data demo untuk memulai",
        });
        // Force reload dashboard data after loading dummy data
        setTimeout(() => {
          loadDashboardData();
        }, 100);
      }
    } else {
      // Regular user without demo data
      setTimeout(() => {
        loadDashboardData();
      }, 100);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('session_user');
    setSessionUser(null);
  };

  const resetToDummyData = () => {
    if (!sessionUser) return;
    
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin menghapus semua data dan kembali ke data demo?\n\n' +
      'Tindakan ini akan menghapus:\n' +
      '• Semua kendaraan yang telah ditambahkan/diubah\n' +
      '• Semua dokumen yang telah ditambahkan/diubah\n' +
      '• Semua catatan perawatan\n' +
      '• Semua data biaya operasional\n' +
      '• Semua pengaturan reminder\n\n' +
      'Data yang dihapus tidak dapat dikembalikan!'
    );
    
    if (confirmed) {
      console.log(`🔄 Resetting to dummy data for: ${sessionUser}`);
      
      // Clear existing data
      localStorageService.clearAllData();
      
      // Load fresh dummy data if this is a valid company login
      if (isValidCompanyLogin(sessionUser)) {
        const loaded = loadDummyDataByUsername(sessionUser) || loadDummyDataByEmail(sessionUser);
        if (loaded) {
          console.log(`✅ Dummy data reset completed for: ${sessionUser}`);
          toast({
            title: "Reset berhasil!",
            description: "Data Anda telah direset ke data demo awal",
          });
          // Reload dashboard
          setTimeout(() => {
            loadDashboardData();
          }, 100);
        }
      }
    }
  };

  if (!sessionUser) {
    return <Login onLogin={handleLogin} />;
  }

  const loadDashboardData = () => {
    console.log(`📊 Loading dashboard data for user: ${sessionUser}`);
    console.log(`🔍 Current localStorage keys:`, Object.keys(localStorage));
    
    // Load data from local storage
    const loadedVehicles = localStorageService.getVehicles();
    const loadedDocuments = localStorageService.getDocuments();
    const loadedMaintenance = localStorageService.getMaintenanceRecords();
    const loadedCosts = localStorageService.getOperationalCosts();

    console.log(`📊 Dashboard data loaded:`, {
      vehicles: loadedVehicles.length,
      documents: loadedDocuments.length,
      maintenance: loadedMaintenance.length,
      costs: loadedCosts.length
    });

    // Debug: Check current date and sample data
    const today = new Date();
    console.log(`📅 Current date: ${today.toISOString().split('T')[0]}`);
    
    if (loadedVehicles.length > 0) {
      console.log(`🚗 Sample vehicle service dates:`, loadedVehicles.slice(0, 3).map(v => ({
        plat: v.platNomor,
        servisBerikutnya: v.servisBerikutnya,
        daysUntil: v.servisBerikutnya ? Math.ceil((new Date(v.servisBerikutnya).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 'No date'
      })));
    }

    if (loadedDocuments.length > 0) {
      console.log(`📄 Sample document expiry:`, loadedDocuments.slice(0, 3).map(d => ({
        dokumen: d.jenisDokumen,
        platNomor: d.platNomor,
        hariTersisa: d.hariTersisa,
        tanggalKadaluarsa: d.tanggalKadaluarsa
      })));
    }

    if (loadedCosts.length > 0) {
      console.log(`💰 Sample costs:`, loadedCosts.slice(0, 3).map(c => ({
        tanggal: c.tanggal,
        jumlah: c.jumlah,
        bulan: new Date(c.tanggal).getMonth(),
        currentMonth: today.getMonth()
      })));
    }

    // Update document statuses based on current date
    const updatedDocuments = loadedDocuments.map(doc => {
      const hariTersisa = calculateDaysRemaining(doc.tanggalKadaluarsa);
      const status = calculateDocumentStatus(hariTersisa);
      if (doc.hariTersisa !== hariTersisa || doc.status !== status) {
        localStorageService.updateDocument(doc.id, { hariTersisa, status });
        return { ...doc, hariTersisa, status };
      }
      return doc;
    });

    setVehicles(loadedVehicles);
    setDocuments(updatedDocuments);
    setMaintenanceRecords(loadedMaintenance);
    setOperationalCosts(loadedCosts);
  };

  const calculateDaysRemaining = (expiryDate: string): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateDocumentStatus = (daysRemaining: number): 'Valid' | 'Akan Kadaluarsa' | 'Kritis' | 'Kadaluarsa' => {
    if (daysRemaining < 0) return 'Kadaluarsa';
    if (daysRemaining <= 14) return 'Kritis';
    if (daysRemaining <= 30) return 'Akan Kadaluarsa';
    return 'Valid';
  };

  // Calculate dashboard statistics from real data
  const dashboardStats = {
    activeVehicles: vehicles.filter(v => v.status === 'Aktif').length,
    inactiveVehicles: vehicles.filter(v => v.status !== 'Aktif').length,
    nearingService: vehicles.filter(v => {
      // Check both vehicle.servisBerikutnya AND scheduled maintenance records
      let hasUpcomingService = false;
      
      // Check vehicle.servisBerikutnya
      if (v.servisBerikutnya) {
        const nextServiceDate = new Date(v.servisBerikutnya);
        const today = new Date();
        const daysUntilService = Math.ceil((nextServiceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilService <= 30 && daysUntilService >= 0) {
          hasUpcomingService = true;
        }
      }
      
      // Also check scheduled maintenance records
      if (!hasUpcomingService) {
        const scheduledMaintenance = maintenanceRecords.find(m => 
          m.vehicleId === v.id && 
          m.status === 'Dijadwalkan' && 
          m.nextServiceDate
        );
        
        if (scheduledMaintenance && scheduledMaintenance.nextServiceDate) {
          const nextServiceDate = new Date(scheduledMaintenance.nextServiceDate);
          const today = new Date();
          const daysUntilService = Math.ceil((nextServiceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilService <= 30 && daysUntilService >= 0) {
            hasUpcomingService = true;
          }
        }
      }
      
      if (hasUpcomingService) {
        console.log(`🚗 Vehicle ${v.platNomor}: has upcoming service within 30 days`);
      }
      
      return hasUpcomingService;
    }).length,
    expiringDocuments: documents.filter(doc => {
      const isExpiring = doc.hariTersisa <= 30 && doc.hariTersisa > 0;
      console.log(`📄 Document ${doc.jenisDokumen} for ${doc.platNomor}: ${doc.hariTersisa} days remaining, expiring: ${isExpiring}`);
      return isExpiring;
    }).length,
    monthlyOperationalCost: operationalCosts
      .filter(cost => {
        const costDate = new Date(cost.tanggal);
        const now = new Date();
        return costDate.getMonth() === now.getMonth() && costDate.getFullYear() === now.getFullYear();
      })
      .reduce((total, cost) => total + cost.jumlah, 0)
  };

  console.log(`📊 Dashboard stats calculated:`, dashboardStats);

  // Get vehicles nearing service from real data
  const nearingServiceVehicles = vehicles
    .filter(v => {
      // Check both vehicle.servisBerikutnya AND scheduled maintenance records
      let hasUpcomingService = false;
      let daysUntilService = 0;
      
      // Check vehicle.servisBerikutnya
      if (v.servisBerikutnya) {
        const nextServiceDate = new Date(v.servisBerikutnya);
        const today = new Date();
        daysUntilService = Math.ceil((nextServiceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilService <= 30 && daysUntilService >= 0) {
          hasUpcomingService = true;
        }
      }
      
      // Also check scheduled maintenance records
      if (!hasUpcomingService) {
        const scheduledMaintenance = maintenanceRecords.find(m => 
          m.vehicleId === v.id && 
          m.status === 'Dijadwalkan' && 
          m.nextServiceDate
        );
        
        if (scheduledMaintenance && scheduledMaintenance.nextServiceDate) {
          const nextServiceDate = new Date(scheduledMaintenance.nextServiceDate);
          const today = new Date();
          daysUntilService = Math.ceil((nextServiceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilService <= 30 && daysUntilService >= 0) {
            hasUpcomingService = true;
          }
        }
      }
      
      return hasUpcomingService;
    })
    .map(v => {
      // Get latest maintenance record for this vehicle
      const latestMaintenance = maintenanceRecords
        .filter(m => m.vehicleId === v.id)
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0];

      // Get scheduled maintenance for this vehicle
      const scheduledMaintenance = maintenanceRecords.find(m => 
        m.vehicleId === v.id && 
        m.status === 'Dijadwalkan' && 
        m.nextServiceDate
      );

      // Determine the actual next service date and days until service
      let nextServiceDate = v.servisBerikutnya || '';
      let daysUntilService = 0;
      
      if (v.servisBerikutnya) {
        const serviceDate = new Date(v.servisBerikutnya);
        const today = new Date();
        const vehicleDays = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (vehicleDays <= 30 && vehicleDays >= 0) {
          daysUntilService = vehicleDays;
        }
      }
      
      if (scheduledMaintenance && scheduledMaintenance.nextServiceDate) {
        const serviceDate = new Date(scheduledMaintenance.nextServiceDate);
        const today = new Date();
        const scheduledDays = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Use scheduled maintenance if it's sooner or if vehicle service date is in the past
        if (scheduledDays <= 30 && scheduledDays >= 0 && (scheduledDays < daysUntilService || daysUntilService <= 0)) {
          nextServiceDate = scheduledMaintenance.nextServiceDate;
          daysUntilService = scheduledDays;
        }
      }

      return {
        platNomor: v.platNomor,
        jenisKendaraan: v.jenisKendaraan,
        servisTerakhir: latestMaintenance?.tanggal || 'Belum ada data',
        kmTerakhir: latestMaintenance?.kilometer || 0,
        servisBerikutnya: nextServiceDate,
        daysUntilService: daysUntilService
      };
    })
    .slice(0, 5); // Show only first 5

  // Get expiring documents from real data
  const expiringDocuments = documents
    .filter(doc => doc.hariTersisa <= 30 && doc.hariTersisa > 0)
    .sort((a, b) => a.hariTersisa - b.hariTersisa)
    .slice(0, 5) // Show only first 5
    .map(doc => ({
      dokumen: doc.jenisDokumen,
      platNomor: doc.platNomor,
      tanggalKadaluarsa: doc.tanggalKadaluarsa,
      hariTersisa: doc.hariTersisa
    }));

  const renderDashboard = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
      {/* Welcome Header - Enhanced responsive padding and text sizes */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sm:p-5 md:p-6 rounded-lg shadow-lg">
        <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-2">Sistem Manajemen Armada LPG</h1>
        <p className="text-sm sm:text-base md:text-base text-blue-100 opacity-90">Selamat datang di dashboard manajemen armada Anda</p>
      </div>

      {/* Key Metrics Cards - Enhanced responsive grid with better tablet support */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm md:text-sm font-medium text-gray-600">Kendaraan Aktif</CardTitle>
            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-green-600">{dashboardStats.activeVehicles}</div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">dari {dashboardStats.activeVehicles + dashboardStats.inactiveVehicles} total kendaraan</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm md:text-sm font-medium text-gray-600">Perlu Servis</CardTitle>
            <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-orange-600">{dashboardStats.nearingService}</div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">kendaraan mendekati jadwal servis</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm md:text-sm font-medium text-gray-600">Dokumen Kadaluarsa</CardTitle>
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-red-600">{dashboardStats.expiringDocuments}</div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">dokumen mendekati kadaluarsa</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 sm:col-span-2 md:col-span-2 xl:col-span-1 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm md:text-sm font-medium text-gray-600">Biaya Operasional</CardTitle>
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600">
              Rp {dashboardStats.monthlyOperationalCost.toLocaleString('id-ID')}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Enhanced responsive button layout with touch-friendly sizing */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-xl">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Aksi Cepat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            <Button 
              onClick={() => setActiveModule('vehicles')} 
              className="min-h-[44px] flex items-center justify-center gap-2 text-xs sm:text-sm md:text-sm p-3 sm:p-4"
            >
              <Truck className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Tambah Kendaraan</span>
            </Button>
            <Button 
              onClick={() => setActiveModule('maintenance')} 
              variant="outline" 
              className="min-h-[44px] flex items-center justify-center gap-2 text-xs sm:text-sm md:text-sm p-3 sm:p-4"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Jadwalkan Perawatan</span>
            </Button>
            <Button 
              onClick={() => setActiveModule('documents')} 
              variant="outline" 
              className="min-h-[44px] flex items-center justify-center gap-2 text-xs sm:text-sm md:text-sm p-3 sm:p-4"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Upload Dokumen</span>
            </Button>
            <Button 
              onClick={() => setActiveModule('costs')} 
              variant="outline" 
              className="min-h-[44px] flex items-center justify-center gap-2 text-xs sm:text-sm md:text-sm p-3 sm:p-4"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Catat Biaya</span>
            </Button>
            <Button 
              onClick={() => { console.log('🔄 Force reloading data...'); loadDashboardData(); }} 
              variant="secondary" 
              className="min-h-[44px] flex items-center justify-center gap-2 text-xs sm:text-sm md:text-sm bg-yellow-100 hover:bg-yellow-200 p-3 sm:p-4 sm:col-span-2 md:col-span-3 lg:col-span-1"
            >
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Force Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section - Enhanced responsive grid with better mobile layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Vehicles Nearing Service */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-orange-600 text-base sm:text-lg md:text-lg">
              <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
              Kendaraan Mendekati Servis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {nearingServiceVehicles.length > 0 ? nearingServiceVehicles.map((vehicle, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-orange-50 rounded-lg gap-2 sm:gap-3 border border-orange-100">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm sm:text-base md:text-base truncate text-gray-900">{vehicle.platNomor}</div>
                    <div className="text-xs sm:text-sm md:text-sm text-gray-600 mt-0.5">
                      {vehicle.jenisKendaraan} • KM: {vehicle.kmTerakhir.toLocaleString('id-ID')}
                    </div>
                    <div className="text-xs sm:text-xs text-gray-500 mt-0.5">
                      Terakhir servis: {vehicle.servisTerakhir}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs sm:text-sm shrink-0 whitespace-nowrap">
                    {vehicle.daysUntilService} hari lagi
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Wrench className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm sm:text-base">Tidak ada kendaraan yang mendekati jadwal servis</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents Nearing Expiry */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-red-600 text-base sm:text-lg md:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              Dokumen Mendekati Kadaluarsa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {expiringDocuments.length > 0 ? expiringDocuments.map((doc, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-red-50 rounded-lg gap-2 sm:gap-3 border border-red-100">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm sm:text-base md:text-base truncate text-gray-900">{doc.dokumen}</div>
                    <div className="text-xs sm:text-sm md:text-sm text-gray-600 truncate mt-0.5">{doc.platNomor}</div>
                    <div className="text-xs sm:text-xs text-gray-500 mt-0.5">
                      Kadaluarsa: {doc.tanggalKadaluarsa}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs sm:text-sm shrink-0 whitespace-nowrap ${
                      doc.hariTersisa <= 14 
                        ? 'text-red-600 border-red-600' 
                        : 'text-orange-600 border-orange-600'
                    }`}
                  >
                    {doc.hariTersisa} hari lagi
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm sm:text-base">Tidak ada dokumen yang mendekati kadaluarsa</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const handleModuleNavigation = (module: string, params?: any) => {
    setActiveModule(module);
    // Could use params for future deep linking or specific actions
    console.log('Navigating to module:', module, 'with params:', params);
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'vehicles':
        return <VehicleManagement onNavigate={handleModuleNavigation} />;
      case 'documents':
        return <DocumentManagement />;
      case 'maintenance':
        return <MaintenanceManagement />;
      case 'costs':
        return <CostReporting />;
      case 'reminders':
        return <ReminderManagement />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        onLogout={handleLogout}
        onResetData={resetToDummyData}
        showResetButton={isValidCompanyLogin(sessionUser)}
      />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-4 sm:py-5 md:py-6 lg:py-8">
        {renderActiveModule()}
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
