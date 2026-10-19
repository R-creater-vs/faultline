import React, { useState, useMemo } from 'react';
import { ViewMode, QuestionConfig, FaultFamily, CanonicalLedger } from '../types';
import { generateCanonicalLedger } from '../engine/generator';
import { runStressSearch } from '../engine/stressSearch';
import { NavigationRail } from '../components/NavigationRail';
import { DecisionRoomView } from '../features/decision-room/DecisionRoomView';
import { FaultStudioView } from '../features/fault-studio/FaultStudioView';
import { BreakingPointView } from '../features/breaking-point/BreakingPointView';
import { DefenseBenchView } from '../features/defense-bench/DefenseBenchView';
import { ExperimentLedgerView } from '../features/experiment-ledger/ExperimentLedgerView';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('decision-room');
  const [ledger, setLedger] = useState<CanonicalLedger>(() => generateCanonicalLedger('worked-example', 20261020));

  const [question, setQuestion] = useState<QuestionConfig>({
    id: 'ranking',
    title: 'Product Group Ranking',
    description: 'Which product group achieved higher net recorded revenue in the reporting period?',
    targetGroup: 'Beta',
    competingGroup: 'Alpha'
  });

  const [faultFamily, setFaultFamily] = useState<FaultFamily>('duplicate_ingestion');
  const [budget, setBudget] = useState<number>(10);

  // Execute stress search
  const witness = useMemo(() => {
    return runStressSearch(ledger, question, faultFamily, budget);
  }, [ledger, question, faultFamily, budget]);

  const handleResetLedger = () => {
    setLedger(generateCanonicalLedger('worked-example', 20261020));
  };

  return (
    <div className="app-container">
      <NavigationRail
        currentView={currentView}
        onSelectView={setCurrentView}
        ledgerName={ledger.name}
        sourceHash={ledger.sourceHash}
        onResetLedger={handleResetLedger}
      />

      <main className="app-main">
        {currentView === 'decision-room' && (
          <DecisionRoomView
            ledger={ledger}
            currentQuestion={question}
            onSelectQuestion={setQuestion}
            witness={witness}
            onRunSearch={() => setCurrentView('breaking-point')}
            onViewBreakingPoint={() => setCurrentView('breaking-point')}
            onViewDefenses={() => setCurrentView('defense-bench')}
          />
        )}

        {currentView === 'fault-studio' && (
          <FaultStudioView
            ledger={ledger}
            currentFault={faultFamily}
            onSelectFault={setFaultFamily}
            budget={budget}
            onBudgetChange={setBudget}
            witness={witness}
            onRunSearch={() => setCurrentView('breaking-point')}
          />
        )}

        {currentView === 'breaking-point' && (
          <BreakingPointView
            ledger={ledger}
            witness={witness}
            onNavigateToDefenses={() => setCurrentView('defense-bench')}
          />
        )}

        {currentView === 'defense-bench' && (
          <DefenseBenchView
            ledger={ledger}
            currentQuestion={question}
            witness={witness}
          />
        )}

        {currentView === 'experiment-ledger' && (
          <ExperimentLedgerView
            ledger={ledger}
            currentQuestion={question}
            witness={witness}
          />
        )}
      </main>
    </div>
  );
};
export default App;
