
import React from 'react';
import { AlertTriangle, Ban, Infinity, Check } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { CompleteRuleSet } from '@/types';

interface RuleIconsDisplayProps {
  ruleSet: CompleteRuleSet;
}

const RuleIconsDisplay: React.FC<RuleIconsDisplayProps> = ({ ruleSet }) => {
  return (
    <TooltipProvider>
      <div className="flex space-x-2">
        {/* ① Cooling-Off ⚠ */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <AlertTriangle 
                className={`h-5 w-5 cursor-help ${
                  ruleSet.enabledRules.coolingOff ? 'text-warning' : 'text-gray-300'
                }`} 
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">Cooling-Off Rule</div>
              <div className="text-xs text-muted-foreground">
                Temporarily restricts trading after stop losses
              </div>
              <div className={`text-xs mt-1 ${
                ruleSet.enabledRules.coolingOff ? 'text-green-600' : 'text-red-600'
              }`}>
                {ruleSet.enabledRules.coolingOff ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* ② Guard ⛔ */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Ban 
                className={`h-5 w-5 cursor-help ${
                  ruleSet.enabledRules.sameDirectionGuard ? 'text-primary' : 'text-gray-300'
                }`} 
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">Same Direction Guard</div>
              <div className="text-xs text-muted-foreground">
                Prevents multiple trades in the same direction
              </div>
              <div className={`text-xs mt-1 ${
                ruleSet.enabledRules.sameDirectionGuard ? 'text-green-600' : 'text-red-600'
              }`}>
                {ruleSet.enabledRules.sameDirectionGuard ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* ③ Active-Cap ∞ */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Infinity 
                className={`h-5 w-5 cursor-help ${
                  ruleSet.enabledRules.maxActiveTrades ? 'text-secondary' : 'text-gray-300'
                }`} 
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">Max Active Trades</div>
              <div className="text-xs text-muted-foreground">
                Limits the number of concurrent trades
              </div>
              <div className={`text-xs mt-1 ${
                ruleSet.enabledRules.maxActiveTrades ? 'text-green-600' : 'text-red-600'
              }`}>
                {ruleSet.enabledRules.maxActiveTrades ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* ④ Cancel-Limit ✔ */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Check 
                className={`h-5 w-5 cursor-help ${
                  ruleSet.enabledRules.positivePipCancelLimit ? 'text-success' : 'text-gray-300'
                }`} 
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">Positive Pip Cancel Limit</div>
              <div className="text-xs text-muted-foreground">
                Restricts cancelling profitable trades
              </div>
              <div className={`text-xs mt-1 ${
                ruleSet.enabledRules.positivePipCancelLimit ? 'text-green-600' : 'text-red-600'
              }`}>
                {ruleSet.enabledRules.positivePipCancelLimit ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default RuleIconsDisplay;
