
import { useState } from 'react';
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

interface ServiceLogbookProps {
  vehicleId: string;
}

const ServiceLogbook = ({ vehicleId }: ServiceLogbookProps) => {
  const [showAddEntry, setShowAddEntry] = useState(false);

  // Mock service history data
  const serviceHistory = [
    {
      id: 1,
      tanggal: '2024-06-15',
      kmSaatService: 48500,
      jenisService: 'Servis Rutin',
      deskripsi: 'Ganti oli mesin Shell Helix HX5 10W-40, ganti filter udara, cek sistem rem dan suspensi',
      sukuCadang: [
        { nama: 'Oli Mesin Shell Helix HX5', jumlah: 6, satuan: 'liter', harga: 85000 },
        { nama: 'Filter Udara', jumlah: 1, satuan: 'pcs', harga: 125000 },
        { nama: 'Filter Oli', jumlah: 1, satuan: 'pcs', harga: 45000 }
      ],
      biayaJasa: 200000,
      totalBiaya: 755000,
      teknisi: 'Budi - Bengkel Jaya Motor',
      status: 'Selesai',
      rekomendasi: 'Service berikutnya di KM 53.500 atau 3 bulan lagi. Perhatikan suara rem yang mulai kasar.',
      buktiService: ['invoice-001.pdf', 'foto-sebelum.jpg', 'foto-sesudah.jpg'],
      nextServiceDue: '2024-09-15'
    },
    {
      id: 2,
      tanggal: '2024-05-20',
      kmSaatService: 46200,
      jenisService: 'Perbaikan AC',
      deskripsi: 'Service AC tidak dingin - ganti freon R134a dan bersihkan evaporator',
      sukuCadang: [
        { nama: 'Freon R134a', jumlah: 1, satuan: 'kaleng', harga: 180000 },
        { nama: 'Pembersih AC', jumlah: 1, satuan: 'botol', harga: 35000 }
      ],
      biayaJasa: 150000,
      totalBiaya: 365000,
      teknisi: 'Ahmad - AC Mobil Sejahtera',
      status: 'Selesai',
      rekomendasi: 'AC sudah normal kembali. Disarankan service AC rutin setiap 6 bulan.',
      buktiService: ['invoice-002.pdf'],
      nextServiceDue: null
    },
    {
      id: 3,
      tanggal: '2024-04-10',
      kmSaatService: 44800,
      jenisService: 'Ganti Ban',
      deskripsi: 'Ganti 4 ban depan dan belakang karena sudah tipis, wheel alignment dan balancing',
      sukuCadang: [
        { nama: 'Ban Bridgestone 185/65 R15', jumlah: 4, satuan: 'pcs', harga: 485000 }
      ],
      biayaJasa: 200000,
      totalBiaya: 2140000,
      teknisi: 'Dedi - Ban & Velg Center',
      status: 'Selesai',
      rekomendasi: 'Ban baru sudah terpasang dengan baik. Cek tekanan angin rutin setiap minggu.',
      buktiService: ['invoice-003.pdf', 'foto-ban-baru.jpg'],
      nextServiceDue: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selesai':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Selesai</Badge>;
      case 'Dalam Progress':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Dalam Progress</Badge>;
      case 'Menunggu':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Menunggu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const AddServiceEntryForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Entry Service Baru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tanggalService">Tanggal Service *</Label>
            <Input id="tanggalService" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kmService">KM Saat Service *</Label>
            <Input id="kmService" type="number" placeholder="48500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jenisService">Jenis Service *</Label>
            <Select>
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
            <Input id="teknisiService" placeholder="Nama teknisi - Nama bengkel" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deskripsiService">Deskripsi Detail Service *</Label>
          <Textarea 
            id="deskripsiService" 
            placeholder="Jelaskan secara detail pekerjaan yang dilakukan, kondisi yang ditemukan, dan tindakan yang diambil..."
            rows={4}
          />
        </div>

        {/* Parts Section */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Suku Cadang yang Digunakan</Label>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Tambah Suku Cadang
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="namaSukuCadang">Nama Suku Cadang</Label>
              <Input id="namaSukuCadang" placeholder="Oli mesin, Filter, dll." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jumlahSukuCadang">Jumlah</Label>
              <Input id="jumlahSukuCadang" type="number" placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="satuanSukuCadang">Satuan</Label>
              <Select>
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
              <Input id="hargaSukuCadang" type="number" placeholder="150000" />
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="biayaJasaService">Biaya Jasa Service</Label>
            <Input id="biayaJasaService" type="number" placeholder="200000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalBiayaService">Total Biaya Service *</Label>
            <Input id="totalBiayaService" type="number" placeholder="755000" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rekomendasiService">Rekomendasi & Catatan Teknisi</Label>
          <Textarea 
            id="rekomendasiService" 
            placeholder="Rekomendasi untuk service berikutnya, kondisi komponen yang perlu diperhatikan, dll..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextServiceDate">Tanggal Service Berikutnya (Estimasi)</Label>
          <Input id="nextServiceDate" type="date" />
        </div>

        {/* File Upload Section */}
        <div className="space-y-4 border-t pt-4">
          <Label className="text-base font-semibold">Upload Bukti & Dokumentasi</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Invoice/Struk</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Upload Invoice</p>
                <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Foto Sebelum Service</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Upload Foto</p>
                <input type="file" className="hidden" accept=".jpg,.png" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Foto Sesudah Service</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Upload Foto</p>
                <input type="file" className="hidden" accept=".jpg,.png" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button className="flex-1">Simpan Entry Service</Button>
          <Button variant="outline" onClick={() => setShowAddEntry(false)}>Batal</Button>
        </div>
      </CardContent>
    </Card>
  );

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
        
        {serviceHistory.map((service) => (
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
                      <h5 className="font-semibold text-lg">{service.jenisService}</h5>
                      {getStatusBadge(service.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {service.tanggal}
                      </span>
                      <span>{service.kmSaatService.toLocaleString('id-ID')} KM</span>
                      <span>{service.teknisi}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">
                      Rp {service.totalBiaya.toLocaleString('id-ID')}
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
                {service.sukuCadang.length > 0 && (
                  <div className="mb-4">
                    <h6 className="font-medium text-sm text-gray-900 mb-2">Suku Cadang Digunakan:</h6>
                    <div className="space-y-1">
                      {service.sukuCadang.map((part, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <span>{part.nama} ({part.jumlah} {part.satuan})</span>
                          <span className="font-medium">Rp {part.harga.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-sm">
                      <span>Biaya Jasa:</span>
                      <span className="font-medium">Rp {service.biayaJasa.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {service.rekomendasi && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h6 className="font-medium text-sm text-blue-900 mb-1">Rekomendasi Teknisi:</h6>
                    <p className="text-sm text-blue-800">{service.rekomendasi}</p>
                  </div>
                )}

                {/* Files */}
                {service.buktiService.length > 0 && (
                  <div className="mb-4">
                    <h6 className="font-medium text-sm text-gray-900 mb-2">Bukti Service:</h6>
                    <div className="flex gap-2 flex-wrap">
                      {service.buktiService.map((file, index) => (
                        <Button key={index} variant="outline" size="sm" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {file}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Service Due */}
                {service.nextServiceDue && (
                  <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                    <strong>Service Berikutnya:</strong> {service.nextServiceDue}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
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
                Rp {serviceHistory.reduce((sum, s) => sum + s.totalBiaya, 0).toLocaleString('id-ID')}
              </div>
              <p className="text-sm text-gray-600">Total Biaya</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((serviceHistory.reduce((sum, s) => sum + s.totalBiaya, 0)) / serviceHistory.length).toLocaleString('id-ID')}
              </div>
              <p className="text-sm text-gray-600">Rata-rata per Service</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {serviceHistory.filter(s => s.nextServiceDue).length}
              </div>
              <p className="text-sm text-gray-600">Service Terjadwal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceLogbook;
