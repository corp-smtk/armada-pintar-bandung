
import { useState } from 'react';
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
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VehicleHealthIndicator from './VehicleHealthIndicator';
import ServiceLogbook from './ServiceLogbook';

interface VehicleDetailDashboardProps {
  vehicle: {
    id: number;
    platNomor: string;
    jenisKendaraan: string;
    merek: string;
    model: string;
    tahunPembuatan: number;
    status: string;
    lokasiPool: string;
  };
}

const VehicleDetailDashboard = ({ vehicle }: VehicleDetailDashboardProps) => {
  // Mock detailed data - in real app, this would come from API
  const vehicleDetails = {
    ...vehicle,
    kmTerakhir: 48500,
    fuelConsumption: 12.5, // km/liter
    lastServiceDate: '2024-06-15',
    nextServiceKm: 50000,
    totalBiayaBulanIni: 2850000,
    utilizationRate: 85, // percentage
    driverUtama: 'Budi Santoso',
    driverBackup: 'Ahmad Wijaya',
    lastLocation: 'Pool Utama Bandung',
    totalPerbaikan: 8,
    statusOperasional: 'Aktif - Standby'
  };

  const utilizationData = [
    { bulan: 'Jan', utilizasi: 78 },
    { bulan: 'Feb', utilizasi: 82 },
    { bulan: 'Mar', utilizasi: 85 },
    { bulan: 'Apr', utilizasi: 79 },
    { bulan: 'Mei', utilizasi: 88 },
    { bulan: 'Jun', utilizasi: 85 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'service',
      description: 'Servis rutin - ganti oli dan filter',
      date: '2024-06-15',
      cost: 850000
    },
    {
      id: 2,
      type: 'fuel',
      description: 'Pengisian bahan bakar - 45 liter',
      date: '2024-06-20',
      cost: 675000
    },
    {
      id: 3,
      type: 'repair',
      description: 'Perbaikan AC - ganti freon',
      date: '2024-06-10',
      cost: 450000
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'service': return <Wrench className="h-4 w-4 text-blue-600" />;
      case 'fuel': return <Fuel className="h-4 w-4 text-green-600" />;
      case 'repair': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{vehicle.platNomor}</h2>
          <p className="text-gray-600">{vehicle.merek} {vehicle.model} ({vehicle.tahunPembuatan})</p>
        </div>
        <VehicleHealthIndicator
          vehicleId={vehicle.id.toString()}
          kmTempuh={vehicleDetails.kmTerakhir}
          tahunPembuatan={vehicle.tahunPembuatan}
          lastServiceDays={30}
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
            <div className="mt-4">
              <Progress value={(vehicleDetails.kmTerakhir / vehicleDetails.nextServiceKm) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {vehicleDetails.nextServiceKm - vehicleDetails.kmTerakhir} KM hingga servis
              </p>
            </div>
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
                <p className="text-xs text-gray-500">bulan ini</p>
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
              <Badge className="bg-green-100 text-green-800">
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
              <span className="text-sm text-gray-600">Lokasi Terakhir:</span>
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
              <span className="text-sm font-medium">{vehicleDetails.lastServiceDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">KM Servis Berikutnya:</span>
              <span className="text-sm font-medium">{vehicleDetails.nextServiceKm.toLocaleString('id-ID')} KM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Perbaikan:</span>
              <span className="text-sm font-medium">{vehicleDetails.totalPerbaikan} kali</span>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full">
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Aktivitas 30 Hari Terakhir</h3>
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          Rp {activity.cost.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="logbook" className="mt-0">
                <ServiceLogbook vehicleId={vehicle.id.toString()} />
              </TabsContent>

              <TabsContent value="photos" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Foto Kendaraan</h3>
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Foto
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Placeholder for photos */}
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Foto Depan</p>
                      </div>
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Foto Samping</p>
                      </div>
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Interior</p>
                      </div>
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Dokumen</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Analytics & Performa</h3>
                  
                  {/* Utilization Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Tingkat Utilisasi 6 Bulan Terakhir</CardTitle>
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
                          Rp {Math.round(vehicleDetails.totalBiayaBulanIni / (vehicleDetails.kmTerakhir / 1000)).toLocaleString('id-ID')}
                        </div>
                        <p className="text-sm text-gray-600">Biaya per 1000 KM</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {vehicleDetails.fuelConsumption}
                        </div>
                        <p className="text-sm text-gray-600">KM per Liter</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(vehicleDetails.kmTerakhir / (new Date().getFullYear() - vehicleDetails.tahunPembuatan + 1)).toLocaleString('id-ID')}
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
