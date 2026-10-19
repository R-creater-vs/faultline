# FAULTLINE — Senior / Staff Technical Interview Deep-Dive

This document prepares you for a rigorous Senior or Staff Software / Data Systems Engineer interview discussion about FAULTLINE. It walks through high-level architecture, mathematical formulations, discrete optimization tradeoffs, idempotency edge cases, and CI integration.

---

## 1. The Core Elevator Pitch & System Architecture

### "How would you describe FAULTLINE in one minute?"
> "FAULTLINE is a client-side analytical stress-testing laboratory that answers: *What is the minimal cardinality of reporting errors required to invert a dashboard's downstream decision rule?*
> 
> Instead of relying on heuristic data quality scores or black-box ML anomaly detectors, FAULTLINE frames data reliability through discrete optimization and counterexample generation. It separates ground-truth business ledgers from stressed reporting copies, searches for minimal error combinations under explicit fault models (such as duplicate ingestion, delayed refunds, or fan-out joins), provides mathematical proofs of exact minimality, and evaluates defense policies against strict negative controls.
> 
> Everything runs in-memory with sub-millisecond latency, zero external API costs, and exports executable SQL regression tests for CI/CD pipelines."

---

## 2. Deep Dive: Mathematical Formulation & Optimization

### "How do you calculate the minimal counterexample, and why is greedy prefix search exact in this case?"

#### The Problem Formulation
Let a decision rule compare two entities, $A$ and $B$, where $A$ currently leads $B$ by margin $M$:
$$M = \text{Net}(A) - \text{Net}(B) > 0$$
We wish to find a minimum-cardinality subset of eligible candidate actions $S \subseteq \mathcal{C}$ such that applying $S$ flips the ranking:
$$\min |S| \quad \text{subject to} \quad \Delta \text{Net}_S(B) > M$$
where each candidate action $i \in \mathcal{C}$ duplicates an eligible reporting row of $B$ with incremental net contribution $v_i > 0$.

#### Why Greedy is Globally Optimal Here (Matroid / Unit Cost Case)
1. In the positive-additive duplication model, every action has uniform weight (cardinality cost $c_i = 1$) and adds independent positive revenue $v_i > 0$.
2. This is the **Unit-Cost 0/1 Knapsack / Subset Sum** problem. Because each item consumes exactly 1 unit of cost, the greedy choice property holds unconditionally:
   - Sorting candidates such that $v_1 \ge v_2 \ge \dots \ge v_n$ maximizes the cumulative gain for any chosen subset size $k$.
   - For any integer $k$, the greedy prefix $P_k = \{v_1, \dots, v_k\}$ achieves the maximum possible sum:
     $$\sum_{i=1}^k v_i \ge \sum_{j \in S} v_j \quad \forall S \subseteq \mathcal{C}, |S| = k$$
3. Therefore:
   - If $\sum_{i=1}^{k-1} v_i \le M$, then **no subset of size $k-1$ or smaller can exceed $M$**.
   - If $\sum_{i=1}^k v_i > M$, then $k$ is the certified **exact minimal cardinality** ($k^* = k$).
   - We label this status strictly as `EXACT_MINIMUM`.

#### What about Tie Handling?
- If $\sum_{i=1}^k v_i = M$, the resulting totals are identical ($\text{Net}(B) = \text{Net}(A)$).
- Our experiment contract specifies that a tie is **not** an inversion. The rule requires strict superiority ($\text{Net}(B) > \text{Net}(A)$). The search continues until the margin is strictly surpassed.

---

## 3. Defense Bench: Idempotency vs. Legitimate Repeats

### "How do you defend against duplicate ingestion without accidentally erasing genuine business transactions?"

This is a classic data pipeline failure mode where naive deduplication creates false positives.

```
+--------------------------------------------------------------------------------+
| Scenario: Customer CUST-B-01 places two genuine orders in the same afternoon   |
+--------------------------------------------------------------------------------+
| Order 1: id = "ORD-B-001", amount = 4500, customer = "CUST-B-01"               |
| Order 2: id = "ORD-B-002", amount = 3500, customer = "CUST-B-01"               |
+--------------------------------------------------------------------------------+
| FAULT: Webhook re-delivery causes Order 1 to arrive twice:                     |
| Duplicate: id = "ORD-B-001-dup-1", original_id = "ORD-B-001", amount = 4500     |
+--------------------------------------------------------------------------------+
```

1. **Naive Deduplication (The Trap)**:
   - Grouping by `(customer_id, order_date)` or `(customer_id, amount)` flags Order 2 as a duplicate because the customer bought twice in the same window.
   - Result: False alert, real revenue erroneously deducted, incorrect business metric.
2. **FAULTLINE's Architectural Defense (Idempotency Key)**:
   - Every ingested event must carry a canonical business transaction ID (`business_id` or upstream payload signature).
   - Injected duplicates carry identical `original_id` references.
   - The defense filter applies a SQL window function partition:
     ```sql
     ROW_NUMBER() OVER (
       PARTITION BY COALESCE(original_id, order_id) 
       ORDER BY ingestion_timestamp ASC
     ) = 1
     ```
   - **Verification**: In our test suite and benchmark, `ORD-B-001` and `ORD-B-002` are preserved at 100% fidelity, maintaining a **0.0% false alert rate** in the negative control.

---

## 4. Prior Art & Honest System Boundaries

### "What makes this different from Great Expectations, dbt tests, or academic query causality tools?"

| Dimension | dbt / Great Expectations | Query Causality Research (VLDB Meliou et al.) | FAULTLINE |
| :--- | :--- | :--- | :--- |
| **Primary Scope** | Static column/table integrity assertions (nulls, ranges, foreign keys) | Theoretical minimal contingency sets for arbitrary relational queries | Decision-level vulnerability laboratory with explicit fault models |
| **Focus Metric** | Boolean pass/fail per table | Algorithmic tuple responsibility | Distance-to-inversion ($k$) for executive business rules |
| **Interface** | CLI / CI logs | Academic prototypes / Python scripts | Interactive visual laboratory with side-by-side comparative lineage |
| **Defense Verification** | Assumes checks are sufficient | Explanatory only (no built-in repair) | Tests defenses against both injected faults and negative controls |

We do not claim to have invented subset sum optimization or query causality theory. FAULTLINE translates proven discrete optimization principles into an inspectable, analyst-ready stress lab that outputs reproducible regression artifacts.

---

## 5. Failure Modes, Scalability, and Trade-offs

### "What are the limitations of the current design?"
1. **Search Space Growth for Complex Joins**:
   - For multi-table join expansions or non-linear multi-metric constraints, subset selection transitions from unit-cost knapsack to general 0/1 integer programming ($NP$-hard).
   - *Mitigation*: FAULTLINE explicitly enforces a search budget ($k_{\max} = 20$, timeout $100\text{ ms}$) and assigns the label `BOUNDED_WITNESS` or `SEARCH_BUDGET_EXHAUSTED` instead of falsely claiming exactness.
2. **Synthetic vs. Production Data**:
   - Synthetic ledgers allow rigorous ground-truth verification ($A = 1,100, B = 1,000$). In real production data warehouses, ground truth is rarely observable directly.
   - *Mitigation*: FAULTLINE produces executable SQL regression scripts that run against isolated staging copies of production tables, testing whether production margins are fragile under historical error rates.
