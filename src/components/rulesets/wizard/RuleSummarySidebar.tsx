
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import RuleSummary from './RuleSummary';

import {
  CoolingOffRule,
  SameDirectionGuardRule,
  MaxActiveTradesRule,
  PositivePipCancelLimitRule
} from '@/types';

interface RuleSummarySidebarProps {
  coolingOff: CoolingOffRule;
  sameDirectionGuard: SameDirectionGuardRule;
  maxActiveTrades: MaxActiveTradesRule;
  positivePipCancelLimit: PositivePipCancelLimitRule;
}

const RuleSummarySidebar: React.FC<RuleSummarySidebarProps> = ({
  coolingOff,
  sameDirectionGuard,
  maxActiveTrades,
  positivePipCancelLimit
}) => {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium text-lg mb-3">Rule Set Summary</h3>
      <RuleSummary 
        coolingOff={coolingOff}
        sameDirectionGuard={sameDirectionGuard}
        maxActiveTrades={maxActiveTrades}
        positivePipCancelLimit={positivePipCancelLimit}
      />
      
      <Separator className="my-4" />
      
      <h3 className="font-medium text-lg mb-3">JSON Preview</h3>
      <div className="bg-muted p-3 rounded-md overflow-auto max-h-[300px]">
        <pre className="text-xs">
          {JSON.stringify(
            {
              coolingOff,
              sameDirectionGuard,
              maxActiveTrades,
              positivePipCancelLimit
            }, 
            null, 
            2
          )}
        </pre>
      </div>
      
      <Button variant="outline" className="w-full mt-4">
        Run Simulation
      </Button>
    </div>
  );
};

export default RuleSummarySidebar;
