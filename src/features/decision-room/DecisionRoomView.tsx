import React, { useState } from 'react';
import { CanonicalLedger, QuestionConfig, SearchWitness } from '../../types';
import { evaluateCleanBaseline } from '../../engine/queryEngine';
import { ArrowRight, AlertTriangle, ShieldCheck, Zap, Database, Play, ArrowDownRight, Layers } from 'lucide-react';

interface Props {
  ledger: CanonicalLedger;
  currentQuestion: QuestionConfig;
  onSelectQuestion: (q: QuestionConfig) => void;
  witness: SearchWitness | null;
  onRunSearch: () => void;
  onViewBreakingPoint: () => void;
  onViewDefenses: () => void;
}

export const DecisionRoomView: React.FC<Props> = ({
  ledger,
  currentQuestion,
  onSelectQuestion,
  witness,
  onRunSearch,
  onViewBreakingPoint,
  onViewDefenses
}) => {
  const [selectedStage, setSelectedStage] = useState<'source' | 'ingestion' | 'sql' | 'rule'>('rule');

  const baselineDecision = evaluateCleanBaseline(ledger, currentQuestion);
  const stressedDecision = witness?.stressedDecision || baselineDecision;
  const reversalHappened = witness?.reversalAchieved ?? false;

  const questionPresets: QuestionConfig[] = [
    {
      id: 'ranking',
      title: 'Leaderboard Ranking',
      description: 'Which product group achieved higher net recorded revenue?',
      targetGroup: 'Beta',
      competingGroup: 'Alpha'
    },
    {
      id: 'threshold',
      title: 'Audit Review Threshold',
      description: "Does Beta's net revenue fall below the audit threshold of ₹1,050.00?",
      targetGroup: 'Beta',
      competingGroup: 'Alpha',
      reviewThresholdPaise: 105000
    },
    {
      id: 'trend',
      title: 'Target Growth Benchmark',
      description: 'Did Beta achieve its period target revenue of ₹50.00?',
      targetGroup: 'Beta',
      competingGroup: 'Alpha',
      growthTargetPaise: 5000
    }
  ];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-canvas)',
      overflowY: 'auto',
      padding: '24px 32px',
      gap: '24px'
    }}>
      {/* Top Question Selector Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-secondary)'
            }}>
              Core Decision Objective
            </span>
          </div>
          <h1 className="serif-heading" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {currentQuestion.title}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {currentQuestion.description}
          </p>
        </div>

        {/* Question Selector Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {questionPresets.map((qp) => {
            const isSel = currentQuestion.id === qp.id;
            return (
              <button
                key={qp.id}
                onClick={() => onSelectQuestion(qp)}
                className="editorial-card"
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: isSel ? 700 : 500,
                  color: isSel ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isSel ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                  border: isSel ? '1.5px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
              >
                {qp.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Side-by-Side Comparative Screen */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) auto minmax(320px, 1fr)',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Left: Clean Baseline Report */}
        <div className="editorial-card" style={{
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderTop: '4px solid var(--accent-teal)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent-teal)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Clean Baseline Report
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent-teal-dim)',
                color: 'var(--accent-teal)',
                border: '1px solid var(--accent-teal-border)'
              }}>
                Immutable Ledger
              </span>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Product A */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-canvas)',
                borderRadius: '6px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Alpha Enterprise
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {baselineDecision.metrics.Alpha.orderCount} orders
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-teal)' }}>
                  ₹{(baselineDecision.metrics.Alpha.netPaise / 100).toFixed(2)}
                </div>
              </div>

              {/* Product B */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-canvas)',
                borderRadius: '6px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Beta Cloud Platform
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {baselineDecision.metrics.Beta.orderCount} orders
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ₹{(baselineDecision.metrics.Beta.netPaise / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Box */}
          <div style={{
            marginTop: '20px',
            padding: '14px',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: '6px',
            borderLeft: '3px solid var(--accent-teal)'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Baseline Conclusion
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-teal)', marginTop: '2px' }}>
              {baselineDecision.outcomeText}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Initial Margin: ₹{(Math.abs(baselineDecision.marginPaise) / 100).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Center: Dynamic Fault Connector & Reversal Marker */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '0 8px'
        }}>
          {reversalHappened ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '14px 16px',
              backgroundColor: 'var(--accent-vermilion-dim)',
              border: '1.5px dashed var(--accent-vermilion)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Zap className="w-6 h-6" style={{ color: 'var(--accent-vermilion)' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-vermilion)', textTransform: 'uppercase' }}>
                Reversal Witnessed
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                +{witness?.cost} reporting errors
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                (+₹{((witness?.addedRevenuePaise || 0) / 100).toFixed(2)})
              </span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '14px',
              color: 'var(--text-muted)'
            }}>
              <ArrowRight className="w-6 h-6" />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>Ready to Stress</span>
            </div>
          )}

          <button
            onClick={onRunSearch}
            className="editorial-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: 'var(--accent-vermilion)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(201, 59, 43, 0.3)'
            }}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Search Fewest Errors</span>
          </button>
        </div>

        {/* Right: Stressed Reporting Copy */}
        <div className="editorial-card" style={{
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderTop: reversalHappened ? '4px solid var(--accent-vermilion)' : '4px solid var(--border-medium)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: reversalHappened ? 'var(--accent-vermilion)' : 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Stressed Reporting View
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: reversalHappened ? 'var(--accent-vermilion-dim)' : 'var(--bg-surface-subtle)',
                color: reversalHappened ? 'var(--accent-vermilion)' : 'var(--text-secondary)',
                border: `1px solid ${reversalHappened ? 'var(--accent-vermilion-border)' : 'var(--border-subtle)'}`
              }}>
                {reversalHappened ? 'Corrupted Ingestion Copy' : 'Clean Copy'}
              </span>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Product A */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-canvas)',
                borderRadius: '6px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Alpha Enterprise
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {stressedDecision.metrics.Alpha.orderCount} orders
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                  ₹{(stressedDecision.metrics.Alpha.netPaise / 100).toFixed(2)}
                </div>
              </div>

              {/* Product B */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-canvas)',
                borderRadius: '6px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Beta Cloud Platform
                  </div>
                  <div style={{ fontSize: '11px', color: reversalHappened ? 'var(--accent-vermilion)' : 'var(--text-secondary)', fontWeight: reversalHappened ? 700 : 400 }}>
                    {stressedDecision.metrics.Beta.orderCount} orders {reversalHappened && `(+${witness?.cost} duplicated)`}
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: reversalHappened ? 'var(--accent-vermilion)' : 'var(--text-primary)' }}>
                  ₹{(stressedDecision.metrics.Beta.netPaise / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Box */}
          <div style={{
            marginTop: '20px',
            padding: '14px',
            backgroundColor: reversalHappened ? 'var(--accent-vermilion-dim)' : 'var(--bg-surface-subtle)',
            borderRadius: '6px',
            borderLeft: `3px solid ${reversalHappened ? 'var(--accent-vermilion)' : 'var(--text-muted)'}`
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Reported Conclusion
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: reversalHappened ? 'var(--accent-vermilion)' : 'var(--text-primary)', marginTop: '2px' }}>
              {stressedDecision.outcomeText}
            </div>
            <div style={{ fontSize: '12px', color: reversalHappened ? 'var(--accent-vermilion)' : 'var(--text-secondary)', marginTop: '4px' }}>
              {reversalHappened ? `Reversed by +₹${((witness?.addedRevenuePaise || 0) / 100).toFixed(2)}` : 'Matches Baseline'}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Data Flow Dependency Pipeline */}
      <div className="editorial-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Analytical Lineage: Visible Dependency Chain
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Click any stage to inspect the underlying formula, SQL transformation, and affected record sets.
            </div>
          </div>

          {reversalHappened && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onViewBreakingPoint}
                className="editorial-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--accent-vermilion)',
                  cursor: 'pointer'
                }}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Minimality Proof</span>
              </button>

              <button
                onClick={onViewDefenses}
                className="editorial-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--accent-teal)',
                  cursor: 'pointer'
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Test Defenses</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Pipeline Stages */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px'
        }}>
          {/* Stage 1 */}
          <div
            onClick={() => setSelectedStage('source')}
            style={{
              padding: '14px',
              borderRadius: '6px',
              backgroundColor: selectedStage === 'source' ? 'var(--bg-surface-subtle)' : 'var(--bg-canvas)',
              border: selectedStage === 'source' ? '1.5px solid var(--text-primary)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700 }}>
              <Database className="w-3.5 h-3.5" />
              <span>1. SOURCE LEDGER</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {ledger.orders.length} Orders • {ledger.refunds.length} Refunds
            </div>
            <div style={{ fontSize: '11px', color: 'var(--accent-teal)', fontWeight: 600 }}>
              Immutable Truth
            </div>
          </div>

          {/* Stage 2 */}
          <div
            onClick={() => setSelectedStage('ingestion')}
            style={{
              padding: '14px',
              borderRadius: '6px',
              backgroundColor: selectedStage === 'ingestion' ? 'var(--bg-surface-subtle)' : 'var(--bg-canvas)',
              border: selectedStage === 'ingestion' ? '1.5px solid var(--text-primary)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700 }}>
              <Layers className="w-3.5 h-3.5" />
              <span>2. INGESTION STREAM</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {ledger.events.length} Stream Events
            </div>
            <div style={{ fontSize: '11px', color: reversalHappened ? 'var(--accent-vermilion)' : 'var(--text-muted)', fontWeight: 600 }}>
              {reversalHappened ? `+${witness?.cost} Injected Replays` : 'Clean Stream'}
            </div>
          </div>

          {/* Stage 3 */}
          <div
            onClick={() => setSelectedStage('sql')}
            style={{
              padding: '14px',
              borderRadius: '6px',
              backgroundColor: selectedStage === 'sql' ? 'var(--bg-surface-subtle)' : 'var(--bg-canvas)',
              border: selectedStage === 'sql' ? '1.5px solid var(--text-primary)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700 }}>
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>3. SQL AGGREGATION</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              GROUP BY product_group
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              SUM(gross) - SUM(refunds)
            </div>
          </div>

          {/* Stage 4 */}
          <div
            onClick={() => setSelectedStage('rule')}
            style={{
              padding: '14px',
              borderRadius: '6px',
              backgroundColor: selectedStage === 'rule' ? 'var(--bg-surface-subtle)' : 'var(--bg-canvas)',
              border: selectedStage === 'rule' ? '1.5px solid var(--text-primary)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700 }}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>4. DECISION RULE</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Net(Alpha) vs Net(Beta)
            </div>
            <div style={{ fontSize: '11px', color: reversalHappened ? 'var(--accent-vermilion)' : 'var(--accent-teal)', fontWeight: 700 }}>
              {reversalHappened ? 'Reversal Witnessed' : 'Baseline Healthy'}
            </div>
          </div>
        </div>

        {/* Selected Stage Explanation Drawer */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: 'var(--bg-canvas)',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          fontSize: '12px',
          lineHeight: '1.6'
        }}>
          {selectedStage === 'source' && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Source Ledger Integrity: </strong>
              <span>
                The canonical orders and refunds ledger is cryptographically hashed with checksum <code className="mono">{ledger.sourceHash}</code>. All faults are isolated to simulated downstream reporting streams. The truth ledger remains completely unmodified.
              </span>
            </div>
          )}
          {selectedStage === 'ingestion' && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Ingestion Stream & Vulnerability: </strong>
              <span>
                ETL event pipelines without strict idempotency keys accept duplicate deliveries when message queues retry failed requests. In this experiment, {witness?.cost || 0} order events were replayed with fresh event IDs, causing double counting in vulnerable downstream queries.
              </span>
            </div>
          )}
          {selectedStage === 'sql' && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>SQL Transformation Recipe: </strong>
              <div style={{
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--bg-surface-dark)',
                color: '#E6EDF3',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                marginTop: '6px',
                whiteSpace: 'pre'
              }}>
{`SELECT product_group,
       SUM(CASE WHEN event_type = 'ORDER' THEN amount ELSE 0 END) AS gross_paise,
       SUM(CASE WHEN event_type = 'REFUND' THEN amount ELSE 0 END) AS refunds_paise,
       SUM(CASE WHEN event_type = 'ORDER' THEN amount ELSE -amount END) AS net_paise
FROM ingestion_events
GROUP BY product_group;`}
              </div>
            </div>
          )}
          {selectedStage === 'rule' && (
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Decision Rule Mathematical Contract: </strong>
              <span>
                The rule tests whether <code className="mono">Net(Beta) &gt; Net(Alpha)</code> strictly. A tie (<code className="mono">Net(Beta) == Net(Alpha)</code>) does not constitute a reversal. To reverse the baseline leader, the cumulative sum of replayed errors must strictly exceed the margin of ₹{(baselineDecision.marginPaise / 100).toFixed(2)}.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
