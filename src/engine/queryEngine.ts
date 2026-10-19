import type { CanonicalLedger, IngestionEvent, QuestionConfig, DecisionResult, GroupMetric } from '../types/index.ts';

export function calculateMetricsFromEvents(
  events: IngestionEvent[],
  defensePolicy: 'none' | 'idempotency' | 'reconciliation' | 'join_guard' = 'none'
): Record<'Alpha' | 'Beta' | 'Gamma', GroupMetric> {
  let effectiveEvents = [...events];

  // Apply Defense Filter if enabled
  if (defensePolicy === 'idempotency') {
    // Idempotency policy: Deduplicate on (eventType, businessId)
    const seen = new Set<string>();
    effectiveEvents = effectiveEvents.filter((ev) => {
      const key = `${ev.eventType}:${ev.businessId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const metrics: Record<'Alpha' | 'Beta' | 'Gamma', GroupMetric> = {
    Alpha: { group: 'Alpha', grossPaise: 0, refundsPaise: 0, netPaise: 0, orderCount: 0, refundCount: 0 },
    Beta: { group: 'Beta', grossPaise: 0, refundsPaise: 0, netPaise: 0, orderCount: 0, refundCount: 0 },
    Gamma: { group: 'Gamma', grossPaise: 0, refundsPaise: 0, netPaise: 0, orderCount: 0, refundCount: 0 }
  };

  for (const ev of effectiveEvents) {
    const grp = ev.productGroup;
    if (!metrics[grp]) continue;

    if (ev.eventType === 'ORDER') {
      metrics[grp].grossPaise += ev.amount;
      metrics[grp].orderCount += 1;
    } else if (ev.eventType === 'REFUND') {
      metrics[grp].refundsPaise += ev.amount;
      metrics[grp].refundCount += 1;
    }
  }

  for (const g of ['Alpha', 'Beta', 'Gamma'] as const) {
    metrics[g].netPaise = metrics[g].grossPaise - metrics[g].refundsPaise;
  }

  return metrics;
}

export function evaluateDecisionRule(
  config: QuestionConfig,
  metrics: Record<'Alpha' | 'Beta' | 'Gamma', GroupMetric>
): DecisionResult {
  const netAlpha = metrics.Alpha.netPaise;
  const netBeta = metrics.Beta.netPaise;

  if (config.id === 'ranking') {
    const margin = netAlpha - netBeta;
    let outcomeText = '';
    let isFlagged = false;
    let winner = 'Alpha';

    if (margin > 0) {
      outcomeText = 'Alpha Dominant (Leading)';
      winner = 'Alpha';
      isFlagged = false;
    } else if (margin < 0) {
      outcomeText = 'Beta Dominant (Reversal)';
      winner = 'Beta';
      isFlagged = true; // Inversion from baseline!
    } else {
      outcomeText = 'Dead Heat (Tie - No Leader)';
      winner = 'Tie';
      isFlagged = false; // A tie is NOT a reversal!
    }

    return {
      questionId: 'ranking',
      questionText: 'Which product group has higher net recorded revenue in the reporting period?',
      outcomeText,
      isFlaggedOrSecondary: isFlagged,
      marginPaise: margin,
      metrics,
      summary: `Alpha: ₹${(netAlpha / 100).toFixed(2)} vs Beta: ₹${(netBeta / 100).toFixed(2)} (Margin: ₹${(Math.abs(margin) / 100).toFixed(2)}, Leader: ${winner})`
    };
  }

  if (config.id === 'threshold') {
    const threshold = config.reviewThresholdPaise ?? 105000; // default ₹1,050.00
    const margin = netBeta - threshold;
    const isBelow = netBeta < threshold;

    return {
      questionId: 'threshold',
      questionText: `Does Beta's net recorded revenue fall below the review threshold of ₹${(threshold / 100).toFixed(2)}?`,
      outcomeText: isBelow ? 'FLAGGED FOR AUDIT REVIEW' : 'PASS (HEALTHY THRESHOLD)',
      isFlaggedOrSecondary: isBelow,
      marginPaise: margin,
      metrics,
      summary: `Beta Net: ₹${(netBeta / 100).toFixed(2)} vs Threshold ₹${(threshold / 100).toFixed(2)} (Delta: ₹${(margin / 100).toFixed(2)})`
    };
  }

  // Trend Question
  const growthTarget = config.growthTargetPaise ?? 5000; // default ₹50.00 growth
  const margin = netBeta - growthTarget;
  const isMissed = netBeta < growthTarget;

  return {
    questionId: 'trend',
    questionText: `Did Beta achieve its period target net revenue of ₹${(growthTarget / 100).toFixed(2)}?`,
    outcomeText: isMissed ? 'TARGET MISSED' : 'TARGET ACHIEVED',
    isFlaggedOrSecondary: isMissed,
    marginPaise: margin,
    metrics,
    summary: `Beta Net: ₹${(netBeta / 100).toFixed(2)} vs Target ₹${(growthTarget / 100).toFixed(2)}`
  };
}

export function evaluateCleanBaseline(ledger: CanonicalLedger, question: QuestionConfig): DecisionResult {
  const metrics = calculateMetricsFromEvents(ledger.events, 'none');
  return evaluateDecisionRule(question, metrics);
}

export function generateSQLRecipe(
  _question: QuestionConfig,
  defense: 'none' | 'idempotency' | 'reconciliation' | 'join_guard' = 'none'
): string {
  if (defense === 'idempotency') {
    return `-- Idempotent Defensive Reporting Query
WITH deduplicated_events AS (
  SELECT 
    event_id,
    event_type,
    business_id,
    product_group,
    amount,
    ROW_NUMBER() OVER (
      PARTITION BY event_type, business_id 
      ORDER BY ingestion_timestamp ASC
    ) AS rnk
  FROM ingestion_events
)
SELECT 
  product_group,
  SUM(CASE WHEN event_type = 'ORDER' THEN amount ELSE 0 END) AS gross_paise,
  SUM(CASE WHEN event_type = 'REFUND' THEN amount ELSE 0 END) AS refunds_paise,
  SUM(CASE WHEN event_type = 'ORDER' THEN amount ELSE -amount END) AS net_paise
FROM deduplicated_events
WHERE rnk = 1
GROUP BY product_group
ORDER BY net_paise DESC;`;
  }

  return `-- Standard Reporting Query (Vulnerable to Duplicate Streaming Events)
SELECT 
  product_group,
  SUM(CASE WHEN event_type = 'ORDER' THEN amount ELSE 0 END) AS gross_paise,
  SUM(CASE WHEN event_type = 'REFUND' THEN amount ELSE 0 END) AS refunds_paise,
  SUM(CASE WHEN event_type = 'ORDER' THEN amount ELSE -amount END) AS net_paise
FROM ingestion_events
GROUP BY product_group
ORDER BY net_paise DESC;`;
}
