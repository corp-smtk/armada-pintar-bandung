import React, { useState, useRef } from 'react';
import { Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PhotoUploadFormProps {
  onUpload: (file: File, category: string, title?: string, description?: string) => void;
  uploading: boolean;
  onCancel: () => void;
}

const PhotoUploadForm: React.FC<PhotoUploadFormProps> = ({ onUpload, uploading, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'front', label: 'Foto Depan' },
    { value: 'side', label: 'Foto Samping' },
    { value: 'rear', label: 'Foto Belakang' },
    { value: 'interior', label: 'Interior' },
    { value: 'document', label: 'Dokumen' },
    { value: 'damage', label: 'Kerusakan' },
    { value: 'other', label: 'Lainnya' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-set title if empty
      if (!title) {
        const fileName = file.name.split('.')[0];
        setTitle(fileName);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && category) {
      onUpload(selectedFile, category, title, description);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCategory('');
    setTitle('');
    setDescription('');
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Upload Area */}
      <div className="space-y-2">
        <Label>Upload Foto</Label>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <div className="space-y-3">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-32 mx-auto rounded-lg object-cover"
              />
              <p className="text-sm text-green-600">
                {selectedFile?.name} ({Math.round((selectedFile?.size || 0) / 1024)} KB)
              </p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
              >
                Ganti Foto
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Klik untuk pilih foto</p>
                <p className="text-xs text-gray-500">Atau drag & drop foto di sini</p>
                <p className="text-xs text-gray-500 mt-1">Maksimal 5MB, format: JPG, PNG, GIF</p>
              </div>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          required
        />
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="category">Kategori Foto *</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori foto" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Judul Foto</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan judul foto (opsional)"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi foto (opsional)"
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button 
          type="submit" 
          className="flex-1"
          disabled={!selectedFile || !category || uploading}
        >
          {uploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Mengupload...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Foto
            </>
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={uploading}
        >
          Batal
        </Button>
      </div>
    </form>
  );
};

export default PhotoUploadForm; 