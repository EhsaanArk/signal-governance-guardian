
import React from 'react';
import { cn } from '@/lib/utils';

interface BreachBadgeProps {
  count: number;
  className?: string;
}

const BreachBadge: React.FC<BreachBadgeProps> = ({ count, className }) => {
  if (count === 0) return null;
  
  return (
    <div className={cn("breach-badge", className)}>
      {count}
    </div>
  );
};

export default BreachBadge;
