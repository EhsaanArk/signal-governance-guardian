
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { TopBreachedRule } from '@/lib/api/dashboard';

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
    </>
  );
};

export default TopRulesChart;
