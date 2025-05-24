
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { TransformedBreachData } from '@/lib/transformers/DashboardDataTransformers';

interface BreachTablePresentationProps {
  breaches: TransformedBreachData[];
  loading: boolean;
}

const BreachTablePresentation: React.FC<BreachTablePresentationProps> = ({ breaches, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!breaches || breaches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent breaches in selected period</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-3">
      {breaches.slice(0, 5).map((breach) => (
        <div key={breach.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getSeverityColor(breach.severity)} className="text-xs">
                {breach.ruleType}
              </Badge>
              <span className="text-xs text-gray-500">
                {breach.timeAgo}
              </span>
            </div>
            <p className="text-sm font-medium truncate">{breach.ruleName}</p>
            <p className="text-xs text-gray-600">{breach.market} • {breach.symbol}</p>
          </div>
          <Badge 
            variant={breach.status === 'active' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {breach.status}
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default BreachTablePresentation;
