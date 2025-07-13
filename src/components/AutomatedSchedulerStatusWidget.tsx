import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Play, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { automatedSchedulerService } from '@/services/AutomatedSchedulerService';

const AutomatedSchedulerStatusWidget = () => {
  const [schedulerStatus, setSchedulerStatus] = useState({
    isActive: false,
    isRunning: false,
    lastCheckDate: null as string | null,
    scheduledTime: '09:00',
    nextCheckIn: ''
  });
  const [lastCheckInfo, setLastCheckInfo] = useState<{
    timestamp: string;
    status: string;
    error?: string;
  } | null>(null);

  // Refresh status periodically
  useEffect(() => {
    const updateStatus = () => {
      setSchedulerStatus(automatedSchedulerService.getSchedulerStatus());
      setLastCheckInfo(automatedSchedulerService.getLastCheckInfo());
    };

    // Update immediately
    updateStatus();

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleManualTrigger = async () => {
    try {
      await automatedSchedulerService.runManualCheck();
      // Refresh status after manual check
      setTimeout(() => {
        setSchedulerStatus(automatedSchedulerService.getSchedulerStatus());
        setLastCheckInfo(automatedSchedulerService.getLastCheckInfo());
      }, 1000);
    } catch (error) {
      console.error('Failed to run manual check:', error);
    }
  };

  const getStatusIcon = () => {
    if (!schedulerStatus.isActive) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (schedulerStatus.isRunning) {
      return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (!schedulerStatus.isActive) {
      return 'Scheduler Tidak Aktif';
    }
    if (schedulerStatus.isRunning) {
      return 'Sedang Berjalan...';
    }
    return 'Aktif & Siap';
  };

  const getStatusColor = () => {
    if (!schedulerStatus.isActive) return 'bg-red-100 text-red-800';
    if (schedulerStatus.isRunning) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const formatLastCheckTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="shadow-sm border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          Automated Daily Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Status</Label>
            <div className="mt-1">
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Waktu Terjadwal</Label>
            <div className="mt-1 text-sm font-semibold">
              {schedulerStatus.scheduledTime} WIB
            </div>
          </div>
        </div>

        {/* Next Check */}
        {schedulerStatus.isActive && schedulerStatus.nextCheckIn && (
          <div>
            <Label className="text-sm font-medium text-gray-600">Cek Berikutnya</Label>
            <div className="mt-1 text-sm font-semibold text-blue-600">
              {schedulerStatus.nextCheckIn}
            </div>
          </div>
        )}

        {/* Last Check Info */}
        {lastCheckInfo && (
          <div className="border-t pt-3">
            <Label className="text-sm font-medium text-gray-600">Cek Terakhir</Label>
            <div className="mt-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {formatLastCheckTime(lastCheckInfo.timestamp)}
                </span>
                <Badge 
                  variant="outline" 
                  className={lastCheckInfo.status === 'success' 
                    ? 'text-green-600 border-green-600' 
                    : 'text-red-600 border-red-600'
                  }
                >
                  {lastCheckInfo.status === 'success' ? 'Berhasil' : 'Gagal'}
                </Badge>
              </div>
              {lastCheckInfo.error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  Error: {lastCheckInfo.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Trigger */}
        <div className="border-t pt-3">
          <Button 
            onClick={handleManualTrigger}
            disabled={schedulerStatus.isRunning}
            size="sm"
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {schedulerStatus.isRunning ? 'Sedang Berjalan...' : 'Jalankan Sekarang'}
          </Button>
        </div>

        {/* Status Details */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <div className="space-y-1">
            <div><strong>Mode:</strong> Otomatis Harian</div>
            <div><strong>Interval Cek:</strong> Setiap 1 menit</div>
            <div><strong>Waktu Eksekusi:</strong> {schedulerStatus.scheduledTime} WIB setiap hari</div>
            {schedulerStatus.lastCheckDate && (
              <div><strong>Terakhir Dijalankan:</strong> {schedulerStatus.lastCheckDate}</div>
            )}
          </div>
        </div>

        {/* Recipient Information */}
        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4" />
            <strong>Penerima Reminder Otomatis</strong>
          </div>
          <div className="space-y-1">
            <div><strong>Email:</strong> {(() => {
              const contacts = JSON.parse(localStorage.getItem('fleet_contacts') || '[]');
              const emailContacts = contacts.filter((c: any) => c.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email));
              return emailContacts.length > 0 ? `${emailContacts.length} kontak terdaftar` : 'irwansyahmirza60@gmail.com (default)';
            })()}</div>
            <div><strong>WhatsApp:</strong> {(() => {
              const contacts = JSON.parse(localStorage.getItem('fleet_contacts') || '[]');
              const waContacts = contacts.filter((c: any) => c.whatsapp && /^\d{8,15}$/.test(c.whatsapp));
              return waContacts.length > 0 ? `${waContacts.length} kontak terdaftar` : '6285720153141 (default)';
            })()}</div>
            <div className="text-blue-500 mt-1">
              ℹ️ Sistem menggunakan kontak dari "Manajemen Kontak" atau default jika kosong
            </div>
          </div>
        </div>

        {/* Help Text */}
        {!schedulerStatus.isActive && (
          <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Scheduler tidak aktif.</strong> Sistem akan tetap berfungsi tetapi reminder harus dijalankan manual. 
              Refresh halaman atau restart aplikasi untuk mengaktifkan scheduler otomatis.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutomatedSchedulerStatusWidget; 