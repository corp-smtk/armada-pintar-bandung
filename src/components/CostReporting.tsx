
import { useState } from 'react';
import { DollarSign, Plus, TrendingUp, FileBarChart, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const CostReporting = () => {
  const [showCostForm, setShowCostForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');

  // Mock cost data
  const operationalCosts = [
    {
      id: 1,
      platNomor: 'B 1234 AB',
      tanggal: '2024-06-25',
      jenisBiaya: 'Bahan Bakar',
      deskripsi: 'Isi solar di SPBU Shell',
      jumlah: 450000,
      lokasi: 'SPBU Shell Pasteur'
    },
    {
      id: 2,
      platNomor: 'B 5678 CD',
      tanggal: '2024-06-24',
      jenisBiaya: 'Tol',
      deskripsi: 'Tol Jakarta-Bandung PP',
      jumlah: 85000,
      lokasi: 'Tol Cipularang'
    },
    {
      id: 3,
      platNomor: 'B 1234 AB',
      tanggal: '2024-06-23',
      jenisBiaya: 'Parkir',
      deskripsi: 'Parkir di terminal LPG',
      jumlah: 15000,
      lokasi: 'Terminal LPG Gedebage'
    },
    {
      id: 4,
      platNomor: 'B 9101 EF',
      tanggal: '2024-06-22',
      jenisBiaya: 'Bahan Bakar',
      deskripsi: 'Isi solar',
      jumlah: 380000,
      lokasi: 'SPBU Pertamina'
    },
    {
      id: 5,
      platNomor: 'B 5678 CD',
      tanggal: '2024-06-21',
      jenisBiaya: 'Denda',
      deskripsi: 'Denda parkir berlebih',
      jumlah: 50000,
      lokasi: 'Samsat Bandung'
    }
  ];

  // Calculate summary statistics
  const totalOperationalCost = operationalCosts.reduce((sum, cost) => sum + cost.jumlah, 0);
  const fuelCosts = operationalCosts.filter(c => c.jenisBiaya === 'Bahan Bakar').reduce((sum, cost) => sum + cost.jumlah, 0);
  const tollCosts = operationalCosts.filter(c => c.jenisBiaya === 'Tol').reduce((sum, cost) => sum + cost.jumlah, 0);
  const otherCosts = totalOperationalCost - fuelCosts - tollCosts;

  // Group costs by vehicle
  const costsByVehicle = operationalCosts.reduce((acc, cost) => {
    if (!acc[cost.platNomor]) {
      acc[cost.platNomor] = 0;
    }
    acc[cost.platNomor] += cost.jumlah;
    return acc;
  }, {} as Record<string, number>);

  const getCostTypeBadge = (type: string) => {
    const typeColors = {
      'Bahan Bakar': 'bg-blue-100 text-blue-800',
      'Tol': 'bg-green-100 text-green-800',
      'Parkir': 'bg-yellow-100 text-yellow-800',
      'Denda': 'bg-red-100 text-red-800',
      'Lain-lain': 'bg-gray-100 text-gray-800'
    };
    return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
  };

  const CostEntryForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Catat Biaya Operasional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pilihKendaraanBiaya">Pilih Kendaraan *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kendaraan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B1234AB">B 1234 AB - Mitsubishi Canter</SelectItem>
                <SelectItem value="B5678CD">B 5678 CD - Toyota Hilux</SelectItem>
                <SelectItem value="B9101EF">B 9101 EF - Isuzu Elf</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalBiaya">Tanggal *</Label>
            <Input id="tanggalBiaya" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jenisBiaya">Jenis Biaya *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis biaya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bahan-bakar">Bahan Bakar</SelectItem>
                <SelectItem value="tol">Tol</SelectItem>
                <SelectItem value="parkir">Parkir</SelectItem>
                <SelectItem value="denda">Denda</SelectItem>
                <SelectItem value="perawatan">Perawatan</SelectItem>
                <SelectItem value="asuransi">Asuransi</SelectItem>
                <SelectItem value="pajak">Pajak</SelectItem>
                <SelectItem value="lain-lain">Lain-lain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jumlahBiaya">Jumlah Biaya *</Label>
            <Input id="jumlahBiaya" type="number" placeholder="450000" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deskripsiBiaya">Deskripsi *</Label>
          <Textarea id="deskripsiBiaya" placeholder="Isi solar di SPBU Shell Pasteur..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lokasiTransaksi">Lokasi Transaksi</Label>
          <Input id="lokasiTransaksi" placeholder="SPBU Shell Pasteur, Tol Cipularang, dll." />
        </div>
        <div className="flex gap-2 pt-4">
          <Button className="flex-1">Simpan Biaya</Button>
          <Button variant="outline" onClick={() => setShowCostForm(false)}>Batal</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pelaporan Biaya Operasional</h1>
        <Button onClick={() => setShowCostForm(!showCostForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Catat Biaya
        </Button>
      </div>

      {showCostForm && <CostEntryForm />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Biaya Operasional</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rp {totalOperationalCost.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-500">bulan ini</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Biaya Bahan Bakar</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {fuelCosts.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-500">
              {Math.round((fuelCosts / totalOperationalCost) * 100)}% dari total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Biaya Tol</CardTitle>
            <FileBarChart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              Rp {tollCosts.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-500">
              {Math.round((tollCosts / totalOperationalCost) * 100)}% dari total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Biaya Lainnya</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              Rp {otherCosts.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-500">
              {Math.round((otherCosts / totalOperationalCost) * 100)}% dari total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Reports Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent">Transaksi Terbaru</TabsTrigger>
              <TabsTrigger value="by-vehicle">Per Kendaraan</TabsTrigger>
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              {/* Period Selector */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Laporan Biaya Operasional</h3>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">Bulan Ini</SelectItem>
                    <SelectItem value="last-month">Bulan Lalu</SelectItem>
                    <SelectItem value="this-quarter">Kuartal Ini</SelectItem>
                    <SelectItem value="custom">Periode Kustom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="recent" className="mt-0">
                <div className="space-y-4">
                  {operationalCosts.map((cost) => (
                    <div key={cost.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <DollarSign className="h-6 w-6 text-blue-600" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{cost.deskripsi}</h4>
                              <Badge className={getCostTypeBadge(cost.jenisBiaya)}>
                                {cost.jenisBiaya}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div><span className="font-medium">Kendaraan:</span> {cost.platNomor}</div>
                              <div><span className="font-medium">Tanggal:</span> {cost.tanggal}</div>
                              <div><span className="font-medium">Lokasi:</span> {cost.lokasi}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-blue-600">
                            Rp {cost.jumlah.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="by-vehicle" className="mt-0">
                <div className="space-y-4">
                  <h4 className="font-semibold">Biaya Operasional per Kendaraan</h4>
                  {Object.entries(costsByVehicle).map(([platNomor, totalCost]) => {
                    const vehicleCosts = operationalCosts.filter(c => c.platNomor === platNomor);
                    return (
                      <Card key={platNomor}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{platNomor}</CardTitle>
                            <div className="text-xl font-bold text-blue-600">
                              Rp {totalCost.toLocaleString('id-ID')}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {vehicleCosts.map((cost) => (
                              <div key={cost.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <div className="font-medium text-sm">{cost.deskripsi}</div>
                                  <div className="text-xs text-gray-600">{cost.tanggal} • {cost.jenisBiaya}</div>
                                </div>
                                <div className="font-semibold">
                                  Rp {cost.jumlah.toLocaleString('id-ID')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="summary" className="mt-0">
                <div className="space-y-6">
                  <h4 className="font-semibold">Ringkasan Biaya Operasional Armada</h4>
                  
                  {/* Cost Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Breakdown Biaya per Kategori</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span>Bahan Bakar</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">Rp {fuelCosts.toLocaleString('id-ID')}</div>
                              <div className="text-sm text-gray-600">
                                {Math.round((fuelCosts / totalOperationalCost) * 100)}%
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span>Tol</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">Rp {tollCosts.toLocaleString('id-ID')}</div>
                              <div className="text-sm text-gray-600">
                                {Math.round((tollCosts / totalOperationalCost) * 100)}%
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span>Lainnya</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">Rp {otherCosts.toLocaleString('id-ID')}</div>
                              <div className="text-sm text-gray-600">
                                {Math.round((otherCosts / totalOperationalCost) * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Statistik Armada</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center p-4 bg-blue-50 rounded">
                            <div className="text-2xl font-bold text-blue-600">
                              Rp {Math.round(totalOperationalCost / Object.keys(costsByVehicle).length).toLocaleString('id-ID')}
                            </div>
                            <p className="text-sm text-gray-600">Rata-rata biaya per kendaraan</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded">
                            <div className="text-2xl font-bold text-green-600">
                              {operationalCosts.length}
                            </div>
                            <p className="text-sm text-gray-600">Total transaksi bulan ini</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded">
                            <div className="text-2xl font-bold text-purple-600">
                              {Object.keys(costsByVehicle).length}
                            </div>
                            <p className="text-sm text-gray-600">Kendaraan aktif beroperasi</p>
                          </div>
                        </div>
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

export default CostReporting;
