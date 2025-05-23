
import { RawBreachEvent, TransformedBreachEvent } from '@/types/breach';

export class BreachTransformer {
  static transformBreachEvents(
    breaches: RawBreachEvent[],
    providerMap: Map<string, string>,
    ruleSetMap: Map<string, string>,
    subRuleMap: Map<string, string>
  ): TransformedBreachEvent[] {
    return breaches.map(breach => {
      const providerName = providerMap.get(breach.provider_id) || 'Unknown Provider';
      const ruleSetName = ruleSetMap.get(breach.rule_set_id) || 'Unknown Rule Set';
      const subRuleName = subRuleMap.get(breach.sub_rule_id) || 'Unknown Sub Rule';
      
      const displayAction = this.mapActionToDisplay(breach.action_taken);

      return {
        id: breach.id,
        timestamp: breach.occurred_at,
        provider: providerName,
        market: breach.market,
        ruleSetId: breach.rule_set_id,
        ruleSetName: ruleSetName,
        subRule: subRuleName,
        action: displayAction,
        details: typeof breach.details === 'object' 
          ? JSON.stringify(breach.details) 
          : String(breach.details || 'No details available')
      };
    });
  }

  private static mapActionToDisplay(actionTaken: string): string {
    switch (actionTaken) {
      case 'signal_rejected':
        return 'Rejected';
      case 'cooldown_triggered':
        return 'Cooldown';
      case 'suspension_applied':
        return 'Suspended';
      default:
        return 'Limited';
    }
  }

  static createLookupMaps(providers: any[], ruleSets: any[], subRules: any[]) {
    return {
      providerMap: new Map(providers.map(p => [p.id, p.provider_name])),
      ruleSetMap: new Map(ruleSets.map(rs => [rs.id, rs.name])),
      subRuleMap: new Map(subRules.map(sr => [sr.id, sr.rule_type]))
    };
  }
}
