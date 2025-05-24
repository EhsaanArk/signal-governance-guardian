
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import HeatmapChart from './charts/HeatmapChart';
import TopRulesChart from './charts/TopRulesChart';

const DashboardCharts = () => {
  const { heatmapData, heatmapLoading, topRulesData, rulesLoading } = useDashboardCharts();

  return (
    <div className="w-full max-w-full">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Loss-Event Heat-map */}
        <Card className="xl:col-span-2 min-w-0">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Loss-Events Activity Map</CardTitle>
            <p className="text-xs lg:text-sm text-muted-foreground">
              Distribution of stop-loss events across markets and time periods (last 7 days)
            </p>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <HeatmapChart heatmapData={heatmapData} heatmapLoading={heatmapLoading} />
          </CardContent>
        </Card>

        {/* Top Breached Rules */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Top 5 Breach Rules</CardTitle>
            <p className="text-xs lg:text-sm text-muted-foreground">Most triggered in 24h</p>
          </CardHeader>
          <CardContent>
            <TopRulesChart topRulesData={topRulesData} rulesLoading={rulesLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCharts;
