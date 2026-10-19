import React from 'react';
import { SearchWitness, CanonicalLedger } from '../../types';
import { Zap, Award, CheckCircle2, AlertTriangle, ShieldCheck, FileCode } from 'lucide-react';

interface Props {
  ledger: CanonicalLedger;
  witness: SearchWitness | null;
  onNavigateToDefenses: () => void;
}

export const BreakingPointView: React.FC<Props> = ({ witness, onNavigateToDefenses }) => {
  if (!witness) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        color: 'var(--text-muted)'
      }}>
        No stress experiment executed yet. Please run search from Decision Room or Fault Studio.
      </div>
    );
  }

  const baselineA = witness.baselineDecision.metrics.Alpha.netPaise;
  const baselineB = witness.baselineDecision.metrics.Beta.netPaise;

  // Generate discrete points for the curve
  const steps: { k: number; added: number; netBeta: number; reversed: boolean }[] = [
    { k: 0, added: 0, netBeta: baselineB, reversed: false }
  ];

  let cumulativeAdded = 0;
  witness.receipts.forEach((r, idx) => {
    cumulativeAdded += r.amountPaise;
    const curNet = baselineB + cumulativeAdded;
    steps.push({
      k: idx + 1,
      added: cumulativeAdded,
      netBeta: curNet,
      reversed: curNet > baselineA
    });
  });

  const maxNet = Math.max(baselineA * 1.05, steps[steps.length - 1].netBeta * 1.02);
  const minNet = baselineB * 0.98;

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
      {/* Header with Certified Minimum Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap className="w-5 h-5" style={{ color: 'var(--accent-vermilion)' }} />
            <h1 className="serif-heading" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Breaking Point: Reversal Curve & Minimality Proof
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Discrete cost-versus-outcome curve identifying the exact threshold where reporting errors reverse the dashboard.
          </p>
        </div>

        {/* Status Certification Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          backgroundColor: witness.status === 'EXACT_MINIMUM' ? 'var(--accent-vermilion-dim)' : 'var(--accent-teal-dim)',
          border: `1.5px solid ${witness.status === 'EXACT_MINIMUM' ? 'var(--accent-vermilion)' : 'var(--accent-teal)'}`
        }}>
          <Award className="w-4 h-4" style={{ color: witness.status === 'EXACT_MINIMUM' ? 'var(--accent-vermilion)' : 'var(--accent-teal)' }} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Search Certification
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: witness.status === 'EXACT_MINIMUM' ? 'var(--accent-vermilion)' : 'var(--accent-teal)' }}>
              {witness.status} (k = {witness.cost})
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Cost-versus-Outcome SVG Curve */}
      <div className="editorial-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Reported Net Revenue vs. Number of Injected Reporting Errors
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Horizontal red dashed line indicates Alpha's revenue (₹{(baselineA / 100).toFixed(2)}). Reversal requires strictly crossing this line.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: 'var(--accent-teal)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Baseline Alpha (₹{(baselineA / 100).toFixed(2)})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '3px', backgroundColor: 'var(--accent-vermilion)' }} />
              <span style={{ color: 'var(--accent-vermilion)', fontWeight: 600 }}>Stressed Beta Revenue</span>
            </div>
          </div>
        </div>

        {/* SVG Curve Chart */}
        <div style={{
          width: '100%',
          height: '240px',
          backgroundColor: 'var(--bg-canvas)',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          padding: '16px',
          position: 'relative'
        }}>
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 800 200" preserveAspectRatio="none">
            {/* Horizontal Line for Alpha Baseline (Threshold) */}
            {(() => {
              const yNorm = (baselineA - minNet) / (maxNet - minNet);
              const yPos = 180 - yNorm * 160;
              return (
                <g>
                  <line x1="40" y1={yPos} x2="760" y2={yPos} stroke="var(--accent-teal)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="44" y={yPos - 6} fill="var(--accent-teal)" fontSize="10" fontWeight="700">
                    Decision Reversal Threshold: ₹{(baselineA / 100).toFixed(2)}
                  </text>
                </g>
              );
            })()}

            {/* Stepped Polyline of Stressed Beta */}
            <polyline
              fill="none"
              stroke="var(--accent-vermilion)"
              strokeWidth="2.5"
              points={steps.map((st, i) => {
                const x = 50 + (i / Math.max(1, steps.length - 1)) * 680;
                const yNorm = (st.netBeta - minNet) / (maxNet - minNet);
                const y = 180 - yNorm * 160;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* Step Points & Badges */}
            {steps.map((st, i) => {
              const x = 50 + (i / Math.max(1, steps.length - 1)) * 680;
              const yNorm = (st.netBeta - minNet) / (maxNet - minNet);
              const y = 180 - yNorm * 160;
              const isBreakingPoint = st.reversed && (i === 0 || !steps[i - 1].reversed);

              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isBreakingPoint ? 6 : 4}
                    fill={isBreakingPoint ? 'var(--accent-vermilion)' : (st.reversed ? 'var(--accent-vermilion)' : 'var(--text-secondary)')}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <text x={x} y={y + 18} fill="var(--text-secondary)" fontSize="9" textAnchor="middle" fontWeight="600">
                    k={st.k}
                  </text>
                  <text x={x} y={y - 10} fill="var(--text-primary)" fontSize="9" textAnchor="middle" fontWeight="700">
                    ₹{(st.netBeta / 100).toFixed(0)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Two Column Grid: Mathematical Proof & Action Receipts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(320px, 1fr)', gap: '20px' }}>
        {/* Mathematical Proof Drawer */}
        <div className="editorial-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode className="w-4 h-4" style={{ color: 'var(--accent-teal)' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Certified Prefix Optimality Proof
            </span>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-canvas)',
            padding: '14px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px',
            lineHeight: '1.7',
            whiteSpace: 'pre-line',
            color: 'var(--text-primary)'
          }}>
            {witness.mathematicalProof}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-teal)' }} />
            <span>Search evaluated {witness.evaluatedCandidatesCount} candidate configurations in {witness.elapsedMs}ms.</span>
          </div>
        </div>

        {/* Action Receipts Table */}
        <div className="editorial-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle className="w-4 h-4" style={{ color: 'var(--accent-vermilion)' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Injected Action Receipts ({witness.receipts.length})
              </span>
            </div>
            <button
              onClick={onNavigateToDefenses}
              className="editorial-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-teal)',
                cursor: 'pointer'
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Test Countermeasures</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {witness.receipts.map((r, idx) => (
              <div
                key={r.actionId}
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-canvas)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-vermilion)' }}>
                    Action #{idx + 1}: {r.targetBusinessId}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-vermilion)' }}>
                    +₹{(r.amountPaise / 100).toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {r.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
