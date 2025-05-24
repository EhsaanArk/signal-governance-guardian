
import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { HeatmapData } from '@/lib/api/dashboard';
import { useDashboardTimeRange } from '@/hooks/useDashboardTimeRange';

interface HeatmapChartProps {
  heatmapData: HeatmapData | undefined;
  heatmapLoading: boolean;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ heatmapData, heatmapLoading }) => {
  const { timeRange } = useDashboardTimeRange();
  
  const getSubtitle = () => {
    if (timeRange.preset === '24h') return 'SL events heatmap for last 24 hours';
    if (timeRange.preset === '7d') return 'SL events heatmap for last 7 days';
    if (timeRange.preset === '30d') return 'SL events heatmap for last 30 days';
    if (timeRange.preset === '90d') return 'SL events heatmap for last 90 days';
    return `SL events heatmap for selected period`;
  };

  if (heatmapLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base lg:text-lg font-semibold">Loss-Event Heat-map</h3>
          <p className="text-xs lg:text-sm text-muted-foreground">{getSubtitle()}</p>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const markets = Object.keys(heatmapData || {});
  const COLORS = ["#68c95f", "#5cb85c", "#53a759", "#4b9656", "#438553", "#3b7450", "#33634d"];

  const getHeatmapData = (market: string) => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({
        hour: i,
        value: heatmapData?.[market]?.[i] || 0
      });
    }
    return data;
  };

  const getIntensityColor = (value: number, maxValue: number) => {
    if (value === 0) return '#f3f4f6'; // Light gray for zero values
    const intensity = Math.min(value / Math.max(maxValue, 1), 1);
    const colorIndex = Math.floor(intensity * (COLORS.length - 1));
    return COLORS[colorIndex];
  };

  const getMaxValueForMarket = (market: string) => {
    const data = getHeatmapData(market);
    return Math.max(...data.map(d => d.value));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base lg:text-lg font-semibold">Loss-Event Heat-map</h3>
        <p className="text-xs lg:text-sm text-muted-foreground">{getSubtitle()}</p>
      </div>
      {markets.map((market) => {
        const marketData = getHeatmapData(market);
        const maxValue = getMaxValueForMarket(market);
        
        return (
          <div key={market} className="space-y-2">
            <h4 className="text-sm font-medium">{market}</h4>
            <Card className="min-w-0">
              <CardContent className="p-2">
                <ResponsiveContainer width="100%" height={80}>
                  <div className="w-full h-full flex">
                    {marketData.map((entry, index) => (
                      <div
                        key={index}
                        className="flex-1 h-full relative group cursor-pointer"
                        style={{
                          backgroundColor: getIntensityColor(entry.value, maxValue),
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                        title={`${market} - ${entry.hour}:00 - ${entry.value} Loss Events`}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                          <div className="font-medium">{market} - {entry.hour}:00</div>
                          <div>Loss Events: {entry.value}</div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default HeatmapChart;
