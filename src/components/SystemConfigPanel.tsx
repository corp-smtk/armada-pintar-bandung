import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Info, Settings, Mail, MessageSquare, MessageCircle, Shield } from 'lucide-react';
import { systemConfigService } from '@/services/SystemConfigService';
import type { SystemConfigStatus } from '@/services/SystemConfigService';

interface SystemConfigPanelProps {
  onClose?: () => void;
}

const SystemConfigPanel: React.FC<SystemConfigPanelProps> = ({ onClose }) => {
  const [configStatus, setConfigStatus] = useState<SystemConfigStatus | null>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = () => {
    setLoading(true);
    try {
      const status = systemConfigService.getConfigStatus();
      const info = systemConfigService.getSystemInfo();
      const readyStatus = systemConfigService.isSystemReady();
      
      setConfigStatus(status);
      setSystemInfo({
        ...info,
        readyStatus
      });
    } catch (error) {
      console.error('Error loading system info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: 'system' | 'user' | 'none') => {
    switch (status) {
      case 'system':
        return <Badge className="bg-blue-100 text-blue-800">System Configured</Badge>;
      case 'user':
        return <Badge className="bg-green-100 text-green-800">User Configured</Badge>;
      case 'none':
        return <Badge className="bg-red-100 text-red-800">Not Configured</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: 'system' | 'user' | 'none') => {
    switch (status) {
      case 'system':
      case 'user':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'none':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'email':
        return <Mail className="h-6 w-6 text-blue-500" />;
      case 'whatsapp':
        return <MessageSquare className="h-6 w-6 text-green-500" />;
      case 'telegram':
        return <MessageCircle className="h-6 w-6 text-blue-600" />;
      default:
        return <Settings className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading system configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
            <p className="text-sm text-gray-600">Central system settings and service status</p>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {systemInfo?.readyStatus ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>System Ready:</strong> All communication services are configured and ready to use.
                Users can start sending reminders immediately without any additional setup.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Partial Configuration:</strong> Some services need configuration.
                Missing: {systemInfo?.readyStatus?.missing?.join(', ') || 'Unknown'}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemInfo?.version || '1.0.0'}</div>
              <div className="text-sm text-gray-600">System Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {configStatus ? Object.values(configStatus).filter(s => s !== 'none').length : 0}
              </div>
              <div className="text-sm text-gray-600">Active Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Auto</div>
              <div className="text-sm text-gray-600">Configuration Mode</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configStatus && Object.entries(configStatus).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getServiceIcon(service)}
                  <div>
                    <h3 className="font-semibold capitalize">{service} Service</h3>
                    <p className="text-sm text-gray-600">
                      {systemInfo?.services?.[service]?.provider || 'Unknown Provider'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  {getStatusBadge(status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold">System Configuration</h4>
                <p className="text-sm text-gray-600">
                  The system comes pre-configured with working EmailJS and Zapin WhatsApp API credentials.
                  This means reminders work immediately without any setup required.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold">User Override (Optional)</h4>
                <p className="text-sm text-gray-600">
                  Advanced users can configure their own EmailJS, Zapin, or Telegram credentials in the settings.
                  When user credentials are provided, they take priority over system configuration.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold">Automatic Fallback</h4>
                <p className="text-sm text-gray-600">
                  If user configuration is incomplete or fails, the system automatically falls back to
                  the reliable system configuration to ensure reminders are always delivered.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Works Out-of-the-Box</h4>
                <p className="text-sm text-gray-600">No technical setup required for users</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Secure & Reliable</h4>
                <p className="text-sm text-gray-600">Credentials managed securely on the server</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Flexible</h4>
                <p className="text-sm text-gray-600">Users can still use their own credentials if needed</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold">Automatic Fallback</h4>
                <p className="text-sm text-gray-600">System ensures reminders are always delivered</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemConfigPanel; 