// NOTE: Data is stored in localStorage, which is not secure for sensitive information. For production, migrate to a backend with authentication and proper access control.

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, Search, Edit, Eye, Power, ChevronDown, ChevronUp, Wrench, Camera, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, Vehicle } from '@/services/LocalStorageService';
import VehicleHealthIndicator from './VehicleHealthIndicator';
import VehicleDetailDashboard from './VehicleDetailDashboard';
import React from 'react';

// Simple input sanitization to prevent XSS and unwanted characters
function sanitizeInput(input: string): string {
  return input.replace(/[<>"]|['`]/g, '').trim();
}

interface VehicleManagementProps {
  onNavigate?: (module: string, params?: any) => void;
}

export default function VehicleManagement({ onNavigate }: VehicleManagementProps = {}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load vehicles with useCallback to prevent re-creation
  const loadVehicles = useCallback(() => {
    const storedVehicles = localStorageService.getVehicles();
    setVehicles(storedVehicles);
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Handle form submission
  const handleFormSubmit = useCallback((data: any) => {
    try {
      // Validate plate number uniqueness
      const platNomor = sanitizeInput(data.platNomor?.toString() || '');
      const existingVehicle = vehicles.find(v => 
        v.platNomor.toLowerCase() === platNomor.toLowerCase() && 
        (!editingVehicle || v.id !== editingVehicle.id)
      );
      
      if (existingVehicle) {
        toast({
          title: "Error",
          description: "Nomor plat sudah terdaftar. Silakan gunakan nomor plat yang berbeda.",
          variant: "destructive",
        });
        return;
      }

      // Sanitize all string inputs
      const sanitizedData = {
        ...data,
        platNomor: sanitizeInput(data.platNomor?.toString() || ''),
        model: sanitizeInput(data.model?.toString() || ''),
        nomorRangka: sanitizeInput(data.nomorRangka?.toString() || ''),
        nomorMesin: sanitizeInput(data.nomorMesin?.toString() || ''),
        kapasitasMusatan: sanitizeInput(data.kapasitasMusatan?.toString() || ''),
        warna: sanitizeInput(data.warna?.toString() || ''),
        catatan: sanitizeInput(data.catatan?.toString() || ''),
      };

      if (editingVehicle) {
        localStorageService.updateVehicle(editingVehicle.id, sanitizedData);
        toast({
          title: "Berhasil",
          description: "Data kendaraan berhasil diperbarui.",
        });
      } else {
        localStorageService.addVehicle(sanitizedData);
        toast({
          title: "Berhasil",
          description: "Kendaraan baru berhasil ditambahkan.",
        });
      }
      
      loadVehicles();
      setShowForm(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data.",
        variant: "destructive",
      });
    }
  }, [vehicles, editingVehicle, toast, loadVehicles]);

  // Handle form cancellation
  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingVehicle(null);
  }, []);

  // Handle edit
  const handleEdit = useCallback((vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  }, []);

  // Toggle vehicle expansion
  const toggleVehicleExpansion = useCallback((vehicleId: string) => {
    setExpandedVehicles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vehicleId)) {
        newSet.delete(vehicleId);
      } else {
        newSet.add(vehicleId);
      }
      return newSet;
    });
  }, []);

  // Get vehicle statistics for inline display
  const getVehicleStats = useCallback((vehicleId: string) => {
    const maintenanceRecords = localStorageService.getMaintenanceByVehicle(vehicleId);
    const operationalCosts = localStorageService.getCostsByVehicle(vehicleId);
    const documents = localStorageService.getDocumentsByVehicle(vehicleId);

    const kmTerakhir = maintenanceRecords.length > 0 
      ? Math.max(...maintenanceRecords.map(m => m.kilometer))
      : 0;

    const lastServiceDate = maintenanceRecords.length > 0 
      ? maintenanceRecords
          .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0]
          .tanggal
      : null;

    const nextServiceKm = kmTerakhir > 0 ? kmTerakhir + 5000 : 5000;
    
    // Check for service due (within 500 km or overdue)
    const isServiceDue = kmTerakhir > 0 && (nextServiceKm - kmTerakhir) <= 500;
    
    // Check for document expiry (within 30 days)
    const expiringSoonDocs = documents.filter(doc => doc.hariTersisa <= 30 && doc.hariTersisa > 0);
    const expiredDocs = documents.filter(doc => doc.hariTersisa <= 0);

    // Calculate total costs this month
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

    return {
      kmTerakhir,
      lastServiceDate,
      nextServiceKm,
      isServiceDue,
      expiringSoonDocs: expiringSoonDocs.length,
      expiredDocs: expiredDocs.length,
      totalMaintenanceRecords: maintenanceRecords.length,
      monthlyTotalCosts: monthlyMaintenanceCosts + monthlyOperationalCosts,
      recentActivities: [...maintenanceRecords, ...operationalCosts]
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
        .slice(0, 3)
    };
  }, []);

  // Filter vehicles with useMemo for performance
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle =>
      vehicle.platNomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.jenisKendaraan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.merek.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  // Handle toggle status
  const toggleStatus = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      const newStatus = vehicle.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
      localStorageService.updateVehicle(vehicleId, { status: newStatus });
      loadVehicles();
      toast({
        title: "Berhasil",
        description: `Status kendaraan berhasil diubah menjadi ${newStatus}.`,
      });
    }
  };

  if (selectedVehicle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedVehicle(null)}
            className="flex items-center gap-2"
          >
            ← Kembali ke Daftar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleEdit(selectedVehicle)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Kendaraan
          </Button>
        </div>
        <VehicleDetailDashboard
          vehicle={{
            ...selectedVehicle,
            id: parseInt(selectedVehicle.id) || 0
          }}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  if (showForm) {
    return (
      <VehicleForm
        editingVehicle={editingVehicle}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Kendaraan & Aset</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Kendaraan
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan plat nomor, merek, atau model..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Vehicle List with Inline Features */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kendaraan ({filteredVehicles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVehicles.map((vehicle) => {
              const isExpanded = expandedVehicles.has(vehicle.id);
              const stats = getVehicleStats(vehicle.id);
              
              return (
                <div key={vehicle.id} className="border rounded-lg bg-white overflow-hidden">
                  {/* Main Vehicle Info Row */}
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{vehicle.platNomor}</h3>
                          <Badge className={getStatusBadge(vehicle.status)}>
                            {vehicle.status}
                          </Badge>
                          <Badge className={getDocumentStatusBadge(vehicle.statusDokumen)}>
                            {vehicle.statusDokumen}
                          </Badge>
                          
                          {/* Inline Status Indicators */}
                          {stats.isServiceDue && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Service Due
                            </Badge>
                          )}
                          {stats.expiredDocs > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              <FileText className="h-3 w-3 mr-1" />
                              {stats.expiredDocs} Expired
                            </Badge>
                          )}
                          {stats.expiringSoonDocs > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Calendar className="h-3 w-3 mr-1" />
                              {stats.expiringSoonDocs} Expiring
                            </Badge>
                          )}
                          
                          <VehicleHealthIndicator
                            vehicleId={vehicle.id}
                            kmTempuh={stats.kmTerakhir}
                            tahunPembuatan={vehicle.tahunPembuatan}
                            lastServiceDays={stats.lastServiceDate ? 
                              Math.floor((new Date().getTime() - new Date(stats.lastServiceDate).getTime()) / (1000 * 60 * 60 * 24)) : 
                              999
                            }
                            totalPerbaikan={stats.totalMaintenanceRecords}
                          />
                        </div>
                        
                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 mb-2">
                          <div>
                            <span className="font-medium">Jenis:</span> {vehicle.jenisKendaraan}
                          </div>
                          <div>
                            <span className="font-medium">Merek:</span> {vehicle.merek} {vehicle.model}
                          </div>
                          <div>
                            <span className="font-medium">KM Terakhir:</span> {stats.kmTerakhir.toLocaleString('id-ID')}
                          </div>
                          <div>
                            <span className="font-medium">Service Berikutnya:</span> {stats.nextServiceKm.toLocaleString('id-ID')} KM
                          </div>
                        </div>

                        {/* Last Service & Monthly Cost */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">
                            <span className="font-medium">Service Terakhir:</span> {
                              stats.lastServiceDate ? 
                                new Date(stats.lastServiceDate).toLocaleDateString('id-ID') : 
                                'Belum ada data'
                            }
                          </div>
                          <div className="text-gray-600">
                            <span className="font-medium">Biaya Bulan Ini:</span> Rp {stats.monthlyTotalCosts.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedVehicle(vehicle)}
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            // Could add logic to open directly to Service Logbook tab
                          }}
                          title="Service Logbook"
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            // Could add logic to open directly to Photos tab
                          }}
                          title="Foto Kendaraan"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(vehicle)}
                          title="Edit Kendaraan"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleVehicleExpansion(vehicle.id)}
                          title={isExpanded ? "Tutup Detail" : "Buka Detail"}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleStatus(vehicle.id)}
                          className={vehicle.status === 'Aktif' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                          title={vehicle.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Section */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Detailed Vehicle Info */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Informasi Detail</h4>
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-gray-600">Tahun:</span>
                                <span className="ml-2 font-medium">{vehicle.tahunPembuatan}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Kapasitas:</span>
                                <span className="ml-2 font-medium">{vehicle.kapasitasMusatan || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Bahan Bakar:</span>
                                <span className="ml-2 font-medium">{vehicle.jenisBahanBakar}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Warna:</span>
                                <span className="ml-2 font-medium">{vehicle.warna || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">No. Rangka:</span>
                                <span className="ml-2 font-medium">{vehicle.nomorRangka}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">No. Mesin:</span>
                                <span className="ml-2 font-medium">{vehicle.nomorMesin}</span>
                              </div>
                            </div>
                            <div className="pt-2">
                              <span className="text-gray-600">Lokasi Pool:</span>
                              <span className="ml-2 font-medium">{vehicle.lokasiPool}</span>
                            </div>
                            {vehicle.catatan && (
                              <div className="pt-2">
                                <span className="text-gray-600">Catatan:</span>
                                <p className="ml-2 font-medium text-gray-800">{vehicle.catatan}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Recent Activities */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Aktivitas Terkini</h4>
                          {stats.recentActivities.length > 0 ? (
                            <div className="space-y-2">
                              {stats.recentActivities.map((activity, index) => (
                                <div key={index} className="bg-white p-3 rounded border text-sm">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {'jenisPerawatan' in activity ? activity.jenisPerawatan : activity.jenisBiaya}
                                      </p>
                                      <p className="text-gray-600 text-xs">
                                        {new Date(activity.tanggal).toLocaleDateString('id-ID')}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-medium text-blue-600">
                                        Rp {'biaya' in activity ? activity.biaya.toLocaleString('id-ID') : activity.jumlah.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-4">
                              <p className="text-sm">Belum ada aktivitas tercatat</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredVehicles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada kendaraan yang ditemukan. Tambahkan kendaraan baru untuk memulai.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getStatusBadge(status: string) {
  const statusColors = {
    'Aktif': 'bg-green-100 text-green-800',
    'Tidak Aktif': 'bg-gray-100 text-gray-800',
    'Dalam Perbaikan': 'bg-yellow-100 text-yellow-800'
  };
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
}

function getDocumentStatusBadge(status: string) {
  const statusColors = {
    'Lengkap': 'bg-green-100 text-green-800',
    'Ada yang Kadaluarsa': 'bg-red-100 text-red-800',
    'Belum Diverifikasi': 'bg-yellow-100 text-yellow-800'
  };
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
}

// Minimal VehicleForm component using uncontrolled inputs
const VehicleForm = React.memo(function VehicleForm({
  editingVehicle,
  onSubmit,
  onCancel
}: {
  editingVehicle: Vehicle | null,
  onSubmit: (data: any) => void,
  onCancel: () => void
}) {
  const formRef = useRef<HTMLFormElement>(null);

  // Initialize form with editing vehicle data if available
  useEffect(() => {
    if (formRef.current && editingVehicle) {
      const form = formRef.current;
      (form.platNomor as HTMLInputElement).value = editingVehicle.platNomor || '';
      (form.jenisKendaraan as HTMLSelectElement).value = editingVehicle.jenisKendaraan || '';
      (form.merek as HTMLSelectElement).value = editingVehicle.merek || '';
      (form.model as HTMLInputElement).value = editingVehicle.model || '';
      (form.tahunPembuatan as HTMLInputElement).value = editingVehicle.tahunPembuatan?.toString() || '';
      (form.nomorRangka as HTMLInputElement).value = editingVehicle.nomorRangka || '';
      (form.nomorMesin as HTMLInputElement).value = editingVehicle.nomorMesin || '';
      (form.kapasitasMusatan as HTMLInputElement).value = editingVehicle.kapasitasMusatan || '';
      (form.jenisBahanBakar as HTMLSelectElement).value = editingVehicle.jenisBahanBakar || '';
      (form.warna as HTMLInputElement).value = editingVehicle.warna || '';
      (form.tanggalPerolehan as HTMLInputElement).value = editingVehicle.tanggalPerolehan || '';
      (form.statusKepemilikan as HTMLSelectElement).value = editingVehicle.statusKepemilikan || '';
      (form.lokasiPool as HTMLSelectElement).value = editingVehicle.lokasiPool || '';
      (form.catatan as HTMLTextAreaElement).value = editingVehicle.catatan || '';
    }
  }, [editingVehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const data = {
        platNomor: formData.get('platNomor'),
        jenisKendaraan: formData.get('jenisKendaraan'),
        merek: formData.get('merek'),
        model: formData.get('model'),
        tahunPembuatan: parseInt(formData.get('tahunPembuatan') as string) || undefined,
        nomorRangka: formData.get('nomorRangka'),
        nomorMesin: formData.get('nomorMesin'),
        kapasitasMusatan: formData.get('kapasitasMusatan'),
        jenisBahanBakar: formData.get('jenisBahanBakar'),
        warna: formData.get('warna'),
        tanggalPerolehan: formData.get('tanggalPerolehan'),
        statusKepemilikan: formData.get('statusKepemilikan'),
        lokasiPool: formData.get('lokasiPool'),
        catatan: formData.get('catatan'),
      };
      onSubmit(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platNomor">Nomor Plat *</Label>
              <input 
                id="platNomor"
                name="platNomor"
                type="text"
                placeholder="B 1234 AB" 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisKendaraan">Jenis Kendaraan *</Label>
              <select 
                id="jenisKendaraan"
                name="jenisKendaraan"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">Pilih jenis kendaraan</option>
                <option value="Truk">Truk</option>
                <option value="Pickup">Pickup</option>
                <option value="Van">Van</option>
                <option value="Motor">Motor</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="merek">Merek *</Label>
              <select 
                id="merek"
                name="merek"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">Pilih merek</option>
                <option value="Toyota">Toyota</option>
                <option value="Mitsubishi">Mitsubishi</option>
                <option value="Isuzu">Isuzu</option>
                <option value="Daihatsu">Daihatsu</option>
                <option value="Honda">Honda</option>
                <option value="Suzuki">Suzuki</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <input 
                id="model"
                name="model"
                type="text"
                placeholder="Hilux, Canter, Elf, dll." 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tahunPembuatan">Tahun Pembuatan *</Label>
              <input 
                id="tahunPembuatan"
                name="tahunPembuatan"
                type="number" 
                placeholder="2020" 
                min="1990" 
                max="2025" 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomorRangka">Nomor Rangka *</Label>
              <input 
                id="nomorRangka"
                name="nomorRangka"
                type="text"
                placeholder="MHK***************" 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomorMesin">Nomor Mesin *</Label>
              <input 
                id="nomorMesin"
                name="nomorMesin"
                type="text"
                placeholder="4M40***********" 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kapasitasMusatan">Kapasitas Muatan</Label>
              <input 
                id="kapasitasMusatan"
                name="kapasitasMusatan"
                type="text"
                placeholder="3 Ton, 1000 Kg, dll." 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisBahanBakar">Jenis Bahan Bakar *</Label>
              <select 
                id="jenisBahanBakar"
                name="jenisBahanBakar"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">Pilih jenis bahan bakar</option>
                <option value="Bensin">Bensin</option>
                <option value="Solar">Solar</option>
                <option value="Pertamax">Pertamax</option>
                <option value="Pertalite">Peritalite</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="warna">Warna</Label>
              <input 
                id="warna"
                name="warna"
                type="text"
                placeholder="Putih, Merah, dll." 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalPerolehan">Tanggal Perolehan *</Label>
              <input 
                id="tanggalPerolehan"
                name="tanggalPerolehan"
                type="date" 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusKepemilikan">Status Kepemilikan *</Label>
              <select 
                id="statusKepemilikan"
                name="statusKepemilikan"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">Pilih status kepemilikan</option>
                <option value="Milik Sendiri">Milik Sendiri</option>
                <option value="Sewa">Sewa</option>
                <option value="Kredit">Kredit</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lokasiPool">Lokasi Pool/Garasi *</Label>
            <select 
              id="lokasiPool"
              name="lokasiPool"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="">Pilih lokasi pool</option>
              <option value="Pool Utama Bandung">Pool Utama Bandung</option>
              <option value="Pool Cimahi">Pool Cimahi</option>
              <option value="Pool Subang">Pool Subang</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan Tambahan</Label>
            <textarea 
              id="catatan"
              name="catatan"
              placeholder="Catatan khusus tentang kendaraan ini..." 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingVehicle ? 'Update Kendaraan' : 'Simpan Kendaraan'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});
