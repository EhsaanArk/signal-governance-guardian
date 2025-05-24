import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import CoolingOffRule from './rules/CoolingOffRule';
import SameDirectionGuardRule from './rules/SameDirectionGuardRule';
import MaxActiveTradesRule from './rules/MaxActiveTradesRule';
import PositivePipCancelRule from './rules/PositivePipCancelRule';
import RuleSummary from './RuleSummary';

import {
  Market,
  CoolingOffRule as CoolingOffRuleType,
  SameDirectionGuardRule as SameDirectionGuardRuleType,
  MaxActiveTradesRule as MaxActiveTradesRuleType,
  PositivePipCancelLimitRule as PositivePipCancelLimitRuleType
} from '@/types';

interface Step2RulesProps {
  initialData?: {
    coolingOff?: CoolingOffRuleType;
    sameDirectionGuard?: SameDirectionGuardRuleType;
    maxActiveTrades?: MaxActiveTradesRuleType;
    positivePipCancelLimit?: PositivePipCancelLimitRuleType;
  };
  selectedMarket?: Market;
  onBack: () => void;
  onSave: (data: {
    coolingOff: CoolingOffRuleType;
    sameDirectionGuard: SameDirectionGuardRuleType;
    maxActiveTrades: MaxActiveTradesRuleType;
    positivePipCancelLimit: PositivePipCancelLimitRuleType;
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

const Step2Rules: React.FC<Step2RulesProps> = ({ 
  initialData, 
  selectedMarket,
  onBack, 
  onSave, 
  onCancel,
  isEditing = false,
  isLoading = false
}) => {
  const [coolingOff, setCoolingOff] = useState<CoolingOffRuleType>(
    initialData?.coolingOff || {
      enabled: false,
      tiers: [{ threshold: 2, window: 12, coolOff: 24 }],
      metric: 'SLCount',
    }
  );
  
  const [sameDirectionGuard, setSameDirectionGuard] = useState<SameDirectionGuardRuleType>(
    initialData?.sameDirectionGuard || {
      enabled: false,
      pairScope: 'All',
      directions: { long: true, short: true },
      selectedPairs: [],
    }
  );
  
  const [maxActiveTrades, setMaxActiveTrades] = useState<MaxActiveTradesRuleType>(
    initialData?.maxActiveTrades || {
      enabled: false,
      baseCap: 10,
      incrementPerWin: 1,
      hardCap: null,
      resetPolicy: 'Never',
    }
  );
  
  const [positivePipCancelLimit, setPositivePipCancelLimit] = useState<PositivePipCancelLimitRuleType>(
    initialData?.positivePipCancelLimit || {
      enabled: false,
      plBand: { from: 0, to: 10 },
      minHoldTime: 5,
      maxCancels: 2,
      window: 'UTCDay',
      suspensionDuration: 24,
    }
  );
  
  // Check if at least one rule is enabled for save button status
  const isAnyRuleEnabled = 
    coolingOff.enabled || 
    sameDirectionGuard.enabled || 
    maxActiveTrades.enabled || 
    positivePipCancelLimit.enabled;
  
  const handleSave = () => {
    onSave({
      coolingOff,
      sameDirectionGuard,
      maxActiveTrades,
      positivePipCancelLimit
    });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Accordion type="multiple" defaultValue={["cooling-off"]} className="w-full">
          <AccordionItem value="cooling-off">
            <AccordionTrigger className="flex justify-between">
              <div className="flex items-center gap-4">
                <span>Cooling-Off (SL-based)</span>
                <Switch
                  checked={coolingOff.enabled}
                  onCheckedChange={(checked) => {
                    setCoolingOff(prev => ({ ...prev, enabled: checked }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CoolingOffRule 
                value={coolingOff} 
                onChange={setCoolingOff}
                disabled={!coolingOff.enabled}
              />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="same-direction">
            <AccordionTrigger className="flex justify-between">
              <div className="flex items-center gap-4">
                <span>Same-Direction Guard</span>
                <Switch
                  checked={sameDirectionGuard.enabled}
                  onCheckedChange={(checked) => {
                    setSameDirectionGuard(prev => ({ ...prev, enabled: checked }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <SameDirectionGuardRule 
                value={sameDirectionGuard} 
                onChange={setSameDirectionGuard}
                disabled={!sameDirectionGuard.enabled}
                selectedMarket={selectedMarket}
              />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="max-active">
            <AccordionTrigger className="flex justify-between">
              <div className="flex items-center gap-4">
                <span>Max Active Trades</span>
                <Switch
                  checked={maxActiveTrades.enabled}
                  onCheckedChange={(checked) => {
                    setMaxActiveTrades(prev => ({ ...prev, enabled: checked }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <MaxActiveTradesRule 
                value={maxActiveTrades} 
                onChange={setMaxActiveTrades}
                disabled={!maxActiveTrades.enabled}
              />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="positive-pip">
            <AccordionTrigger className="flex justify-between">
              <div className="flex items-center gap-4">
                <span>Positive-Pip Cancel-Limit</span>
                <Switch
                  checked={positivePipCancelLimit.enabled}
                  onCheckedChange={(checked) => {
                    setPositivePipCancelLimit(prev => ({ ...prev, enabled: checked }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <PositivePipCancelRule 
                value={positivePipCancelLimit} 
                onChange={setPositivePipCancelLimit}
                disabled={!positivePipCancelLimit.enabled}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onBack} disabled={isLoading}>
            ← Back
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!isAnyRuleEnabled || isLoading}
            >
              {isLoading ? 'Creating...' : (isEditing ? 'Save Rule Set' : 'Create Rule Set')}
            </Button>
          </div>
        </div>
      </div>
      
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
    </div>
  );
};

export default Step2Rules;
