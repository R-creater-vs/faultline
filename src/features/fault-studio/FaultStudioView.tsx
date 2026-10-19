import React from 'react';
import { CanonicalLedger, FaultFamily, SearchWitness } from '../../types';
import { Sliders, Copy, Clock, Layers, CheckCircle2, AlertOctagon, Play } from 'lucide-react';

interface Props {
  ledger: CanonicalLedger;
  currentFault: FaultFamily;
  onSelectFault: (f: FaultFamily) => void;
  budget: number;
  onBudgetChange: (b: number) => void;
  witness: SearchWitness | null;
  onRunSearch: () => void;
}

export const FaultStudioView: React.FC<Props> = ({
  ledger,
  currentFault,
  onSelectFault,
  budget,
  onBudgetChange,
  witness,
  onRunSearch
}) => {
  // Find eligible candidate records based on fault family
  const eligibleRecords = React.useMemo(() => {
    if (currentFault === 'duplicate_ingestion') {
      return ledger.events
        .filter((e) => e.eventType === 'ORDER' && e.productGroup === 'Beta')
        .sort((a, b) => b.amount - a.amount);
    } else if (currentFault === 'delayed_refunds') {
      return ledger.events
        .filter((e) => e.eventType === 'REFUND' && e.productGroup === 'Beta')
        .sort((a, b) => b.amount - a.amount);
    } else {
      return ledger.products.filter((p) => p.productGroup === 'Beta');
    }
  }, [ledger, currentFault]);

  const faultFamilies: { id: FaultFamily; name: string; icon: React.ReactNode; desc: string; costUnit: string }[] = [
    {
      id: 'duplicate_ingestion',
      name: 'Duplicate Event Ingestion',
      icon: <Copy className="w-4 h-4" />,
      desc: 'Replays positive sales ingestion events. Vulnerable queries double-count; idempotent queries filter duplicates.',
      costUnit: '1 replayed event per row'
    },
    {
      id: 'delayed_refunds',
      name: 'Delayed Refund Timing',
      icon: <Clock className="w-4 h-4" />,
      desc: 'Shifts refund ingestion timestamps beyond the reporting cutoff without altering business-effective timestamps.',
      costUnit: '1 delayed refund record'
    },
    {
      id: 'dimension_fanout',
      name: 'Dimension Fan-out (Cartesian)',
      icon: <Layers className="w-4 h-4" />,
      desc: 'Injects an overlapping product dimension record, causing a 1:2 join explosion across all downstream orders.',
      costUnit: '1 injected dimension row'
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
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders className="w-5 h-5" style={{ color: 'var(--accent-vermilion)' }} />
          <h1 className="serif-heading" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Fault Studio: Scope & Action Budget
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Configure permitted reporting fault mechanisms, action cost models, and discrete candidate search bounds.
        </p>
      </div>

      {/* Fault Family Selector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {faultFamilies.map((fam) => {
          const isSel = currentFault === fam.id;
          return (
            <div
              key={fam.id}
              onClick={() => onSelectFault(fam.id)}
              className="editorial-card"
              style={{
                padding: '18px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isSel ? '2px solid var(--accent-vermilion)' : '1px solid var(--border-subtle)',
                backgroundColor: isSel ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                boxShadow: isSel ? '0 4px 16px rgba(201, 59, 43, 0.12)' : 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: isSel ? 'var(--accent-vermilion-dim)' : 'var(--bg-surface-subtle)',
                    color: isSel ? 'var(--accent-vermilion)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {fam.icon}
                  </div>
                  {isSel && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: 'var(--accent-vermilion)',
                      backgroundColor: 'var(--accent-vermilion-dim)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      ACTIVE FAMILY
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '12px' }}>
                  {fam.name}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                  {fam.desc}
                </p>
              </div>

              <div style={{
                marginTop: '14px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: 'var(--text-muted)'
              }}>
                Cost Model: <strong style={{ color: 'var(--text-primary)' }}>{fam.costUnit}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Budget & Constraint Configuration */}
      <div className="editorial-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Discrete Action Budget ($k$)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Maximum number of reporting errors permitted in the candidate search space.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-vermilion)', minWidth: '40px', textAlign: 'right' }}>
              {budget}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>max errors</span>
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="15"
          step="1"
          value={budget}
          onChange={(e) => onBudgetChange(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            accentColor: 'var(--accent-vermilion)',
            cursor: 'pointer'
          }}
        />

        {/* Explicit Constraint Disclosures */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginTop: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-teal)' }} />
            <span>At most 1 replay per row</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-teal)' }} />
            <span>Unit action cost ($c_i = 1$)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <AlertOctagon className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
            <span>Competitor A ledger untouched</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button
            onClick={onRunSearch}
            className="editorial-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: 'var(--accent-vermilion)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Execute Reversal Search</span>
          </button>
        </div>
      </div>

      {/* Eligible Candidates & Action Receipts Table */}
      <div className="editorial-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Eligible Candidate Pool (Target Group: Beta)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Ranked in descending order of contribution value. Search chooses the shortest prefix crossing the margin.
            </div>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {eligibleRecords.length} eligible records
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px' }}>Rank</th>
              <th style={{ padding: '8px 10px' }}>Business ID</th>
              <th style={{ padding: '8px 10px' }}>Record Type</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount (Paise)</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount (INR)</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Search Priority</th>
            </tr>
          </thead>
          <tbody>
            {eligibleRecords.slice(0, 10).map((rec: any, idx: number) => {
              const amt = rec.amount ?? rec.grossAmount ?? 0;
              const isSelectedInWitness = witness?.receipts.some((r) => r.targetBusinessId === (rec.businessId || rec.orderId || rec.productId));
              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    backgroundColor: isSelectedInWitness ? 'var(--accent-vermilion-dim)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {rec.businessId || rec.orderId || rec.productId}
                  </td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>
                    {rec.eventType || 'ORDER'}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {amt.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: isSelectedInWitness ? 'var(--accent-vermilion)' : 'var(--text-primary)' }}>
                    ₹{(amt / 100).toFixed(2)}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    {isSelectedInWitness ? (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: 'var(--accent-vermilion)',
                        backgroundColor: 'var(--accent-vermilion-dim)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--accent-vermilion-border)'
                      }}>
                        WITNESS CHOSEN
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Priority #{idx + 1}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
