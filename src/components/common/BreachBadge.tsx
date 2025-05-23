
import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface BreachBadgeProps {
  count: number;
  className?: string;
}

const BreachBadge: React.FC<BreachBadgeProps> = ({ count, className }) => {
  if (count === 0) return null;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("breach-badge", className)}>
          {count}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Breaches triggered in last 24 h</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default BreachBadge;
