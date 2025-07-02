import { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Wrench, 
  FileText, 
  Camera, 
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, MaintenanceRecord } from '@/services/LocalStorageService';

interface ServiceLogbookProps {
  vehicleId: string;
  refreshVehicleData?: () => void; // Optional callback to refresh parent data
}

const ServiceLogbook = ({ vehicleId, refreshVehicleData }: ServiceLogbookProps) => {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [serviceHistory, setServiceHistory] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load real service history from localStorage
  const loadServiceHistory = () => {
    setLoading(true);
    try {
      const maintenanceRecords = localStorageService.getMaintenanceByVehicle(vehicleId);
      // Sort by date descending (newest first)
      const sortedRecords = maintenanceRecords.sort((a, b) => 
        new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      );
      setServiceHistory(sortedRecords);
    } catch (error) {
      console.error('Error loading service history:', error);
      toast({
        title: "Error",
        description: "Gagal memuat riwayat service",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServiceHistory();
  }, [vehicleId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selesai':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Selesai</Badge>;
      case 'Dalam Progress':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Dalam Progress</Badge>;
      case 'Dijadwalkan':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Dijadwalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const AddServiceEntryForm = () => {
    const [formData, setFormData] = useState({
      tanggalService: '',
      kmService: '',
      jenisService: '',
      teknisiService: '',
      deskripsiService: '',
      biayaJasa: '',
      rekomendasi: '',
      nextServiceDate: '',
      sukuCadang: [] as { nama: string; jumlah: number; satuan: string; harga: number }[]
    });

    const [newPart, setNewPart] = useState({
      nama: '',
      jumlah: 1,
      satuan: 'pcs',
      harga: 0
    });

    const addPart = () => {
      if (newPart.nama && newPart.harga > 0) {
        setFormData(prev => ({
          ...prev,
          sukuCadang: [...prev.sukuCadang, { ...newPart }]
        }));
        setNewPart({ nama: '', jumlah: 1, satuan: 'pcs', harga: 0 });
      }
    };

    const removePart = (index: number) => {
      setFormData(prev => ({
        ...prev,
        sukuCadang: prev.sukuCadang.filter((_, i) => i !== index)
      }));
    };

    const calculateTotalCost = () => {
      const partsCost = formData.sukuCadang.reduce((sum, part) => sum + (part.jumlah * part.harga), 0);
      const serviceCost = parseInt(formData.biayaJasa) || 0;
      return partsCost + serviceCost;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.tanggalService || !formData.kmService || !formData.jenisService || !formData.teknisiService) {
        toast({
          title: "Error",
          description: "Mohon lengkapi semua field yang wajib diisi",
          variant: "destructive",
        });
        return;
      }

      try {
        const vehicle = localStorageService.getVehicleById(vehicleId);
        
        const maintenanceRecord: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
          vehicleId: vehicleId,
          platNomor: vehicle?.platNomor || '',
          tanggal: formData.tanggalService,
          jenisPerawatan: formData.jenisService,
          deskripsi: formData.deskripsiService,
          kilometer: parseInt(formData.kmService),
          biaya: calculateTotalCost(),
          bengkel: formData.teknisiService,
          spareParts: formData.sukuCadang,
          status: 'Selesai',
          nextServiceKm: parseInt(formData.kmService) + 5000, // Default 5000 km interval
          nextServiceDate: formData.nextServiceDate || undefined,
          catatan: formData.rekomendasi
        };

        localStorageService.addMaintenanceRecord(maintenanceRecord);

        // Update vehicle's service info
        if (vehicle) {
          localStorageService.updateVehicle(vehicleId, {
            servisBerikutnya: formData.nextServiceDate || undefined
          });
        }

        toast({
          title: "Berhasil",
          description: "Entry service berhasil disimpan",
        });

        // Reset form and refresh data
        setFormData({
          tanggalService: '',
          kmService: '',
          jenisService: '',
          teknisiService: '',
          deskripsiService: '',
          biayaJasa: '',
          rekomendasi: '',
          nextServiceDate: '',
          sukuCadang: []
        });
        setShowAddEntry(false);
        loadServiceHistory();
        
        // Refresh parent component data (VehicleDetailDashboard)
        if (refreshVehicleData) {
          refreshVehicleData();
        }

      } catch (error) {
        console.error('Error saving service record:', error);
        toast({
          title: "Error",
          description: "Gagal menyimpan entry service",
          variant: "destructive",
        });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Tambah Entry Service Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggalService">Tanggal Service *</Label>
                <Input 
                  id="tanggalService" 
                  type="date" 
                  value={formData.tanggalService}
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggalService: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kmService">KM Saat Service *</Label>
                <Input 
                  id="kmService" 
                  type="number" 
                  placeholder="48500"
                  value={formData.kmService}
                  onChange={(e) => setFormData(prev => ({ ...prev, kmService: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenisService">Jenis Service *</Label>
                <Select value={formData.jenisService} onValueChange={(value) => setFormData(prev => ({ ...prev, jenisService: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="servis-rutin">Servis Rutin</SelectItem>
                    <SelectItem value="ganti-oli">Ganti Oli</SelectItem>
                    <SelectItem value="perbaikan-mesin">Perbaikan Mesin</SelectItem>
                    <SelectItem value="perbaikan-ac">Perbaikan AC</SelectItem>
                    <SelectItem value="ganti-ban">Ganti Ban</SelectItem>
                    <SelectItem value="perbaikan-rem">Perbaikan Rem</SelectItem>
                    <SelectItem value="tune-up">Tune Up</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teknisiService">Teknisi/Bengkel *</Label>
                <Input 
                  id="teknisiService" 
                  placeholder="Nama teknisi - Nama bengkel"
                  value={formData.teknisiService}
                  onChange={(e) => setFormData(prev => ({ ...prev, teknisiService: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsiService">Deskripsi Detail Service *</Label>
              <Textarea 
                id="deskripsiService" 
                placeholder="Jelaskan secara detail pekerjaan yang dilakukan, kondisi yang ditemukan, dan tindakan yang diambil..."
                rows={4}
                value={formData.deskripsiService}
                onChange={(e) => setFormData(prev => ({ ...prev, deskripsiService: e.target.value }))}
                required
              />
            </div>

            {/* Parts Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Suku Cadang yang Digunakan</Label>
              </div>
              
              {/* Existing parts list */}
              {formData.sukuCadang.length > 0 && (
                <div className="space-y-2">
                  {formData.sukuCadang.map((part, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">{part.nama} ({part.jumlah} {part.satuan})</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Rp {part.harga.toLocaleString('id-ID')}</span>
                        <Button type="button" variant="outline" size="sm" onClick={() => removePart(index)}>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add new part form */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="namaSukuCadang">Nama Suku Cadang</Label>
                  <Input 
                    id="namaSukuCadang" 
                    placeholder="Oli mesin, Filter, dll."
                    value={newPart.nama}
                    onChange={(e) => setNewPart(prev => ({ ...prev, nama: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jumlahSukuCadang">Jumlah</Label>
                  <Input 
                    id="jumlahSukuCadang" 
                    type="number" 
                    placeholder="1"
                    value={newPart.jumlah}
                    onChange={(e) => setNewPart(prev => ({ ...prev, jumlah: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="satuanSukuCadang">Satuan</Label>
                  <Select value={newPart.satuan} onValueChange={(value) => setNewPart(prev => ({ ...prev, satuan: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pcs</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="meter">Meter</SelectItem>
                      <SelectItem value="kaleng">Kaleng</SelectItem>
                      <SelectItem value="botol">Botol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hargaSukuCadang">Harga Satuan</Label>
                  <Input 
                    id="hargaSukuCadang" 
                    type="number" 
                    placeholder="150000"
                    value={newPart.harga || ''}
                    onChange={(e) => setNewPart(prev => ({ ...prev, harga: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={addPart}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="biayaJasaService">Biaya Jasa Service</Label>
                <Input 
                  id="biayaJasaService" 
                  type="number" 
                  placeholder="200000"
                  value={formData.biayaJasa}
                  onChange={(e) => setFormData(prev => ({ ...prev, biayaJasa: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Biaya Service</Label>
                <Input 
                  type="text" 
                  value={`Rp ${calculateTotalCost().toLocaleString('id-ID')}`}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rekomendasiService">Rekomendasi & Catatan Teknisi</Label>
              <Textarea 
                id="rekomendasiService" 
                placeholder="Rekomendasi untuk service berikutnya, kondisi komponen yang perlu diperhatikan, dll..."
                rows={3}
                value={formData.rekomendasi}
                onChange={(e) => setFormData(prev => ({ ...prev, rekomendasi: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextServiceDate">Tanggal Service Berikutnya (Estimasi)</Label>
              <Input 
                id="nextServiceDate" 
                type="date"
                value={formData.nextServiceDate}
                onChange={(e) => setFormData(prev => ({ ...prev, nextServiceDate: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Simpan Entry Service</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddEntry(false)}>Batal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Memuat riwayat service...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Service Logbook Digital</h3>
        <Button onClick={() => setShowAddEntry(!showAddEntry)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Entry Service
        </Button>
      </div>

      {/* Add Entry Form */}
      {showAddEntry && <AddServiceEntryForm />}

      {/* Service History Timeline */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Riwayat Service ({serviceHistory.length} entries)</h4>
        
        {serviceHistory.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada riwayat service untuk kendaraan ini</p>
              <p className="text-sm">Klik "Tambah Entry Service" untuk memulai mencatat riwayat service</p>
            </CardContent>
          </Card>
        ) : (
          serviceHistory.map((service) => (
            <Card key={service.id} className="relative">
              <CardContent className="pt-6">
                {/* Timeline indicator */}
                <div className="absolute left-0 top-6 w-1 h-full bg-blue-200 rounded-full"></div>
                <div className="absolute left-0 top-6 w-3 h-3 bg-blue-600 rounded-full -translate-x-1"></div>
                
                <div className="ml-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-semibold text-lg">{service.jenisPerawatan}</h5>
                        {getStatusBadge(service.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(service.tanggal).toLocaleDateString('id-ID')}
                        </span>
                        <span>{service.kilometer.toLocaleString('id-ID')} KM</span>
                        {service.bengkel && <span>{service.bengkel}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">
                        Rp {service.biaya.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {service.deskripsi}
                    </p>
                  </div>

                  {/* Parts Used */}
                  {service.spareParts && service.spareParts.length > 0 && (
                    <div className="mb-4">
                      <h6 className="font-medium text-sm text-gray-900 mb-2">Suku Cadang Digunakan:</h6>
                      <div className="space-y-1">
                        {service.spareParts.map((part, index) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                            <span>{part.nama} ({part.jumlah} unit)</span>
                            <span className="font-medium">Rp {part.harga.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {service.catatan && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h6 className="font-medium text-sm text-blue-900 mb-1">Rekomendasi Teknisi:</h6>
                      <p className="text-sm text-blue-800">{service.catatan}</p>
                    </div>
                  )}

                  {/* Next Service Due */}
                  {service.nextServiceDate && (
                    <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      <strong>Service Berikutnya:</strong> {new Date(service.nextServiceDate).toLocaleDateString('id-ID')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {serviceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ringkasan Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{serviceHistory.length}</div>
                <p className="text-sm text-gray-600">Total Service</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  Rp {serviceHistory.reduce((sum, s) => sum + s.biaya, 0).toLocaleString('id-ID')}
                </div>
                <p className="text-sm text-gray-600">Total Biaya</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  Rp {Math.round((serviceHistory.reduce((sum, s) => sum + s.biaya, 0)) / serviceHistory.length).toLocaleString('id-ID')}
                </div>
                <p className="text-sm text-gray-600">Rata-rata per Service</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {serviceHistory.filter(s => s.nextServiceDate).length}
                </div>
                <p className="text-sm text-gray-600">Service Terjadwal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceLogbook;
