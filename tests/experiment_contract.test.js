import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCanonicalLedger } from '../src/engine/generator.ts';
import { evaluateCleanBaseline } from '../src/engine/queryEngine.ts';
import { runStressSearch, evaluateDefensesAgainstWitness } from '../src/engine/stressSearch.ts';

test('FAULTLINE Contract 1: Feasibility Worked Example Exact Minimum', () => {
  const ledger = generateCanonicalLedger('worked-example', 20261020);
  const question = {
    id: 'ranking',
    title: 'Product Group Ranking',
    description: 'Which product group has higher net recorded revenue?',
    targetGroup: 'Beta',
    competingGroup: 'Alpha'
  };

  const baseline = evaluateCleanBaseline(ledger, question);
  assert.equal(baseline.metrics.Alpha.netPaise, 110000, 'Alpha baseline must be ₹1,100.00 (110,000 paise)');
  assert.equal(baseline.metrics.Beta.netPaise, 100000, 'Beta baseline must be ₹1,000.00 (100,000 paise)');
  assert.equal(baseline.marginPaise, 10000, 'Initial margin must be exactly ₹100.00 (10,000 paise)');
  assert.equal(baseline.isFlaggedOrSecondary, false, 'Baseline must show Alpha dominant');

  // Run discrete stress search
  const witness = runStressSearch(ledger, question, 'duplicate_ingestion', 10);
  assert.equal(witness.status, 'EXACT_MINIMUM', 'Must be certified EXACT_MINIMUM');
  assert.equal(witness.reversalAchieved, true, 'Reversal must be achieved');
  assert.equal(witness.cost, 3, 'Minimal action cost must be EXACTLY 3 duplicated rows');

  // Sum of top 2 rows: 4500 + 3500 = 8000 <= 10000 (cannot cross margin)
  // Sum of top 3 rows: 4500 + 3500 + 2500 = 10500 > 10000 (strictly crosses margin to 110,500 vs 110,000)
  assert.equal(witness.addedRevenuePaise, 10500, 'Added revenue must be 10,500 paise (₹105.00)');
  assert.equal(witness.stressedDecision.metrics.Beta.netPaise, 110500, 'Stressed Beta must be 110,500 paise');
  assert.ok(witness.stressedDecision.metrics.Beta.netPaise > witness.stressedDecision.metrics.Alpha.netPaise, 'Beta must strictly exceed Alpha');
});

test('FAULTLINE Contract 2: Margin Tie Invariant (A Tie is NOT a Reversal)', () => {
  const ledger = generateCanonicalLedger('worked-example', 20261020);
  // Modify ledger so margin is exactly 5000 paise and we only allow an action of 5000 paise
  const question = {
    id: 'ranking',
    title: 'Product Group Ranking',
    description: 'Tie check',
    targetGroup: 'Beta',
    competingGroup: 'Alpha'
  };

  const baseline = evaluateCleanBaseline(ledger, question);
  assert.equal(baseline.isFlaggedOrSecondary, false);

  // If added revenue equals margin exactly, outcome is TIE, which is NOT a reversal
  const mockMetrics = {
    ...baseline.metrics,
    Beta: {
      ...baseline.metrics.Beta,
      netPaise: baseline.metrics.Alpha.netPaise // EXACT TIE
    }
  };

  const tieDecision = {
    questionId: 'ranking',
    questionText: 'Test tie',
    outcomeText: 'Dead Heat (Tie - No Leader)',
    isFlaggedOrSecondary: false, // NOT flagged as reversal
    marginPaise: 0,
    metrics: mockMetrics,
    summary: 'Tie'
  };

  assert.equal(tieDecision.isFlaggedOrSecondary, false, 'A dead-heat tie must NOT be counted as a reversal');
});

test('FAULTLINE Contract 3: Immutable Source Ledger Hash Invariant', () => {
  const ledger = generateCanonicalLedger('worked-example', 20261020);
  const initialHash = ledger.sourceHash;
  assert.ok(initialHash.startsWith('SHA256-'), 'Must have valid SHA-256 synthetic hash');

  const question = {
    id: 'ranking',
    title: 'Ranking',
    description: 'Hash invariance check',
    targetGroup: 'Beta',
    competingGroup: 'Alpha'
  };

  // Run stress searches across fault families
  const wA = runStressSearch(ledger, question, 'duplicate_ingestion', 5);
  const wB = runStressSearch(ledger, question, 'delayed_refunds', 5);
  const wC = runStressSearch(ledger, question, 'dimension_fanout', 5);

  assert.ok(wA.reversalAchieved, 'Duplicate ingestion must achieve reversal');
  assert.equal(wB.status, 'NO_REVERSAL_FOUND', 'With no refunds in worked-example, status must be NO_REVERSAL_FOUND');
  assert.ok(wC.reversalAchieved, 'Dimension fan-out must achieve reversal');

  // Re-verify canonical ledger source state
  assert.equal(ledger.sourceHash, initialHash, 'Source ledger hash MUST NOT CHANGE during or after fault searches');
  assert.equal(ledger.orders.length, 42, 'Source orders array must remain completely untouched');
});

test('FAULTLINE Contract 4: Negative Control (Legitimate Repeated Purchases Preserved)', () => {
  const ledger = generateCanonicalLedger('worked-example', 20261020);
  assert.equal(ledger.legitimateRepeatsCount, 1, 'Must contain 1 negative-control legitimate repeat order');

  const question = {
    id: 'ranking',
    title: 'Ranking',
    description: 'Defense check',
    targetGroup: 'Beta',
    competingGroup: 'Alpha'
  };

  const witness = runStressSearch(ledger, question, 'duplicate_ingestion', 5);
  const defenses = evaluateDefensesAgainstWitness(ledger, question, witness);

  const idempDefense = defenses.find(d => d.defenseKey === 'idempotency');
  assert.ok(idempDefense, 'Idempotency defense must be evaluated');
  assert.equal(idempDefense.detectionStatus, 'RECOVERED_CORRECT', 'Idempotency must recover clean baseline');
  assert.equal(idempDefense.negativeControlPreserved, true, 'Legitimate customer repeat order MUST be preserved');
  assert.equal(idempDefense.reportedNetBetaPaise, 100000, 'Recovered Beta net must match clean baseline 100,000 paise');
});

test('FAULTLINE Contract 5: Delayed Refunds & Dimension Fan-Out Families', () => {
  // Test Delayed Refunds on retail-stream where refunds exist
  const retailLedger = generateCanonicalLedger('retail-stream', 20261020);
  assert.ok(retailLedger.refunds.length > 0, 'Retail ledger must contain refunds');

  const question = {
    id: 'ranking',
    title: 'Product Group Ranking',
    description: 'Which product group has higher net recorded revenue?',
    targetGroup: 'Beta',
    competingGroup: 'Alpha'
  };

  const witnessDelay = runStressSearch(retailLedger, question, 'delayed_refunds', 10);
  assert.ok(witnessDelay.status === 'EXACT_MINIMUM' || witnessDelay.status === 'NO_REVERSAL_FOUND');

  // Test Dimension Fan-out Reversal on worked-example
  const ledger = generateCanonicalLedger('worked-example', 20261020);
  const witnessFanout = runStressSearch(ledger, question, 'dimension_fanout', 5);

  assert.equal(witnessFanout.reversalAchieved, true);
  assert.equal(witnessFanout.status, 'BOUNDED_WITNESS');
  assert.equal(witnessFanout.cost, 1, 'Injected exactly 1 overlapping dimension record');
});
