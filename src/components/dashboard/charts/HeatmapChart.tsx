import React from 'react';
import { ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const renderTooltipContent = (entry: any) => {
    if (!entry || !entry.payload || entry.payload.length === 0) {
      return null;
    }
  
    const { hour, value } = entry.payload[0].payload;
    const market = entry.payload[0].name;
  
    return (
      <div className="bg-white border rounded-md shadow-md p-2">
        <p className="text-sm font-medium text-gray-800">
          {market} - {hour}:00
        </p>
        <p className="text-xs text-gray-600">
          Loss Events: {value}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base lg:text-lg font-semibold">Loss-Event Heat-map</h3>
        <p className="text-xs lg:text-sm text-muted-foreground">{getSubtitle()}</p>
      </div>
      {markets.map((market) => (
        <div key={market} className="space-y-2">
          <h4 className="text-sm font-medium">{market}</h4>
          <Card className="min-w-0">
            <CardContent className="p-2">
              <ResponsiveContainer width="100%" height={80}>
                <svg width="100%" height="100%">
                  <defs>
                    <linearGradient id={`colorUv-${market}`} x1="0" y1="0" x2="1" y2="0">
                      {COLORS.map((color, index) => (
                        <stop key={index} offset={`${index / (COLORS.length - 1)}`} stopColor={color} />
                      ))}
                    </linearGradient>
                  </defs>
                  <g>
                    {getHeatmapData(market).map((entry, index) => (
                      <rect
                        key={index}
                        x={`${(index / 24) * 100}%`}
                        y="0"
                        width={`${(1 / 24) * 100}%`}
                        height="100%"
                        fill={`url(#colorUv-${market})`}
                      >
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            padding: '5px'
                          }}
                          labelStyle={{ color: 'black' }}
                          itemStyle={{ color: 'black' }}
                          formatter={(value, name) => [`${value}`, 'Loss Events']}
                          position={{ x: 0, y: 0 }}
                          content={<>{renderTooltipContent({payload: [{hour: entry.hour, value: entry.value, name: market}]})}</>}
                        />
                      </rect>
                    ))}
                  </g>
                </svg>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default HeatmapChart;
