
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Cell, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
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
      return <Skeleton className="h-64 w-full" />;
    }

    // Transform heatmap data for visualization
    const markets = ['Forex', 'Crypto', 'Indices'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="h-64 w-full">
        <div className="grid grid-cols-24 gap-px h-full">
          {hours.map(hour => (
            <div key={hour} className="text-xs text-center mb-1">
              {hour}
            </div>
          ))}
          {markets.map(market => (
            <div key={market} className="col-span-24 grid grid-cols-24 gap-px">
              {hours.map(hour => {
                const intensity = heatmapData?.[market]?.[hour] || 0;
                const opacity = Math.min(intensity / 10, 1);
                return (
                  <div
                    key={`${market}-${hour}`}
                    className="h-8 bg-red-500 hover:bg-red-600 cursor-pointer rounded-sm flex items-center justify-center text-xs text-white"
                    style={{ opacity: opacity + 0.1 }}
                    onClick={() => navigate(`/admin/breaches?market=${market}&hour=${hour}`)}
                    title={`${market} at ${hour}:00 UTC - ${intensity} events`}
                  >
                    {intensity > 0 ? intensity : ''}
                  </div>
                );
              })}
            </div>
          ))}
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Loss-Event Heat-map */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Loss-Events Heat-map</CardTitle>
          <p className="text-sm text-muted-foreground">
            Time-of-day vs #SL (last 7 days, per market)
          </p>
        </CardHeader>
        <CardContent>
          <HeatmapChart />
        </CardContent>
      </Card>

      {/* Top Breached Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 5 Breach Rules</CardTitle>
          <p className="text-sm text-muted-foreground">Most triggered in 24h</p>
        </CardHeader>
        <CardContent>
          <TopRulesChart />
          {topRulesData && (
            <div className="mt-4 space-y-2">
              {topRulesData.slice(0, 5).map((rule, index) => (
                <div key={rule.ruleSetId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate">{rule.name}</span>
                  </div>
                  <span className="font-medium">{rule.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
