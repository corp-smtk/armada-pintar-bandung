import React from 'react';
import { X, Edit, Trash2, Download, Calendar } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VehiclePhoto } from '@/services/LocalStorageService';

interface PhotoViewerModalProps {
  photo: VehiclePhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (photo: VehiclePhoto) => void;
  onDelete: (photoId: string) => void;
}

const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  photo,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!photo) return null;

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

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = photo.fileData;
      link.download = photo.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const categoryInfo = getCategoryInfo(photo.category);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center gap-3">
              <Badge className={categoryInfo.color}>
                {categoryInfo.name}
              </Badge>
              <div>
                <h3 className="font-semibold text-lg">{photo.title || photo.fileName}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(photo.uploadDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span>{Math.round((photo.fileData.length * 0.75) / 1024)} KB</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="Download foto"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(photo)}
                title="Edit info foto"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(photo.id)}
                title="Hapus foto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Display */}
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            <img
              src={photo.fileData}
              alt={photo.title || photo.fileName}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Footer with Description */}
          {photo.description && (
            <div className="p-4 border-t bg-gray-50">
              <h4 className="font-medium text-sm mb-2">Deskripsi:</h4>
              <p className="text-sm text-gray-700">{photo.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoViewerModal; 