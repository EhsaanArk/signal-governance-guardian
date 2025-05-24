
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import ComplianceTooltip from '@/components/common/ComplianceTooltip';
import { TransformedCooldownData } from '@/lib/transformers/DashboardDataTransformers';

interface CooldownTablePresentationProps {
  cooldowns: TransformedCooldownData[];
  loading: boolean;
  onEndCooldown: (cooldownId: string) => void;
}

const CooldownTablePresentation: React.FC<CooldownTablePresentationProps> = ({ 
  cooldowns, 
  loading, 
  onEndCooldown 
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!cooldowns || cooldowns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No active cooldowns</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cooldowns.slice(0, 5).map((cooldown) => (
        <div key={cooldown.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{cooldown.ruleName}</span>
            </div>
            <p className="text-xs text-gray-600 mb-1">
              {cooldown.market} • {cooldown.symbol}
            </p>
            <p className="text-xs text-blue-600">
              {cooldown.timeRemaining}
            </p>
          </div>
          <ComplianceTooltip>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
              disabled={!cooldown.canEndEarly}
              onClick={() => onEndCooldown(cooldown.id)}
            >
              End Now
            </Button>
          </ComplianceTooltip>
        </div>
      ))}
    </div>
  );
};

export default CooldownTablePresentation;
