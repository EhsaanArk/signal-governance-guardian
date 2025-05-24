
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ComplianceTooltipProps {
  children: React.ReactNode;
  message?: string;
}

const ComplianceTooltip: React.FC<ComplianceTooltipProps> = ({ 
  children, 
  message = "Requires reason and audit log entry" 
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ComplianceTooltip;
