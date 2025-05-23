
import React from 'react';
import { Button } from '@/components/ui/button';
import MarketChip from '../common/MarketChip';
import { Market, RuleStatus } from '@/types';

interface RuleSetFilterProps {
  selectedMarket: Market | 'All';
  selectedStatus: RuleStatus;
  onMarketChange: (market: Market | 'All') => void;
  onStatusChange: (status: RuleStatus) => void;
}

const RuleSetFilter: React.FC<RuleSetFilterProps> = ({
  selectedMarket,
  selectedStatus,
  onMarketChange,
  onStatusChange
}) => {
  const markets: (Market | 'All')[] = ['All', 'Forex', 'Crypto', 'Indices'];
  const statuses: RuleStatus[] = ['All', 'On', 'Off'];
  
  const handleMarketToggle = (market: Market | 'All') => {
    if (market === 'All') {
      // Toggle behavior for "All" - if currently selected, deselect
      // If not selected, select and deselect others
      onMarketChange(selectedMarket === 'All' ? 'Forex' : 'All');
    } else {
      onMarketChange(market);
    }
  };
  
  return (
    <div className="sticky top-0 z-10 flex flex-wrap justify-between gap-4 py-4 px-6 border-b bg-background">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium">Markets:</span>
        {markets.map((market) => (
          <MarketChip 
            key={market} 
            market={market} 
            selected={selectedMarket === market}
            onClick={() => handleMarketToggle(market)}
          />
        ))}
      </div>
      
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium">Status:</span>
        <div className="flex border rounded-md overflow-hidden">
          {statuses.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'default' : 'outline'}
              className="rounded-none border-0 h-9"
              onClick={() => onStatusChange(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RuleSetFilter;
