
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
import { DatePickerWithRange } from '../common/DatePickerWithRange';
import MarketChip from '../common/MarketChip';
import { Market } from '@/types';

interface BreachFilterProps {
  selectedMarket: Market;
  providerSearch: string;
  selectedRuleSet: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  ruleSets: Array<{ id: string; name: string }>;
  onMarketChange: (market: Market) => void;
  onProviderSearchChange: (search: string) => void;
  onRuleSetChange: (ruleSetId: string) => void;
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

const BreachFilter: React.FC<BreachFilterProps> = ({
  selectedMarket,
  providerSearch,
  selectedRuleSet,
  dateRange,
  ruleSets,
  onMarketChange,
  onProviderSearchChange,
  onRuleSetChange,
  onDateRangeChange
}) => {
  const markets: Market[] = ['All', 'Forex', 'Crypto', 'Indices'];
  
  return (
    <div className="p-6 border-b bg-background space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by provider"
              className="pl-8"
              value={providerSearch}
              onChange={(e) => onProviderSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-auto flex flex-wrap gap-2 items-center">
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
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <Select
            value={selectedRuleSet}
            onValueChange={onRuleSetChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Rule Set" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rule Sets</SelectItem>
              {ruleSets.map((ruleSet) => (
                <SelectItem key={ruleSet.id} value={ruleSet.id}>
                  {ruleSet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <DatePickerWithRange 
            date={dateRange}
            onDateChange={onDateRangeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BreachFilter;
