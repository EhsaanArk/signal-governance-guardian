
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardTimeRange } from '@/hooks/useDashboardTimeRange';
import { useDashboardData } from '@/hooks/useDashboardData';
import HeatmapLegend from './HeatmapLegend';
import HeatmapTable from './HeatmapTable';
import HeatmapSummary from './HeatmapSummary';

const HeatmapChart: React.FC = () => {
  const { timeRange } = useDashboardTimeRange();
  const { rawHeatmapData, transformedHeatmapData, heatmapLoading } = useDashboardData();
  
  const getSubtitle = () => {
    if (timeRange.preset === '24h') return 'Distribution of stop-loss events across markets and time periods (last 24 hours)';
    if (timeRange.preset === '7d') return 'Distribution of stop-loss events across markets and time periods (last 7 days)';
    if (timeRange.preset === '30d') return 'Distribution of stop-loss events across markets and time periods (last 30 days)';
    if (timeRange.preset === '90d') return 'Distribution of stop-loss events across markets and time periods (last 90 days)';
    return 'Distribution of stop-loss events across markets and time periods (selected period)';
  };

  if (heatmapLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base lg:text-lg font-semibold">Loss-Events Activity Map</h3>
          <p className="text-xs lg:text-sm text-muted-foreground">{getSubtitle()}</p>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!rawHeatmapData || !transformedHeatmapData) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base lg:text-lg font-semibold">Loss-Events Activity Map</h3>
          <p className="text-xs lg:text-sm text-muted-foreground">{getSubtitle()}</p>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No data available for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base lg:text-lg font-semibold">Loss-Events Activity Map</h3>
        <p className="text-xs lg:text-sm text-muted-foreground">{getSubtitle()}</p>
      </div>

      <HeatmapLegend />
      <HeatmapTable heatmapData={rawHeatmapData} markets={transformedHeatmapData.markets} />
      <HeatmapSummary heatmapData={rawHeatmapData} markets={transformedHeatmapData.markets} />
    </div>
  );
};

export default HeatmapChart;
