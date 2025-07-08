import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
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
import { reminderService } from './ReminderService';

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
  bengkel: string;
  nomorFaktur: string;
}

interface SparePart {
  id: string;
  nama: string;
  jumlah: number;
  harga: number;
}

interface FormErrors {
  [key: string]: string;
}

// Separate ScheduleForm component to prevent re-creation on parent re-renders
interface ScheduleFormProps {
  formData: ScheduleFormData;
  vehicles: Vehicle[];
  editMode: boolean;
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (field: keyof ScheduleFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ScheduleForm = memo<ScheduleFormProps>(({
  formData,
  vehicles,
  editMode,
  submitting,
  onInputChange,
  onSelectChange,
  onSubmit,
  onCancel
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{editMode ? 'Edit Jadwal Perawatan' : 'Jadwal Perawatan Preventif'}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pilihKendaraan">Pilih Kendaraan *</Label>
            <Select 
              value={formData.vehicleId} 
              onValueChange={(value) => onSelectChange('vehicleId', value)}
              required
            >
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
            <Select 
              value={formData.jenisServis} 
              onValueChange={(value) => onSelectChange('jenisServis', value)}
              required
            >
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
              value={formData.intervalKm}
              onChange={onInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intervalBulan">Interval Bulan</Label>
            <Input 
              id="intervalBulan" 
              name="intervalBulan"
              type="number" 
              placeholder="Setiap berapa bulan (contoh: 3)" 
              value={formData.intervalBulan}
              onChange={onInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalServisTerakhir">Tanggal Servis Terakhir</Label>
            <Input 
              id="tanggalServisTerakhir" 
              name="tanggalServisTerakhir"
              type="date" 
              value={formData.tanggalServisTerakhir}
              onChange={onInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kmTerakhir">KM Saat Servis Terakhir</Label>
            <Input 
              id="kmTerakhir" 
              name="kmTerakhir"
              type="number" 
              placeholder="48500" 
              value={formData.kmTerakhir}
              onChange={onInputChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="catatanJadwal">Catatan Jadwal</Label>
          <Textarea 
            id="catatanJadwal" 
            name="catatan"
            placeholder="Catatan khusus untuk jadwal perawatan ini..." 
            value={formData.catatan}
            onChange={onInputChange}
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
            onClick={onCancel}
            disabled={submitting}
          >
            Batal
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
));

// Separate RepairForm component to prevent re-creation on parent re-renders
interface RepairFormProps {
  formData: RepairFormData;
  spareParts: SparePart[];
  vehicles: Vehicle[];
  calculatedTotalCost: number;
  editMode: boolean;
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (field: keyof RepairFormData, value: string) => void;
  onSparePartAdd: () => void;
  onSparePartRemove: (index: number) => void;
  onSparePartNameChange: (index: number, value: string) => void;
  onSparePartQuantityChange: (index: number, value: string) => void;
  onSparePartPriceChange: (index: number, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const RepairForm = memo<RepairFormProps>(({
  formData,
  spareParts,
  vehicles,
  calculatedTotalCost,
  editMode,
  submitting,
  onInputChange,
  onSelectChange,
  onSparePartAdd,
  onSparePartRemove,
  onSparePartNameChange,
  onSparePartQuantityChange,
  onSparePartPriceChange,
  onSubmit,
  onCancel
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{editMode ? 'Edit Riwayat Perbaikan' : 'Catat Riwayat Perbaikan'}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pilihKendaraanPerbaikan">Pilih Kendaraan *</Label>
            <Select 
              value={formData.vehicleId} 
              onValueChange={(value) => onSelectChange('vehicleId', value)}
              required
            >
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
              value={formData.tanggal}
              onChange={onInputChange}
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
              value={formData.kilometer}
              onChange={onInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jenisPerbaikan">Jenis Perbaikan *</Label>
            <Select 
              value={formData.jenisPerbaikan} 
              onValueChange={(value) => onSelectChange('jenisPerbaikan', value)}
              required
            >
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
            value={formData.deskripsi}
            onChange={onInputChange}
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
              onClick={onSparePartAdd}
              disabled={submitting}
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah Suku Cadang
            </Button>
          </div>
          
          {spareParts.map((part, index) => (
            <div key={part.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor={`namaSukuCadang_${index}`}>Nama Suku Cadang</Label>
                <Input 
                  id={`namaSukuCadang_${index}`} 
                  placeholder="Oli mesin, Filter udara, dll." 
                  value={part.nama}
                  onChange={(e) => onSparePartNameChange(index, e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`jumlahSukuCadang_${index}`}>Jumlah</Label>
                <Input 
                  id={`jumlahSukuCadang_${index}`} 
                  type="number" 
                  placeholder="1" 
                  value={part.jumlah.toString()}
                  onChange={(e) => onSparePartQuantityChange(index, e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`hargaSatuan_${index}`}>Harga Satuan</Label>
                <Input 
                  id={`hargaSatuan_${index}`} 
                  type="number" 
                  placeholder="150000" 
                  value={part.harga > 0 ? part.harga.toString() : ''}
                  onChange={(e) => onSparePartPriceChange(index, e.target.value)}
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
                  onClick={() => onSparePartRemove(index)}
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
              value={formData.biayaJasa}
              onChange={onInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalBiaya">Total Biaya (Auto-calculated) *</Label>
            <Input 
              id="totalBiaya" 
              name="totalBiaya"
              type="number" 
              placeholder="850000" 
              value={calculatedTotalCost.toString()}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="namaBengkel">Nama Bengkel</Label>
            <Input 
              id="namaBengkel" 
              name="bengkel"
              placeholder="Bengkel Jaya Motor" 
              value={formData.bengkel}
              onChange={onInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomorFaktur">Nomor Faktur/Invoice</Label>
            <Input 
              id="nomorFaktur" 
              name="nomorFaktur"
              placeholder="INV-2024-001" 
              value={formData.nomorFaktur}
              onChange={onInputChange}
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
            onClick={onCancel}
            disabled={submitting}
          >
            Batal
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
));

RepairForm.displayName = 'RepairForm';

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

  // Controlled Form State for Repair Form
  const [repairFormData, setRepairFormData] = useState<RepairFormData>({
    vehicleId: '',
    tanggal: '',
    kilometer: '',
    jenisPerbaikan: '',
    deskripsi: '',
    biayaJasa: '',
    bengkel: '',
    nomorFaktur: ''
  });

  // Controlled Form State for Schedule Form
  const [scheduleFormData, setScheduleFormData] = useState<ScheduleFormData>({
    vehicleId: '',
    jenisServis: '',
    intervalKm: '',
    intervalBulan: '',
    tanggalServisTerakhir: '',
    kmTerakhir: '',
    catatan: ''
  });

  // UI-only State Management (controlled spare parts)
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);

  // Edit State Management
  const [editMode, setEditMode] = useState(false);
  const [editMaintenanceId, setEditMaintenanceId] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [editFormType, setEditFormType] = useState<'schedule' | 'repair'>('repair');

  // Delete State Management
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<MaintenanceRecord | null>(null);

  // No refs needed since all forms are now controlled

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
  const upcomingMaintenance = useMemo(() => {
    try {
      return maintenanceRecords
        .filter(record => record.status === 'Dijadwalkan')
        .sort((a, b) => new Date(a.nextServiceDate || '').getTime() - new Date(b.nextServiceDate || '').getTime());
    } catch (error) {
      console.error('Error computing upcomingMaintenance:', error);
      return [];
    }
  }, [maintenanceRecords]);

  const completedMaintenance = useMemo(() => {
    try {
      return maintenanceRecords
        .filter(record => record.status === 'Selesai')
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    } catch (error) {
      console.error('Error computing completedMaintenance:', error);
      return [];
    }
  }, [maintenanceRecords]);

  // Memoized total cost calculation
  const calculatedTotalCost = useMemo(() => {
    const laborCost = parseFloat(repairFormData.biayaJasa) || 0;
    const partsTotal = spareParts.reduce((sum, part) => sum + (part.jumlah * part.harga), 0);
    return partsTotal + laborCost;
  }, [repairFormData.biayaJasa, spareParts]);

  // Validation Functions
  const validateScheduleFormData = (formData: ScheduleFormData): FormErrors => {
    const errors: FormErrors = {};
    
    if (!formData.vehicleId) errors.vehicleId = 'Pilih kendaraan wajib diisi';
    if (!formData.jenisServis) errors.jenisServis = 'Jenis servis wajib diisi';
    if (!formData.intervalKm && !formData.intervalBulan) {
      errors.interval = 'Minimal satu interval (KM atau Bulan) harus diisi';
    }
    if (formData.intervalKm && (parseInt(formData.intervalKm) <= 0)) {
      errors.intervalKm = 'Interval KM harus lebih dari 0';
    }
    if (formData.intervalBulan && (parseInt(formData.intervalBulan) <= 0)) {
      errors.intervalBulan = 'Interval bulan harus lebih dari 0';
    }
    if (formData.tanggalServisTerakhir && new Date(formData.tanggalServisTerakhir) > new Date()) {
      errors.tanggalServisTerakhir = 'Tanggal servis terakhir tidak boleh di masa depan';
    }
    if (formData.kmTerakhir && parseInt(formData.kmTerakhir) < 0) {
      errors.kmTerakhir = 'KM terakhir tidak boleh negatif';
    }
    
    return errors;
  };

  const validateRepairFormData = (formData: RepairFormData, spareParts: SparePart[]): FormErrors => {
    const errors: FormErrors = {};
    
    if (!formData.vehicleId) errors.vehicleId = 'Pilih kendaraan wajib diisi';
    if (!formData.tanggal) errors.tanggal = 'Tanggal perbaikan wajib diisi';
    if (!formData.jenisPerbaikan) errors.jenisPerbaikan = 'Jenis perbaikan wajib diisi';
    if (!formData.deskripsi) errors.deskripsi = 'Deskripsi masalah wajib diisi';
    if (formData.tanggal && new Date(formData.tanggal) > new Date()) {
      errors.tanggal = 'Tanggal perbaikan tidak boleh di masa depan';
    }
    if (formData.kilometer && parseInt(formData.kilometer) < 0) {
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
    setScheduleFormData({
      vehicleId: '',
      jenisServis: '',
      intervalKm: '',
      intervalBulan: '',
      tanggalServisTerakhir: '',
      kmTerakhir: '',
      catatan: ''
    });
  };

  const resetRepairForm = useCallback(() => {
    setRepairFormData({
      vehicleId: '',
      tanggal: '',
      kilometer: '',
      jenisPerbaikan: '',
      deskripsi: '',
      biayaJasa: '',
      bengkel: '',
      nomorFaktur: ''
    });
    setSpareParts([]);
  }, []);

  // Form Submission Handlers
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateScheduleFormData(scheduleFormData);
    
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
      const selectedVehicle = vehicles.find(v => v.id === scheduleFormData.vehicleId);
      if (!selectedVehicle) {
        throw new Error("Kendaraan tidak ditemukan");
      }

      const intervalKmNum = scheduleFormData.intervalKm ? parseInt(scheduleFormData.intervalKm) : undefined;
      const intervalBulanNum = scheduleFormData.intervalBulan ? parseInt(scheduleFormData.intervalBulan) : undefined;
      const kmTerakhirNum = scheduleFormData.kmTerakhir ? parseInt(scheduleFormData.kmTerakhir) : 0;

      const { nextServiceDate, nextServiceKm } = calculateNextService(
        scheduleFormData.tanggalServisTerakhir,
        kmTerakhirNum,
        intervalBulanNum,
        intervalKmNum,
        kmTerakhirNum // Use form data instead of vehicle data
      );

      const maintenanceData = {
        vehicleId: scheduleFormData.vehicleId,
        platNomor: selectedVehicle.platNomor,
        jenisPerawatan: scheduleFormData.jenisServis,
        tanggal: scheduleFormData.tanggalServisTerakhir || new Date().toISOString().split('T')[0],
        kilometer: kmTerakhirNum,
        catatan: scheduleFormData.catatan || '',
        status: 'Dijadwalkan' as const,
        intervalKm: intervalKmNum,
        intervalBulan: intervalBulanNum,
        nextServiceDate,
        nextServiceKm,
        tanggalServisTerakhir: scheduleFormData.tanggalServisTerakhir
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

      // --- Robust reminder integration for maintenance ---
      if (maintenanceData.status === 'Dijadwalkan' && maintenanceData.nextServiceDate) {
        const platNomor = maintenanceData.platNomor;
        const triggerDate = maintenanceData.nextServiceDate;
        const title = `[AUTO] Reminder Service: ${platNomor} - ${maintenanceData.jenisPerawatan}`;
        const adminEmail = localStorageService.getEmailSettings().fromEmail;
        // Remove any existing reminder for this vehicle and triggerDate
        const existing = reminderService.getReminderConfigs().find(
          r => r.type === 'service' && r.vehicle === platNomor && r.triggerDate === triggerDate
        );
        if (!existing) {
          reminderService.addReminderConfig({
            title,
            type: 'service',
            vehicle: platNomor,
            triggerDate,
            daysBeforeAlert: [30, 14, 7, 1],
            channels: ['email', 'whatsapp'],
            recipients: [adminEmail],
            messageTemplate: `Kendaraan {vehicle} perlu service {service} pada {date}.`,
            isRecurring: false,
            status: 'active'
          });
        } else {
          reminderService.updateReminderConfig(existing.id, {
            title,
            recipients: [adminEmail],
            status: 'active',
            messageTemplate: `Kendaraan {vehicle} perlu service {service} pada {date}.`
          });
        }
        toast({
          title: "Reminder Diperbarui",
          description: "Pengingat service kendaraan telah disesuaikan.",
          variant: "default"
        });
      }
      // --- End robust reminder integration ---

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
    
    const errors = validateRepairFormData(repairFormData, spareParts);
    
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
      const selectedVehicle = vehicles.find(v => v.id === repairFormData.vehicleId);
      if (!selectedVehicle) {
        throw new Error("Kendaraan tidak ditemukan");
      }

      const biayaJasaNum = parseFloat(repairFormData.biayaJasa) || 0;
      const totalBiayaNum = calculatedTotalCost;

      const maintenanceData = {
        vehicleId: repairFormData.vehicleId,
        platNomor: selectedVehicle.platNomor,
        jenisPerawatan: repairFormData.jenisPerbaikan,
        tanggal: repairFormData.tanggal,
        kilometer: parseInt(repairFormData.kilometer) || 0,
        deskripsi: repairFormData.deskripsi,
        spareParts: spareParts.map(part => ({
          nama: part.nama,
          jumlah: part.jumlah,
          harga: part.harga
        })),
        biaya: totalBiayaNum,
        bengkel: repairFormData.bengkel || '',
        teknisi: '',
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
    setSpareParts(prev => [...prev, { 
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), 
      nama: '', 
      jumlah: 1, 
      harga: 0 
    }]);
  }, []);

  const removeSparePart = useCallback((index: number) => {
    setSpareParts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateSparePart = useCallback((index: number, field: keyof SparePart, value: string | number) => {
    setSpareParts(prev => prev.map((part, i) => 
      i === index ? { ...part, [field]: value } : part
    ));
  }, []);

  // Controlled form input handlers for schedule form
  const handleScheduleFormChange = useCallback((field: keyof ScheduleFormData, value: string) => {
    setScheduleFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleScheduleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleScheduleFormChange(name as keyof ScheduleFormData, value);
  }, [handleScheduleFormChange]);

  const handleScheduleSelectChange = useCallback((field: keyof ScheduleFormData, value: string) => {
    handleScheduleFormChange(field, value);
  }, [handleScheduleFormChange]);

  // Controlled form input handlers for repair form
  const handleRepairFormChange = useCallback((field: keyof RepairFormData, value: string) => {
    setRepairFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleRepairInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleRepairFormChange(name as keyof RepairFormData, value);
  }, [handleRepairFormChange]);

  const handleRepairSelectChange = useCallback((field: keyof RepairFormData, value: string) => {
    handleRepairFormChange(field, value);
  }, [handleRepairFormChange]);

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
    setScheduleFormData({
      vehicleId: record.vehicleId || '',
      jenisServis: record.jenisPerawatan || '',
      intervalKm: record.nextServiceKm ? (record.nextServiceKm - record.kilometer).toString() : '',
      intervalBulan: record.nextServiceDate ? 
        Math.ceil((new Date(record.nextServiceDate).getTime() - new Date(record.tanggal).getTime()) / (1000 * 60 * 60 * 24 * 30)).toString() : '',
      tanggalServisTerakhir: record.tanggal || '',
      kmTerakhir: record.kilometer.toString() || '',
      catatan: record.catatan || ''
    });
  };

  const populateRepairFormFromRecord = (record: MaintenanceRecord) => {
    // Calculate biayaJasa by subtracting spare parts cost from total biaya
    const totalSpareParts = (record.spareParts || []).reduce((sum, part) => sum + (part.jumlah * part.harga), 0);
    const biayaJasaAmount = (record.biaya || 0) - totalSpareParts;
    
    setRepairFormData({
      vehicleId: record.vehicleId,
      tanggal: record.tanggal,
      kilometer: record.kilometer.toString(),
      jenisPerbaikan: record.jenisPerawatan,
      deskripsi: record.deskripsi || '',
      biayaJasa: biayaJasaAmount.toString(),
      bengkel: record.bengkel || '',
      nomorFaktur: ''
    });
    // Ensure spare parts have IDs for stable React keys
    const sparePartsWithIds = (record.spareParts || []).map((part: any) => ({
      id: part.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nama: part.nama,
      jumlah: part.jumlah,
      harga: part.harga
    }));
    setSpareParts(sparePartsWithIds);
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
      
      // --- Robust reminder integration for maintenance ---
      // Remove any reminder associated with this maintenance record
      const platNomor = deletingRecord.platNomor;
      const triggerDate = deletingRecord.nextServiceDate;
      if (platNomor && triggerDate) {
        const existing = reminderService.getReminderConfigs().find(
          r => r.type === 'service' && r.vehicle === platNomor && r.triggerDate === triggerDate
        );
        if (existing) {
          reminderService.deleteReminderConfig(existing.id);
        }
      }
      toast({
        title: "Reminder Diperbarui",
        description: "Pengingat service kendaraan telah disesuaikan.",
        variant: "default"
      });
      // --- End robust reminder integration ---
      
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

  // Memoized cancel handler for schedule form
  const handleScheduleCancel = useCallback(() => {
    if (editMode) {
      cancelEdit();
    } else {
      setShowScheduleForm(false);
      resetScheduleForm();
    }
  }, [editMode, resetScheduleForm]);

  // Memoized cancel handler for repair form
  const handleRepairCancel = useCallback(() => {
    if (editMode) {
      cancelEdit();
    } else {
      setShowRepairForm(false);
      resetRepairForm();
    }
  }, [editMode, resetRepairForm]);





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

      {showScheduleForm && (
        <ScheduleForm
          formData={scheduleFormData}
          vehicles={vehicles}
          editMode={editMode}
          submitting={submitting}
          onInputChange={handleScheduleInputChange}
          onSelectChange={handleScheduleSelectChange}
          onSubmit={handleScheduleSubmit}
          onCancel={handleScheduleCancel}
        />
      )}
      {showRepairForm && (
        <RepairForm
          formData={repairFormData}
          spareParts={spareParts}
          vehicles={vehicles}
          calculatedTotalCost={calculatedTotalCost}
          editMode={editMode}
          submitting={submitting}
          onInputChange={handleRepairInputChange}
          onSelectChange={handleRepairSelectChange}
          onSparePartAdd={addSparePart}
          onSparePartRemove={removeSparePart}
          onSparePartNameChange={handleSparePartNameChange}
          onSparePartQuantityChange={handleSparePartQuantityChange}
          onSparePartPriceChange={handleSparePartPriceChange}
          onSubmit={handleRepairSubmit}
          onCancel={handleRepairCancel}
        />
      )}

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
                          {maintenance.kilometer > 0 && `KM Target: ${(maintenance.kilometer || 0).toLocaleString('id-ID')}`}
                          {maintenance.nextServiceKm && ` / Next: ${(maintenance.nextServiceKm || 0).toLocaleString('id-ID')}`}
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
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mt-1">
                                <div>
                                  <span className="font-medium">Biaya Jasa Mekanik:</span> Rp {(() => {
                                    const sparePartsCost = (history.spareParts || []).reduce((sum, part) => sum + (part.jumlah * part.harga), 0);
                                    const laborCost = (history.biaya || 0) - sparePartsCost;
                                    return Math.max(0, laborCost).toLocaleString('id-ID');
                                  })()}
                                </div>
                                <div>
                                  <span className="font-medium">Biaya Suku Cadang:</span> Rp {(history.spareParts || []).reduce((sum, part) => sum + (part.jumlah * part.harga), 0).toLocaleString('id-ID')}
                                </div>
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
                              Rp {(history.biaya || 0).toLocaleString('id-ID')}
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
                                  <div><span className="font-medium">KM Saat Ini:</span> {(maintenance.kilometer || 0).toLocaleString('id-ID')}</div>
                                  <div><span className="font-medium">Target KM:</span> {maintenance.nextServiceKm ? (maintenance.nextServiceKm || 0).toLocaleString('id-ID') : 'Belum ditentukan'}</div>
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
                                Rp {completedMaintenance.reduce((total, item) => total + (item.biaya || 0), 0).toLocaleString('id-ID')}
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
                                  `Rp ${Math.round(completedMaintenance.reduce((total, item) => total + (item.biaya || 0), 0) / completedMaintenance.length).toLocaleString('id-ID')}`
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
                                const totalCost = vehicleCosts.reduce((sum, cost) => sum + (cost.biaya || 0), 0);
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
