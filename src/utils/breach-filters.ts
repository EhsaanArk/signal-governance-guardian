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
        // Convert to UTC for comparison
        const fromUTC = new Date(Date.UTC(
          dateRange.from.getFullYear(),
          dateRange.from.getMonth(),
          dateRange.from.getDate(),
          0, 0, 0, 0
        ));
        fromMatch = breachDate >= fromUTC;
        console.log(`  From check: ${breachDate.toISOString()} >= ${fromUTC.toISOString()} = ${fromMatch}`);
      }
      
      if (dateRange?.to) {
        // Convert to UTC for comparison and include the entire end date
        const toUTC = new Date(Date.UTC(
          dateRange.to.getFullYear(),
          dateRange.to.getMonth(),
          dateRange.to.getDate(),
          23, 59, 59, 999
        ));
        toMatch = breachDate <= toUTC;
        console.log(`  To check: ${breachDate.toISOString()} <= ${toUTC.toISOString()} = ${toMatch}`);
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
