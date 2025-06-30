
import { useState, useEffect } from 'react';
import { Upload, AlertTriangle, FileText, Calendar, Search, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { localStorageService, Document, Vehicle } from '@/services/LocalStorageService';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState<Partial<Document>>({});
  const { toast } = useToast();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jenisDokumen || !formData.vehicleId || !formData.nomorDokumen || 
        !formData.tanggalTerbit || !formData.tanggalKadaluarsa) {
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

      const documentData = {
        ...formData,
        platNomor: selectedVehicle.platNomor
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan dokumen",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setFormData(document);
    setShowUploadForm(true);
  };

  const handleDelete = (document: Document) => {
    if (confirm(`Apakah Anda yakin ingin menghapus dokumen ${document.jenisDokumen} - ${document.nomorDokumen}?`)) {
      try {
        localStorageService.deleteDocument(document.id);
        loadData();
        toast({
          title: "Berhasil",
          description: "Dokumen berhasil dihapus"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus dokumen",
          variant: "destructive"
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingDocument(null);
    setShowUploadForm(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormData({
          ...formData,
          fileData: base64Data,
          fileName: file.name,
          fileType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

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

  const DocumentUploadForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>{editingDocument ? 'Edit Dokumen' : 'Upload & Kelola Dokumen'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jenisDokumen">Jenis Dokumen *</Label>
              <Select value={formData.jenisDokumen || ''} onValueChange={(value) => setFormData({...formData, jenisDokumen: value})}>
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
              <Select value={formData.vehicleId || ''} onValueChange={(value) => setFormData({...formData, vehicleId: value})}>
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
                placeholder="Masukkan nomor dokumen" 
                value={formData.nomorDokumen || ''}
                onChange={(e) => setFormData({...formData, nomorDokumen: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalTerbit">Tanggal Terbit *</Label>
              <Input 
                id="tanggalTerbit" 
                type="date" 
                value={formData.tanggalTerbit || ''}
                onChange={(e) => setFormData({...formData, tanggalTerbit: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalKadaluarsa">Tanggal Kadaluarsa *</Label>
              <Input 
                id="tanggalKadaluarsa" 
                type="date" 
                value={formData.tanggalKadaluarsa || ''}
                onChange={(e) => setFormData({...formData, tanggalKadaluarsa: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="penerbitDokumen">Penerbit Dokumen</Label>
              <Input 
                id="penerbitDokumen" 
                placeholder="Samsat, Dishub, dll." 
                value={formData.penerbitDokumen || ''}
                onChange={(e) => setFormData({...formData, penerbitDokumen: e.target.value})}
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
                  onChange={handleFileUpload}
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
              {formData.fileName && (
                <p className="mt-2 text-sm text-green-600">
                  File terpilih: {formData.fileName}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingDocument ? 'Update Dokumen' : 'Simpan Dokumen'}
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
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Dokumen & Kepatuhan</h1>
        <Button onClick={() => setShowUploadForm(!showUploadForm)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Dokumen
        </Button>
      </div>

      {showUploadForm && <DocumentUploadForm />}

      {/* Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div key={doc.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
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
                          <div className="flex flex-col gap-1">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(doc)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    <div key={doc.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <FileText className="h-8 w-8 text-orange-600" />
                          <div>
                            <h3 className="font-semibold">{doc.jenisDokumen}</h3>
                            <p className="text-sm text-gray-600">No: {doc.nomorDokumen}</p>
                            <p className="text-sm text-gray-600">Kendaraan: {doc.platNomor}</p>
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
                            <div className="text-sm font-semibold mt-1 text-orange-600">
                              {doc.hariTersisa} hari lagi
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(doc)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    <div key={doc.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <FileText className="h-8 w-8 text-green-600" />
                          <div>
                            <h3 className="font-semibold">{doc.jenisDokumen}</h3>
                            <p className="text-sm text-gray-600">No: {doc.nomorDokumen}</p>
                            <p className="text-sm text-gray-600">Kendaraan: {doc.platNomor}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-800">Valid</Badge>
                            <div className="text-sm text-gray-600 mt-1">
                              Kadaluarsa: {doc.tanggalKadaluarsa}
                            </div>
                            <div className="text-sm font-semibold mt-1 text-green-600">
                              {doc.hariTersisa} hari lagi
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(doc)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="expired" className="mt-0">
                <div className="space-y-4">
                  {expiredDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <FileText className="h-8 w-8 text-red-600" />
                          <div>
                            <h3 className="font-semibold">{doc.jenisDokumen}</h3>
                            <p className="text-sm text-gray-600">No: {doc.nomorDokumen}</p>
                            <p className="text-sm text-gray-600">Kendaraan: {doc.platNomor}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <Badge className="bg-red-100 text-red-800">Kadaluarsa</Badge>
                            <div className="text-sm text-gray-600 mt-1">
                              Kadaluarsa: {doc.tanggalKadaluarsa}
                            </div>
                            <div className="text-sm font-semibold mt-1 text-red-600">
                              {Math.abs(doc.hariTersisa)} hari yang lalu
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(doc)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
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
