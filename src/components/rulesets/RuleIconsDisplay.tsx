
import React from 'react';
import { AlertTriangle, Ban, Infinity, Check } from 'lucide-react';
import { CompleteRuleSet } from '@/types';

interface RuleIconsDisplayProps {
  ruleSet: CompleteRuleSet;
}

const RuleIconsDisplay: React.FC<RuleIconsDisplayProps> = ({ ruleSet }) => {
  return (
    <div className="flex space-x-2">
      {/* ① Cooling-Off ⚠ */}
      <AlertTriangle 
        className={`h-5 w-5 ${ruleSet.enabledRules.coolingOff ? 'text-warning' : 'text-gray-300'}`} 
      />
      {/* ② Guard ⛔ */}
      <Ban 
        className={`h-5 w-5 ${ruleSet.enabledRules.sameDirectionGuard ? 'text-primary' : 'text-gray-300'}`} 
      />
      {/* ③ Active-Cap ∞ */}
      <Infinity 
        className={`h-5 w-5 ${ruleSet.enabledRules.maxActiveTrades ? 'text-secondary' : 'text-gray-300'}`} 
      />
      {/* ④ Cancel-Limit ✔ */}
      <Check 
        className={`h-5 w-5 ${ruleSet.enabledRules.positivePipCancelLimit ? 'text-success' : 'text-gray-300'}`} 
      />
    </div>
  );
};

export default RuleIconsDisplay;
