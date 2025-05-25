
import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MarketChip from '@/components/common/MarketChip';
import FilterClearButton from '@/components/breaches/FilterClearButton';
import { Market } from '@/types/database';

type ProviderStatus = 'All' | 'Active' | 'Suspended' | 'Review';
type PerformanceTier = 'All' | 'Top' | 'Neutral' | 'Under-perform';

interface ProvidersFilterProps {
  search: string;
  selectedMarket: Market | 'All';
  selectedStatus: ProviderStatus;
  selectedPerformance: PerformanceTier;
  hasActiveFilters: boolean;
  onSearchChange: (search: string) => void;
  onMarketChange: (market: Market | 'All') => void;
  onStatusChange: (status: ProviderStatus) => void;
  onPerformanceChange: (performance: PerformanceTier) => void;
  onClearFilters: () => void;
}

const ProvidersFilter: React.FC<ProvidersFilterProps> = ({
  search,
  selectedMarket,
  selectedStatus,
  selectedPerformance,
  hasActiveFilters,
  onSearchChange,
  onMarketChange,
  onStatusChange,
  onPerformanceChange,
  onClearFilters
}) => {
  const markets: (Market | 'All')[] = ['All', 'Forex', 'Crypto', 'Indices'];
  const statuses: ProviderStatus[] = ['All', 'Active', 'Suspended', 'Review'];
  const performanceTiers: PerformanceTier[] = ['All', 'Top', 'Neutral', 'Under-perform'];

  return (
    <div className="space-y-4 p-6 border-b">
      <div className="flex flex-col gap-4">
        {/* Search and Reset Button Row */}
        <div className="flex items-center gap-4 justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search providers..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-10 px-3 whitespace-nowrap"
              title="Reset all filters"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          )}
        </div>

        {/* Filter Groups */}
        <div className="flex flex-wrap gap-6">
          {/* Market Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Market</label>
            <div className="flex flex-wrap gap-2">
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

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => onStatusChange(status)}
                  className="h-8"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Performance Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Performance</label>
            <div className="flex flex-wrap gap-2">
              {performanceTiers.map((tier) => (
                <Button
                  key={tier}
                  variant={selectedPerformance === tier ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPerformanceChange(tier)}
                  className="h-8"
                >
                  {tier === 'Top' ? 'Top ≥2%' : tier}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvidersFilter;
