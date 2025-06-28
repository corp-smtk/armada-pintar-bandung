
import { useState } from 'react';
import { Search, Filter, Mail, MessageCircle, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const ReminderLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  // Mock delivery logs data
  const deliveryLogs = [
    {
      id: 1,
      reminderId: 1,
      reminderTitle: 'Service Rutin - B 1234 AB',
      recipient: 'fleet@company.com',
      channel: 'email',
      status: 'delivered',
      sentAt: '2024-12-28 08:00:15',
      deliveredAt: '2024-12-28 08:00:22',
      subject: 'Reminder: Service Kendaraan B 1234 AB',
      message: 'Kendaraan B 1234 AB perlu service dalam 7 hari. Jadwal: 2025-01-15',
      attempts: 1,
      errorMessage: null
    },
    {
      id: 2,
      reminderId: 1,
      reminderTitle: 'Service Rutin - B 1234 AB',
      recipient: '@johndoe',
      channel: 'telegram',
      status: 'delivered',
      sentAt: '2024-12-28 08:00:15',
      deliveredAt: '2024-12-28 08:00:18',
      subject: null,
      message: '🚛 Reminder: Kendaraan B 1234 AB perlu service dalam 7 hari. Jadwal: 15 Januari 2025',
      attempts: 1,
      errorMessage: null
    },
    {
      id: 3,
      reminderId: 2,
      reminderTitle: 'STNK Kadaluarsa - B 5678 CD',
      recipient: 'admin@company.com',
      channel: 'email',
      status: 'failed',
      sentAt: '2024-12-27 08:00:10',
      deliveredAt: null,
      subject: 'URGENT: STNK Kendaraan B 5678 CD Akan Kadaluarsa',
      message: 'STNK kendaraan B 5678 CD akan kadaluarsa dalam 30 hari. Tanggal: 2025-02-20',
      attempts: 3,
      errorMessage: 'SMTP authentication failed'
    },
    {
      id: 4,
      reminderId: 3,
      reminderTitle: 'KIR Renewal - B 9101 EF',
      recipient: '@fleetmanager',
      channel: 'telegram',
      status: 'pending',
      sentAt: '2024-12-28 07:45:00',
      deliveredAt: null,
      subject: null,
      message: '📋 KIR kendaraan B 9101 EF akan kadaluarsa dalam 15 hari. Tanggal: 01 Maret 2025',
      attempts: 2,
      errorMessage: 'Telegram API rate limit exceeded'
    },
    {
      id: 5,
      reminderId: 1,
      reminderTitle: 'Service Rutin - B 1234 AB',
      recipient: 'driver1@company.com',
      channel: 'email',
      status: 'delivered',
      sentAt: '2024-12-21 08:00:30',
      deliveredAt: '2024-12-21 08:00:35',
      subject: 'Reminder: Service Kendaraan B 1234 AB',
      message: 'Kendaraan B 1234 AB perlu service dalam 14 hari. Jadwal: 2025-01-15',
      attempts: 1,
      errorMessage: null
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'delivered': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getChannelIcon = (channel: string) => {
    return channel === 'email' ? <Mail className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />;
  };

  const filteredLogs = deliveryLogs.filter(log => {
    const matchesSearch = 
      log.reminderTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || log.channel === channelFilter;
    
    return matchesSearch && matchesStatus && matchesChannel;
  });

  const exportLogs = () => {
    // TODO: Implement export functionality
    console.log('Exporting logs...');
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Terkirim</p>
                <p className="text-xl font-bold text-green-600">
                  {deliveryLogs.filter(log => log.status === 'delivered').length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gagal</p>
                <p className="text-xl font-bold text-red-600">
                  {deliveryLogs.filter(log => log.status === 'failed').length}
                </p>
              </div>
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-yellow-600">
                  {deliveryLogs.filter(log => log.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-xl font-bold text-blue-600">
                  {Math.round((deliveryLogs.filter(log => log.status === 'delivered').length / deliveryLogs.length) * 100)}%
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari berdasarkan reminder, penerima, atau pesan..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="delivered">Terkirim</SelectItem>
            <SelectItem value="failed">Gagal</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Channel</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="telegram">Telegram</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportLogs} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Delivery Logs */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(log.status)}
                    <h3 className="font-semibold">{log.reminderTitle}</h3>
                    <Badge className={getStatusBadge(log.status)}>
                      {log.status === 'delivered' ? 'Terkirim' : 
                       log.status === 'failed' ? 'Gagal' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getChannelIcon(log.channel)}
                        <span className="font-medium">
                          {log.channel === 'email' ? 'Email' : 'Telegram'}
                        </span>
                        <span>→ {log.recipient}</span>
                      </div>
                      <div>
                        <span className="font-medium">Dikirim:</span> {log.sentAt}
                      </div>
                      {log.deliveredAt && (
                        <div>
                          <span className="font-medium">Terkirim:</span> {log.deliveredAt}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div>
                        <span className="font-medium">Percobaan:</span> {log.attempts}
                      </div>
                      {log.subject && (
                        <div>
                          <span className="font-medium">Subject:</span> {log.subject}
                        </div>
                      )}
                      {log.errorMessage && (
                        <div className="text-red-600">
                          <span className="font-medium">Error:</span> {log.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Pesan:</span>
                      <p className="mt-1 text-gray-600">{log.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Tidak ada log pengiriman yang ditemukan</p>
        </div>
      )}
    </div>
  );
};

export default ReminderLogs;
