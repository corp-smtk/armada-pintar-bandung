import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Wrench, Plus, Clock, AlertCircle, Trash2, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, MaintenanceRecord, Vehicle } from '@/services/LocalStorageService';

// Types for form data
interface ScheduleFormData {
  vehicleId: string;
  jenisServis: string;
  intervalKm: string;
  intervalBulan: string;
  tanggalServisTerakhir: string;
  kmTerakhir: string;
  catatan: string;
}

interface RepairFormData {
  vehicleId: string;
  tanggal: string;
  kilometer: string;
  jenisPerbaikan: string;
  deskripsi: string;
  biayaJasa: string;
  totalBiaya: string;
  bengkel: string;
  nomorFaktur: string;
}

interface SparePart {
  nama: string;
  jumlah: number;
  harga: number;
}

interface FormErrors {
  [key: string]: string;
}

const MaintenanceManagement = () => {
  const { toast } = useToast();

  // UI State Management
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data State Management
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // UI-only State Management (not form data)
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [calculatedTotalCost, setCalculatedTotalCost] = useState<number>(0);

  // Edit State Management
  const [editMode, setEditMode] = useState(false);
  const [editMaintenanceId, setEditMaintenanceId] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [editFormType, setEditFormType] = useState<'schedule' | 'repair'>('repair');

  // Delete State Management
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<MaintenanceRecord | null>(null);

  // Form refs for uncontrolled forms
  const scheduleFormRef = useRef<HTMLFormElement>(null);
  const repairFormRef = useRef<HTMLFormElement>(null);

  // Data fetching and refresh functionality
  const refreshData = useCallback(() => {
    setLoading(true);
    try {
      const records = localStorageService.getMaintenanceRecords();
      const vehicleData = localStorageService.getVehicles();
      setMaintenanceRecords(records);
      setVehicles(vehicleData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data perawatan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Computed data for displays
  const upcomingMaintenance = maintenanceRecords
    .filter(record => record.status === 'Dijadwalkan')
    .sort((a, b) => new Date(a.nextServiceDate || '').getTime() - new Date(b.nextServiceDate || '').getTime());

  const completedMaintenance = maintenanceRecords
    .filter(record => record.status === 'Selesai')
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // Validation Functions
  const validateScheduleFormData = (formData: FormData): FormErrors => {
    const errors: FormErrors = {};
    
    const vehicleId = formData.get('vehicleId') as string;
    const jenisServis = formData.get('jenisServis') as string;
    const intervalKm = formData.get('intervalKm') as string;
    const intervalBulan = formData.get('intervalBulan') as string;
    const tanggalServisTerakhir = formData.get('tanggalServisTerakhir') as string;
    const kmTerakhir = formData.get('kmTerakhir') as string;
    
    if (!vehicleId) errors.vehicleId = 'Pilih kendaraan wajib diisi';
    if (!jenisServis) errors.jenisServis = 'Jenis servis wajib diisi';
    if (!intervalKm && !intervalBulan) {
      errors.interval = 'Minimal satu interval (KM atau Bulan) harus diisi';
    }
    if (intervalKm && (parseInt(intervalKm) <= 0)) {
      errors.intervalKm = 'Interval KM harus lebih dari 0';
    }
    if (intervalBulan && (parseInt(intervalBulan) <= 0)) {
      errors.intervalBulan = 'Interval bulan harus lebih dari 0';
    }
    if (tanggalServisTerakhir && new Date(tanggalServisTerakhir) > new Date()) {
      errors.tanggalServisTerakhir = 'Tanggal servis terakhir tidak boleh di masa depan';
    }
    if (kmTerakhir && parseInt(kmTerakhir) < 0) {
      errors.kmTerakhir = 'KM terakhir tidak boleh negatif';
    }
    
    return errors;
  };

  const validateRepairFormData = (formData: FormData, spareParts: SparePart[]): FormErrors => {
    const errors: FormErrors = {};
    
    const vehicleId = formData.get('vehicleId') as string;
    const tanggal = formData.get('tanggal') as string;
    const jenisPerbaikan = formData.get('jenisPerbaikan') as string;
    const deskripsi = formData.get('deskripsi') as string;
    const kilometer = formData.get('kilometer') as string;
    
    if (!vehicleId) errors.vehicleId = 'Pilih kendaraan wajib diisi';
    if (!tanggal) errors.tanggal = 'Tanggal perbaikan wajib diisi';
    if (!jenisPerbaikan) errors.jenisPerbaikan = 'Jenis perbaikan wajib diisi';
    if (!deskripsi) errors.deskripsi = 'Deskripsi masalah wajib diisi';
    if (tanggal && new Date(tanggal) > new Date()) {
      errors.tanggal = 'Tanggal perbaikan tidak boleh di masa depan';
    }
    if (kilometer && parseInt(kilometer) < 0) {
      errors.kilometer = 'KM tidak boleh negatif';
    }
    
    // Validate spare parts
    spareParts.forEach((part, index) => {
      if (!part.nama.trim()) {
        errors[`sparePart_${index}_nama`] = 'Nama suku cadang wajib diisi';
      }
      if (part.jumlah <= 0) {
        errors[`sparePart_${index}_jumlah`] = 'Jumlah harus lebih dari 0';
      }
      if (part.harga <= 0) {
        errors[`sparePart_${index}_harga`] = 'Harga harus lebih dari 0';
      }
    });
    
    return errors;
  };

  // Utility Functions
  const calculateNextService = (
    lastServiceDate: string,
    lastServiceKm: number,
    intervalMonths?: number,
    intervalKm?: number,
    currentKm?: number
  ) => {
    let nextServiceDate = '';
    let nextServiceKm = 0;

    // Calculate next service date
    if (lastServiceDate && intervalMonths) {
      const lastDate = new Date(lastServiceDate);
      lastDate.setMonth(lastDate.getMonth() + intervalMonths);
      nextServiceDate = lastDate.toISOString().split('T')[0];
    }

    // Calculate next service KM
    if (intervalKm && lastServiceKm) {
      nextServiceKm = lastServiceKm + intervalKm;
    }

    return { nextServiceDate, nextServiceKm };
  };

  const resetScheduleForm = () => {
    if (scheduleFormRef.current) {
      scheduleFormRef.current.reset();
    }
  };

  const resetRepairForm = () => {
    if (repairFormRef.current) {
      repairFormRef.current.reset();
    }
    setSpareParts([]);
    setCalculatedTotalCost(0);
  };

  // Calculate total cost when spare parts change
  useEffect(() => {
    const laborCost = repairFormRef.current ? 
      parseFloat((repairFormRef.current.querySelector('[name="biayaJasa"]') as HTMLInputElement)?.value || '0') : 0;
    const total = calculateTotalCost(spareParts, laborCost);
    setCalculatedTotalCost(total);
    
    // Update the total cost field
    if (repairFormRef.current) {
      const totalField = repairFormRef.current.querySelector('[name="totalBiaya"]') as HTMLInputElement;
      if (totalField) {
        totalField.value = total.toString();
      }
    }
  }, [spareParts]);

  // Form Submission Handlers
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleFormRef.current) return;
    
    const formData = new FormData(scheduleFormRef.current);
    const errors = validateScheduleFormData(formData);
    
    if (Object.keys(errors).length > 0) {
      // Show first error
      const firstError = Object.values(errors)[0];
      toast({
        title: "Error Validasi",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const vehicleId = formData.get('vehicleId') as string;
      const jenisServis = formData.get('jenisServis') as string;
      const intervalKm = formData.get('intervalKm') as string;
      const intervalBulan = formData.get('intervalBulan') as string;
      const tanggalServisTerakhir = formData.get('tanggalServisTerakhir') as string;
      const kmTerakhir = formData.get('kmTerakhir') as string;
      const catatan = formData.get('catatan') as string;

      const selectedVehicle = vehicles.find(v => v.id === vehicleId);
      if (!selectedVehicle) {
        throw new Error("Kendaraan tidak ditemukan");
      }

      const intervalKmNum = intervalKm ? parseInt(intervalKm) : undefined;
      const intervalBulanNum = intervalBulan ? parseInt(intervalBulan) : undefined;
      const kmTerakhirNum = kmTerakhir ? parseInt(kmTerakhir) : 0;

      const { nextServiceDate, nextServiceKm } = calculateNextService(
        tanggalServisTerakhir,
        kmTerakhirNum,
        intervalBulanNum,
        intervalKmNum,
        selectedVehicle.kmTerakhir
      );

      const maintenanceData = {
        vehicleId,
        platNomor: selectedVehicle.platNomor,
        jenisPerawatan: jenisServis,
        tanggal: tanggalServisTerakhir || new Date().toISOString().split('T')[0],
        kilometer: kmTerakhirNum,
        catatan: catatan || '',
        status: 'Dijadwalkan' as const,
        intervalKm: intervalKmNum,
        intervalBulan: intervalBulanNum,
        nextServiceDate,
        nextServiceKm,
        tanggalServisTerakhir
      };

      if (editMode && editMaintenanceId) {
        localStorageService.updateMaintenanceRecord(editMaintenanceId, maintenanceData);
        toast({
          title: "Berhasil",
          description: "Jadwal perawatan berhasil diperbarui"
        });
        cancelEdit();
      } else {
        localStorageService.addMaintenanceRecord(maintenanceData);
        toast({
          title: "Berhasil",
          description: "Jadwal perawatan berhasil dibuat"
        });
      }

      refreshData();
      resetScheduleForm();
      setShowScheduleForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan jadwal perawatan",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRepairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repairFormRef.current) return;
    
    const formData = new FormData(repairFormRef.current);
    const errors = validateRepairFormData(formData, spareParts);
    
    if (Object.keys(errors).length > 0) {
      // Show first error
      const firstError = Object.values(errors)[0];
      toast({
        title: "Error Validasi",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const vehicleId = formData.get('vehicleId') as string;
      const tanggal = formData.get('tanggal') as string;
      const kilometer = formData.get('kilometer') as string;
      const jenisPerbaikan = formData.get('jenisPerbaikan') as string;
      const deskripsi = formData.get('deskripsi') as string;
      const biayaJasa = formData.get('biayaJasa') as string;
      const bengkel = formData.get('bengkel') as string;
      const nomorFaktur = formData.get('nomorFaktur') as string;

      const selectedVehicle = vehicles.find(v => v.id === vehicleId);
      if (!selectedVehicle) {
        throw new Error("Kendaraan tidak ditemukan");
      }

      const biayaJasaNum = biayaJasa ? parseFloat(biayaJasa) : 0;
      const totalBiayaNum = calculateTotalCost(spareParts, biayaJasaNum);

      const maintenanceData = {
        vehicleId,
        platNomor: selectedVehicle.platNomor,
        jenisPerawatan: jenisPerbaikan,
        tanggal,
        kilometer: kilometer ? parseInt(kilometer) : 0,
        deskripsi,
        spareParts,
        biayaJasa: biayaJasaNum,
        totalBiaya: totalBiayaNum,
        bengkel: bengkel || '',
        nomorFaktur: nomorFaktur || '',
        status: 'Selesai' as const
      };

      if (editMode && editMaintenanceId) {
        localStorageService.updateMaintenanceRecord(editMaintenanceId, maintenanceData);
        toast({
          title: "Berhasil",
          description: "Riwayat perbaikan berhasil diperbarui"
        });
        cancelEdit();
      } else {
        localStorageService.addMaintenanceRecord(maintenanceData);
        toast({
          title: "Berhasil",
          description: "Riwayat perbaikan berhasil disimpan"
        });
      }

      refreshData();
      resetRepairForm();
      setShowRepairForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan riwayat perbaikan",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Spare Parts Management
  const addSparePart = useCallback(() => {
    setSpareParts(prev => [...prev, { nama: '', jumlah: 1, harga: 0 }]);
  }, []);

  const removeSparePart = useCallback((index: number) => {
    setSpareParts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateSparePart = useCallback((index: number, field: keyof SparePart, value: string | number) => {
    setSpareParts(prev => prev.map((part, i) => 
      i === index ? { ...part, [field]: value } : part
    ));
  }, []);

  // Cost Calculation
  const calculateTotalCost = useCallback((spareParts: SparePart[], laborCost: number): number => {
    const partsTotal = spareParts.reduce((sum, part) => sum + (part.jumlah * part.harga), 0);
    return partsTotal + laborCost;
  }, []);

  // Optimized onChange handlers
  const handleLaborCostChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const laborCost = parseFloat(e.target.value) || 0;
    const total = calculateTotalCost(spareParts, laborCost);
    setCalculatedTotalCost(total);
    
    // Update total cost field
    const totalField = repairFormRef.current?.querySelector('[name="totalBiaya"]') as HTMLInputElement;
    if (totalField) {
      totalField.value = total.toString();
    }
  }, [spareParts, calculateTotalCost]);

  const handleSparePartNameChange = useCallback((index: number, value: string) => {
    updateSparePart(index, 'nama', value);
  }, [updateSparePart]);

  const handleSparePartQuantityChange = useCallback((index: number, value: string) => {
    updateSparePart(index, 'jumlah', parseInt(value) || 0);
  }, [updateSparePart]);

  const handleSparePartPriceChange = useCallback((index: number, value: string) => {
    updateSparePart(index, 'harga', parseFloat(value) || 0);
  }, [updateSparePart]);

  // Form Population Helper Functions
  const populateScheduleFormFromRecord = (record: MaintenanceRecord) => {
    if (scheduleFormRef.current) {
      scheduleFormRef.current.reset();
      setTimeout(() => {
        if (scheduleFormRef.current) {
          const form = scheduleFormRef.current;
          (form.querySelector('[name="vehicleId"]') as any)?.setAttribute('data-value', record.vehicleId);
          (form.querySelector('[name="jenisServis"]') as any)?.setAttribute('data-value', record.jenisPerawatan);
          (form.querySelector('[name="tanggalServisTerakhir"]') as HTMLInputElement).value = record.tanggalServisTerakhir || record.tanggal;
          (form.querySelector('[name="kmTerakhir"]') as HTMLInputElement).value = record.kilometer.toString();
          (form.querySelector('[name="catatan"]') as HTMLTextAreaElement).value = record.catatan || '';
          (form.querySelector('[name="intervalKm"]') as HTMLInputElement).value = record.intervalKm?.toString() || '';
          (form.querySelector('[name="intervalBulan"]') as HTMLInputElement).value = record.intervalBulan?.toString() || '';
        }
      }, 100);
    }
  };

  const populateRepairFormFromRecord = (record: MaintenanceRecord) => {
    if (repairFormRef.current) {
      repairFormRef.current.reset();
      setTimeout(() => {
        if (repairFormRef.current) {
          const form = repairFormRef.current;
          (form.querySelector('[name="vehicleId"]') as any)?.setAttribute('data-value', record.vehicleId);
          (form.querySelector('[name="jenisPerbaikan"]') as any)?.setAttribute('data-value', record.jenisPerawatan);
          (form.querySelector('[name="tanggal"]') as HTMLInputElement).value = record.tanggal;
          (form.querySelector('[name="kilometer"]') as HTMLInputElement).value = record.kilometer.toString();
          (form.querySelector('[name="deskripsi"]') as HTMLTextAreaElement).value = record.deskripsi || '';
          (form.querySelector('[name="biayaJasa"]') as HTMLInputElement).value = record.biayaJasa?.toString() || '0';
          (form.querySelector('[name="totalBiaya"]') as HTMLInputElement).value = record.totalBiaya?.toString() || '0';
          (form.querySelector('[name="bengkel"]') as HTMLInputElement).value = record.bengkel || '';
          (form.querySelector('[name="nomorFaktur"]') as HTMLInputElement).value = record.nomorFaktur || '';
        }
      }, 100);
      setSpareParts(record.spareParts || []);
    }
  };

  // Edit Handlers
  const handleEditRecord = (recordId: string) => {
    const record = maintenanceRecords.find(r => r.id === recordId);
    if (!record) {
      toast({
        title: "Error",
        description: "Record tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    setEditingRecord(record);
    setEditMaintenanceId(recordId);
    setEditMode(true);
    
    if (record.status === 'Dijadwalkan') {
      setEditFormType('schedule');
      populateScheduleFormFromRecord(record);
      setShowScheduleForm(true);
    } else {
      setEditFormType('repair');
      populateRepairFormFromRecord(record);
      setShowRepairForm(true);
    }
    
    setShowEditDialog(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditMaintenanceId('');
    setEditingRecord(null);
    setShowEditDialog(false);
    setShowScheduleForm(false);
    setShowRepairForm(false);
    resetScheduleForm();
    resetRepairForm();
  };

  // Delete Handlers
  const handleDeleteRecord = (recordId: string) => {
    const record = maintenanceRecords.find(r => r.id === recordId);
    if (!record) {
      toast({
        title: "Error",
        description: "Record tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    setDeletingRecord(record);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingRecord) return;

    try {
      localStorageService.deleteMaintenanceRecord(deletingRecord.id);
      
      toast({
        title: "Berhasil",
        description: `${deletingRecord.jenisPerawatan} untuk ${deletingRecord.platNomor} telah dihapus`,
        variant: "default",
      });

      setShowDeleteDialog(false);
      setDeletingRecord(null);
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menghapus record",
        variant: "destructive",
      });
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingRecord(null);
  };

  const ScheduleMaintenanceForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? 'Edit Jadwal Perawatan' : 'Jadwal Perawatan Preventif'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form ref={scheduleFormRef} onSubmit={handleScheduleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pilihKendaraan">Pilih Kendaraan *</Label>
              <Select name="vehicleId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kendaraan untuk dijadwalkan" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.platNomor} - {vehicle.merek} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisServis">Jenis Servis *</Label>
              <Select name="jenisServis" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis servis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Servis Rutin">Servis Rutin</SelectItem>
                  <SelectItem value="Ganti Oli">Ganti Oli</SelectItem>
                  <SelectItem value="Tune Up">Tune Up</SelectItem>
                  <SelectItem value="Cek Sistem Rem">Cek Sistem Rem</SelectItem>
                  <SelectItem value="Ganti Ban">Ganti Ban</SelectItem>
                  <SelectItem value="Servis AC">Servis AC</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="intervalKm">Interval KM</Label>
              <Input 
                id="intervalKm" 
                name="intervalKm"
                type="number" 
                placeholder="Setiap berapa KM (contoh: 5000)" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intervalBulan">Interval Bulan</Label>
              <Input 
                id="intervalBulan" 
                name="intervalBulan"
                type="number" 
                placeholder="Setiap berapa bulan (contoh: 3)" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalServisTerakhir">Tanggal Servis Terakhir</Label>
              <Input 
                id="tanggalServisTerakhir" 
                name="tanggalServisTerakhir"
                type="date" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kmTerakhir">KM Saat Servis Terakhir</Label>
              <Input 
                id="kmTerakhir" 
                name="kmTerakhir"
                type="number" 
                placeholder="48500" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="catatanJadwal">Catatan Jadwal</Label>
            <Textarea 
              id="catatanJadwal" 
              name="catatan"
              placeholder="Catatan khusus untuk jadwal perawatan ini..." 
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editMode ? 'Memperbarui Jadwal...' : 'Membuat Jadwal...'}
                </>
              ) : (
                editMode ? 'Perbarui Jadwal Perawatan' : 'Buat Jadwal Perawatan'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                if (editMode) {
                  cancelEdit();
                } else {
                  setShowScheduleForm(false);
                  resetScheduleForm();
                }
              }}
              disabled={submitting}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const RepairHistoryForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? 'Edit Riwayat Perbaikan' : 'Catat Riwayat Perbaikan'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form ref={repairFormRef} onSubmit={handleRepairSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pilihKendaraanPerbaikan">Pilih Kendaraan *</Label>
              <Select name="vehicleId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kendaraan yang diperbaiki" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.platNomor} - {vehicle.merek} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalPerbaikan">Tanggal Perbaikan *</Label>
              <Input 
                id="tanggalPerbaikan" 
                name="tanggal"
                type="date" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kmPerbaikan">KM Saat Perbaikan</Label>
              <Input 
                id="kmPerbaikan" 
                name="kilometer"
                type="number" 
                placeholder="50000" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisPerbaikan">Jenis Perbaikan *</Label>
              <Select name="jenisPerbaikan" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis perbaikan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Servis Rutin">Servis Rutin</SelectItem>
                  <SelectItem value="Perbaikan Mesin">Perbaikan Mesin</SelectItem>
                  <SelectItem value="Perbaikan Rem">Perbaikan Rem</SelectItem>
                  <SelectItem value="Perbaikan Transmisi">Perbaikan Transmisi</SelectItem>
                  <SelectItem value="Perbaikan AC">Perbaikan AC</SelectItem>
                  <SelectItem value="Ganti Suku Cadang">Ganti Suku Cadang</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deskripsiMasalah">Deskripsi Masalah *</Label>
            <Textarea 
              id="deskripsiMasalah" 
              name="deskripsi"
              placeholder="Jelaskan masalah yang terjadi dan tindakan perbaikan yang dilakukan..." 
              required
            />
          </div>
          
          {/* Dynamic Spare Parts Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Suku Cadang yang Digunakan</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addSparePart}
                disabled={submitting}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Suku Cadang
              </Button>
            </div>
            
            {spareParts.map((part, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor={`namaSukuCadang_${index}`}>Nama Suku Cadang</Label>
                  <Input 
                    id={`namaSukuCadang_${index}`} 
                    placeholder="Oli mesin, Filter udara, dll." 
                    defaultValue={part.nama}
                    onChange={(e) => handleSparePartNameChange(index, e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`jumlahSukuCadang_${index}`}>Jumlah</Label>
                  <Input 
                    id={`jumlahSukuCadang_${index}`} 
                    type="number" 
                    placeholder="1" 
                    defaultValue={part.jumlah}
                    onChange={(e) => handleSparePartQuantityChange(index, e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`hargaSatuan_${index}`}>Harga Satuan</Label>
                  <Input 
                    id={`hargaSatuan_${index}`} 
                    type="number" 
                    placeholder="150000" 
                    defaultValue={part.harga}
                    onChange={(e) => handleSparePartPriceChange(index, e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtotal</Label>
                  <Input 
                    value={`Rp ${(part.jumlah * part.harga).toLocaleString('id-ID')}`} 
                    disabled 
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => removeSparePart(index)}
                    disabled={submitting}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="biayaJasaMekanik">Biaya Jasa Mekanik</Label>
              <Input 
                id="biayaJasaMekanik" 
                name="biayaJasa"
                type="number" 
                placeholder="300000" 
                onChange={handleLaborCostChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalBiaya">Total Biaya (Auto-calculated) *</Label>
              <Input 
                id="totalBiaya" 
                name="totalBiaya"
                type="number" 
                placeholder="850000" 
                defaultValue={calculatedTotalCost}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namaBengkel">Nama Bengkel</Label>
              <Input 
                id="namaBengkel" 
                name="bengkel"
                placeholder="Bengkel Jaya Motor" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomorFaktur">Nomor Faktur/Invoice</Label>
              <Input 
                id="nomorFaktur" 
                name="nomorFaktur"
                placeholder="INV-2024-001" 
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editMode ? 'Memperbarui...' : 'Menyimpan...'}
                </>
              ) : (
                editMode ? 'Perbarui Riwayat Perbaikan' : 'Simpan Riwayat Perbaikan'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                if (editMode) {
                  cancelEdit();
                } else {
                  setShowRepairForm(false);
                  resetRepairForm();
                }
              }}
              disabled={submitting}
            >
              Batal
            </Button>
          </div>
        </form>
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
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
              <span className="ml-2 text-orange-600">Memuat data...</span>
            </div>
          ) : upcomingMaintenance.length > 0 ? (
            <div className="space-y-3">
              {upcomingMaintenance.map((maintenance) => {
                const daysRemaining = maintenance.nextServiceDate 
                  ? Math.ceil((new Date(maintenance.nextServiceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : 0;
                
                return (
                  <div key={maintenance.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-4">
                      <Clock className="h-6 w-6 text-orange-600" />
                      <div>
                        <div className="font-semibold">{maintenance.platNomor}</div>
                        <div className="text-sm text-gray-600">{maintenance.jenisPerawatan}</div>
                        <div className="text-sm text-gray-600">
                          {maintenance.kilometer > 0 && `KM Target: ${maintenance.kilometer.toLocaleString('id-ID')}`}
                          {maintenance.nextServiceKm && ` / Next: ${maintenance.nextServiceKm.toLocaleString('id-ID')}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={daysRemaining <= 7 ? 'text-red-600 border-red-600' : 'text-orange-600 border-orange-600'}
                      >
                        {daysRemaining > 0 ? `${daysRemaining} hari lagi` : 'Terlambat'}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">
                        {maintenance.nextServiceDate && new Date(maintenance.nextServiceDate).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>Tidak ada perawatan yang dijadwalkan</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setShowScheduleForm(true)}
              >
                Buat Jadwal Perawatan
              </Button>
            </div>
          )}
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
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-blue-600">Memuat data...</span>
                    </div>
                  ) : completedMaintenance.length > 0 ? (
                    completedMaintenance.map((history) => (
                      <div key={history.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <Wrench className="h-6 w-6 text-blue-600 mt-1" />
                            <div>
                              <h4 className="font-semibold">{history.jenisPerawatan}</h4>
                              <p className="text-sm text-gray-600 mb-2">{history.deskripsi}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                <div><span className="font-medium">Kendaraan:</span> {history.platNomor}</div>
                                <div><span className="font-medium">Tanggal:</span> {new Date(history.tanggal).toLocaleDateString('id-ID')}</div>
                                <div><span className="font-medium">Bengkel:</span> {history.bengkel || 'Tidak diketahui'}</div>
                              </div>
                              {history.spareParts && history.spareParts.length > 0 && (
                                <div className="mt-2">
                                  <span className="font-medium text-sm text-gray-600">Suku Cadang:</span>
                                  <div className="text-sm text-gray-600">
                                    {history.spareParts.map((part, index) => (
                                      <span key={index}>
                                        {part.nama} ({part.jumlah}x)
                                        {index < history.spareParts.length - 1 ? ', ' : ''}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-blue-600">
                              Rp {history.biaya.toLocaleString('id-ID')}
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              {history.status}
                            </Badge>
                            <div className="mt-2 flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditRecord(history.id)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteRecord(history.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Wrench className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p>Belum ada riwayat perawatan</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowRepairForm(true)}
                      >
                        Catat Perbaikan Pertama
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Jadwal Perawatan Mendatang</h3>
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                      <span className="ml-2 text-orange-600">Memuat data...</span>
                    </div>
                  ) : upcomingMaintenance.length > 0 ? (
                    upcomingMaintenance.map((maintenance) => {
                      const daysRemaining = maintenance.nextServiceDate 
                        ? Math.ceil((new Date(maintenance.nextServiceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        : 0;
                      
                      return (
                        <div key={maintenance.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Calendar className="h-6 w-6 text-orange-600" />
                              <div>
                                <h4 className="font-semibold">{maintenance.jenisPerawatan}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mt-1">
                                  <div><span className="font-medium">Kendaraan:</span> {maintenance.platNomor}</div>
                                  <div><span className="font-medium">Tanggal:</span> {maintenance.nextServiceDate ? new Date(maintenance.nextServiceDate).toLocaleDateString('id-ID') : 'Belum ditentukan'}</div>
                                  <div><span className="font-medium">KM Saat Ini:</span> {maintenance.kilometer.toLocaleString('id-ID')}</div>
                                  <div><span className="font-medium">Target KM:</span> {maintenance.nextServiceKm ? maintenance.nextServiceKm.toLocaleString('id-ID') : 'Belum ditentukan'}</div>
                                </div>
                                {maintenance.catatan && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Catatan:</span> {maintenance.catatan}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant="outline" 
                                className={daysRemaining <= 7 ? 'text-red-600 border-red-600' : 'text-orange-600 border-orange-600'}
                              >
                                {daysRemaining > 0 ? `${daysRemaining} hari lagi` : 'Terlambat'}
                              </Badge>
                              <div className="mt-2 flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditRecord(maintenance.id)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteRecord(maintenance.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p>Belum ada jadwal perawatan</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowScheduleForm(true)}
                      >
                        Buat Jadwal Pertama
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="costs" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Ringkasan Biaya Perawatan</h3>
                  
                  {/* Summary Cards */}
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                      <span className="ml-2 text-purple-600">Memuat data...</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                Rp {completedMaintenance.reduce((total, item) => total + item.biaya, 0).toLocaleString('id-ID')}
                              </div>
                              <p className="text-sm text-gray-600">Total Biaya Perawatan</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {completedMaintenance.length > 0 ? (
                                  `Rp ${Math.round(completedMaintenance.reduce((total, item) => total + item.biaya, 0) / completedMaintenance.length).toLocaleString('id-ID')}`
                                ) : (
                                  'Rp 0'
                                )}
                              </div>
                              <p className="text-sm text-gray-600">Rata-rata per Perawatan</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {completedMaintenance.length}
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
                          {vehicles.length > 0 ? (
                            <div className="space-y-4">
                              {vehicles.map((vehicle) => {
                                const vehicleCosts = completedMaintenance.filter(h => h.vehicleId === vehicle.id);
                                const totalCost = vehicleCosts.reduce((sum, cost) => sum + cost.biaya, 0);
                                return (
                                  <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded">
                                    <div>
                                      <div className="font-semibold">{vehicle.platNomor}</div>
                                      <div className="text-sm text-gray-600">
                                        {vehicleCosts.length} kali perawatan - {vehicle.merek} {vehicle.model}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold text-blue-600">
                                        Rp {totalCost.toLocaleString('id-ID')}
                                      </div>
                                      {vehicleCosts.length > 0 && (
                                        <div className="text-sm text-gray-600">
                                          Avg: Rp {Math.round(totalCost / vehicleCosts.length).toLocaleString('id-ID')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p>Belum ada data kendaraan</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus record perawatan "{deletingRecord?.jenisPerawatan}" 
              untuk kendaraan {deletingRecord?.platNomor}?
              <br />
              <br />
              <strong>Tindakan ini tidak dapat dibatalkan.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MaintenanceManagement;
