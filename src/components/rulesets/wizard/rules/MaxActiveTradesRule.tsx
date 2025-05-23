
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MaxActiveTradesRule as MaxActiveTradesRuleType } from '@/types';

interface MaxActiveTradesRuleProps {
  value: MaxActiveTradesRuleType;
  onChange: (value: MaxActiveTradesRuleType) => void;
  disabled?: boolean;
}

const MaxActiveTradesRule: React.FC<MaxActiveTradesRuleProps> = ({ value, onChange, disabled = false }) => {
  const handleBaseCap = (newValue: number) => {
    onChange({
      ...value,
      baseCap: newValue
    });
  };
  
  const handleIncrementPerWin = (newValue: number) => {
    onChange({
      ...value,
      incrementPerWin: newValue
    });
  };
  
  const handleHardCap = (newValue: number | null) => {
    onChange({
      ...value,
      hardCap: newValue
    });
  };
  
  const handleInfiniteToggle = (checked: boolean) => {
    onChange({
      ...value,
      hardCap: checked ? null : 20 // Default cap if not infinite
    });
  };
  
  const handleResetPolicy = (newValue: 'Never' | 'Monthly' | 'OnFirstSL') => {
    onChange({
      ...value,
      resetPolicy: newValue
    });
  };
  
  return (
    <div className={`space-y-6 ${disabled ? 'opacity-50' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="base-cap">Base Cap</Label>
          <Input
            id="base-cap"
            type="number"
            value={value.baseCap}
            onChange={(e) => handleBaseCap(parseInt(e.target.value) || 1)}
            min={1}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Initial maximum number of active trades allowed.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="increment">Increment per Win</Label>
          <Input
            id="increment"
            type="number"
            value={value.incrementPerWin}
            onChange={(e) => handleIncrementPerWin(parseInt(e.target.value) || 0)}
            min={0}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Increase cap by this amount after each profitable trade.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="hard-cap">Hard Cap</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="infinite"
                  checked={value.hardCap === null}
                  onCheckedChange={handleInfiniteToggle}
                  disabled={disabled}
                />
                <Label htmlFor="infinite" className="text-sm">Infinite (∞)</Label>
              </div>
            </div>
            <Input
              id="hard-cap"
              type="number"
              value={value.hardCap === null ? '' : value.hardCap}
              onChange={(e) => handleHardCap(e.target.value ? parseInt(e.target.value) : null)}
              min={1}
              disabled={disabled || value.hardCap === null}
            />
            <p className="text-xs text-muted-foreground">
              Maximum limit regardless of win streak.
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reset-policy">Reset Policy</Label>
          <Select
            value={value.resetPolicy}
            onValueChange={(val) => handleResetPolicy(val as 'Never' | 'Monthly' | 'OnFirstSL')}
            disabled={disabled}
          >
            <SelectTrigger id="reset-policy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Never">Never</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="OnFirstSL">On 1st SL</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            When to reset the trade cap back to base value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaxActiveTradesRule;
