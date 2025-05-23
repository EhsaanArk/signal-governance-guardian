
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CoolingOffRule as CoolingOffRuleType } from '@/types';

interface CoolingOffRuleProps {
  value: CoolingOffRuleType;
  onChange: (value: CoolingOffRuleType) => void;
  disabled?: boolean;
}

const CoolingOffRule: React.FC<CoolingOffRuleProps> = ({ value, onChange, disabled = false }) => {
  const handleMetricChange = (newMetric: 'SLCount' | 'Consecutive') => {
    onChange({
      ...value,
      metric: newMetric
    });
  };
  
  const handleTierChange = (index: number, field: string, newValue: number) => {
    const newTiers = [...value.tiers];
    newTiers[index] = {
      ...newTiers[index],
      [field]: newValue
    };
    onChange({
      ...value,
      tiers: newTiers
    });
  };
  
  const addTier = () => {
    // Create a new tier based on the last one
    const lastTier = value.tiers[value.tiers.length - 1];
    const newTier = {
      threshold: lastTier.threshold + 1,
      window: lastTier.window,
      coolOff: lastTier.coolOff * 2
    };
    
    onChange({
      ...value,
      tiers: [...value.tiers, newTier]
    });
  };
  
  const removeTier = (index: number) => {
    if (value.tiers.length <= 1) return;
    
    const newTiers = value.tiers.filter((_, i) => i !== index);
    onChange({
      ...value,
      tiers: newTiers
    });
  };
  
  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Metric</h4>
          <Select
            value={value.metric}
            onValueChange={(val) => handleMetricChange(val as 'SLCount' | 'Consecutive')}
            disabled={disabled}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SLCount">SL Count</SelectItem>
              <SelectItem value="Consecutive">Consecutive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Tiers</h4>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addTier}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Tier
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Threshold</TableHead>
              <TableHead>Window (hours)</TableHead>
              <TableHead>Cool-off (hours)</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {value.tiers.map((tier, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="number"
                    value={tier.threshold}
                    onChange={(e) => 
                      handleTierChange(index, 'threshold', parseInt(e.target.value) || 0)
                    }
                    min={1}
                    className="w-20"
                    disabled={disabled}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={tier.window}
                    onChange={(e) => 
                      handleTierChange(index, 'window', parseInt(e.target.value) || 0)
                    }
                    min={1}
                    className="w-20"
                    disabled={disabled}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={tier.coolOff}
                    onChange={(e) => 
                      handleTierChange(index, 'coolOff', parseInt(e.target.value) || 0)
                    }
                    min={1}
                    className="w-20"
                    disabled={disabled}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTier(index)}
                    disabled={disabled || value.tiers.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-2">
          Example: If threshold = 2, window = 12, cool-off = 24, then after 2 stop-losses in 12 hours, trading is paused for 24 hours.
        </p>
      </div>
    </div>
  );
};

export default CoolingOffRule;
