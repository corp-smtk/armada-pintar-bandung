import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Upload, AlertTriangle, FileText, Calendar, Search, Trash2, Edit, Eye, Download, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, Document, Vehicle } from '@/services/LocalStorageService';
import { reminderService } from './ReminderService';

// File Viewer Modal Component
const FileViewerModal = memo(({ 
  document, 
  isOpen, 
  onClose 
}: {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!document || !document.fileData) return null;

  const handleDownload = () => {
    if (document.fileData && document.fileName) {
      // Create a download link
      const link = document.createElement('a');
      link.href = document.fileData;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isImage = document.fileType?.startsWith('image/');
  const isPDF = document.fileType === 'application/pdf';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" aria-describedby="file-viewer-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {document.jenisDokumen} - {document.nomorDokumen}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <span id="file-viewer-description" className="sr-only">
          Pratinjau file dokumen kendaraan. Anda dapat melihat, mengunduh, atau menutup dialog ini.
        </span>
        
        <div className="flex-1 overflow-auto">
          {isImage ? (
            <div className="flex justify-center p-4">
              <img 
                src={document.fileData} 
                alt={document.fileName}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : isPDF ? (
            <div className="w-full h-[70vh]">
              <iframe
                src={document.fileData}
                className="w-full h-full border rounded-lg"
                title={document.fileName}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Preview tidak tersedia</h3>
              <p className="text-gray-600 mb-4">
                File {document.fileName} tidak dapat ditampilkan di browser.
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Nama File:</span> {document.fileName}
            </div>
            <div>
              <span className="font-semibold">Kendaraan:</span> {document.platNomor}
            </div>
            <div>
              <span className="font-semibold">Tanggal Terbit:</span> {document.tanggalTerbit}
            </div>
            <div>
              <span className="font-semibold">Tanggal Kadaluarsa:</span> {document.tanggalKadaluarsa}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// Move DocumentUploadForm outside to prevent re-creation on each render
const DocumentUploadForm = memo(({ 
  editingDocument, 
  vehicles, 
  uploadedFile, 
  onSubmit, 
  onReset, 
  onFileUpload,
  documentFormRef 
}: {
  editingDocument: Document | null;
  vehicles: Vehicle[];
  uploadedFile: {data: string, name: string, type: string} | null;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  documentFormRef: React.RefObject<HTMLFormElement>;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{editingDocument ? 'Edit Dokumen' : 'Upload & Kelola Dokumen'}</CardTitle>
    </CardHeader>
    <CardContent>
      <form ref={documentFormRef} onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jenisDokumen">Jenis Dokumen *</Label>
            <Select name="jenisDokumen" defaultValue={editingDocument?.jenisDokumen || ''} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis dokumen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STNK">STNK</SelectItem>
                <SelectItem value="KIR">KIR (Kendaraan Bermotor)</SelectItem>
                <SelectItem value="Asuransi">Asuransi Kendaraan</SelectItem>
                <SelectItem value="SIM Driver">SIM Pengemudi</SelectItem>
                <SelectItem value="Sertifikat LPG">Sertifikasi Tangki LPG</SelectItem>
                <SelectItem value="Izin Usaha">Izin Usaha</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Kendaraan Terkait *</Label>
            <Select name="vehicleId" defaultValue={editingDocument?.vehicleId || ''} required>
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
            <Label htmlFor="nomorDokumen">Nomor Dokumen *</Label>
            <Input 
              id="nomorDokumen" 
              name="nomorDokumen"
              placeholder="Masukkan nomor dokumen" 
              defaultValue={editingDocument?.nomorDokumen || ''}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalTerbit">Tanggal Terbit *</Label>
            <Input 
              id="tanggalTerbit" 
              name="tanggalTerbit"
              type="date" 
              defaultValue={editingDocument?.tanggalTerbit || ''}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalKadaluarsa">Tanggal Kadaluarsa *</Label>
            <Input 
              id="tanggalKadaluarsa" 
              name="tanggalKadaluarsa"
              type="date" 
              defaultValue={editingDocument?.tanggalKadaluarsa || ''}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="penerbitDokumen">Penerbit Dokumen</Label>
            <Input 
              id="penerbitDokumen" 
              name="penerbitDokumen"
              placeholder="Samsat, Dishub, dll." 
              defaultValue={editingDocument?.penerbitDokumen || ''}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fileDokumen">File Dokumen (PDF/JPG/PNG)</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={onFileUpload}
                className="hidden"
                id="fileInput"
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById('fileInput')?.click()}>
                Pilih File
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Drag & drop file atau klik untuk browse. Max 10MB.
            </p>
            {uploadedFile && (
              <p className="mt-2 text-sm text-green-600">
                File terpilih: {uploadedFile.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {editingDocument ? 'Update Dokumen' : 'Simpan Dokumen'}
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>Batal</Button>
        </div>
      </form>
    </CardContent>
  </Card>
));

const DocumentManagement = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{data: string, name: string, type: string} | null>(null);
  
  // File viewer state
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  
  const { toast } = useToast();

  // Form refs for uncontrolled forms
  const documentFormRef = useRef<HTMLFormElement>(null);

  const resetForm = useCallback(() => {
    setEditingDocument(null);
    setShowUploadForm(false);
    setUploadedFile(null);
    if (documentFormRef.current) {
      documentFormRef.current.reset();
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedDocuments = localStorageService.getDocuments();
    const loadedVehicles = localStorageService.getVehicles();
    
    // Update document status based on current date
    const updatedDocuments = loadedDocuments.map(doc => {
      const hariTersisa = calculateDaysRemaining(doc.tanggalKadaluarsa);
      const status = calculateDocumentStatus(hariTersisa);
      if (doc.hariTersisa !== hariTersisa || doc.status !== status) {
        localStorageService.updateDocument(doc.id, { hariTersisa, status });
        return { ...doc, hariTersisa, status };
      }
      return doc;
    });

    setDocuments(updatedDocuments);
    setVehicles(loadedVehicles);
  };

  const calculateDaysRemaining = (expiryDate: string): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateDocumentStatus = (daysRemaining: number): 'Valid' | 'Akan Kadaluarsa' | 'Kritis' | 'Kadaluarsa' => {
    if (daysRemaining < 0) return 'Kadaluarsa';
    if (daysRemaining <= 14) return 'Kritis';
    if (daysRemaining <= 30) return 'Akan Kadaluarsa';
    return 'Valid';
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentFormRef.current) return;
    
    const formData = new FormData(documentFormRef.current);
    const jenisDokumen = formData.get('jenisDokumen') as string;
    const vehicleId = formData.get('vehicleId') as string;
    const nomorDokumen = formData.get('nomorDokumen') as string;
    const tanggalTerbit = formData.get('tanggalTerbit') as string;
    const tanggalKadaluarsa = formData.get('tanggalKadaluarsa') as string;
    const penerbitDokumen = formData.get('penerbitDokumen') as string;

    if (!jenisDokumen || !vehicleId || !nomorDokumen || 
        !tanggalTerbit || !tanggalKadaluarsa) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedVehicle = vehicles.find(v => v.id === vehicleId);
      if (!selectedVehicle) {
        throw new Error("Kendaraan tidak ditemukan");
      }

      const documentData = {
        jenisDokumen,
        vehicleId,
        nomorDokumen,
        tanggalTerbit,
        tanggalKadaluarsa,
        penerbitDokumen: penerbitDokumen || '',
        platNomor: selectedVehicle.platNomor,
        ...(uploadedFile && {
          fileData: uploadedFile.data,
          fileName: uploadedFile.name,
          fileType: uploadedFile.type
        })
      } as Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'hariTersisa' | 'status'>;

      if (editingDocument) {
        localStorageService.updateDocument(editingDocument.id, documentData);
        toast({
          title: "Berhasil",
          description: "Dokumen berhasil diperbarui"
        });
      } else {
        localStorageService.addDocument(documentData);
        toast({
          title: "Berhasil",
          description: "Dokumen baru berhasil ditambahkan"
        });
      }

      loadData();
      resetForm();
      // --- Robust reminder integration ---
      await reminderService.ensureDailyRemindersForExpiredDocuments();
      toast({
        title: "Reminder Diperbarui",
        description: "Pengingat dokumen kadaluarsa telah disesuaikan.",
        variant: "default"
      });
      // --- End robust reminder integration ---
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan dokumen",
        variant: "destructive"
      });
    }
  }, [editingDocument, uploadedFile, vehicles, toast, resetForm]);

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setShowUploadForm(true);
    
    // Populate form fields for editing
    setTimeout(() => {
      if (documentFormRef.current) {
        const form = documentFormRef.current;
        (form.querySelector('[name="jenisDokumen"]') as HTMLSelectElement)?.setAttribute('data-value', document.jenisDokumen);
        (form.querySelector('[name="vehicleId"]') as HTMLSelectElement)?.setAttribute('data-value', document.vehicleId);
        (form.querySelector('[name="nomorDokumen"]') as HTMLInputElement).value = document.nomorDokumen;
        (form.querySelector('[name="tanggalTerbit"]') as HTMLInputElement).value = document.tanggalTerbit;
        (form.querySelector('[name="tanggalKadaluarsa"]') as HTMLInputElement).value = document.tanggalKadaluarsa;
        (form.querySelector('[name="penerbitDokumen"]') as HTMLInputElement).value = document.penerbitDokumen || '';
        
        // Handle file data
        if (document.fileData && document.fileName) {
          setUploadedFile({
            data: document.fileData,
            name: document.fileName,
            type: document.fileType || ''
          });
        }
      }
    }, 100);
  };

  const handleDelete = async (document: Document) => {
    if (confirm(`Apakah Anda yakin ingin menghapus dokumen ${document.jenisDokumen} - ${document.nomorDokumen}?`)) {
      try {
        localStorageService.deleteDocument(document.id);
        loadData();
        toast({
          title: "Berhasil",
          description: "Dokumen berhasil dihapus"
        });
        // --- Robust reminder integration ---
        await reminderService.ensureDailyRemindersForExpiredDocuments();
        toast({
          title: "Reminder Diperbarui",
          description: "Pengingat dokumen kadaluarsa telah disesuaikan.",
          variant: "default"
        });
        // --- End robust reminder integration ---
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus dokumen",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Error",
          description: "Ukuran file terlalu besar. Maksimal 10MB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        setUploadedFile({
          data: base64Data,
          name: file.name,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Valid': 'bg-green-100 text-green-800',
      'Akan Kadaluarsa': 'bg-yellow-100 text-yellow-800',
      'Kritis': 'bg-red-100 text-red-800',
      'Kadaluarsa': 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const filteredDocuments = documents.filter(doc => 
    doc.platNomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.jenisDokumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.nomorDokumen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expiringDocuments = documents.filter(doc => doc.hariTersisa <= 30 && doc.hariTersisa > 0);
  const criticalDocuments = documents.filter(doc => doc.hariTersisa <= 14 && doc.hariTersisa > 0);
  const expiredDocuments = documents.filter(doc => doc.hariTersisa < 0);

  // File viewing functions
  const handleViewFile = useCallback((document: Document) => {
    if (document.fileData) {
      setViewingDocument(document);
      setShowFileViewer(true);
    } else {
      toast({
        title: "Tidak ada file",
        description: "Dokumen ini tidak memiliki file yang dapat dilihat",
        variant: "destructive"
      });
    }
  }, [toast]);

  const closeFileViewer = useCallback(() => {
    setShowFileViewer(false);
    setViewingDocument(null);
  }, []);

  // Enhanced document card component
  const DocumentCard = memo(({ doc, showActions = true }: { doc: Document, showActions?: boolean }) => {
    const getFileIcon = (fileType?: string) => {
      if (fileType?.startsWith('image/')) return '🖼️';
      if (fileType === 'application/pdf') return '📄';
      return '📎';
    };

    return (
      <div className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold">{doc.jenisDokumen}</h3>
              <p className="text-sm text-gray-600">No: {doc.nomorDokumen}</p>
              <p className="text-sm text-gray-600">Kendaraan: {doc.platNomor}</p>
              {doc.penerbitDokumen && (
                <p className="text-sm text-gray-600">Penerbit: {doc.penerbitDokumen}</p>
              )}
              {doc.fileName && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span>{getFileIcon(doc.fileType)}</span>
                  {doc.fileName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <Badge className={getStatusBadge(doc.status)}>
                {doc.status}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">
                Kadaluarsa: {doc.tanggalKadaluarsa}
              </div>
              <div className="text-sm font-semibold mt-1">
                {doc.hariTersisa > 0 ? `${doc.hariTersisa} hari lagi` : 'Sudah kadaluarsa'}
              </div>
            </div>
            {showActions && (
              <div className="flex flex-col gap-1">
                {doc.fileData && (
                  <Button variant="outline" size="sm" onClick={() => handleViewFile(doc)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(doc)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Dokumen & Kepatuhan</h1>
        <Button onClick={() => setShowUploadForm(!showUploadForm)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Dokumen
        </Button>
      </div>

      {showUploadForm && (
        <DocumentUploadForm
          editingDocument={editingDocument}
          vehicles={vehicles}
          uploadedFile={uploadedFile}
          onSubmit={handleSubmit}
          onReset={resetForm}
          onFileUpload={handleFileUpload}
          documentFormRef={documentFormRef}
        />
      )}

      {/* File Viewer Modal */}
      <FileViewerModal
        document={viewingDocument}
        isOpen={showFileViewer}
        onClose={closeFileViewer}
      />

      {/* Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Dokumen Kritis (≤ 14 hari)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalDocuments.length > 0 ? (
                criticalDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <div className="font-semibold text-sm">{doc.jenisDokumen}</div>
                      <div className="text-xs text-gray-600">{doc.platNomor}</div>
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      {doc.hariTersisa} hari
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Tidak ada dokumen kritis saat ini</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Calendar className="h-5 w-5" />
              Akan Kadaluarsa (≤ 30 hari)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringDocuments.filter(doc => doc.hariTersisa > 14).length > 0 ? (
                expiringDocuments.filter(doc => doc.hariTersisa > 14).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <div className="font-semibold text-sm">{doc.jenisDokumen}</div>
                      <div className="text-xs text-gray-600">{doc.platNomor}</div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      {doc.hariTersisa} hari
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Tidak ada dokumen yang akan kadaluarsa</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <AlertTriangle className="h-5 w-5" />
              Sudah Kadaluarsa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiredDocuments.length > 0 ? (
                expiredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <div className="font-semibold text-sm">{doc.jenisDokumen}</div>
                      <div className="text-xs text-gray-600">{doc.platNomor}</div>
                    </div>
                    <Badge variant="outline" className="text-gray-600 border-gray-600">
                      {Math.abs(doc.hariTersisa)} hari
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Tidak ada dokumen yang sudah kadaluarsa</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Management Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Semua Dokumen</TabsTrigger>
              <TabsTrigger value="expiring">Akan Kadaluarsa</TabsTrigger>
              <TabsTrigger value="valid">Valid</TabsTrigger>
              <TabsTrigger value="expired">Kadaluarsa</TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari dokumen berdasarkan nomor plat, jenis, atau nomor dokumen..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="all" className="mt-0">
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                  {filteredDocuments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Tidak ada dokumen yang ditemukan</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="expiring" className="mt-0">
                <div className="space-y-4">
                  {expiringDocuments.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                  {expiringDocuments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Tidak ada dokumen yang akan kadaluarsa</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="valid" className="mt-0">
                <div className="space-y-4">
                  {filteredDocuments.filter(doc => doc.hariTersisa > 30).map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="expired" className="mt-0">
                <div className="space-y-4">
                  {expiredDocuments.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                  {expiredDocuments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Tidak ada dokumen yang kadaluarsa</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManagement;
