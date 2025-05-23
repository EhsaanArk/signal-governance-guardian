
import { supabase } from '@/integrations/supabase/client';
import { BreachEventFilters, RawBreachEvent } from '@/types/breach';

export class BreachEventsService {
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Supabase connection...');
      const { data, error } = await supabase.from('breach_events').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
        return false;
      }
      
      console.log('✅ Supabase connection successful. Breach events count:', data);
      return true;
    } catch (error) {
      console.error('❌ Connection test exception:', error);
      return false;
    }
  }

  async fetchAllBreachEvents(): Promise<RawBreachEvent[]> {
    console.log('🚀 Starting breach events fetch...');
    
    // Test connection first
    const connectionOk = await this.testConnection();
    if (!connectionOk) {
      console.error('❌ Database connection failed, aborting fetch');
      throw new Error('Database connection failed');
    }

    try {
      console.log('📊 Fetching ALL breach events from database...');
      const { data: allBreaches, error: allBreachesError } = await supabase
        .from('breach_events')
        .select('*')
        .order('occurred_at', { ascending: false });

      if (allBreachesError) {
        console.error('❌ Error fetching breach events:', allBreachesError);
        console.error('Error details:', {
          message: allBreachesError.message,
          details: allBreachesError.details,
          hint: allBreachesError.hint,
          code: allBreachesError.code
        });
        throw allBreachesError;
      }

      console.log('✅ Successfully fetched breach events');
      console.log('📈 Total breach events found:', allBreaches?.length || 0);
      
      if (allBreaches && allBreaches.length > 0) {
        console.log('📋 Sample breach events:', allBreaches.slice(0, 3));
        console.log('📅 Date range of events:', {
          earliest: allBreaches[allBreaches.length - 1]?.occurred_at,
          latest: allBreaches[0]?.occurred_at
        });
      } else {
        console.warn('⚠️ No breach events found in database');
      }

      return allBreaches || [];
    } catch (error) {
      console.error('💥 Exception during breach events fetch:', error);
      throw error;
    }
  }

  async fetchRelatedData(breaches: RawBreachEvent[]) {
    if (breaches.length === 0) {
      console.log('ℹ️ No breaches to fetch related data for');
      return {
        providers: [],
        ruleSets: [],
        subRules: []
      };
    }

    const providerIds = [...new Set(breaches.map(b => b.provider_id))];
    const ruleSetIds = [...new Set(breaches.map(b => b.rule_set_id))];
    const subRuleIds = [...new Set(breaches.map(b => b.sub_rule_id))];

    console.log('🔗 Fetching related data for breach events...');
    console.log('📊 Related data counts:', { 
      providerIds: providerIds.length, 
      ruleSetIds: ruleSetIds.length, 
      subRuleIds: subRuleIds.length 
    });

    try {
      const [
        { data: providers, error: providersError },
        { data: ruleSetsData, error: ruleSetsError },
        { data: subRules, error: subRulesError }
      ] = await Promise.all([
        supabase
          .from('signal_providers')
          .select('id, provider_name')
          .in('id', providerIds),
        supabase
          .from('rule_sets')
          .select('id, name')
          .in('id', ruleSetIds),
        supabase
          .from('sub_rules')
          .select('id, rule_type')
          .in('id', subRuleIds)
      ]);

      if (providersError) {
        console.error('❌ Error fetching providers:', providersError);
      } else {
        console.log('✅ Providers fetched:', providers?.length || 0);
      }

      if (ruleSetsError) {
        console.error('❌ Error fetching rule sets:', ruleSetsError);
      } else {
        console.log('✅ Rule sets fetched:', ruleSetsData?.length || 0);
      }

      if (subRulesError) {
        console.error('❌ Error fetching sub rules:', subRulesError);
      } else {
        console.log('✅ Sub rules fetched:', subRules?.length || 0);
      }

      const result = {
        providers: providers || [],
        ruleSets: ruleSetsData || [],
        subRules: subRules || []
      };

      console.log('🎯 Related data fetch complete:', {
        providers: result.providers.length,
        ruleSets: result.ruleSets.length,
        subRules: result.subRules.length
      });

      return result;
    } catch (error) {
      console.error('💥 Exception during related data fetch:', error);
      throw error;
    }
  }
}
