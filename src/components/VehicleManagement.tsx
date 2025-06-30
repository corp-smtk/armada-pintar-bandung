
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, Power, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, Vehicle } from '@/services/LocalStorageService';
import VehicleHealthIndicator from './VehicleHealthIndicator';
import VehicleDetailDashboard from './VehicleDetailDashboard';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  const { toast } = useToast();

  // Load vehicles on component mount
  useEffect(() => {
    loadVehicles();
    // Initialize sample data if empty
    localStorageService.initializeSampleData();
  }, []);

  const loadVehicles = () => {
    const loadedVehicles = localStorageService.getVehicles();
    setVehicles(loadedVehicles);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.platNomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.merek.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         vehicle.jenisKendaraan.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.platNomor || !formData.jenisKendaraan || !formData.merek || !formData.model || 
        !formData.tahunPembuatan || !formData.nomorRangka || !formData.nomorMesin || 
        !formData.jenisBahanBakar || !formData.tanggalPerolehan || !formData.statusKepemilikan || 
        !formData.lokasiPool) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const vehicleData = {
        ...formData,
        status: formData.status || 'Aktif',
        statusDokumen: 'Belum Diverifikasi'
      } as Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;

      if (editingVehicle) {
        localStorageService.updateVehicle(editingVehicle.id, vehicleData);
        toast({
          title: "Berhasil",
          description: "Data kendaraan berhasil diperbarui"
        });
      } else {
        localStorageService.addVehicle(vehicleData);
        toast({
          title: "Berhasil",
          description: "Kendaraan baru berhasil ditambahkan"
        });
      }

      loadVehicles();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan data kendaraan",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setShowAddForm(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kendaraan ${vehicle.platNomor}? Data terkait seperti dokumen, perawatan, dan biaya juga akan terhapus.`)) {
      try {
        localStorageService.deleteVehicle(vehicle.id);
        loadVehicles();
        toast({
          title: "Berhasil",
          description: "Kendaraan berhasil dihapus"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus kendaraan",
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleStatus = (vehicle: Vehicle) => {
    const newStatus = vehicle.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    try {
      localStorageService.updateVehicle(vehicle.id, { status: newStatus });
      loadVehicles();
      toast({
        title: "Berhasil",
        description: `Status kendaraan berhasil diubah menjadi ${newStatus}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah status kendaraan",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingVehicle(null);
    setShowAddForm(false);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Aktif': 'bg-green-100 text-green-800',
      'Tidak Aktif': 'bg-gray-100 text-gray-800',
      'Dalam Perbaikan': 'bg-yellow-100 text-yellow-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getDocumentStatusBadge = (status: string) => {
    const statusColors = {
      'Lengkap': 'bg-green-100 text-green-800',
      'Ada yang Kadaluarsa': 'bg-red-100 text-red-800',
      'Belum Diverifikasi': 'bg-yellow-100 text-yellow-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  // If a vehicle is selected, show detailed dashboard
  if (selectedVehicle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedVehicle(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar
          </Button>
        </div>
        <VehicleDetailDashboard vehicle={selectedVehicle} />
      </div>
    );
  }

  const VehicleForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>{editingVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platNomor">Nomor Plat *</Label>
              <Input 
                id="platNomor" 
                placeholder="B 1234 AB" 
                value={formData.platNomor || ''}
                onChange={(e) => setFormData({...formData, platNomor: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisKendaraan">Jenis Kendaraan *</Label>
              <Select value={formData.jenisKendaraan || ''} onValueChange={(value) => setFormData({...formData, jenisKendaraan: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kendaraan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Truk">Truk</SelectItem>
                  <SelectItem value="Pickup">Pickup</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Motor">Motor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="merek">Merek *</Label>
              <Select value={formData.merek || ''} onValueChange={(value) => setFormData({...formData, merek: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih merek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Toyota">Toyota</SelectItem>
                  <SelectItem value="Mitsubishi">Mitsubishi</SelectItem>
                  <SelectItem value="Isuzu">Isuzu</SelectItem>
                  <SelectItem value="Daihatsu">Daihatsu</SelectItem>
                  <SelectItem value="Honda">Honda</SelectItem>
                  <SelectItem value="Suzuki">Suzuki</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input 
                id="model" 
                placeholder="Hilux, Canter, Elf, dll." 
                value={formData.model || ''}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tahunPembuatan">Tahun Pembuatan *</Label>
              <Input 
                id="tahunPembuatan" 
                type="number" 
                placeholder="2020" 
                min="1990" 
                max="2025" 
                value={formData.tahunPembuatan || ''}
                onChange={(e) => setFormData({...formData, tahunPembuatan: parseInt(e.target.value)})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomorRangka">Nomor Rangka *</Label>
              <Input 
                id="nomorRangka" 
                placeholder="MHK***************" 
                value={formData.nomorRangka || ''}
                onChange={(e) => setFormData({...formData, nomorRangka: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomorMesin">Nomor Mesin *</Label>
              <Input 
                id="nomorMesin" 
                placeholder="4M40***********" 
                value={formData.nomorMesin || ''}
                onChange={(e) => setFormData({...formData, nomorMesin: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kapasitasMusatan">Kapasitas Muatan</Label>
              <Input 
                id="kapasitasMusatan" 
                placeholder="3 Ton, 1000 Kg, dll." 
                value={formData.kapasitasMusatan || ''}
                onChange={(e) => setFormData({...formData, kapasitasMusatan: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisBahanBakar">Jenis Bahan Bakar *</Label>
              <Select value={formData.jenisBahanBakar || ''} onValueChange={(value) => setFormData({...formData, jenisBahanBakar: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis bahan bakar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bensin">Bensin</SelectItem>
                  <SelectItem value="Solar">Solar</SelectItem>
                  <SelectItem value="Pertamax">Pertamax</SelectItem>
                  <SelectItem value="Pertalite">Peritalite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="warna">Warna</Label>
              <Input 
                id="warna" 
                placeholder="Putih, Merah, dll." 
                value={formData.warna || ''}
                onChange={(e) => setFormData({...formData, warna: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalPerolehan">Tanggal Perolehan *</Label>
              <Input 
                id="tanggalPerolehan" 
                type="date" 
                value={formData.tanggalPerolehan || ''}
                onChange={(e) => setFormData({...formData, tanggalPerolehan: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusKepemilikan">Status Kepemilikan *</Label>
              <Select value={formData.statusKepemilikan || ''} onValueChange={(value) => setFormData({...formData, statusKepemilikan: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status kepemilikan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
                  <SelectItem value="Sewa">Sewa</SelectItem>
                  <SelectItem value="Kredit">Kredit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lokasiPool">Lokasi Pool/Garasi *</Label>
            <Select value={formData.lokasiPool || ''} onValueChange={(value) => setFormData({...formData, lokasiPool: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih lokasi pool" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pool Utama Bandung">Pool Utama Bandung</SelectItem>
                <SelectItem value="Pool Cimahi">Pool Cimahi</SelectItem>
                <SelectItem value="Pool Subang">Pool Subang</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan Tambahan</Label>
            <Textarea 
              id="catatan" 
              placeholder="Catatan khusus tentang kendaraan ini..." 
              value={formData.catatan || ''}
              onChange={(e) => setFormData({...formData, catatan: e.target.value})}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingVehicle ? 'Update Kendaraan' : 'Simpan Kendaraan'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Kendaraan & Aset</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Kendaraan
        </Button>
      </div>

      {showAddForm && <VehicleForm />}

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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter jenis kendaraan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="truk">Truk</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="motor">Motor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kendaraan ({filteredVehicles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
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
                      <VehicleHealthIndicator
                        vehicleId={vehicle.id}
                        kmTempuh={48500}
                        tahunPembuatan={vehicle.tahunPembuatan}
                        lastServiceDays={30}
                        totalPerbaikan={8}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Jenis:</span> {vehicle.jenisKendaraan}
                      </div>
                      <div>
                        <span className="font-medium">Merek:</span> {vehicle.merek} {vehicle.model}
                      </div>
                      <div>
                        <span className="font-medium">Tahun:</span> {vehicle.tahunPembuatan}
                      </div>
                      <div>
                        <span className="font-medium">Kapasitas:</span> {vehicle.kapasitasMusatan || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Bahan Bakar:</span> {vehicle.jenisBahanBakar}
                      </div>
                      <div>
                        <span className="font-medium">Servis Berikutnya:</span> {vehicle.servisBerikutnya || 'Belum Dijadwalkan'}
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-medium">Lokasi:</span> {vehicle.lokasiPool}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleStatus(vehicle)}
                      className={vehicle.status === 'Aktif' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
};

export default VehicleManagement;
