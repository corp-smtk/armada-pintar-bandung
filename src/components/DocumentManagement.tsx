
import { useState } from 'react';
import { Upload, AlertTriangle, FileText, Calendar, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DocumentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Mock document data
  const documents = [
    {
      id: 1,
      jenisDokumen: 'STNK',
      nomorDokumen: 'B1234AB2024',
      platNomor: 'B 1234 AB',
      tanggalTerbit: '2024-01-15',
      tanggalKadaluarsa: '2025-01-15',
      hariTersisa: 19,
      status: 'Akan Kadaluarsa'
    },
    {
      id: 2,
      jenisDokumen: 'KIR',
      nomorDokumen: 'KIR567890',
      platNomor: 'B 5678 CD',
      tanggalTerbit: '2024-01-20',
      tanggalKadaluarsa: '2025-01-20',
      hariTersisa: 24,
      status: 'Akan Kadaluarsa'
    },
    {
      id: 3,
      jenisDokumen: 'Asuransi',
      nomorDokumen: 'ASR2024001',
      platNomor: 'B 9101 EF',
      tanggalTerbit: '2024-03-01',
      tanggalKadaluarsa: '2025-03-01',
      hariTersisa: 89,
      status: 'Valid'
    },
    {
      id: 4,
      jenisDokumen: 'SIM Driver',
      nomorDokumen: 'SIM123456789',
      platNomor: 'B 2345 GH',
      tanggalTerbit: '2022-01-25',
      tanggalKadaluarsa: '2025-01-25',
      hariTersisa: 29,
      status: 'Akan Kadaluarsa'
    },
    {
      id: 5,
      jenisDokumen: 'Sertifikat LPG',
      nomorDokumen: 'LPG2024005',
      platNomor: 'B 6789 IJ',
      tanggalTerbit: '2024-01-08',
      tanggalKadaluarsa: '2025-01-08',
      hariTersisa: 12,
      status: 'Kritis'
    }
  ];

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

  const expiringDocuments = documents.filter(doc => doc.hariTersisa <= 30);
  const criticalDocuments = documents.filter(doc => doc.hariTersisa <= 14);

  const DocumentUploadForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Upload & Kelola Dokumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jenisDokumen">Jenis Dokumen *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis dokumen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stnk">STNK</SelectItem>
                <SelectItem value="kir">KIR (Kendaraan Bermotor)</SelectItem>
                <SelectItem value="asuransi">Asuransi Kendaraan</SelectItem>
                <SelectItem value="sim">SIM Pengemudi</SelectItem>
                <SelectItem value="sertifikat-lpg">Sertifikasi Tangki LPG</SelectItem>
                <SelectItem value="izin-usaha">Izin Usaha</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="platNomor">Kendaraan Terkait *</Label>
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
            <Label htmlFor="nomorDokumen">Nomor Dokumen *</Label>
            <Input id="nomorDokumen" placeholder="Masukkan nomor dokumen" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalTerbit">Tanggal Terbit *</Label>
            <Input id="tanggalTerbit" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tanggalKadaluarsa">Tanggal Kadaluarsa *</Label>
            <Input id="tanggalKadaluarsa" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="penerbitDokumen">Penerbit Dokumen</Label>
            <Input id="penerbitDokumen" placeholder="Samsat, Dishub, dll." />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fileDokumen">File Dokumen (PDF/JPG/PNG) *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <Button variant="outline">Pilih File</Button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Drag & drop file atau klik untuk browse. Max 10MB.
            </p>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button className="flex-1">Simpan Dokumen</Button>
          <Button variant="outline" onClick={() => setShowUploadForm(false)}>Batal</Button>
        </div>
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
              {criticalDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <div className="font-semibold text-sm">{doc.jenisDokumen}</div>
                    <div className="text-xs text-gray-600">{doc.platNomor}</div>
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    {doc.hariTersisa} hari
                  </Badge>
                </div>
              ))}
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
              {expiringDocuments.filter(doc => doc.hariTersisa > 14).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <div className="font-semibold text-sm">{doc.jenisDokumen}</div>
                    <div className="text-xs text-gray-600">{doc.platNomor}</div>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    {doc.hariTersisa} hari
                  </Badge>
                </div>
              ))}
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
                          </div>
                        </div>
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
                      </div>
                    </div>
                  ))}
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
                      </div>
                    </div>
                  ))}
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
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800">Valid</Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            Kadaluarsa: {doc.tanggalKadaluarsa}
                          </div>
                          <div className="text-sm font-semibold mt-1 text-green-600">
                            {doc.hariTersisa} hari lagi
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="expired" className="mt-0">
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Tidak ada dokumen yang kadaluarsa saat ini</p>
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
