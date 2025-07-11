import { useState, useEffect, useMemo } from 'react';
import { 
  Car, 
  Fuel, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  Camera,
  FileText,
  Wrench,
  DollarSign,
  BarChart3,
  Filter,
  Download,
  PieChart,
  Upload,
  Edit,
  Trash2,
  Eye,
  X,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import VehicleHealthIndicator from './VehicleHealthIndicator';
import ServiceLogbook from './ServiceLogbook';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, MaintenanceRecord, OperationalCost, Document, VehiclePhoto } from '@/services/LocalStorageService';
import PhotoUploadForm from './PhotoUploadForm';
import PhotoViewerModal from './PhotoViewerModal';
import PhotoEditModal from './PhotoEditModal';

interface VehicleDetailDashboardProps {
  vehicle: {
    id: string;
    platNomor: string;
    jenisKendaraan: string;
    merek: string;
    model: string;
    tahunPembuatan: number;
    status: string;
    lokasiPool: string;
  };
  onNavigate?: (module: string, params?: any) => void; // Add navigation callback
}

const VehicleDetailDashboard = ({ vehicle, onNavigate }: VehicleDetailDashboardProps) => {
  const { toast } = useToast();
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [operationalCosts, setOperationalCosts] = useState<OperationalCost[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Activity filters state
  const [activityTimeFilter, setActivityTimeFilter] = useState('30'); // days
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');

  // Photo management state
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<VehiclePhoto | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<VehiclePhoto | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Load real data from localStorage
  useEffect(() => {
    loadVehicleData();
  }, [vehicle.id]);

  const loadVehicleData = () => {
    setLoading(true);
    try {
      const vehicleId = vehicle.id; // No need to convert to string
      console.log('Loading data for vehicle ID:', vehicleId); // Debug log
      
      const maintenance = localStorageService.getMaintenanceByVehicle(vehicleId);
      const costs = localStorageService.getCostsByVehicle(vehicleId);
      const docs = localStorageService.getDocumentsByVehicle(vehicleId);
      const vehiclePhotos = localStorageService.getVehiclePhotos(vehicleId);
      
      console.log('Loaded data:', { 
        maintenance: maintenance.length, 
        costs: costs.length, 
        docs: docs.length,
        photos: vehiclePhotos.length 
      }); // Debug log
      
      setMaintenanceRecords(maintenance);
      setOperationalCosts(costs);
      setDocuments(docs);
      setPhotos(vehiclePhotos);
    } catch (error) {
      console.error('Error loading vehicle data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh data when new records are added
  const refreshVehicleData = () => {
    loadVehicleData();
  };

  // Handle scheduling service navigation
  const handleScheduleService = () => {
    if (onNavigate) {
      onNavigate('maintenance', { 
        action: 'schedule',
        vehicleId: vehicle.id,
        platNomor: vehicle.platNomor 
      });
      toast({
        title: "Navigasi",
        description: `Menuju halaman jadwal perawatan untuk ${vehicle.platNomor}`,
      });
    } else {
      toast({
        title: "Jadwalkan Servis",
        description: `Gunakan menu Perawatan untuk menjadwalkan servis ${vehicle.platNomor}`,
      });
    }
  };

  // Photo management functions
  const handlePhotoUpload = async (file: File, category: string, title?: string, description?: string) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "File harus berupa gambar (JPG, PNG, dll.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "Ukuran file terlalu besar. Maksimal 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const base64Data = await convertFileToBase64(file);
      
      const photoData: Omit<VehiclePhoto, 'id' | 'createdAt' | 'updatedAt'> = {
        vehicleId: vehicle.id,
        category: category as VehiclePhoto['category'],
        fileName: file.name,
        fileType: file.type,
        fileData: base64Data,
        title: title || `${category} - ${vehicle.platNomor}`,
        description: description || '',
        uploadDate: new Date().toISOString()
      };

      localStorageService.addVehiclePhoto(vehicle.id, photoData);
      refreshVehicleData();
      
      toast({
        title: "Berhasil",
        description: "Foto berhasil diupload"
      });
      
      setShowPhotoUpload(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengupload foto",
        variant: "destructive"
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini?')) return;

    try {
      localStorageService.deleteVehiclePhoto(vehicle.id, photoId);
      refreshVehicleData();
      
      toast({
        title: "Berhasil",
        description: "Foto berhasil dihapus"
      });
      
      setShowPhotoViewer(false);
      setSelectedPhoto(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus foto",
        variant: "destructive"
      });
    }
  };

  const handlePhotoEdit = (photo: VehiclePhoto, newTitle: string, newDescription: string) => {
    try {
      localStorageService.updateVehiclePhoto(vehicle.id, photo.id, {
        title: newTitle,
        description: newDescription
      });
      refreshVehicleData();
      
      toast({
        title: "Berhasil",
        description: "Info foto berhasil diperbarui"
      });
      
      setEditingPhoto(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui foto",
        variant: "destructive"
      });
    }
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Get category display name and icon
  const getCategoryInfo = (category: string) => {
    const categoryMap = {
      front: { name: 'Foto Depan', icon: '🚗', color: 'bg-blue-100 text-blue-800' },
      side: { name: 'Foto Samping', icon: '↔️', color: 'bg-green-100 text-green-800' },
      rear: { name: 'Foto Belakang', icon: '🔄', color: 'bg-yellow-100 text-yellow-800' },
      interior: { name: 'Interior', icon: '🪑', color: 'bg-purple-100 text-purple-800' },
      document: { name: 'Dokumen', icon: '📄', color: 'bg-indigo-100 text-indigo-800' },
      damage: { name: 'Kerusakan', icon: '⚠️', color: 'bg-red-100 text-red-800' },
      other: { name: 'Lainnya', icon: '📷', color: 'bg-gray-100 text-gray-800' }
    };
    return categoryMap[category as keyof typeof categoryMap] || categoryMap.other;
  };

  // Calculate real vehicle details from actual data
  const vehicleDetails = useMemo(() => {
    // Get latest KM from maintenance records
    const kmTerakhir = maintenanceRecords.length > 0 
      ? Math.max(...maintenanceRecords.map(m => m.kilometer))
      : 0;

    // Calculate total costs for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyMaintenanceCosts = maintenanceRecords
      .filter(m => {
        const recordDate = new Date(m.tanggal);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      })
      .reduce((sum, m) => sum + m.biaya, 0);

    const monthlyOperationalCosts = operationalCosts
      .filter(c => {
        const costDate = new Date(c.tanggal);
        return costDate.getMonth() === currentMonth && costDate.getFullYear() === currentYear;
      })
      .reduce((sum, c) => sum + c.jumlah, 0);

    const totalBiayaBulanIni = monthlyMaintenanceCosts + monthlyOperationalCosts;

    // Calculate fuel consumption (estimate from operational costs)
    const fuelCosts = operationalCosts.filter(c => 
      c.jenisBiaya.toLowerCase().includes('bbm') || 
      c.jenisBiaya.toLowerCase().includes('bensin') ||
      c.jenisBiaya.toLowerCase().includes('solar')
    );
    const avgFuelConsumption = fuelCosts.length > 0 ? 12.5 : 0; // Default estimate

    // Get last service date
    const lastServiceDate = maintenanceRecords.length > 0 
      ? maintenanceRecords
          .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0]
          .tanggal
      : null;

    // Calculate next service KM (5000 km interval)
    const nextServiceKm = kmTerakhir > 0 ? kmTerakhir + 5000 : 5000;

    // Calculate utilization rate based on service frequency
    const serviceInterval = maintenanceRecords.length > 1 
      ? (kmTerakhir - maintenanceRecords[maintenanceRecords.length - 1].kilometer) / (maintenanceRecords.length - 1)
      : 0;
    const recommendedInterval = 5000;
    const utilizationRate = serviceInterval > 0 ? Math.min((serviceInterval / recommendedInterval) * 100, 100) : 75;

    return {
      ...vehicle,
      kmTerakhir,
      fuelConsumption: avgFuelConsumption,
      lastServiceDate,
      nextServiceKm,
      totalBiayaBulanIni,
      utilizationRate: Math.round(utilizationRate),
      driverUtama: 'Belum Ditentukan', // Could be extended to store driver info
      driverBackup: 'Belum Ditentukan',
      lastLocation: vehicle.lokasiPool,
      totalPerbaikan: maintenanceRecords.length,
      statusOperasional: vehicle.status === 'Aktif' ? 'Aktif - Standby' : vehicle.status
    };
  }, [vehicle, maintenanceRecords, operationalCosts]);

  // Generate filtered activities with comprehensive data
  const activityData = useMemo(() => {
    const allActivities: Array<{
      id: string;
      type: 'maintenance' | 'cost';
      description: string;
      date: string;
      cost: number;
      category?: string;
      details?: any;
    }> = [];

    // Add maintenance activities with detailed info
    maintenanceRecords.forEach(record => {
      allActivities.push({
        id: record.id,
        type: 'maintenance',
        description: `${record.jenisPerawatan} - ${record.deskripsi}`,
        date: record.tanggal,
        cost: record.biaya,
        category: record.jenisPerawatan,
        details: record
      });
    });

    // Add operational cost activities with detailed info
    operationalCosts.forEach(cost => {
      allActivities.push({
        id: cost.id,
        type: 'cost',
        description: `${cost.jenisBiaya} - ${cost.deskripsi}`,
        date: cost.tanggal,
        cost: cost.jumlah,
        category: cost.jenisBiaya,
        details: cost
      });
    });

    // Sort by date (newest first)
    const sortedActivities = allActivities.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Apply time filter
    const timeFilterDays = parseInt(activityTimeFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeFilterDays);
    
    const filteredByTime = timeFilterDays === 0 ? sortedActivities : 
      sortedActivities.filter(activity => new Date(activity.date) >= cutoffDate);

    // Apply type filter
    const filteredActivities = activityTypeFilter === 'all' ? filteredByTime :
      filteredByTime.filter(activity => activity.type === activityTypeFilter);

    // Calculate summary statistics
    const totalCost = filteredActivities.reduce((sum, activity) => sum + activity.cost, 0);
    const maintenanceActivities = filteredActivities.filter(a => a.type === 'maintenance');
    const costActivities = filteredActivities.filter(a => a.type === 'cost');
    
    const maintenanceCost = maintenanceActivities.reduce((sum, a) => sum + a.cost, 0);
    const operationalCostTotal = costActivities.reduce((sum, a) => sum + a.cost, 0);

    // Group by category for breakdown
    const categoryBreakdown = filteredActivities.reduce((acc, activity) => {
      const category = activity.category || 'Lainnya';
      if (!acc[category]) {
        acc[category] = { count: 0, totalCost: 0 };
      }
      acc[category].count++;
      acc[category].totalCost += activity.cost;
      return acc;
    }, {} as Record<string, { count: number; totalCost: number }>);

    // Monthly trend calculation
    const monthlyTrend = filteredActivities.reduce((acc, activity) => {
      const month = new Date(activity.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { maintenance: 0, operational: 0, total: 0 };
      }
      if (activity.type === 'maintenance') {
        acc[month].maintenance += activity.cost;
      } else {
        acc[month].operational += activity.cost;
      }
      acc[month].total += activity.cost;
      return acc;
    }, {} as Record<string, { maintenance: number; operational: number; total: number }>);

    return {
      activities: filteredActivities,
      recentActivities: filteredActivities.slice(0, 10), // For display
      summary: {
        totalActivities: filteredActivities.length,
        totalCost,
        maintenanceCount: maintenanceActivities.length,
        operationalCount: costActivities.length,
        maintenanceCost,
        operationalCostTotal,
        averageCost: filteredActivities.length > 0 ? totalCost / filteredActivities.length : 0,
        timeFrameDays: timeFilterDays
      },
      categoryBreakdown,
      monthlyTrend
    };
  }, [maintenanceRecords, operationalCosts, activityTimeFilter, activityTypeFilter]);

  // Calculate utilization data for the last 6 months
  const utilizationData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentMonth = new Date().getMonth();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      
      // Calculate utilization based on maintenance frequency in that month
      const monthMaintenanceCount = maintenanceRecords.filter(m => {
        const recordDate = new Date(m.tanggal);
        return recordDate.getMonth() === monthIndex;
      }).length;
      
      // Basic utilization calculation (more maintenance = higher utilization)
      const utilizasi = Math.min(50 + (monthMaintenanceCount * 15), 100);
      
      data.push({ bulan: monthName, utilizasi });
    }

    return data;
  }, [maintenanceRecords]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Wrench className="h-4 w-4 text-blue-600" />;
      case 'cost': return <DollarSign className="h-4 w-4 text-green-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Memuat data kendaraan...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{vehicle.platNomor}</h2>
          <p className="text-gray-600">{vehicle.merek} {vehicle.model} ({vehicle.tahunPembuatan})</p>
        </div>
        <VehicleHealthIndicator
          vehicleId={vehicle.id}
          kmTempuh={vehicleDetails.kmTerakhir}
          tahunPembuatan={vehicle.tahunPembuatan}
          lastServiceDays={vehicleDetails.lastServiceDate ? 
            Math.floor((new Date().getTime() - new Date(vehicleDetails.lastServiceDate).getTime()) / (1000 * 60 * 60 * 24)) : 
            999
          }
          totalPerbaikan={vehicleDetails.totalPerbaikan}
        />
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">KM Terakhir</p>
                <p className="text-2xl font-bold">{vehicleDetails.kmTerakhir.toLocaleString('id-ID')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            {vehicleDetails.kmTerakhir > 0 && (
              <div className="mt-4">
                <Progress value={(vehicleDetails.kmTerakhir / vehicleDetails.nextServiceKm) * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {vehicleDetails.nextServiceKm - vehicleDetails.kmTerakhir} KM hingga servis
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Konsumsi BBM</p>
                <p className="text-2xl font-bold">{vehicleDetails.fuelConsumption}</p>
                <p className="text-xs text-gray-500">km/liter</p>
              </div>
              <Fuel className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisasi</p>
                <p className="text-2xl font-bold">{vehicleDetails.utilizationRate}%</p>
                <p className="text-xs text-gray-500">rata-rata</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Biaya Bulan Ini</p>
                <p className="text-2xl font-bold">Rp {vehicleDetails.totalBiayaBulanIni.toLocaleString('id-ID')}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status & Location Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Status Operasional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status Saat Ini:</span>
              <Badge className={vehicleDetails.statusOperasional.includes('Aktif') ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {vehicleDetails.statusOperasional}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Driver Utama:</span>
              <span className="text-sm font-medium">{vehicleDetails.driverUtama}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Driver Backup:</span>
              <span className="text-sm font-medium">{vehicleDetails.driverBackup}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lokasi Pool:</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {vehicleDetails.lastLocation}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Jadwal & Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Servis Terakhir:</span>
              <span className="text-sm font-medium">
                {vehicleDetails.lastServiceDate ? 
                  new Date(vehicleDetails.lastServiceDate).toLocaleDateString('id-ID') : 
                  'Belum ada data'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">KM Servis Berikutnya:</span>
              <span className="text-sm font-medium">{vehicleDetails.nextServiceKm.toLocaleString('id-ID')} KM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Service:</span>
              <span className="text-sm font-medium">{vehicleDetails.totalPerbaikan} kali</span>
            </div>
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleScheduleService}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Jadwalkan Servis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed information */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="activities" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activities">Aktivitas Terkini</TabsTrigger>
              <TabsTrigger value="logbook">Service Logbook</TabsTrigger>
              <TabsTrigger value="photos">Foto Kendaraan</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="activities" className="mt-0">
                <div className="space-y-6">
                  {/* Header with Filters */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Aktivitas Terkini</h3>
                    <div className="flex items-center gap-2">
                      <Select value={activityTimeFilter} onValueChange={setActivityTimeFilter}>
                        <SelectTrigger className="w-[140px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 Hari Terakhir</SelectItem>
                          <SelectItem value="30">30 Hari Terakhir</SelectItem>
                          <SelectItem value="90">3 Bulan Terakhir</SelectItem>
                          <SelectItem value="365">1 Tahun Terakhir</SelectItem>
                          <SelectItem value="0">Semua Waktu</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="cost">Operasional</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Summary Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Aktivitas</p>
                            <p className="text-2xl font-bold">{activityData.summary.totalActivities}</p>
                          </div>
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Biaya</p>
                            <p className="text-xl font-bold">Rp {activityData.summary.totalCost.toLocaleString('id-ID')}</p>
                          </div>
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Maintenance</p>
                            <p className="text-xl font-bold">{activityData.summary.maintenanceCount}x</p>
                            <p className="text-xs text-gray-500">Rp {activityData.summary.maintenanceCost.toLocaleString('id-ID')}</p>
                          </div>
                          <Wrench className="h-6 w-6 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Rata-rata/Aktivitas</p>
                            <p className="text-lg font-bold">Rp {activityData.summary.averageCost.toLocaleString('id-ID')}</p>
                          </div>
                          <BarChart3 className="h-6 w-6 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Category Breakdown */}
                  {Object.keys(activityData.categoryBreakdown).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Breakdown by Category
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(activityData.categoryBreakdown).map(([category, data]) => (
                            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{category}</p>
                                <p className="text-xs text-gray-500">{data.count} aktivitas</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">Rp {(data.totalCost ?? 0).toLocaleString('id-ID')}</p>
                                <p className="text-xs text-gray-500">
                                  {activityData.summary.totalCost > 0 ? 
                                    Math.round((data.totalCost / activityData.summary.totalCost) * 100) : 0}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Activity List */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Daftar Aktivitas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activityData.recentActivities.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Tidak ada aktivitas dalam periode ini</p>
                          <p className="text-sm">Coba ubah filter waktu atau tipe aktivitas</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activityData.recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              {getActivityIcon(activity.type)}
                              <div className="flex-1">
                                <p className="font-medium text-sm">{activity.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString('id-ID')}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {activity.category}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">
                                  Rp {(activity.cost ?? 0).toLocaleString('id-ID')}
                                </p>
                                <Badge variant={activity.type === 'maintenance' ? 'destructive' : 'secondary'} className="text-xs">
                                  {activity.type === 'maintenance' ? 'Maintenance' : 'Operasional'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="logbook" className="mt-0">
                <ServiceLogbook vehicleId={vehicle.id.toString()} refreshVehicleData={refreshVehicleData} />
              </TabsContent>

              <TabsContent value="photos" className="mt-0">
                <div className="space-y-6">
                  {/* Header with Upload Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Foto Kendaraan</h3>
                      <p className="text-sm text-gray-600">Kelola galeri foto untuk {vehicle.platNomor}</p>
                    </div>
                    <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Foto
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Upload Foto Kendaraan</DialogTitle>
                        </DialogHeader>
                        <PhotoUploadForm
                          onUpload={handlePhotoUpload}
                          uploading={uploadingPhoto}
                          onCancel={() => setShowPhotoUpload(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Photo Statistics */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {(['front', 'side', 'rear', 'interior'] as const).map(category => {
                        const categoryPhotos = photos.filter(p => p.category === category);
                        const categoryInfo = getCategoryInfo(category);
                        return (
                          <Card key={category}>
                            <CardContent className="pt-4 pb-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">{categoryInfo.name}</p>
                                  <p className="text-lg font-bold">{categoryPhotos.length}</p>
                                </div>
                                <span className="text-lg">{categoryInfo.icon}</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {/* Photo Grid */}
                  {photos.length === 0 ? (
                    <Card>
                      <CardContent className="pt-8 pb-8">
                        <div className="text-center text-gray-500">
                          <Camera className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <h4 className="text-lg font-medium mb-2">Belum Ada Foto</h4>
                          <p className="text-sm mb-4">Upload foto pertama untuk kendaraan {vehicle.platNomor}</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowPhotoUpload(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Upload Foto Pertama
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {photos.map((photo) => {
                        const categoryInfo = getCategoryInfo(photo.category);
                        return (
                          <Card key={photo.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                            <CardContent className="p-0">
                              <div className="relative">
                                <img
                                  src={photo.fileData}
                                  alt={photo.title || photo.fileName}
                                  className="w-full h-48 object-cover"
                                  onClick={() => {
                                    setSelectedPhoto(photo);
                                    setShowPhotoViewer(true);
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPhoto(photo);
                                        setShowPhotoViewer(true);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingPhoto(photo);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePhotoDelete(photo.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="absolute top-2 left-2">
                                  <Badge className={categoryInfo.color}>
                                    {categoryInfo.name}
                                  </Badge>
                                </div>
                              </div>
                              <div className="p-3">
                                <h4 className="font-medium text-sm truncate">{photo.title || photo.fileName}</h4>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {photo.description || 'Tidak ada deskripsi'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(photo.uploadDate).toLocaleDateString('id-ID')}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Photo Viewer Modal */}
                <PhotoViewerModal
                  photo={selectedPhoto}
                  isOpen={showPhotoViewer}
                  onClose={() => {
                    setShowPhotoViewer(false);
                    setSelectedPhoto(null);
                  }}
                  onEdit={(photo) => {
                    setEditingPhoto(photo);
                    setShowPhotoViewer(false);
                  }}
                  onDelete={handlePhotoDelete}
                />

                {/* Photo Edit Modal */}
                <PhotoEditModal
                  photo={editingPhoto}
                  isOpen={!!editingPhoto}
                  onClose={() => setEditingPhoto(null)}
                  onSave={handlePhotoEdit}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Analytics & Performa</h3>
                  
                  {/* Utilization Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Tingkat Aktivitas 6 Bulan Terakhir</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {utilizationData.map((data, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-12 text-sm text-gray-600">{data.bulan}</div>
                            <div className="flex-1">
                              <Progress value={data.utilizasi} className="h-3" />
                            </div>
                            <div className="w-12 text-sm font-medium">{data.utilizasi}%</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cost Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          Rp {vehicleDetails.kmTerakhir > 0 ? 
                            Math.round(vehicleDetails.totalBiayaBulanIni / (vehicleDetails.kmTerakhir / 1000)).toLocaleString('id-ID') : 
                            '0'
                          }
                        </div>
                        <p className="text-sm text-gray-600">Biaya per 1000 KM</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {vehicleDetails.fuelConsumption || 'N/A'}
                        </div>
                        <p className="text-sm text-gray-600">KM per Liter</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {vehicleDetails.kmTerakhir > 0 ? 
                            Math.round(vehicleDetails.kmTerakhir / (new Date().getFullYear() - vehicleDetails.tahunPembuatan + 1)).toLocaleString('id-ID') :
                            '0'
                          }
                        </div>
                        <p className="text-sm text-gray-600">KM per Tahun</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleDetailDashboard;
