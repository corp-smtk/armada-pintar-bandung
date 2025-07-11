import { useState, useEffect, useCallback, useMemo } from 'react';
import { DollarSign, Plus, TrendingUp, FileBarChart, Calendar, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, OperationalCost, Vehicle } from '@/services/LocalStorageService';

const CostReporting = () => {
  const { toast } = useToast();
  const [costs, setCosts] = useState<OperationalCost[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showCostForm, setShowCostForm] = useState(false);
  const [editingCost, setEditingCost] = useState<OperationalCost | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  
  // Optimized form data state management
  const [formData, setFormData] = useState({
    vehicleId: '',
    tanggal: '',
    jenisBiaya: '',
    deskripsi: '',
    jumlah: '',
    lokasi: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(() => {
    const loadedCosts = localStorageService.getOperationalCosts();
    const loadedVehicles = localStorageService.getVehicles();
    setCosts(loadedCosts);
    setVehicles(loadedVehicles);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleId || !formData.tanggal || !formData.jenisBiaya || 
        !formData.deskripsi || !formData.jumlah) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
      if (!selectedVehicle) {
        throw new Error("Kendaraan tidak ditemukan");
      }

      const costData = {
        vehicleId: formData.vehicleId,
        tanggal: formData.tanggal,
        jenisBiaya: formData.jenisBiaya,
        deskripsi: formData.deskripsi,
        jumlah: parseInt(formData.jumlah) || 0,
        lokasi: formData.lokasi,
        platNomor: selectedVehicle.platNomor,
        kategori: getCostCategory(formData.jenisBiaya)
      } as Omit<OperationalCost, 'id' | 'createdAt' | 'updatedAt'>;

      if (editingCost) {
        localStorageService.updateOperationalCost(editingCost.id, costData);
        toast({
          title: "Berhasil",
          description: "Data biaya berhasil diperbarui"
        });
      } else {
        localStorageService.addOperationalCost(costData);
        toast({
          title: "Berhasil",
          description: "Biaya operasional berhasil dicatat"
        });
      }

      loadData();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan data biaya",
        variant: "destructive"
      });
    }
  }, [formData, vehicles, editingCost, loadData, toast]);

  const getCostCategory = (jenisBiaya: string): 'Operasional' | 'Perawatan' | 'Administrasi' => {
    if (['Bahan Bakar', 'Tol', 'Parkir'].includes(jenisBiaya)) return 'Operasional';
    if (['Perawatan'].includes(jenisBiaya)) return 'Perawatan';
    return 'Administrasi';
  };

  const handleEdit = useCallback((cost: OperationalCost) => {
    setEditingCost(cost);
    setFormData({
      vehicleId: cost.vehicleId,
      tanggal: cost.tanggal,
      jenisBiaya: cost.jenisBiaya,
      deskripsi: cost.deskripsi,
      jumlah: cost.jumlah.toString(),
      lokasi: cost.lokasi || ''
    });
    setShowCostForm(true);
  }, []);

  const handleDelete = (cost: OperationalCost) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data biaya ${cost.deskripsi}?`)) {
      try {
        localStorageService.deleteOperationalCost(cost.id);
        loadData();
        toast({
          title: "Berhasil",
          description: "Data biaya berhasil dihapus"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus data biaya",
          variant: "destructive"
        });
      }
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      vehicleId: '',
      tanggal: '',
      jenisBiaya: '',
      deskripsi: '',
      jumlah: '',
      lokasi: ''
    });
    setEditingCost(null);
    setShowCostForm(false);
  }, []);

  // Form input change handlers with useCallback for optimization
  const handleVehicleChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, vehicleId: value }));
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, tanggal: e.target.value }));
  }, []);

  const handleJenisBiayaChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, jenisBiaya: value }));
  }, []);

  const handleJumlahChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, jumlah: value }));
  }, []);

  const handleDeskripsiChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, deskripsi: e.target.value }));
  }, []);

  const handleLokasiChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, lokasi: e.target.value }));
  }, []);

  // Filter costs based on selected period
  const filteredCosts = useMemo(() => {
    const now = new Date();
    
    return costs.filter(cost => {
      const costDate = new Date(cost.tanggal);
      
      switch (selectedPeriod) {
        case 'this-month':
          return costDate.getMonth() === now.getMonth() && 
                 costDate.getFullYear() === now.getFullYear();
        
        case 'last-month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return costDate.getMonth() === lastMonth.getMonth() && 
                 costDate.getFullYear() === lastMonth.getFullYear();
        
        case 'this-quarter':
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const costQuarter = Math.floor(costDate.getMonth() / 3);
          return costQuarter === currentQuarter && 
                 costDate.getFullYear() === now.getFullYear();
        
        case 'custom':
          // For now, show all data when custom is selected
          // TODO: Add date range picker for custom period
          return true;
        
        default:
          return true;
      }
    });
  }, [costs, selectedPeriod]);

  // Calculate summary statistics using filtered costs
  const totalOperationalCost = filteredCosts.reduce((sum, cost) => sum + cost.jumlah, 0);
  const fuelCosts = filteredCosts.filter(c => c.jenisBiaya === 'Bahan Bakar').reduce((sum, cost) => sum + cost.jumlah, 0);
  const tollCosts = filteredCosts.filter(c => c.jenisBiaya === 'Tol').reduce((sum, cost) => sum + cost.jumlah, 0);
  const otherCosts = totalOperationalCost - fuelCosts - tollCosts;

  // Group filtered costs by vehicle
  const costsByVehicle = filteredCosts.reduce((acc, cost) => {
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
      'Perawatan': 'bg-purple-100 text-purple-800',
      'Asuransi': 'bg-indigo-100 text-indigo-800',
      'Pajak': 'bg-pink-100 text-pink-800',
      'Lain-lain': 'bg-gray-100 text-gray-800'
    };
    return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
  };

  // Get period description for user feedback
  const getPeriodDescription = (period: string) => {
    const now = new Date();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    switch (period) {
      case 'this-month':
        return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return `${monthNames[lastMonth.getMonth()]} ${lastMonth.getFullYear()}`;
      case 'this-quarter':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `Kuartal ${quarter} ${now.getFullYear()}`;
      case 'custom':
        return 'Periode Kustom (Semua Data)';
      default:
        return 'Semua Data';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pelaporan Biaya Operasional</h1>
        <Button onClick={() => setShowCostForm(!showCostForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Catat Biaya
        </Button>
      </div>

      {showCostForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCost ? 'Edit Biaya Operasional' : 'Catat Biaya Operasional'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleId">Pilih Kendaraan *</Label>
                  <Select value={formData.vehicleId} onValueChange={handleVehicleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kendaraan" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.platNomor} - {vehicle.merek} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggal">Tanggal *</Label>
                  <Input 
                    id="tanggal" 
                    type="date" 
                    value={formData.tanggal}
                    onChange={handleDateChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jenisBiaya">Jenis Biaya *</Label>
                  <Select value={formData.jenisBiaya} onValueChange={handleJenisBiayaChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis biaya" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bahan Bakar">Bahan Bakar</SelectItem>
                      <SelectItem value="Tol">Tol</SelectItem>
                      <SelectItem value="Parkir">Parkir</SelectItem>
                      <SelectItem value="Denda">Denda</SelectItem>
                      <SelectItem value="Perawatan">Perawatan</SelectItem>
                      <SelectItem value="Asuransi">Asuransi</SelectItem>
                      <SelectItem value="Pajak">Pajak</SelectItem>
                      <SelectItem value="Lain-lain">Lain-lain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jumlah">Jumlah Biaya *</Label>
                  <Input 
                    id="jumlah" 
                    type="number" 
                    placeholder="450000" 
                    value={formData.jumlah}
                    onChange={handleJumlahChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi *</Label>
                <Textarea 
                  id="deskripsi" 
                  placeholder="Isi solar di SPBU Shell Pasteur..." 
                  value={formData.deskripsi}
                  onChange={handleDeskripsiChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lokasi">Lokasi Transaksi</Label>
                <Input 
                  id="lokasi" 
                  placeholder="SPBU Shell Pasteur, Tol Cipularang, dll." 
                  value={formData.lokasi}
                  onChange={handleLokasiChange}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCost ? 'Update Biaya' : 'Simpan Biaya'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
            <p className="text-xs text-gray-500">total tercatat</p>
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
              {totalOperationalCost > 0 ? Math.round((fuelCosts / totalOperationalCost) * 100) : 0}% dari total
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
              {totalOperationalCost > 0 ? Math.round((tollCosts / totalOperationalCost) * 100) : 0}% dari total
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
              {totalOperationalCost > 0 ? Math.round((otherCosts / totalOperationalCost) * 100) : 0}% dari total
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
                <div>
                  <h3 className="text-lg font-semibold">Laporan Biaya Operasional</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Menampilkan data untuk: <span className="font-medium text-blue-600">{getPeriodDescription(selectedPeriod)}</span>
                  </p>
                  {filteredCosts.length !== costs.length && (
                    <Badge variant="outline" className="mt-2 text-blue-600 border-blue-600">
                      {filteredCosts.length} dari {costs.length} transaksi
                    </Badge>
                  )}
                </div>
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
                  {filteredCosts.length > 0 ? (
                    filteredCosts.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map((cost) => (
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
                                <div><span className="font-medium">Lokasi:</span> {cost.lokasi || 'N/A'}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-lg font-semibold text-blue-600">
                                Rp {cost.jumlah.toLocaleString('id-ID')}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(cost)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(cost)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Belum ada transaksi yang dicatat</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="by-vehicle" className="mt-0">
                <div className="space-y-4">
                  <h4 className="font-semibold">Biaya Operasional per Kendaraan</h4>
                  {Object.keys(costsByVehicle).length > 0 ? (
                    Object.entries(costsByVehicle).map(([platNomor, totalCost]) => {
                      const vehicleCosts = filteredCosts.filter(c => c.platNomor === platNomor);
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
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Belum ada data biaya per kendaraan</p>
                    </div>
                  )}
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
                                {totalOperationalCost > 0 ? Math.round((fuelCosts / totalOperationalCost) * 100) : 0}%
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
                                {totalOperationalCost > 0 ? Math.round((tollCosts / totalOperationalCost) * 100) : 0}%
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
                                {totalOperationalCost > 0 ? Math.round((otherCosts / totalOperationalCost) * 100) : 0}%
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
                              Rp {Object.keys(costsByVehicle).length > 0 ? Math.round(totalOperationalCost / Object.keys(costsByVehicle).length).toLocaleString('id-ID') : 0}
                            </div>
                            <p className="text-sm text-gray-600">Rata-rata biaya per kendaraan</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded">
                            <div className="text-2xl font-bold text-green-600">
                              {filteredCosts.length}
                            </div>
                            <p className="text-sm text-gray-600">Total transaksi tercatat</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded">
                            <div className="text-2xl font-bold text-purple-600">
                              {Object.keys(costsByVehicle).length}
                            </div>
                            <p className="text-sm text-gray-600">Kendaraan dengan data biaya</p>
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
