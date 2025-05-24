
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { TopBreachedRule } from '@/lib/api/dashboard';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TopRulesChartProps {
  topRulesData: TopBreachedRule[] | undefined;
  rulesLoading: boolean;
}

const TopRulesChart: React.FC<TopRulesChartProps> = ({ topRulesData, rulesLoading }) => {
  const navigate = useNavigate();
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (rulesLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  // Simulate trend data - in real implementation this would come from API
  const getTrendDirection = (index: number): 'up' | 'down' | 'flat' => {
    // Mock trend logic based on index for demo
    const trends = ['up', 'down', 'up', 'flat', 'down'];
    return trends[index] as 'up' | 'down' | 'flat';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'flat') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3 h-3 text-red-500" />;
      case 'down':
        return <ArrowDown className="w-3 h-3 text-green-500" />;
      default:
        return <div className="w-3 h-3 flex items-center justify-center text-gray-400">−</div>;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'flat') => {
    switch (trend) {
      case 'up':
        return 'text-red-500';
      case 'down':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <>
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
      
      {topRulesData && (
        <div className="mt-4 space-y-2">
          {topRulesData.slice(0, 5).map((rule, index) => {
            const trend = getTrendDirection(index);
            return (
              <div key={rule.ruleSetId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate text-xs lg:text-sm">{rule.name}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {getTrendIcon(trend)}
                  <span className="font-medium text-xs lg:text-sm">{rule.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default TopRulesChart;
