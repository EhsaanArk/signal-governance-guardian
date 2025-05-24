
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useDashboardContext } from '@/hooks/useDashboardContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import HeatmapTable from './HeatmapTable';
import HeatmapLegend from './HeatmapLegend';
import HeatmapSummary from './HeatmapSummary';

const HeatmapChart = () => {
  const { getContextualTitle } = useDashboardContext();
  const { rawHeatmapData, heatmapLoading, heatmapError } = useDashboardData();

  console.log('🔥 HeatmapChart - Loading state:', heatmapLoading);
  console.log('🔥 HeatmapChart - Raw data:', rawHeatmapData);

  if (heatmapLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (heatmapError) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">Failed to load heatmap data</p>
        <p className="text-xs mt-1">Please try refreshing the page</p>
      </div>
    );
  }

  if (!rawHeatmapData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No heatmap data available</p>
      </div>
    );
  }

  // Extract markets from the raw data
  const markets = Object.keys(rawHeatmapData.markets);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {getContextualTitle('Loss-Event Heat-map')}
          </h3>
          <p className="text-sm text-muted-foreground">
            Breach frequency by market and trading session
          </p>
        </div>
      </div>

      <HeatmapSummary heatmapData={rawHeatmapData} markets={markets} />
      <HeatmapTable heatmapData={rawHeatmapData} markets={markets} />
      <HeatmapLegend />
    </div>
  );
};

export default HeatmapChart;
