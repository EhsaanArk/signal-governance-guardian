import React, { useState } from 'react';
import { Calendar, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/common/DatePickerWithRange';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';

export type TimeRangePreset = '24h' | '7d' | '30d' | '90d' | 'custom';

export const TIME_RANGE_PRESETS = {
  '24h': { label: 'Last 24 hours', hours: 24 },
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
  'custom': { label: 'Custom range' }
} as const;

interface TimeRangeSelectorProps {
  selectedPreset: TimeRangePreset;
  dateRange: DateRange | undefined;
  onPresetChange: (preset: TimeRangePreset) => void;
  onCustomRangeChange: (range: DateRange | undefined) => void;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedPreset,
  dateRange,
  onPresetChange,
  onCustomRangeChange,
  onReset,
  hasActiveFilters = false
}) => {
  const { toast } = useToast();
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);

  const handlePresetChange = (value: string) => {
    const preset = value as TimeRangePreset;
    
    if (preset === 'custom') {
      setCustomDialogOpen(true);
    } else {
      onPresetChange(preset);
    }
  };

  const handleCustomRangeApply = () => {
    if (!tempDateRange?.from || !tempDateRange?.to) {
      toast({
        title: "Invalid Date Range",
        description: "Please select both start and end dates.",
        variant: "destructive"
      });
      return;
    }

    const daysDiff = Math.ceil((tempDateRange.to.getTime() - tempDateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 180) {
      toast({
        title: "Invalid Date Range",
        description: "Date range cannot exceed 180 days.",
        variant: "destructive"
      });
      return;
    }

    onCustomRangeChange(tempDateRange);
    onPresetChange('custom');
    setCustomDialogOpen(false);
    toast({
      title: "Custom Range Applied",
      description: `Showing data from ${tempDateRange.from.toLocaleDateString()} to ${tempDateRange.to.toLocaleDateString()}`
    });
  };

  const handleCustomRangeCancel = () => {
    setTempDateRange(dateRange);
    setCustomDialogOpen(false);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      toast({
        title: "Filters Reset",
        description: "All filters have been reset to defaults"
      });
    }
  };

  const getDisplayValue = () => {
    if (selectedPreset === 'custom' && dateRange?.from && dateRange?.to) {
      return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
    }
    return TIME_RANGE_PRESETS[selectedPreset].label;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Desktop Select */}
      <div className="hidden md:block">
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-48 h-10" aria-label="Select time period">
            <SelectValue>{getDisplayValue()}</SelectValue>
          </SelectTrigger>
          <SelectContent className="z-50 bg-white">
            {Object.entries(TIME_RANGE_PRESETS).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Button */}
      <div className="md:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCustomDialogOpen(true)}
          className="h-10"
          aria-label="Select time period"
        >
          <Calendar className="h-4 w-4 mr-1" />
          <span className="truncate max-w-24">
            {selectedPreset === 'custom' ? 'Custom' : TIME_RANGE_PRESETS[selectedPreset].label}
          </span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-10 px-2"
          title="Reset all filters"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}

      {/* Custom Range Dialog */}
      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Mobile preset options */}
            <div className="md:hidden space-y-2">
              <label className="text-sm font-medium">Quick presets:</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TIME_RANGE_PRESETS).filter(([key]) => key !== 'custom').map(([key, config]) => (
                  <Button
                    key={key}
                    variant={selectedPreset === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      onPresetChange(key as TimeRangePreset);
                      setCustomDialogOpen(false);
                    }}
                  >
                    {config.label}
                  </Button>
                ))}
              </div>
              <div className="border-t pt-4">
                <label className="text-sm font-medium">Or select custom range:</label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range (max 180 days):</label>
              <DatePickerWithRange
                date={tempDateRange}
                onDateChange={setTempDateRange}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCustomRangeCancel}>
                Cancel
              </Button>
              <Button onClick={handleCustomRangeApply}>
                Apply Range
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeRangeSelector;
