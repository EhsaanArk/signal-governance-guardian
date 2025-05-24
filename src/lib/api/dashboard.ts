import { supabase } from '@/integrations/supabase/client';
import { Market } from '@/types/database';

export interface DashboardMetrics {
  activeCooldowns: number;
  breaches24h: number;
  winRate24h: number;
  providersInReview: number;
  cooldownChange: number;
  breachChange: number;
  winRateChange: number;
  reviewChange: number;
}

export interface HeatmapData {
  [market: string]: {
    [hour: number]: number;
  };
}

export interface TopBreachedRule {
  ruleSetId: string;
  name: string;
  count: number;
  percentage: number;
  previousCount: number;
  deltaPercentage: number;
  trendDirection: 'up' | 'down' | 'flat';
}

export interface RecentBreach {
  id: string;
  occurred_at: string;
  providerName: string;
  market: Market;
  ruleName: string;
  action_taken: string;
}

export interface ExpiringCooldown {
  id: string;
  providerName: string;
  market: Market;
  expires_at: string;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  console.log('📊 Fetching dashboard metrics...');

  // Get current metrics
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  try {
    // Active cooldowns
    const { data: cooldowns, error: cooldownError } = await supabase
      .from('active_cooldowns')
      .select('id')
      .eq('status', 'active');

    if (cooldownError) throw cooldownError;

    // 24h breaches (current)
    const { data: breaches24h, error: breachError } = await supabase
      .from('breach_events')
      .select('id')
      .gte('occurred_at', yesterday.toISOString());

    if (breachError) throw breachError;

    // Previous 24h breaches for comparison
    const { data: breachesPrev24h, error: breachPrevError } = await supabase
      .from('breach_events')
      .select('id')
      .gte('occurred_at', twoDaysAgo.toISOString())
      .lt('occurred_at', yesterday.toISOString());

    if (breachPrevError) throw breachPrevError;

    // Win rate calculation from provider statistics
    const { data: stats, error: statsError } = await supabase
      .from('provider_statistics')
      .select('profitable_closes, sl_count')
      .gte('updated_at', yesterday.toISOString());

    if (statsError) throw statsError;

    const totalWins = stats?.reduce((sum, stat) => sum + stat.profitable_closes, 0) || 0;
    const totalLosses = stats?.reduce((sum, stat) => sum + stat.sl_count, 0) || 0;
    const winRate24h = totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0;

    // Providers in review (mock data for now)
    const providersInReview = 3; // This would come from a proper provider status system

    // Calculate changes
    const breachChange = breachesPrev24h?.length 
      ? Math.round(((breaches24h?.length || 0) - breachesPrev24h.length) / breachesPrev24h.length * 100)
      : 0;

    console.log('✅ Dashboard metrics fetched:', {
      activeCooldowns: cooldowns?.length || 0,
      breaches24h: breaches24h?.length || 0,
      winRate24h,
      providersInReview
    });

    return {
      activeCooldowns: cooldowns?.length || 0,
      breaches24h: breaches24h?.length || 0,
      winRate24h,
      providersInReview,
      cooldownChange: 0, // Would need historical data
      breachChange,
      winRateChange: 0, // Would need historical data
      reviewChange: 0, // Would need historical data
    };
  } catch (error) {
    console.error('❌ Error fetching dashboard metrics:', error);
    throw error;
  }
}

export async function fetchHeatmapData(): Promise<HeatmapData> {
  console.log('📈 Fetching heatmap data...');

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const { data: breaches, error } = await supabase
      .from('breach_events')
      .select('occurred_at, market')
      .gte('occurred_at', sevenDaysAgo.toISOString())
      .eq('action_taken', 'signal_rejected'); // Assuming this represents SL events

    if (error) throw error;

    // Process data into heatmap format
    const heatmapData: HeatmapData = {
      Forex: {},
      Crypto: {},
      Indices: {}
    };

    breaches?.forEach(breach => {
      const hour = new Date(breach.occurred_at).getUTCHours();
      const market = breach.market;
      
      if (!heatmapData[market]) {
        heatmapData[market] = {};
      }
      
      heatmapData[market][hour] = (heatmapData[market][hour] || 0) + 1;
    });

    console.log('✅ Heatmap data processed');
    return heatmapData;
  } catch (error) {
    console.error('❌ Error fetching heatmap data:', error);
    throw error;
  }
}

