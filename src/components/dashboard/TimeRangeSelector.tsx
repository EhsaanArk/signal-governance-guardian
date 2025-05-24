
import React, { useState } from 'react';
import { Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/common/DatePickerWithRange';
import { useDashboardFilters, TIME_RANGE_PRESETS, TimeRangePreset } from '@/hooks/useDashboardFilters';
import { useFilterTransitions } from '@/hooks/useFilterTransitions';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';

const TimeRangeSelector = () => {
  const { filters, setTimeRangePreset, setCustomTimeRange, getTimeRangeDisplayLabel, isCustomTimeRange } = useDashboardFilters();
  const { isTransitioning, handleFilterChange } = useFilterTransitions();
  const { toast } = useToast();
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>({
    from: filters.timeRange.from,
    to: filters.timeRange.to
  });

  const handlePresetChange = async (value: string) => {
    const preset = value as TimeRangePreset;
    
    if (preset === 'custom') {
      setCustomDialogOpen(true);
    } else {
      await handleFilterChange(async () => {
        await setTimeRangePreset(preset);
      });
    }
  };

  const handleCustomRangeApply = async () => {
    if (!tempDateRange?.from || !tempDateRange?.to) {
      toast({
        title: "Invalid Date Range",
        description: "Please select both start and end dates.",
        variant: "destructive"
      });
      return;
    }

    try {
      await handleFilterChange(async () => {
        await setCustomTimeRange(tempDateRange.from!, tempDateRange.to!);
      });
      setCustomDialogOpen(false);
      toast({
        title: "Custom Range Applied",
        description: `Showing data from ${tempDateRange.from.toLocaleDateString()} to ${tempDateRange.to.toLocaleDateString()}`
      });
    } catch (error) {
      toast({
        title: "Invalid Date Range",
        description: error instanceof Error ? error.message : "Please select a valid date range.",
        variant: "destructive"
      });
    }
  };

  const handleCustomRangeCancel = () => {
    setTempDateRange({
      from: filters.timeRange.from,
      to: filters.timeRange.to
    });
    setCustomDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">Period:</span>
      
      {/* Desktop Select */}
      <div className="hidden md:block">
        <Select value={filters.timeRange.preset} onValueChange={handlePresetChange} disabled={isTransitioning}>
          <SelectTrigger className="w-48 h-8" aria-label="Select reporting period">
            <div className="flex items-center gap-2">
              {isTransitioning && <Loader2 className="h-3 w-3 animate-spin" />}
              <SelectValue />
            </div>
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
          className="h-8"
          aria-label="Select reporting period"
          disabled={isTransitioning}
        >
          <div className="flex items-center gap-1">
            {isTransitioning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            <span className="truncate max-w-24">
              {isCustomTimeRange ? 'Custom' : TIME_RANGE_PRESETS[filters.timeRange.preset].label}
            </span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </Button>
      </div>

      {/* Visual indicator for non-default ranges */}
      {filters.timeRange.preset !== '24h' && (
        <div className="w-2 h-2 rounded-full bg-blue-500" title="Viewing historical period" />
      )}

      {/* Custom Range Dialog */}
      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Custom Date Range</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Mobile preset options */}
            <div className="md:hidden space-y-2">
              <label className="text-sm font-medium">Quick presets:</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TIME_RANGE_PRESETS).filter(([key]) => key !== 'custom').map(([key, config]) => (
                  <Button
                    key={key}
                    variant={filters.timeRange.preset === key ? "default" : "outline"}
                    size="sm"
                    disabled={isTransitioning}
                    onClick={async () => {
                      await handleFilterChange(async () => {
                        await setTimeRangePreset(key as TimeRangePreset);
                      });
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
              <Button variant="outline" onClick={handleCustomRangeCancel} disabled={isTransitioning}>
                Cancel
              </Button>
              <Button onClick={handleCustomRangeApply} disabled={isTransitioning}>
                {isTransitioning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Applying...
                  </>
                ) : (
                  'Apply Range'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeRangeSelector;
