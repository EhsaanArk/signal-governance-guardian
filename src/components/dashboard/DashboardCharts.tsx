
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import HeatmapChart from './charts/HeatmapChart';
import TopRulesChart from './charts/TopRulesChart';

const DashboardCharts = () => {
  const { 
    topRulesData, 
    rulesLoading,
    selectedMarket,
    setSelectedMarket
  } = useDashboardCharts();

  return (
    <div className="w-full max-w-full">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Loss-Event Heat-map */}
        <Card className="xl:col-span-2 min-w-0">
          <CardContent className="p-6 overflow-hidden">
            <HeatmapChart />
          </CardContent>
        </Card>

        {/* Enhanced Top Breached Rules */}
        <Card className="min-w-0">
          <CardContent className="p-6">
            <TopRulesChart 
              topRulesData={topRulesData} 
              rulesLoading={rulesLoading}
              selectedMarket={selectedMarket}
              onMarketChange={setSelectedMarket}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCharts;
