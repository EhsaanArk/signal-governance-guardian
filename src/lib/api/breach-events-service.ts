
import { supabase } from '@/integrations/supabase/client';
import { BreachEventFilters, RawBreachEvent } from '@/types/breach';

export class BreachEventsService {
  async fetchAllBreachEvents(): Promise<RawBreachEvent[]> {
    console.log('Step 1: Fetching ALL breach events first...');
    const { data: allBreaches, error: allBreachesError } = await supabase
      .from('breach_events')
      .select('*')
      .order('occurred_at', { ascending: false });

    if (allBreachesError) {
      console.error('Error fetching all breach events:', allBreachesError);
      throw allBreachesError;
    }

    console.log('All breach events in database:', allBreaches);
    console.log('Total breach events found:', allBreaches?.length || 0);

    return allBreaches || [];
  }

  async fetchRelatedData(breaches: RawBreachEvent[]) {
    const providerIds = [...new Set(breaches.map(b => b.provider_id))];
    const ruleSetIds = [...new Set(breaches.map(b => b.rule_set_id))];
    const subRuleIds = [...new Set(breaches.map(b => b.sub_rule_id))];

    console.log('Fetching related data:', { 
      providerIds: providerIds.length, 
      ruleSetIds: ruleSetIds.length, 
      subRuleIds: subRuleIds.length 
    });

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

    if (providersError) console.error('Error fetching providers:', providersError);
    if (ruleSetsError) console.error('Error fetching rule sets:', ruleSetsError);
    if (subRulesError) console.error('Error fetching sub rules:', subRulesError);

    console.log('Related data fetched:', { 
      providers: providers?.length || 0, 
      ruleSets: ruleSetsData?.length || 0, 
      subRules: subRules?.length || 0 
    });

    return {
      providers: providers || [],
      ruleSets: ruleSetsData || [],
      subRules: subRules || []
    };
  }
}