export async function fetchTopBreachedRules(market?: Market | 'All'): Promise<TopBreachedRule[]> {
  console.log('📊 Fetching top breached rules...', market ? `for market: ${market}` : 'for all markets');

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  try {
    // Current 24h breaches query
    let currentQuery = supabase
      .from('breach_events')
      .select(`
        rule_set_id,
        rule_sets(name)
      `)
      .gte('occurred_at', yesterday.toISOString());

    // Previous 24h breaches query
    let previousQuery = supabase
      .from('breach_events')
      .select(`
        rule_set_id,
        rule_sets(name)
      `)
      .gte('occurred_at', twoDaysAgo.toISOString())
      .lt('occurred_at', yesterday.toISOString());

    // Apply market filter if specified
    if (market && market !== 'All') {
      currentQuery = currentQuery.eq('market', market);
      previousQuery = previousQuery.eq('market', market);
    }

    const [currentResult, previousResult] = await Promise.all([
      currentQuery,
      previousQuery
    ]);

    if (currentResult.error) throw currentResult.error;
    if (previousResult.error) throw previousResult.error;

    // Count current breaches by rule set
    const currentCounts: { [key: string]: { name: string; count: number } } = {};
    currentResult.data?.forEach(breach => {
      const ruleSetId = breach.rule_set_id;
      const ruleName = (breach.rule_sets as any)?.name || 'Unknown Rule';
      
      if (!currentCounts[ruleSetId]) {
        currentCounts[ruleSetId] = { name: ruleName, count: 0 };
      }
      currentCounts[ruleSetId].count += 1;
    });

    // Count previous breaches by rule set
    const previousCounts: { [key: string]: number } = {};
    previousResult.data?.forEach(breach => {
      const ruleSetId = breach.rule_set_id;
      previousCounts[ruleSetId] = (previousCounts[ruleSetId] || 0) + 1;
    });

    // Calculate total current breaches for percentages
    const totalCurrentBreaches = Object.values(currentCounts).reduce((sum, { count }) => sum + count, 0);

    // Convert to array and calculate trends
    const topRules = Object.entries(currentCounts)
      .map(([ruleSetId, { name, count }]) => {
        const previousCount = previousCounts[ruleSetId] || 0;
        const percentage = totalCurrentBreaches > 0 ? Math.round((count / totalCurrentBreaches) * 100) : 0;
        
        // Calculate trend
        let deltaPercentage = 0;
        let trendDirection: 'up' | 'down' | 'flat' = 'flat';
        
        if (previousCount > 0) {
          deltaPercentage = Math.round(((count - previousCount) / previousCount) * 100);
          if (deltaPercentage >= 10) {
            trendDirection = 'up';
          } else if (deltaPercentage <= -10) {
            trendDirection = 'down';
          }
        } else if (count > 0) {
          // New rule that didn't have breaches before
          deltaPercentage = 100;
          trendDirection = 'up';
        }

        return {
          ruleSetId,
          name,
          count,
          percentage,
          previousCount,
          deltaPercentage,
          trendDirection
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    console.log('✅ Top breached rules fetched:', topRules.length);
    return topRules;
  } catch (error) {
    console.error('❌ Error fetching top breached rules:', error);
    throw error;
  }
}

export async function fetchRecentBreaches(): Promise<RecentBreach[]> {
  console.log('📋 Fetching recent breaches...');

  try {
    const { data: breaches, error } = await supabase
      .from('breach_events')
      .select(`
        id,
        occurred_at,
        market,
        action_taken,
        signal_providers(provider_name),
        rule_sets(name)
      `)
      .order('occurred_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const recentBreaches: RecentBreach[] = breaches?.map(breach => ({
      id: breach.id,
      occurred_at: breach.occurred_at,
      providerName: (breach.signal_providers as any)?.provider_name || 'Unknown',
      market: breach.market,
      ruleName: (breach.rule_sets as any)?.name || 'Unknown Rule',
      action_taken: breach.action_taken
    })) || [];

    console.log('✅ Recent breaches fetched:', recentBreaches.length);
    return recentBreaches;
  } catch (error) {
    console.error('❌ Error fetching recent breaches:', error);
    throw error;
  }
}

export async function fetchExpiringCooldowns(): Promise<ExpiringCooldown[]> {
  console.log('⏰ Fetching expiring cooldowns...');

  try {
    const { data: cooldowns, error } = await supabase
      .from('active_cooldowns')
      .select(`
        id,
        market,
        expires_at,
        signal_providers(provider_name)
      `)
      .eq('status', 'active')
      .order('expires_at', { ascending: true })
      .limit(10);

    if (error) throw error;

    const expiringCooldowns: ExpiringCooldown[] = cooldowns?.map(cooldown => ({
      id: cooldown.id,
      providerName: (cooldown.signal_providers as any)?.provider_name || 'Unknown',
      market: cooldown.market,
      expires_at: cooldown.expires_at
    })) || [];

    console.log('✅ Expiring cooldowns fetched:', expiringCooldowns.length);
    return expiringCooldowns;
  } catch (error) {
    console.error('❌ Error fetching expiring cooldowns:', error);
    throw error;
  }
}
