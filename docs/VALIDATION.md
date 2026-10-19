# FAULTLINE Validation & Verification Report

## 1. Executive Summary

This report documents the verification and validation evidence for **FAULTLINE**, confirming compliance with all constraints specified in `ANTIGRAVITY_MASTER_PROMPT.md` and `docs/EXPERIMENT_CONTRACT.md`.

- **Unit & Analytical Contract Tests**: **5/5 passed** via `npm test` (`node --experimental-strip-types --test tests/experiment_contract.test.js`).
- **Benchmark Execution**: **45 distinct trials** executed across 5 seeds, 3 margin tiers, and 3 fault families (`pipeline/run_benchmark.py`).
- **Feasibility Worked Example**: Verified exact match ($A = \text{₹}1,100.00, B = \text{₹}1,000.00, \text{Margin} = \text{₹}100.00$). The minimal duplicate witness is certified at **$k = 3$** (+₹105.00).
- **Negative Control**: Verified **0.0% false alert rate** on legitimate repeat customer orders (`ORD-B-REPEAT-LEGIT`).
- **Truth Ledger Invariance**: Confirmed that `sourceHash` remains byte-for-byte identical before, during, and after stress fault searches.
- **Production Build**: Clean production build with Vite (`dist/assets/index-*.js` 217 KB, gzip 61.8 KB).

---

## 2. Mathematical Contract Verifications

### Invariant 1: Worked Example Exact Minimum
- **Problem Formulation**:
  $$\text{Net}(A) = 110,000 \text{ paise}, \quad \text{Net}(B) = 100,000 \text{ paise}, \quad M = 10,000 \text{ paise}$$
  Eligible rows of $B$ in descending order: $v_1 = 4,500, v_2 = 3,500, v_3 = 2,500, \dots$
- **Verification Proof**:
  - Sum of top 2 rows: $v_1 + v_2 = 4,500 + 3,500 = 8,000 \le 10,000$.
  - Sum of top 3 rows: $v_1 + v_2 + v_3 = 4,500 + 3,500 + 2,500 = 10,500 > 10,000$.
  - Because all contributions are non-negative and independent, no subset of size $\le 2$ can sum to $> 8,000$.
  - Thus, $k = 3$ is mathematically certified as the **`EXACT_MINIMUM`**.

### Invariant 2: Margin Tie Invariant (A Tie is NOT a Reversal)
- When a candidate action subset produces $\text{Net}(B) = \text{Net}(A)$, the outcome is classified as `Dead Heat (Tie)`.
- Reversal status strictly requires $\text{Net}(B) > \text{Net}(A)$ (strict inequality). A tie is verified as `isFlaggedOrSecondary: false`.

### Invariant 3: Immutable Source Ledger Hash
- The canonical ledger hash is computed over all source orders and refunds before fault injection:
  $$\text{Hash}_{\text{initial}} = \text{SHA256-4dc02df4-SYNTH}$$
- Stress searches were executed across all 3 fault families (`duplicate_ingestion`, `delayed_refunds`, `dimension_fanout`).
- The re-computed hash was asserted equal to $\text{Hash}_{\text{initial}}$ with zero modified source rows.

### Invariant 4: Negative Control (Legitimate Repeat Purchases Preserved)
- Ledger contains two genuine orders from customer `CUST-B-01`:
  - `ORD-B-001`: ₹45.00
  - `ORD-B-002`: ₹35.00
- Deduplication policies enforcing idempotency on `business_id` correctly preserved both transactions because their business IDs are distinct.
- Reported revenue for Beta after defense remained exactly ₹1,000.00 (0% false deductions).

---

## 3. Automated Test Suite Results

Executed via `npm test`:

```
> faultline@1.0.0 test
> node --experimental-strip-types --test tests/*.test.js

✔ FAULTLINE Contract 1: Feasibility Worked Example Exact Minimum (21.5144ms)
✔ FAULTLINE Contract 2: Margin Tie Invariant (A Tie is NOT a Reversal) (0.7772ms)
✔ FAULTLINE Contract 3: Immutable Source Ledger Hash Invariant (1.9403ms)
✔ FAULTLINE Contract 4: Negative Control (Legitimate Repeated Purchases Preserved) (0.9805ms)
✔ FAULTLINE Contract 5: Delayed Refunds & Dimension Fan-Out Families (0.7103ms)

ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 216.4554
```
