
import { useState, useEffect } from 'react';
import { Search, Filter, Mail, MessageCircle, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useReminderService } from './ReminderService';

const ReminderLogs = () => {
  const reminderService = useReminderService();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [reminderFilter, setReminderFilter] = useState('all');
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);

  useEffect(() => {
    setDeliveryLogs(reminderService.getDeliveryLogs());
  }, []);

  const allReminders = Array.from(new Set(deliveryLogs.map(log => log.reminderTitle)));

  const handleRetry = async (log: any) => {
    const reminder = reminderService.getReminderConfigs().find(r => r.id === log.reminderId);
    if (reminder) {
      await reminderService.sendReminder(reminder);
      setDeliveryLogs(reminderService.getDeliveryLogs());
    }
  };

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
    const matchesReminder = reminderFilter === 'all' || log.reminderTitle === reminderFilter;
    return matchesSearch && matchesStatus && matchesChannel && matchesReminder;
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
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={reminderFilter} onValueChange={setReminderFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter Reminder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Reminder</SelectItem>
            {allReminders.map(title => (
              <SelectItem key={title} value={title}>{title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Channel</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="telegram">Telegram</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="delivered">Terkirim</SelectItem>
            <SelectItem value="failed">Gagal</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportLogs} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Log Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Date/Time</th>
              <th className="p-2 text-left">Reminder</th>
              <th className="p-2 text-left">Channel</th>
              <th className="p-2 text-left">Recipient</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Error</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{log.sentAt ? new Date(log.sentAt).toLocaleString('id-ID') : '-'}</td>
                <td className="p-2">{log.reminderTitle}</td>
                <td className="p-2">{log.channel}</td>
                <td className="p-2">{log.recipient}</td>
                <td className="p-2">
                  <span className={
                    log.status === 'delivered' ? 'text-green-600' :
                    log.status === 'failed' ? 'text-red-600' :
                    'text-gray-600'
                  }>
                    {log.status}
                  </span>
                </td>
                <td className="p-2 text-xs text-red-600">{log.errorMessage || '-'}</td>
                <td className="p-2">
                  {log.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleRetry(log)}
                    >
                      Retry
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
