import assert from 'node:assert/strict';

// A narrow proof of feasibility, not the application.
// Each eligible positive reporting row may be duplicated at most once.
// We seek the fewest added rows making B strictly exceed A; ties do not win.
function minimumDuplicateWitness(a, b, weights) {
  assert(Number.isSafeInteger(a) && Number.isSafeInteger(b) && a > b);
  assert(weights.every(x => Number.isSafeInteger(x) && x > 0));
  const sorted = weights.map((value, id) => ({ value, id }))
    .sort((x, y) => y.value - x.value || x.id - y.id);
  const chosen = [];
  let added = 0;
  for (const row of sorted) {
    added += row.value;
    chosen.push(row.id);
    if (b + added > a) return { count: chosen.length, added, chosen };
  }
  return null;
}

// Independent exhaustive subset enumeration for tiny inputs.
function bruteForceMinimum(a, b, weights) {
  let best = Infinity;
  for (let mask = 0; mask < 2 ** weights.length; mask++) {
    let added = 0;
    let count = 0;
    for (let i = 0; i < weights.length; i++) {
      if ((mask & (1 << i)) !== 0) { added += weights[i]; count++; }
    }
    if (b + added > a) best = Math.min(best, count);
  }
  return Number.isFinite(best) ? best : null;
}

let seed = 20261020;
function randomInt(limit) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed % limit;
}

let checked = 0;
for (let trial = 0; trial < 400; trial++) {
  const weights = Array.from({ length: 1 + randomInt(10) }, () => 1 + randomInt(100));
  const b = weights.reduce((sum, value) => sum + value, 0);
  const a = b + 1 + randomInt(b + 30);
  const result = minimumDuplicateWitness(a, b, weights);
  assert.equal(result?.count ?? null, bruteForceMinimum(a, b, weights));
  if (result) {
    assert.equal(new Set(result.chosen).size, result.chosen.length);
    assert(b + result.chosen.reduce((sum, id) => sum + weights[id], 0) > a);
  }
  checked++;
}

assert.equal(minimumDuplicateWitness(200, 100, [100]), null, 'Tie is not reversal');
assert.equal(minimumDuplicateWitness(201, 100, [100]), null, 'No eligible reversal');
assert.equal(minimumDuplicateWitness(101, 100, [100]).count, 1);
assert.equal(minimumDuplicateWitness(101, 100, []), null);
checked += 4;

// Explicitly synthetic, integer paise; all 39 B rows are eligible.
const bRows = [4500, 3500, 2500, ...Array(35).fill(2500), 2000];
const aRows = [55000, 55000];
const a = aRows.reduce((sum, value) => sum + value, 0);
const b = bRows.reduce((sum, value) => sum + value, 0);
const witness = minimumDuplicateWitness(a, b, bRows);
assert.equal(a, 110000);
assert.equal(b, 100000);
assert.equal(witness.count, 3);
assert.equal(b + witness.added, 110500);
assert(b + [...bRows].sort((x, y) => y - x)[0] + [...bRows].sort((x, y) => y - x)[1] <= a);

console.log(JSON.stringify({
  status: 'passed',
  scope: 'Synthetic positive-row duplication with unit action cost and at most one duplicate per source row',
  independentRandomizedComparisons: 400,
  edgeCaseChecks: 4,
  totalChecksBeforeWorkedExample: checked,
  example: {
    currency: 'INR', sourceRows: aRows.length + bRows.length,
    baselineA: a / 100, baselineB: b / 100,
    duplicatedValues: witness.chosen.map(id => bRows[id] / 100),
    minimumAddedReportingRows: witness.count,
    corruptedB: (b + witness.added) / 100,
    actualBusinessRevenueChanged: false
  },
  limitations: [
    'No UI, SQL engine, mixed faults, or real-world dataset tested.',
    'Minimum is valid only for this declared independent additive fault family.',
    'The algorithm is standard; this check establishes feasibility, not novelty.'
  ]
}, null, 2));
