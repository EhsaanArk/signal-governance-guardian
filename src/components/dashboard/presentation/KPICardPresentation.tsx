
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { KPICard } from '@/lib/services/KPIMetricsService';

interface KPICardPresentationProps {
  card: KPICard;
  hasSignificantChange: boolean;
  deltaColor: string;
}

const KPICardPresentation: React.FC<KPICardPresentationProps> = ({
  card,
  hasSignificantChange,
  deltaColor
}) => {
  const Icon = card.icon;
  const isPositive = card.change > 0;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow min-w-0"
      onClick={card.onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate cursor-help">
              {card.title}
            </CardTitle>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{card.tooltip}</p>
          </TooltipContent>
        </Tooltip>
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {card.timeLabel && (
              <div className="text-xs text-muted-foreground mb-1">{card.timeLabel}</div>
            )}
            <div className="text-xl sm:text-2xl font-bold truncate">
              {typeof card.displayValue === 'number' ? `${card.displayValue}%` : card.value}
            </div>
          </div>
          {hasSignificantChange && (
            <div className={`flex items-center text-xs flex-shrink-0 ml-2 ${deltaColor}`}>
              {isPositive ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(card.change)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICardPresentation;
