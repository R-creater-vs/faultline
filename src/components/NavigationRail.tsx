import React from 'react';
import { ViewMode } from '../types';
import { SplitSquareVertical, Sliders, Zap, ShieldCheck, FileText, RotateCcw } from 'lucide-react';

interface Props {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  ledgerName: string;
  sourceHash: string;
  onResetLedger: () => void;
}

export const NavigationRail: React.FC<Props> = ({
  currentView,
  onSelectView,
  ledgerName,
  sourceHash,
  onResetLedger
}) => {
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'decision-room',
      label: 'Decision Room',
      icon: <SplitSquareVertical className="w-4 h-4" />
    },
    {
      id: 'fault-studio',
      label: 'Fault Studio',
      icon: <Sliders className="w-4 h-4" />
    },
    {
      id: 'breaking-point',
      label: 'Breaking Point',
      icon: <Zap className="w-4 h-4" />,
      badge: 'Exact k=3'
    },
    {
      id: 'defense-bench',
      label: 'Defense Bench',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: 'Protected'
    },
    {
      id: 'experiment-ledger',
      label: 'Experiment Ledger',
      icon: <FileText className="w-4 h-4" />
    }
  ];

  return (
    <header className="no-print" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      padding: '0 24px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      zIndex: 50,
      flexShrink: 0
    }}>
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-surface-dark)',
          color: '#F0F6FC',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border-medium)'
        }}>
          <span style={{
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-mono)'
          }}>
            FAULTLINE
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Analytics Decision Stress Lab
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Synthetic experiment data • Integer Currency (Paise)
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 13px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-surface-subtle)' : 'transparent',
                border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ color: isActive ? 'var(--accent-vermilion)' : 'inherit' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: item.id === 'breaking-point' ? 'var(--accent-vermilion-dim)' : 'var(--accent-teal-dim)',
                  color: item.id === 'breaking-point' ? 'var(--accent-vermilion)' : 'var(--accent-teal)',
                  border: `1px solid ${item.id === 'breaking-point' ? 'var(--accent-vermilion-border)' : 'var(--accent-teal-border)'}`
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Ledger Provenance Badge & Reset Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          fontSize: '11px'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ledgerName}</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '10px' }}>
            {sourceHash}
          </span>
        </div>

        <button
          onClick={onResetLedger}
          className="editorial-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 10px',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Reset to Clean Baseline Ledger"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};
