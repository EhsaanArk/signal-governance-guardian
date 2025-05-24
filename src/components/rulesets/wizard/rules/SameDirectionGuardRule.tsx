
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { SameDirectionGuardRule as SameDirectionGuardRuleType, Market } from '@/types';
import { getMarketPairs } from '@/constants/marketPairs';
import PairSelector from './PairSelector';

interface SameDirectionGuardRuleProps {
  value: SameDirectionGuardRuleType;
  onChange: (value: SameDirectionGuardRuleType) => void;
  disabled?: boolean;
  selectedMarket?: Market;
}

const SameDirectionGuardRule: React.FC<SameDirectionGuardRuleProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  selectedMarket 
}) => {
  const marketPairs = selectedMarket ? getMarketPairs(selectedMarket) : [];
  
  const handlePairScopeChange = (newScope: 'All' | 'Select') => {
    onChange({
      ...value,
      pairScope: newScope,
      selectedPairs: newScope === 'All' ? [] : value.selectedPairs || []
    });
  };
  
  const handleDirectionChange = (direction: 'long' | 'short', checked: boolean) => {
    onChange({
      ...value,
      directions: {
        ...value.directions,
        [direction]: checked
      }
    });
  };

  const handleSelectedPairsChange = (selectedPairs: string[]) => {
    onChange({
      ...value,
      selectedPairs
    });
  };
  
  return (
    <div className={`space-y-6 ${disabled ? 'opacity-50' : ''}`}>
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Pair Scope</h4>
        <RadioGroup
          value={value.pairScope}
          onValueChange={(val) => handlePairScopeChange(val as 'All' | 'Select')}
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="All" id="all" />
            <Label htmlFor="all">
              All pairs {selectedMarket && `(${marketPairs.length} pairs for ${selectedMarket})`}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Select" id="select" />
            <Label htmlFor="select">Select specific pairs</Label>
          </div>
        </RadioGroup>

        {value.pairScope === 'Select' && selectedMarket && (
          <div className="mt-4">
            <h5 className="text-sm font-medium mb-2">Select {selectedMarket} Pairs</h5>
            <PairSelector
              pairs={marketPairs}
              selectedPairs={value.selectedPairs || []}
              onChange={handleSelectedPairsChange}
              disabled={disabled}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Direction</h4>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="long" 
              checked={value.directions.long}
              onCheckedChange={(checked) => handleDirectionChange('long', !!checked)}
              disabled={disabled}
            />
            <Label htmlFor="long">Long</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="short" 
              checked={value.directions.short}
              onCheckedChange={(checked) => handleDirectionChange('short', !!checked)}
              disabled={disabled}
            />
            <Label htmlFor="short">Short</Label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          This rule prevents signals with the same direction from being sent consecutively within the specified scope.
        </p>
      </div>
    </div>
  );
};

export default SameDirectionGuardRule;
