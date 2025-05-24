import { BreachEventFilters, RawBreachEvent } from '@/types/breach';

export class BreachFilters {
  static applyDateRangeFilter(breaches: RawBreachEvent[], dateRange: BreachEventFilters['dateRange']): RawBreachEvent[] {
    if (!dateRange?.from && !dateRange?.to) {
      console.log('No date range specified, returning all breaches');
      return breaches;
    }

    const beforeDateFilter = breaches.length;
    console.log('=== DATE FILTERING DEBUG ===');
    console.log('Input date range:', {
      from: dateRange?.from?.toISOString(),
      to: dateRange?.to?.toISOString(),
      fromLocal: dateRange?.from?.toString(),
      toLocal: dateRange?.to?.toString()
    });

    const filtered = breaches.filter(breach => {
      const breachDate = new Date(breach.occurred_at);
      
      // Handle invalid dates
      if (isNaN(breachDate.getTime())) {
        console.warn(`Invalid date found in breach ${breach.id}: ${breach.occurred_at}`);
        return false;
      }
      
      console.log(`Checking breach ${breach.id} with date: ${breachDate.toISOString()} (${breachDate.toString()})`);
      
      let fromMatch = true;
      let toMatch = true;
      
      if (dateRange?.from) {
        // Use the from date as-is (already set to start of day in the hook)
        fromMatch = breachDate >= dateRange.from;
        console.log(`  From check: ${breachDate.toISOString()} >= ${dateRange.from.toISOString()} = ${fromMatch}`);
      }
      
      if (dateRange?.to) {
        // Set the to date to end of day for inclusive filtering
        const toEndOfDay = new Date(dateRange.to);
        toEndOfDay.setHours(23, 59, 59, 999);
        toMatch = breachDate <= toEndOfDay;
        console.log(`  To check: ${breachDate.toISOString()} <= ${toEndOfDay.toISOString()} = ${toMatch}`);
      }
      
      const result = fromMatch && toMatch;
      console.log(`  Final result for breach ${breach.id}: ${result}`);
      return result;
    });
    
    console.log(`Date filter applied: ${beforeDateFilter} -> ${filtered.length} events`);
    console.log('=== END DATE FILTERING DEBUG ===');
    
    return filtered;
  }

  static applyMarketFilter(breaches: RawBreachEvent[], selectedMarket: BreachEventFilters['selectedMarket']): RawBreachEvent[] {
    if (selectedMarket === 'All') {
      return breaches;
    }

    const beforeMarketFilter = breaches.length;
    const filtered = breaches.filter(breach => breach.market === selectedMarket);
    console.log(`Market filter (${selectedMarket}): ${beforeMarketFilter} -> ${filtered.length} events`);
    return filtered;
  }

  static applyRuleSetFilter(breaches: RawBreachEvent[], selectedRuleSet: string): RawBreachEvent[] {
    if (selectedRuleSet === 'all') {
      return breaches;
    }

    const beforeRuleSetFilter = breaches.length;
    const filtered = breaches.filter(breach => breach.rule_set_id === selectedRuleSet);
    console.log(`Rule set filter (${selectedRuleSet}): ${beforeRuleSetFilter} -> ${filtered.length} events`);
    return filtered;
  }

  static applyRuleTypeFilter(breaches: RawBreachEvent[], selectedRuleTypes: string[]): RawBreachEvent[] {
    if (selectedRuleTypes.length === 0) {
      return breaches;
    }

    const beforeRuleTypeFilter = breaches.length;
    const filtered = breaches.filter(breach => {
      // Map database rule_type to our filter types
      const ruleTypeMapping: Record<string, string> = {
        'cooling_off': 'CO',
        'guard': 'GD', 
        'active_cap': 'AC',
        'positive_cancel': 'PC'
      };
      
      const mappedRuleType = ruleTypeMapping[breach.rule_type || ''];
      return mappedRuleType && selectedRuleTypes.includes(mappedRuleType);
    });
    
    console.log(`Rule type filter (${selectedRuleTypes.join(', ')}): ${beforeRuleTypeFilter} -> ${filtered.length} events`);
    return filtered;
  }

  static applyActionFilter(breaches: RawBreachEvent[], selectedActions: string[]): RawBreachEvent[] {
    if (selectedActions.length === 0) {
      return breaches;
    }

    const beforeActionFilter = breaches.length;
    const filtered = breaches.filter(breach => {
      // Map database action_taken to our filter types
      const actionMapping: Record<string, string> = {
        'cooldown_triggered': 'paused',
        'signal_rejected': 'rejected',
        'provider_suspended': 'suspended'
      };
      
      const mappedAction = actionMapping[breach.action_taken || ''];
      return mappedAction && selectedActions.includes(mappedAction);
    });
    
    console.log(`Action filter (${selectedActions.join(', ')}): ${beforeActionFilter} -> ${filtered.length} events`);
    return filtered;
  }

  static applyProviderSearchFilter(transformedBreaches: any[], providerSearch: string): any[] {
    if (!providerSearch.trim()) {
      return transformedBreaches;
    }

    const beforeProviderSearch = transformedBreaches.length;
    const searchTerm = providerSearch.toLowerCase();
    const filtered = transformedBreaches.filter(breach =>
      breach.provider.toLowerCase().includes(searchTerm)
    );
    console.log(`Provider search filter "${providerSearch}": ${beforeProviderSearch} -> ${filtered.length} results`);
    return filtered;
  }
}
