
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';
import { fetchHeatmapData, fetchTopBreachedRules } from '@/lib/api/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const DashboardCharts = () => {
  const navigate = useNavigate();
  
  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ['dashboard-heatmap'],
    queryFn: fetchHeatmapData,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: topRulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['dashboard-top-rules'],
    queryFn: fetchTopBreachedRules,
    refetchInterval: 60000,
  });

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const HeatmapChart = () => {
    if (heatmapLoading) {
      return <Skeleton className="h-80 w-full" />;
    }

    const markets = ['Forex', 'Crypto', 'Indices'];
    const timeSlots = [
      { range: '00-06', label: 'Night', hours: [0, 1, 2, 3, 4, 5] },
      { range: '06-12', label: 'Morning', hours: [6, 7, 8, 9, 10, 11] },
      { range: '12-18', label: 'Afternoon', hours: [12, 13, 14, 15, 16, 17] },
      { range: '18-24', label: 'Evening', hours: [18, 19, 20, 21, 22, 23] }
    ];

    const getIntensityColor = (count) => {
      if (count === 0) return 'bg-gray-100 border border-gray-200';
      if (count <= 2) return 'bg-yellow-200 border border-yellow-300';
      if (count <= 5) return 'bg-orange-300 border border-orange-400';
      if (count <= 10) return 'bg-red-400 border border-red-500';
      return 'bg-red-600 border border-red-700';
    };

    const getTextColor = (count) => {
      if (count === 0) return 'text-gray-400';
      if (count <= 2) return 'text-yellow-800';
      if (count <= 5) return 'text-orange-800';
      return 'text-white';
    };

    return (
      <div className="space-y-4 overflow-hidden">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm">
          <span className="font-medium text-gray-700 text-xs lg:text-sm">Loss Events Intensity:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span className="text-gray-600 text-xs">None (0)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
            <span className="text-gray-600 text-xs">Low (1-2)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-300 border border-orange-400 rounded"></div>
            <span className="text-gray-600 text-xs">Medium (3-5)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 border border-red-500 rounded"></div>
            <span className="text-gray-600 text-xs">High (6-10)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 border border-red-700 rounded"></div>
            <span className="text-gray-600 text-xs">Critical (10+)</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-3 overflow-x-auto">
          {/* Time Headers */}
          <div className="grid grid-cols-5 gap-2 min-w-[480px]">
            <div className="text-xs lg:text-sm font-medium text-gray-600">Market</div>
            {timeSlots.map(slot => (
              <div key={slot.range} className="text-center">
                <div className="text-xs lg:text-sm font-medium text-gray-700">{slot.label}</div>
                <div className="text-xs text-gray-500">{slot.range} UTC</div>
              </div>
            ))}
          </div>

          {/* Market Rows */}
          {markets.map(market => (
            <div key={market} className="grid grid-cols-5 gap-2 items-center min-w-[480px]">
              <div className="text-xs lg:text-sm font-medium text-gray-700 py-2">
                {market}
              </div>
              {timeSlots.map(slot => {
                const totalEvents = slot.hours.reduce((sum, hour) => {
                  return sum + (heatmapData?.[market]?.[hour] || 0);
                }, 0);

                return (
                  <div
                    key={`${market}-${slot.range}`}
                    className={`
                      h-12 lg:h-16 rounded-lg flex items-center justify-center 
                      cursor-pointer transition-all duration-200 
                      hover:scale-105 hover:shadow-md
                      ${getIntensityColor(totalEvents)}
                    `}
                    onClick={() => navigate(`/admin/breaches?market=${market}&timeSlot=${slot.range}`)}
                    title={`${market} ${slot.label} (${slot.range} UTC) - ${totalEvents} loss events`}
                  >
                    <div className="text-center">
                      <div className={`text-sm lg:text-lg font-bold ${getTextColor(totalEvents)}`}>
                        {totalEvents || '0'}
                      </div>
                      <div className={`text-xs ${getTextColor(totalEvents)}`}>
                        events
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
          <div className="text-xs lg:text-sm text-gray-600">
            <span className="font-medium">Total Events:</span> {
              Object.values(heatmapData || {}).reduce((total, marketData) => {
                return total + Object.values(marketData).reduce((sum, count) => sum + count, 0);
              }, 0)
            }
          </div>
          <div className="text-xs lg:text-sm text-gray-600">
            <span className="font-medium">Most Active:</span> {
              (() => {
                let maxCount = 0;
                let maxMarket = '';
                Object.entries(heatmapData || {}).forEach(([market, hours]) => {
                  const marketTotal = Object.values(hours).reduce((sum, count) => sum + count, 0);
                  if (marketTotal > maxCount) {
                    maxCount = marketTotal;
                    maxMarket = market;
                  }
                });
                return maxMarket || 'None';
              })()
            }
          </div>
        </div>
      </div>
    );
  };

  const TopRulesChart = () => {
    if (rulesLoading) {
      return <Skeleton className="h-64 w-full" />;
    }

    return (
      <ChartContainer
        config={{
          count: { label: "Breaches" }
        }}
        className="h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={topRulesData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="count"
              onClick={(data) => navigate(`/admin/breaches?ruleSet=${data.ruleSetId}`)}
            >
              {topRulesData?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="cursor-pointer hover:opacity-80"
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

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
            <HeatmapChart />
          </CardContent>
        </Card>

        {/* Top Breached Rules */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Top 5 Breach Rules</CardTitle>
            <p className="text-xs lg:text-sm text-muted-foreground">Most triggered in 24h</p>
          </CardHeader>
          <CardContent>
            <TopRulesChart />
            {topRulesData && (
              <div className="mt-4 space-y-2">
                {topRulesData.slice(0, 5).map((rule, index) => (
                  <div key={rule.ruleSetId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="truncate text-xs lg:text-sm">{rule.name}</span>
                    </div>
                    <span className="font-medium text-xs lg:text-sm flex-shrink-0">{rule.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardCharts;
