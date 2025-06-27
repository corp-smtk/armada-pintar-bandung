
import { useState } from 'react';
import { Calendar, Wrench, Plus, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MaintenanceManagement = () => {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showRepairForm, setShowRepairForm] = useState(false);

  // Mock maintenance data
  const upcomingMaintenance = [
    {
      id: 1,
      platNomor: 'B 1234 AB',
      jenisServis: 'Servis Rutin',
      tanggalJadwal: '2024-07-15',
      kmTerakhir: 48500,
      kmServis: 50000,
      hariTersisa: 5,
      status: 'Terjadwal'
    },
    {
      id: 2,
      platNomor: 'B 5678 CD',
      jenisServis: 'Ganti Oli',
      tanggalJadwal: '2024-07-20',
      kmTerakhir: 35200,
      kmServis: 36000,
      hariTersisa: 10,
      status: 'Terjadwal'
    }
  ];

  const maintenanceHistory = [
    {
      id: 1,
      platNomor: 'B 1234 AB',
      tanggal: '2024-06-15',
      jenisPerbaikan: 'Servis Rutin',
      deskripsi: 'Ganti oli mesin, filter udara, dan cek sistem rem',
      biayaTotal: 850000,
      bengkel: 'Bengkel Jaya Motor',
      status: 'Selesai'
    },
    {
      id: 2,
      platNomor: 'B 5678 CD',
      tanggal: '2024-06-10',
      jenisPerbaikan: 'Perbaikan AC',
      deskripsi: 'Ganti freon dan service kompresor AC',
      biayaTotal: 650000,
      bengkel: 'AC Mobil Sejahtera',
      status: 'Selesai'
    },
    {
      id: 3,
      platNomor: 'B 9101 EF',
      tanggal: '2024-06-05',
      jenisPerbaikan: 'Ganti Ban',
      deskripsi: 'Ganti 4 ban dan wheel alignment',
      biayaTotal: 2400000,
      bengkel: 'Ban & Velg Center',
      status: 'Selesai'
    }
  ];

  const ScheduleMaintenanceForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Jadwal Perawatan Preventif</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pilihKendaraan">Pilih Kendaraan *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kendaraan untuk dijadwalkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B1234AB">B 1234 AB - Mitsubishi Canter</SelectItem>
                <SelectItem value="B5678CD">B 5678 CD - Toyota Hilux</SelectItem>
                <SelectItem value="B9101EF">B 9101 EF - Isuzu Elf</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jenisServis">Jenis Servis *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis servis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="servis-rutin">Servis Rutin</SelectItem>
                <SelectItem value="ganti-oli">Ganti Oli</SelectItem>
                <SelectItem value="tune-up">Tune Up</SelectItem>
                <SelectItem value="cek-rem">Cek Sistem Rem</SelectItem>
                <SelectItem value="ganti-ban">Ganti Ban</SelectItem>
                <SelectItem value="servis-ac">Servis AC</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="intervalKm">Interval KM</Label>
            <Input id="intervalKm" type="number" placeholder="Setiap berapa KM (contoh: 5000)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intervalBulan">Interval Bulan</Label>
            <Input id="intervalBulan" type="number" placeholder="Setiap berapa bulan (contoh: 3)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalServisTerakhir">Tanggal Servis Terakhir</Label>
            <Input id="tanggalServisTerakhir" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kmTerakhir">KM Saat Servis Terakhir</Label>
            <Input id="kmTerakhir" type="number" placeholder="48500" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="catatanJadwal">Catatan Jadwal</Label>
          <Textarea id="catatanJadwal" placeholder="Catatan khusus untuk jadwal perawatan ini..." />
        </div>
        <div className="flex gap-2 pt-4">
          <Button className="flex-1">Buat Jadwal Perawatan</Button>
          <Button variant="outline" onClick={() => setShowScheduleForm(false)}>Batal</Button>
        </div>
      </CardContent>
    </Card>
  );

  const RepairHistoryForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Catat Riwayat Perbaikan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pilihKendaraanPerbaikan">Pilih Kendaraan *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kendaraan yang diperbaiki" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B1234AB">B 1234 AB - Mitsubishi Canter</SelectItem>
                <SelectItem value="B5678CD">B 5678 CD - Toyota Hilux</SelectItem>
                <SelectItem value="B9101EF">B 9101 EF - Isuzu Elf</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalPerbaikan">Tanggal Perbaikan *</Label>
            <Input id="tanggalPerbaikan" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kmPerbaikan">KM Saat Perbaikan</Label>
            <Input id="kmPerbaikan" type="number" placeholder="50000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jenisPerbaikan">Jenis Perbaikan *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis perbaikan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="servis-rutin">Servis Rutin</SelectItem>
                <SelectItem value="perbaikan-mesin">Perbaikan Mesin</SelectItem>
                <SelectItem value="perbaikan-rem">Perbaikan Rem</SelectItem>
                <SelectItem value="perbaikan-transmisi">Perbaikan Transmisi</SelectItem>
                <SelectItem value="perbaikan-ac">Perbaikan AC</SelectItem>
                <SelectItem value="ganti-suku-cadang">Ganti Suku Cadang</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deskripsiMasalah">Deskripsi Masalah *</Label>
          <Textarea id="deskripsiMasalah" placeholder="Jelaskan masalah yang terjadi dan tindakan perbaikan yang dilakukan..." />
        </div>
        
        {/* Parts Used Section */}
        <div className="space-y-4 border-t pt-4">
          <Label className="text-base font-semibold">Suku Cadang yang Digunakan</Label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="namaSukuCadang">Nama Suku Cadang</Label>
              <Input id="namaSukuCadang" placeholder="Oli mesin, Filter udara, dll." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jumlahSukuCadang">Jumlah</Label>
              <Input id="jumlahSukuCadang" type="number" placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hargaSatuan">Harga Satuan</Label>
              <Input id="hargaSatuan" type="number" placeholder="150000" />
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="biayaJasaMekanik">Biaya Jasa Mekanik</Label>
            <Input id="biayaJasaMekanik" type="number" placeholder="300000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalBiaya">Total Biaya *</Label>
            <Input id="totalBiaya" type="number" placeholder="850000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="namaBengkel">Nama Bengkel</Label>
            <Input id="namaBengkel" placeholder="Bengkel Jaya Motor" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomorFaktur">Nomor Faktur/Invoice</Label>
            <Input id="nomorFaktur" placeholder="INV-2024-001" />
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button className="flex-1">Simpan Riwayat Perbaikan</Button>
          <Button variant="outline" onClick={() => setShowRepairForm(false)}>Batal</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Perawatan & Servis</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowScheduleForm(!showScheduleForm)} className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Jadwal Perawatan
          </Button>
          <Button onClick={() => setShowRepairForm(!showRepairForm)} variant="outline" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Catat Perbaikan
          </Button>
        </div>
      </div>

      {showScheduleForm && <ScheduleMaintenanceForm />}
      {showRepairForm && <RepairHistoryForm />}

      {/* Upcoming Maintenance Alert */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <AlertCircle className="h-5 w-5" />
            Perawatan Mendatang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingMaintenance.map((maintenance) => (
              <div key={maintenance.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-4">
                  <Clock className="h-6 w-6 text-orange-600" />
                  <div>
                    <div className="font-semibold">{maintenance.platNomor}</div>
                    <div className="text-sm text-gray-600">{maintenance.jenisServis}</div>
                    <div className="text-sm text-gray-600">KM: {maintenance.kmTerakhir.toLocaleString('id-ID')} / Target: {maintenance.kmServis.toLocaleString('id-ID')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    {maintenance.hariTersisa} hari lagi
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">
                    {maintenance.tanggalJadwal}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history">Riwayat Perawatan</TabsTrigger>
              <TabsTrigger value="schedule">Jadwal Mendatang</TabsTrigger>
              <TabsTrigger value="costs">Laporan Biaya</TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="history" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Riwayat Perawatan & Perbaikan</h3>
                  {maintenanceHistory.map((history) => (
                    <div key={history.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Wrench className="h-6 w-6 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">{history.jenisPerbaikan}</h4>
                            <p className="text-sm text-gray-600 mb-2">{history.deskripsi}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div><span className="font-medium">Kendaraan:</span> {history.platNomor}</div>
                              <div><span className="font-medium">Tanggal:</span> {history.tanggal}</div>
                              <div><span className="font-medium">Bengkel:</span> {history.bengkel}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-blue-600">
                            Rp {history.biayaTotal.toLocaleString('id-ID')}
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {history.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Jadwal Perawatan Mendatang</h3>
                  {upcomingMaintenance.map((maintenance) => (
                    <div key={maintenance.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Calendar className="h-6 w-6 text-orange-600" />
                          <div>
                            <h4 className="font-semibold">{maintenance.jenisServis}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mt-1">
                              <div><span className="font-medium">Kendaraan:</span> {maintenance.platNomor}</div>
                              <div><span className="font-medium">Tanggal:</span> {maintenance.tanggalJadwal}</div>
                              <div><span className="font-medium">KM Saat Ini:</span> {maintenance.kmTerakhir.toLocaleString('id-ID')}</div>
                              <div><span className="font-medium">Target KM:</span> {maintenance.kmServis.toLocaleString('id-ID')}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="outline" 
                            className={maintenance.hariTersisa <= 7 ? 'text-red-600 border-red-600' : 'text-orange-600 border-orange-600'}
                          >
                            {maintenance.hariTersisa} hari lagi
                          </Badge>
                          <div className="mt-2">
                            <Button size="sm" variant="outline">Edit Jadwal</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="costs" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Ringkasan Biaya Perawatan</h3>
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            Rp {maintenanceHistory.reduce((total, item) => total + item.biayaTotal, 0).toLocaleString('id-ID')}
                          </div>
                          <p className="text-sm text-gray-600">Total Biaya Perawatan</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            Rp {Math.round(maintenanceHistory.reduce((total, item) => total + item.biayaTotal, 0) / maintenanceHistory.length).toLocaleString('id-ID')}
                          </div>
                          <p className="text-sm text-gray-600">Rata-rata per Perawatan</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {maintenanceHistory.length}
                          </div>
                          <p className="text-sm text-gray-600">Total Perawatan</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Cost Report */}
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-gray-50">
                      <h4 className="font-semibold">Laporan Biaya Detail per Kendaraan</h4>
                    </div>
                    <div className="p-4">
                      <div className="space-y-4">
                        {['B 1234 AB', 'B 5678 CD', 'B 9101 EF'].map((plat) => {
                          const vehicleCosts = maintenanceHistory.filter(h => h.platNomor === plat);
                          const totalCost = vehicleCosts.reduce((sum, cost) => sum + cost.biayaTotal, 0);
                          return (
                            <div key={plat} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <div className="font-semibold">{plat}</div>
                                <div className="text-sm text-gray-600">{vehicleCosts.length} kali perawatan</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-blue-600">
                                  Rp {totalCost.toLocaleString('id-ID')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
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

export default MaintenanceManagement;
