
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MarketChip from '../common/MarketChip';
import TimeRangeSelector from './TimeRangeSelector';
import ProviderSelector from './ProviderSelector';
import FilterClearButton from './FilterClearButton';
import { Market } from '@/types/database';
import { DateRange } from 'react-day-picker';
import { TimeRangePreset } from './TimeRangeSelector';

interface BreachFilterProps {
  selectedMarket: Market | 'All';
  providerSearch: string;
  selectedRuleSet: string;
  timeRangePreset: TimeRangePreset;
  dateRange: DateRange | undefined;
  selectedProviderId: string | null;
  selectedProviderName: string | null;
  hasActiveFilters: boolean;
  ruleSets: Array<{ id: string; name: string }>;
  onMarketChange: (market: Market | 'All') => void;
  onProviderSearchChange: (search: string) => void;
  onRuleSetChange: (ruleSetId: string) => void;
  onTimeRangePresetChange: (preset: TimeRangePreset) => void;
  onCustomDateRangeChange: (range: DateRange | undefined) => void;
  onProviderChange: (providerId: string | null, providerName: string | null) => void;
  onClearFilters: () => void;
}

const BreachFilter: React.FC<BreachFilterProps> = ({
  selectedMarket,
  providerSearch,
  selectedRuleSet,
  timeRangePreset,
  dateRange,
  selectedProviderId,
  selectedProviderName,
  hasActiveFilters,
  ruleSets,
  onMarketChange,
  onProviderSearchChange,
  onRuleSetChange,
  onTimeRangePresetChange,
  onCustomDateRangeChange,
  onProviderChange,
  onClearFilters
}) => {
  const markets: (Market | 'All')[] = ['All', 'Forex', 'Crypto', 'Indices'];
  
  return (
    <div className="p-6 border-b bg-background space-y-4">
      {/* First Row: Search, Rule Set, Time Range, Provider, Clear */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by provider"
              className="pl-8 h-10"
              value={providerSearch}
              onChange={(e) => onProviderSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-full sm:w-auto">
            <Select
              value={selectedRuleSet}
              onValueChange={onRuleSetChange}
            >
              <SelectTrigger className="w-full sm:w-48 h-10">
                <SelectValue placeholder="All Rule Sets" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white">
                <SelectItem value="all">All Rule Sets</SelectItem>
                {ruleSets.map((ruleSet) => (
                  <SelectItem key={ruleSet.id} value={ruleSet.id}>
                    {ruleSet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <TimeRangeSelector
            selectedPreset={timeRangePreset}
            dateRange={dateRange}
            onPresetChange={onTimeRangePresetChange}
            onCustomRangeChange={onCustomDateRangeChange}
          />
          
          <ProviderSelector
            selectedProviderId={selectedProviderId}
            selectedProviderName={selectedProviderName}
            onProviderChange={onProviderChange}
          />
          
          <FilterClearButton
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
          />
        </div>
      </div>
      
      {/* Second Row: Market Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground mr-2">Market:</span>
        {markets.map((market) => (
          <MarketChip 
            key={market} 
            market={market} 
            selected={selectedMarket === market}
            onClick={() => onMarketChange(market)}
          />
        ))}
      </div>
    </div>
  );
};

export default BreachFilter;
