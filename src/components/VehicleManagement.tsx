
import { useState } from 'react';
import { Plus, Search, Edit, Eye, Power } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const VehicleManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock vehicle data
  const vehicles = [
    {
      id: 1,
      platNomor: 'B 1234 AB',
      jenisKendaraan: 'Truk',
      merek: 'Mitsubishi',
      model: 'Canter',
      tahunPembuatan: 2020,
      kapasitasMusatan: '3 Ton',
      jenisBahanBakar: 'Solar',
      status: 'Aktif',
      statusDokumen: 'Lengkap',
      servisBerikutnya: '2024-08-15',
      lokasiPool: 'Pool Utama Bandung'
    },
    {
      id: 2,
      platNomor: 'B 5678 CD',
      jenisKendaraan: 'Pickup',
      merek: 'Toyota',
      model: 'Hilux',
      tahunPembuatan: 2019,
      kapasitasMusatan: '1 Ton',
      jenisBahanBakar: 'Bensin',
      status: 'Aktif',
      statusDokumen: 'Ada yang Kadaluarsa',
      servisBerikutnya: '2024-07-20',
      lokasiPool: 'Pool Utama Bandung'
    },
    {
      id: 3,
      platNomor: 'B 9101 EF',
      jenisKendaraan: 'Truk',
      merek: 'Isuzu',
      model: 'Elf',
      tahunPembuatan: 2018,
      kapasitasMusatan: '2.5 Ton',
      jenisBahanBakar: 'Solar',
      status: 'Dalam Perbaikan',
      statusDokumen: 'Lengkap',
      servisBerikutnya: '2024-09-10',
      lokasiPool: 'Pool Utama Bandung'
    }
  ];

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.platNomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.merek.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         vehicle.jenisKendaraan.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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
      'Ada yang Kadaluarsa': 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const VehicleForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Kendaraan Baru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platNomor">Nomor Plat *</Label>
            <Input id="platNomor" placeholder="B 1234 AB" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jenisKendaraan">Jenis Kendaraan *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kendaraan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="truk">Truk</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="motor">Motor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="merek">Merek *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih merek" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toyota">Toyota</SelectItem>
                <SelectItem value="mitsubishi">Mitsubishi</SelectItem>
                <SelectItem value="isuzu">Isuzu</SelectItem>
                <SelectItem value="daihatsu">Daihatsu</SelectItem>
                <SelectItem value="honda">Honda</SelectItem>
                <SelectItem value="suzuki">Suzuki</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Input id="model" placeholder="Hilux, Canter, Elf, dll." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tahunPembuatan">Tahun Pembuatan *</Label>
            <Input id="tahunPembuatan" type="number" placeholder="2020" min="1990" max="2025" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomorRangka">Nomor Rangka *</Label>
            <Input id="nomorRangka" placeholder="MHK***************" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomorMesin">Nomor Mesin *</Label>
            <Input id="nomorMesin" placeholder="4M40***********" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kapasitasMusatan">Kapasitas Muatan</Label>
            <Input id="kapasitasMusatan" placeholder="3 Ton, 1000 Kg, dll." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jenisBahanBakar">Jenis Bahan Bakar *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis bahan bakar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bensin">Bensin</SelectItem>
                <SelectItem value="solar">Solar</SelectItem>
                <SelectItem value="pertamax">Pertamax</SelectItem>
                <SelectItem value="pertalite">Pertalite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="warna">Warna</Label>
            <Input id="warna" placeholder="Putih, Merah, dll." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalPerolehan">Tanggal Perolehan *</Label>
            <Input id="tanggalPerolehan" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="statusKepemilikan">Status Kepemilikan *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status kepemilikan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="milik-sendiri">Milik Sendiri</SelectItem>
                <SelectItem value="sewa">Sewa</SelectItem>
                <SelectItem value="kredit">Kredit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lokasiPool">Lokasi Pool/Garasi *</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Pilih lokasi pool" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pool-utama">Pool Utama Bandung</SelectItem>
              <SelectItem value="pool-cimahi">Pool Cimahi</SelectItem>
              <SelectItem value="pool-subang">Pool Subang</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="catatan">Catatan Tambahan</Label>
          <Textarea id="catatan" placeholder="Catatan khusus tentang kendaraan ini..." />
        </div>
        <div className="flex gap-2 pt-4">
          <Button className="flex-1">Simpan Kendaraan</Button>
          <Button variant="outline" onClick={() => setShowAddForm(false)}>Batal</Button>
        </div>
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
                        <span className="font-medium">Kapasitas:</span> {vehicle.kapasitasMusatan}
                      </div>
                      <div>
                        <span className="font-medium">Bahan Bakar:</span> {vehicle.jenisBahanBakar}
                      </div>
                      <div>
                        <span className="font-medium">Servis Berikutnya:</span> {vehicle.servisBerikutnya}
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-medium">Lokasi:</span> {vehicle.lokasiPool}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detail Kendaraan - {vehicle.platNomor}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-semibold">Informasi Umum</Label>
                              <div className="mt-2 space-y-1 text-sm">
                                <div>Plat Nomor: {vehicle.platNomor}</div>
                                <div>Jenis: {vehicle.jenisKendaraan}</div>
                                <div>Merek: {vehicle.merek}</div>
                                <div>Model: {vehicle.model}</div>
                                <div>Tahun: {vehicle.tahunPembuatan}</div>
                              </div>
                            </div>
                            <div>
                              <Label className="font-semibold">Status & Lokasi</Label>
                              <div className="mt-2 space-y-1 text-sm">
                                <div>Status: {vehicle.status}</div>
                                <div>Status Dokumen: {vehicle.statusDokumen}</div>
                                <div>Lokasi Pool: {vehicle.lokasiPool}</div>
                                <div>Servis Berikutnya: {vehicle.servisBerikutnya}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={vehicle.status === 'Aktif' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleManagement;
