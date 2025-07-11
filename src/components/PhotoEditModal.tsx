import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { VehiclePhoto } from '@/services/LocalStorageService';

interface PhotoEditModalProps {
  photo: VehiclePhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (photo: VehiclePhoto, title: string, description: string) => void;
}

const PhotoEditModal: React.FC<PhotoEditModalProps> = ({
  photo,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (photo) {
      setTitle(photo.title || '');
      setDescription(photo.description || '');
    }
  }, [photo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (photo) {
      onSave(photo, title, description);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setTitle('');
    setDescription('');
  };

  const getCategoryInfo = (category: string) => {
    const categoryMap = {
      front: { name: 'Foto Depan', icon: '🚗', color: 'bg-blue-100 text-blue-800' },
      side: { name: 'Foto Samping', icon: '↔️', color: 'bg-green-100 text-green-800' },
      rear: { name: 'Foto Belakang', icon: '🔄', color: 'bg-yellow-100 text-yellow-800' },
      interior: { name: 'Interior', icon: '🪑', color: 'bg-purple-100 text-purple-800' },
      document: { name: 'Dokumen', icon: '📄', color: 'bg-indigo-100 text-indigo-800' },
      damage: { name: 'Kerusakan', icon: '⚠️', color: 'bg-red-100 text-red-800' },
      other: { name: 'Lainnya', icon: '📷', color: 'bg-gray-100 text-gray-800' }
    };
    return categoryMap[category as keyof typeof categoryMap] || categoryMap.other;
  };

  if (!photo) return null;

  const categoryInfo = getCategoryInfo(photo.category);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Info Foto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Preview */}
          <div className="space-y-3">
            <div className="relative">
              <img
                src={photo.fileData}
                alt={photo.title || photo.fileName}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute top-2 left-2">
                <Badge className={categoryInfo.color}>
                  {categoryInfo.name}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p><strong>File:</strong> {photo.fileName}</p>
              <p><strong>Uploaded:</strong> {new Date(photo.uploadDate).toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Judul Foto</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul foto"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Deskripsi</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi foto"
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Simpan Perubahan
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoEditModal; 