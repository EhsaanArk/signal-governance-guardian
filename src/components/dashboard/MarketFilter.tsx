
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Market } from '@/types/database';

interface MarketFilterProps {
  selectedMarket: Market | 'All';
  onMarketChange: (market: Market | 'All') => void;
}

const MarketFilter: React.FC<MarketFilterProps> = ({ selectedMarket, onMarketChange }) => {
  return (
    <Select value={selectedMarket} onValueChange={onMarketChange}>
      <SelectTrigger className="w-32 h-8 text-xs">
        <SelectValue placeholder="All markets" />
      </SelectTrigger>
      <SelectContent className="z-50 bg-white">
        <SelectItem value="All">All markets</SelectItem>
        <SelectItem value="Forex">Forex</SelectItem>
        <SelectItem value="Crypto">Crypto</SelectItem>
        <SelectItem value="Indices">Indices</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default MarketFilter;
