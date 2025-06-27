
import { useState } from 'react';
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

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  // Mock data for dashboard
  const dashboardStats = {
    activeVehicles: 12,
    inactiveVehicles: 2,
    nearingService: 3,
    expiringDocuments: 5,
    monthlyOperationalCost: 45250000
  };

  const nearingServiceVehicles = [
    { platNomor: 'B 1234 AB', jenisKendaraan: 'Truk', servisTerakhir: '2024-05-15', kmTerakhir: 48500 },
    { platNomor: 'B 5678 CD', jenisKendaraan: 'Pickup', servisTerakhir: '2024-05-20', kmTerakhir: 35200 },
    { platNomor: 'B 9101 EF', jenisKendaraan: 'Truk', servisTerakhir: '2024-05-10', kmTerakhir: 52000 }
  ];

  const expiringDocuments = [
    { dokumen: 'STNK', platNomor: 'B 1234 AB', tanggalKadaluarsa: '2025-01-15', hariTersisa: 19 },
    { dokumen: 'KIR', platNomor: 'B 5678 CD', tanggalKadaluarsa: '2025-01-20', hariTersisa: 24 },
    { dokumen: 'Asuransi', platNomor: 'B 9101 EF', tanggalKadaluarsa: '2025-01-10', hariTersisa: 14 },
    { dokumen: 'SIM Driver', platNomor: 'B 2345 GH', tanggalKadaluarsa: '2025-01-25', hariTersisa: 29 },
    { dokumen: 'Sertifikat LPG', platNomor: 'B 6789 IJ', tanggalKadaluarsa: '2025-01-08', hariTersisa: 12 }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Sistem Manajemen Armada LPG</h1>
        <p className="text-blue-100">Selamat datang di dashboard manajemen armada Anda</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Kendaraan Aktif</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardStats.activeVehicles}</div>
            <p className="text-xs text-gray-500">dari {dashboardStats.activeVehicles + dashboardStats.inactiveVehicles} total kendaraan</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Perlu Servis</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dashboardStats.nearingService}</div>
            <p className="text-xs text-gray-500">kendaraan mendekati jadwal servis</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dokumen Kadaluarsa</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardStats.expiringDocuments}</div>
            <p className="text-xs text-gray-500">dokumen mendekati kadaluarsa</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Biaya Operasional</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rp {dashboardStats.monthlyOperationalCost.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-500">bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Aksi Cepat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setActiveModule('vehicles')} className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Tambah Kendaraan Baru
            </Button>
            <Button onClick={() => setActiveModule('maintenance')} variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Jadwalkan Perawatan
            </Button>
            <Button onClick={() => setActiveModule('documents')} variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Upload Dokumen
            </Button>
            <Button onClick={() => setActiveModule('costs')} variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Catat Biaya
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles Nearing Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Wrench className="h-5 w-5" />
              Kendaraan Mendekati Servis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearingServiceVehicles.map((vehicle, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-semibold">{vehicle.platNomor}</div>
                    <div className="text-sm text-gray-600">{vehicle.jenisKendaraan} • KM: {vehicle.kmTerakhir.toLocaleString('id-ID')}</div>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Servis Terakhir: {vehicle.servisTerakhir}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents Nearing Expiry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Dokumen Mendekati Kadaluarsa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-semibold">{doc.dokumen}</div>
                    <div className="text-sm text-gray-600">{doc.platNomor}</div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      doc.hariTersisa <= 14 
                        ? 'text-red-600 border-red-600' 
                        : 'text-orange-600 border-orange-600'
                    }`}
                  >
                    {doc.hariTersisa} hari lagi
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'vehicles':
        return <VehicleManagement />;
      case 'documents':
        return <DocumentManagement />;
      case 'maintenance':
        return <MaintenanceManagement />;
      case 'costs':
        return <CostReporting />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveModule()}
      </main>
    </div>
  );
};

export default Index;
