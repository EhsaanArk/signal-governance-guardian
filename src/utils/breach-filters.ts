
import { BreachEventFilters, RawBreachEvent } from '@/types/breach';

export class BreachFilters {
  static applyDateRangeFilter(breaches: RawBreachEvent[], dateRange: BreachEventFilters['dateRange']): RawBreachEvent[] {
    if (!dateRange?.from && !dateRange?.to) {
      console.log('No date range specified, returning all breaches');
      return breaches;
    }

    const beforeDateFilter = breaches.length;
    const filtered = breaches.filter(breach => {
      const breachDate = new Date(breach.occurred_at);
      
      // Handle invalid dates
      if (isNaN(breachDate.getTime())) {
        console.warn(`Invalid date found in breach ${breach.id}: ${breach.occurred_at}`);
        return false;
      }
      
      let fromMatch = true;
      let toMatch = true;
      
      if (dateRange?.from) {
        fromMatch = breachDate >= dateRange.from;
      }
      
      if (dateRange?.to) {
        // Include the entire end date by adding 23:59:59
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        toMatch = breachDate <= endOfDay;
      }
      
      return fromMatch && toMatch;
    });
    
    console.log(`Date filter applied: ${beforeDateFilter} -> ${filtered.length} events`);
    if (dateRange?.from || dateRange?.to) {
      console.log(`Date range: ${dateRange?.from?.toISOString()} to ${dateRange?.to?.toISOString()}`);
    }
    
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
