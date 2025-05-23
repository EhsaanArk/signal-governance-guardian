
import React from 'react';
import { Check, X } from 'lucide-react';
import {
  CoolingOffRule,
  SameDirectionGuardRule,
  MaxActiveTradesRule,
  PositivePipCancelLimitRule
} from '@/types';

interface RuleSummaryProps {
  coolingOff: CoolingOffRule;
  sameDirectionGuard: SameDirectionGuardRule;
  maxActiveTrades: MaxActiveTradesRule;
  positivePipCancelLimit: PositivePipCancelLimitRule;
}

const RuleSummaryItem = ({ 
  title, 
  enabled, 
  description 
}: { 
  title: string; 
  enabled: boolean; 
  description: string 
}) => (
  <div className="mb-3">
    <div className="flex items-center gap-2">
      {enabled ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <h4 className={`font-medium ${enabled ? '' : 'text-muted-foreground'}`}>{title}</h4>
    </div>
    {enabled && <p className="ml-6 text-sm text-muted-foreground">{description}</p>}
  </div>
);

const RuleSummary: React.FC<RuleSummaryProps> = ({
  coolingOff,
  sameDirectionGuard,
  maxActiveTrades,
  positivePipCancelLimit
}) => {
  // Generate plain-English summary for cooling off rule
  const coolingOffSummary = () => {
    if (!coolingOff.enabled || coolingOff.tiers.length === 0) return "";
    
    const tier = coolingOff.tiers[0]; // Just taking the first tier for simplicity
    return `Pause trading after ${tier.threshold} ${coolingOff.metric === 'SLCount' ? 'stop-losses' : 'consecutive losses'} within ${tier.window}h for ${tier.coolOff}h.`;
  };
  
  // Generate plain-English summary for same direction guard
  const sameDirectionSummary = () => {
    if (!sameDirectionGuard.enabled) return "";
    
    const directions = [];
    if (sameDirectionGuard.directions.long) directions.push("long");
    if (sameDirectionGuard.directions.short) directions.push("short");
    
    return `Prevent consecutive ${directions.join(" and ")} trades for ${sameDirectionGuard.pairScope === 'All' ? 'all pairs' : 'selected pairs'}.`;
  };
  
  // Generate plain-English summary for max active trades
  const maxActiveTradesSummary = () => {
    if (!maxActiveTrades.enabled) return "";
    
    return `Start with ${maxActiveTrades.baseCap} max trades, ` + 
           `increase by ${maxActiveTrades.incrementPerWin} per win` + 
           `${maxActiveTrades.hardCap ? `, up to ${maxActiveTrades.hardCap} max` : `, no hard cap`}. ` +
           `Reset: ${maxActiveTrades.resetPolicy === 'Never' ? 'Never' : 
                     maxActiveTrades.resetPolicy === 'Monthly' ? 'Monthly' : 
                     'On first stop-loss'}.`;
  };
  
  // Generate plain-English summary for positive pip cancel limit
  const positivePipSummary = () => {
    if (!positivePipCancelLimit.enabled) return "";
    
    return `When P/L is +${positivePipCancelLimit.plBand.from} to +${positivePipCancelLimit.plBand.to} pips, ` +
           `allow max ${positivePipCancelLimit.maxCancels} cancels per ${positivePipCancelLimit.window === 'UTCDay' ? 'UTC day' : 'custom window'} ` +
           `after ${positivePipCancelLimit.minHoldTime}min hold. ` +
           `Suspend for ${positivePipCancelLimit.suspensionDuration}h on violation.`;
  };
  
  return (
    <div>
      <RuleSummaryItem 
        title="Cooling-Off" 
        enabled={coolingOff.enabled} 
        description={coolingOffSummary()}
      />
      
      <RuleSummaryItem 
        title="Same-Direction Guard" 
        enabled={sameDirectionGuard.enabled} 
        description={sameDirectionSummary()}
      />
      
      <RuleSummaryItem 
        title="Max Active Trades" 
        enabled={maxActiveTrades.enabled} 
        description={maxActiveTradesSummary()}
      />
      
      <RuleSummaryItem 
        title="Positive-Pip Cancel-Limit" 
        enabled={positivePipCancelLimit.enabled} 
        description={positivePipSummary()}
      />
    </div>
  );
};

export default RuleSummary;
