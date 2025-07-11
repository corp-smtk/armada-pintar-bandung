import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, MessageSquare, Settings } from 'lucide-react';
import { autoConfigService } from '@/services/AutoConfigService';

interface AutoConfigStatusWidgetProps {
  compact?: boolean;
  className?: string;
}

const AutoConfigStatusWidget: React.FC<AutoConfigStatusWidgetProps> = ({ 
  compact = false, 
  className = "" 
}) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = () => {
    try {
      const autoStatus = autoConfigService.getSystemStatus();
      setStatus(autoStatus);
    } catch (error) {
      console.error('Failed to load auto-config status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-gray-600">Checking system status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {status?.autoConfigured ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Ready
            </Badge>
          </>
        ) : (
          <>
            <Settings className="h-4 w-4 text-orange-500" />
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
              Setup Needed
            </Badge>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-gray-600" />
              <h4 className="font-medium text-sm">System Status</h4>
            </div>
            
            {status?.autoConfigured ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Auto-configured and ready</span>
                </div>
                
                <div className="flex items-center gap-4 ml-6">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-blue-500" />
                    <span className={`text-xs ${status.emailReady ? 'text-green-600' : 'text-red-600'}`}>
                      Email {status.emailReady ? '✓' : '✗'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-green-500" />
                    <span className={`text-xs ${status.whatsappReady ? 'text-green-600' : 'text-red-600'}`}>
                      WhatsApp {status.whatsappReady ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-sm text-gray-700">System configuration needed</span>
              </div>
            )}
          </div>
          
          <Badge 
            variant="secondary" 
            className={
              status?.autoConfigured 
                ? "bg-green-100 text-green-800" 
                : "bg-orange-100 text-orange-800"
            }
          >
            {status?.autoConfigured ? 'Ready' : 'Setup'}
          </Badge>
        </div>
        
        {status?.lastConfigured && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Configured: {new Date(status.lastConfigured).toLocaleDateString('id-ID')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoConfigStatusWidget; 