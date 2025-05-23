
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PositivePipCancelLimitRule } from '@/types';

interface PositivePipCancelRuleProps {
  value: PositivePipCancelLimitRule;
  onChange: (value: PositivePipCancelLimitRule) => void;
  disabled?: boolean;
}

const PositivePipCancelRule: React.FC<PositivePipCancelRuleProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  const handlePLBandChange = (field: 'from' | 'to', newValue: number) => {
    onChange({
      ...value,
      plBand: {
        ...value.plBand,
        [field]: newValue
      }
    });
  };
  
  const handleMinHoldTime = (newValue: number) => {
    onChange({
      ...value,
      minHoldTime: newValue
    });
  };
  
  const handleMaxCancels = (newValue: number) => {
    onChange({
      ...value,
      maxCancels: newValue
    });
  };
  
  const handleWindowChange = (newValue: 'UTCDay' | 'Custom') => {
    onChange({
      ...value,
      window: newValue
    });
  };
  
  const handleSuspensionDuration = (newValue: number) => {
    onChange({
      ...value,
      suspensionDuration: newValue
    });
  };
  
  return (
    <div className={`space-y-6 ${disabled ? 'opacity-50' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>P/L Band (pips)</Label>
          <div className="flex items-center space-x-2">
            <div className="w-full">
              <Label htmlFor="pl-from" className="text-xs">From</Label>
              <Input
                id="pl-from"
                type="number"
                value={value.plBand.from}
                onChange={(e) => handlePLBandChange('from', parseInt(e.target.value) || 0)}
                min={0}
                disabled={disabled}
              />
            </div>
            <div className="w-full">
              <Label htmlFor="pl-to" className="text-xs">To</Label>
              <Input
                id="pl-to"
                type="number"
                value={value.plBand.to}
                onChange={(e) => handlePLBandChange('to', parseInt(e.target.value) || 0)}
                min={value.plBand.from + 1}
                disabled={disabled}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            P/L range in pips where the rule applies.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="min-hold-time">Min Hold Time (minutes)</Label>
          <Input
            id="min-hold-time"
            type="number"
            value={value.minHoldTime}
            onChange={(e) => handleMinHoldTime(parseInt(e.target.value) || 0)}
            min={0}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Minimum time a trade must be held before cancelation.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="max-cancels">Max Cancellations</Label>
          <Input
            id="max-cancels"
            type="number"
            value={value.maxCancels}
            onChange={(e) => handleMaxCancels(parseInt(e.target.value) || 0)}
            min={0}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Maximum allowed cancellations within the window.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="window-type">Window</Label>
          <Select
            value={value.window}
            onValueChange={(val) => handleWindowChange(val as 'UTCDay' | 'Custom')}
            disabled={disabled}
          >
            <SelectTrigger id="window-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTCDay">UTC Day</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Time period within which the limit applies.
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="suspension-duration">Suspension Duration (hours)</Label>
        <Input
          id="suspension-duration"
          type="number"
          value={value.suspensionDuration}
          onChange={(e) => handleSuspensionDuration(parseInt(e.target.value) || 1)}
          min={1}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Duration for which trading will be suspended if limit is exceeded.
        </p>
      </div>
    </div>
  );
};

export default PositivePipCancelRule;
