
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { HeatmapData } from '@/lib/api/dashboard';
import { useDashboardTimeRange } from '@/hooks/useDashboardTimeRange';
import HeatmapLegend from './HeatmapLegend';
import HeatmapTable from './HeatmapTable';
import HeatmapSummary from './HeatmapSummary';

interface HeatmapChartProps {
  heatmapData: HeatmapData | undefined;
  heatmapLoading: boolean;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ heatmapData, heatmapLoading }) => {
  const { timeRange } = useDashboardTimeRange();
  
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

  if (!heatmapData) {
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

  const markets = ['Forex', 'Crypto', 'Indices'];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base lg:text-lg font-semibold">Loss-Events Activity Map</h3>
        <p className="text-xs lg:text-sm text-muted-foreground">{getSubtitle()}</p>
      </div>

      <HeatmapLegend />
      <HeatmapTable heatmapData={heatmapData} markets={markets} />
      <HeatmapSummary heatmapData={heatmapData} markets={markets} />
    </div>
  );
};

export default HeatmapChart;
