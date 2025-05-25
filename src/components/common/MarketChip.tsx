
import React from 'react';
import { cn } from '@/lib/utils';
import { Market } from '@/types';

interface MarketChipProps {
  market: Market | 'All';
  onClick?: () => void;
  selected?: boolean;
  size?: 'sm' | 'md';
}

const MarketChip: React.FC<MarketChipProps> = ({ market, onClick, selected = false, size = 'md' }) => {
  const baseClasses = size === 'sm' ? "market-chip text-xs px-2 py-1" : "market-chip";
  
  const marketClasses = {
    All: "bg-gray-200 text-gray-800",
    Forex: "market-chip-forex",
    Crypto: "market-chip-crypto",
    Indices: "market-chip-indices",
  };
  
  const selectedClasses = {
    All: "bg-gray-800 text-white",
    Forex: "bg-market-forex text-white",
    Crypto: "bg-market-crypto text-white",
    Indices: "bg-market-indices text-white",
  };
  
  const classes = cn(
    baseClasses,
    selected ? selectedClasses[market] : marketClasses[market],
    onClick && "cursor-pointer hover:opacity-90"
  );
  
  return (
    <span 
      className={classes} 
      onClick={onClick}
    >
      {market}
    </span>
  );
};

export default MarketChip;
