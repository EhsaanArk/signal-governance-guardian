
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { TopBreachedRule } from '@/lib/api/dashboard';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Market } from '@/types/database';
import MarketFilter from '../MarketFilter';
import { useDashboardTimeRange } from '@/hooks/useDashboardTimeRange';

interface TopRulesChartProps {
  topRulesData: TopBreachedRule[] | undefined;
  rulesLoading: boolean;
  selectedMarket: Market | 'All';
  onMarketChange: (market: Market | 'All') => void;
}

const TopRulesChart: React.FC<TopRulesChartProps> = ({ 
  topRulesData, 
  rulesLoading, 
  selectedMarket, 
  onMarketChange 
}) => {
  const navigate = useNavigate();
  const { timeRange, getDisplayLabel } = useDashboardTimeRange();
  
  // Consistent color scheme matching rule-set icons
  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  // Debug logging for troubleshooting
  console.log('📊 TopRulesChart debug:', {
    topRulesData,
    rulesLoading,
    selectedMarket,
    dataLength: topRulesData?.length,
    timeRange: timeRange.preset
  });

  const handleRuleClick = (ruleSetId: string) => {
    const { startDate, endDate } = {
      startDate: timeRange.from.toISOString().split('T')[0],
      endDate: timeRange.to.toISOString().split('T')[0]
    };
    navigate(`/admin/breaches?ruleSet=${ruleSetId}&from=${startDate}&to=${endDate}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent, ruleSetId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRuleClick(ruleSetId);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'flat', delta: number) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3 h-3 text-red-500" />;
      case 'down':
        return <ArrowDown className="w-3 h-3 text-green-500" />;
      default:
        return <div className="w-3 h-3 flex items-center justify-center text-gray-400">•</div>;
    }
  };

  const getTrendTooltip = (delta: number, trend: 'up' | 'down' | 'flat') => {
    if (trend === 'flat') return 'No significant change vs prev. period';
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta}% vs prev. period`;
  };

  const getTimeLabel = () => {
    if (timeRange.preset === '24h') return 'Most triggered in 24h';
    if (timeRange.preset === '7d') return 'Most triggered in 7 days';
    if (timeRange.preset === '30d') return 'Most triggered in 30 days';
    if (timeRange.preset === '90d') return 'Most triggered in 90 days';
    return `Most triggered in selected period`;
  };

  if (rulesLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  // Updated logic: show chart if we have any data, show empty state only if no data at all
  const hasNoData = !topRulesData || topRulesData.length === 0;
  const totalBreaches = topRulesData ? topRulesData.reduce((sum, rule) => sum + rule.count, 0) : 0;

  return (
    <div className="space-y-4">
      {/* Header with market filter - ALWAYS rendered */}
      <div className="flex items-center justify-between">
        <h3 className="text-base lg:text-lg font-semibold">Top 5 Breach Rules</h3>
        <MarketFilter selectedMarket={selectedMarket} onMarketChange={onMarketChange} />
      </div>
      <p className="text-xs lg:text-sm text-muted-foreground">{getTimeLabel()}</p>

      {/* Conditional content based on data availability */}
      {hasNoData ? (
        // No data state with same height as chart
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No breach data found for selected period
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting the time range or market filter
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Donut Chart - now displays with any amount of data */}
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
                  paddingAngle={topRulesData.length > 1 ? 5 : 0}
                  dataKey="count"
                  className="cursor-pointer"
                >
                  {topRulesData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => handleRuleClick(entry.ruleSetId)}
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, entry.ruleSetId)}
                      role="button"
                      aria-label={`${entry.name} – ${entry.count} breaches (${entry.percentage}%)`}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          {/* Enhanced Legend */}
          <div className="space-y-2">
            {topRulesData.map((rule, index) => (
              <div 
                key={rule.ruleSetId} 
                className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => handleRuleClick(rule.ruleSetId)}
                onKeyDown={(e) => handleKeyDown(e, rule.ruleSetId)}
                tabIndex={0}
                role="button"
                aria-label={`${rule.name} – ${rule.count} breaches (${rule.percentage}%)`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate text-xs lg:text-sm font-medium">{rule.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs lg:text-sm">
                    {rule.count}
                    {/* Only show percentages if we have more than one rule or significant breach count */}
                    {(topRulesData.length > 1 || totalBreaches >= 5) && (
                      <span className="text-muted-foreground ml-1">
                        ({rule.percentage}%)
                      </span>
                    )}
                  </span>
                  <div 
                    className="flex items-center gap-1"
                    title={getTrendTooltip(rule.deltaPercentage, rule.trendDirection)}
                  >
                    {getTrendIcon(rule.trendDirection, rule.deltaPercentage)}
                    {rule.trendDirection !== 'flat' && (
                      <span className={`text-xs ${
                        rule.trendDirection === 'up' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {Math.abs(rule.deltaPercentage)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TopRulesChart;
