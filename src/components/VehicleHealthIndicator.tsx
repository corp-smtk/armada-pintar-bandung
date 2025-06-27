
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VehicleHealthIndicatorProps {
  vehicleId: string;
  kmTempuh: number;
  tahunPembuatan: number;
  lastServiceDays: number;
  totalPerbaikan: number;
}

const VehicleHealthIndicator = ({ 
  vehicleId, 
  kmTempuh, 
  tahunPembuatan, 
  lastServiceDays, 
  totalPerbaikan 
}: VehicleHealthIndicatorProps) => {
  
  // Calculate health score based on multiple factors
  const calculateHealthScore = () => {
    let score = 100;
    
    // Age factor (lose 5 points per year after 5 years)
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - tahunPembuatan;
    if (vehicleAge > 5) {
      score -= (vehicleAge - 5) * 5;
    }
    
    // KM factor (lose points based on high mileage)
    if (kmTempuh > 100000) {
      score -= Math.floor((kmTempuh - 100000) / 10000) * 3;
    }
    
    // Service frequency factor
    if (lastServiceDays > 90) {
      score -= 15;
    } else if (lastServiceDays > 60) {
      score -= 8;
    }
    
    // Repair frequency factor
    if (totalPerbaikan > 10) {
      score -= totalPerbaikan * 2;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();
  
  const getHealthStatus = () => {
    if (healthScore >= 80) {
      return {
        status: 'Excellent',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: CheckCircle,
        label: 'Sangat Baik'
      };
    } else if (healthScore >= 60) {
      return {
        status: 'Good',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: Clock,
        label: 'Baik'
      };
    } else if (healthScore >= 40) {
      return {
        status: 'Fair',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        icon: AlertTriangle,
        label: 'Perlu Perhatian'
      };
    } else {
      return {
        status: 'Poor',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: XCircle,
        label: 'Buruk'
      };
    }
  };

  const health = getHealthStatus();
  const Icon = health.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${health.bgColor} ${health.color} border-0 font-medium`}>
        <Icon className="h-3 w-3 mr-1" />
        {health.label}
      </Badge>
      <div className="text-sm text-gray-600">
        {healthScore}/100
      </div>
    </div>
  );
};

export default VehicleHealthIndicator;
