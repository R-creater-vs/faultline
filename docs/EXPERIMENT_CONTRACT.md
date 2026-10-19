# FAULTLINE Experiment Contract & Invariant Specification

## 1. Ground Truth vs. Reporting Projections

### Principle of Truth Separation
1. **The Clean Business Ledger is Immutable**: Real commercial transactions are represented by canonical business records (`fact_orders`, `fact_refunds`). Once finalized in the ledger, these records never change.
2. **Reporting Copies are Isolated Projections**: All analytical dashboards, SQL summaries, and BI cubes query a downstream reporting copy or ingestion event stream (`ingestion_events`).
3. **Fault Injection Scope**: A fault strictly introduces errors into the *reporting pipeline* (e.g., duplicated streaming events, delayed ingestion timestamps, corrupted dimension mappings). The underlying business reality is unchanged.
4. **Defense Principle**: Defenses improve data quality checks, idempotency, or reconciliation in the reporting pipeline. A defense must **never** delete legitimate transactions to force a desired metric outcome.

---

## 2. Schema Architecture & Grain Definitions

All financial metrics are stored as **exact 64-bit safe integers in minor currency units** (paise / cents, where ₹1.00 = 100 paise). Floating-point arithmetic is strictly prohibited for monetary accumulations.

### A. `dim_products` (Product Dimension)
- **Grain**: One row per product version.
- `product_id`: `STRING` (Primary Key, e.g. `'PRD-ALPHA-01'`)
- `product_group`: `STRING` (`'Alpha'`, `'Beta'`, `'Gamma'`)
- `product_name`: `STRING`
- `effective_start`: `TIMESTAMP`
- `effective_end`: `TIMESTAMP` (NULL indicates currently active)

### B. `fact_orders` (Canonical Business Orders)
- **Grain**: One row per customer order line.
- `order_id`: `STRING` (Canonical Business ID, e.g. `'ORD-2026-0001'`)
- `customer_id`: `STRING`
- `product_id`: `STRING` (Foreign Key to `dim_products`)
- `order_timestamp`: `TIMESTAMP` (Business transaction time in UTC)
- `gross_amount`: `INT64` (Gross order amount in integer paise)
- `status`: `STRING` (`'COMPLETED'`)

### C. `fact_refunds` (Canonical Business Refunds)
- **Grain**: One row per processed refund.
- `refund_id`: `STRING` (Canonical Refund ID, e.g. `'REF-2026-0001'`)
- `order_id`: `STRING` (Foreign Key to `fact_orders`)
- `refund_timestamp`: `TIMESTAMP` (Business-effective refund time in UTC)
- `refund_amount`: `INT64` (Refund amount in integer paise, $\le \text{gross\_amount}$)

### D. `ingestion_events` (ETL Reporting Stream)
- **Grain**: One row per transmission event into the analytical data warehouse.
- `event_id`: `STRING` (Technical stream UUID, e.g. `'EVT-9812-4012'`)
- `event_type`: `STRING` (`'ORDER'`, `'REFUND'`)
- `business_id`: `STRING` (Maps to `order_id` or `refund_id`)
- `ingestion_timestamp`: `TIMESTAMP` (System arrival time in reporting stream)
- `payload`: `JSON / STRUCT` containing entity fields

---

## 3. The Three Analytical Questions & Decision Rules

### Question 1: Product Group Ranking (Leaderboard Rule)
- **Question**: *"Which product group achieved higher net recorded revenue in the reporting period?"*
- **Mathematical Definition**:
  $$\text{Net Revenue}(G) = \sum_{o \in G} \text{gross\_amount}(o) - \sum_{r \in G} \text{refund\_amount}(r)$$
- **Decision Rule**:
  $$\text{Outcome} = \begin{cases} \text{Alpha Dominant} & \text{if } \text{Net}(\text{Alpha}) > \text{Net}(\text{Beta}) \\ \text{Beta Dominant} & \text{if } \text{Net}(\text{Beta}) > \text{Net}(\text{Alpha}) \\ \text{Dead Heat (Tie)} & \text{if } \text{Net}(\text{Alpha}) = \text{Net}(\text{Beta}) \end{cases}$$
- **Invariant**: A tie is **NOT** a reversal. Reversing from Alpha Dominant requires $\text{Net}(\text{Beta}) > \text{Net}(\text{Alpha})$ strictly.

### Question 2: Group Review Threshold (Audit Rule)
- **Question**: *"Does product group Beta's net recorded revenue fall below the audit review threshold $\theta_{\text{audit}}$?"*
- **Decision Rule**:
  $$\text{Review Flag} = \begin{cases} \text{FLAGGED FOR REVIEW} & \text{if } \text{Net}(\text{Beta}) < \theta_{\text{audit}} \\ \text{PASS (HEALTHY)} & \text{if } \text{Net}(\text{Beta}) \ge \theta_{\text{audit}} \end{cases}$$

### Question 3: Period Growth Target (Momentum Rule)
- **Question**: *"Did product group Beta achieve its target period-over-period net growth $\Delta_{\text{target}}$?"*
- **Decision Rule**:
  $$\text{Growth Status} = \begin{cases} \text{TARGET MET} & \text{if } \text{Net}_{P2}(\text{Beta}) - \text{Net}_{P1}(\text{Beta}) \ge \Delta_{\text{target}} \\ \text{TARGET MISSED} & \text{if } \text{Net}_{P2}(\text{Beta}) - \text{Net}_{P1}(\text{Beta}) < \Delta_{\text{target}} \end{cases}$$

---

## 4. Fault Families & Formal Cost Models

Every injected fault is a formal transformation $T_E: \mathcal{R} \to \mathcal{R}'$ with explicit preconditions and reversible audit receipts.

### Fault Family A: Duplicate Event Ingestion
- **Mechanism**: A vulnerable ingestion pipeline fails to enforce idempotency on retried HTTP/message-queue events. An eligible order event is replayed with its identical `order_id` but a fresh `event_id`.
- **Constraint**: Each eligible positive sales row can be duplicated at most **once** (1-replay limit).
- **Cost**: Number of replayed events ($k$).
- **Action Receipt**:
  $$\text{Receipt}_i = \langle \text{order\_id}, \text{gross\_amount}, \text{original\_event\_id}, \text{injected\_event\_id} \rangle$$
- **Algorithmic Guarantee**: For positive-additive rows with unit cost and an unchanged competing total, the optimal subset minimizing $k$ to overcome margin $M = \text{Net}(A) - \text{Net}(B)$ is obtained by sorting eligible rows in descending value order and taking the shortest prefix whose sum strictly exceeds $M$.

### Fault Family B: Delayed Refund Ingestion
- **Mechanism**: Refunds processed by the payment gateway arrive late in the analytics warehouse, with `ingestion_timestamp` $> T_{\text{cutoff}}$.
- **Constraint**: Only refunds with business timestamp $\le T_{\text{cutoff}}$ are eligible.
- **Cost**: Number of delayed refund records ($k$).
- **Action Receipt**:
  $$\text{Receipt}_j = \langle \text{refund\_id}, \text{refund\_amount}, \text{business\_timestamp}, \text{delayed\_ingestion\_timestamp} \rangle$$
- **Algorithmic Guarantee**: Removing refunds from group Beta increases its net revenue. The minimal set of refunds to overcome margin $M$ is obtained by sorting eligible refunds in descending amount order and taking the shortest prefix exceeding $M$.

### Fault Family C: Dimension Fan-Out (Cartesian Join Corruption)
- **Mechanism**: An overlapping record with a duplicate `product_id` is inserted into `dim_products`. A vulnerable query using `INNER JOIN` or `LEFT JOIN` on `product_id` without temporal validity constraints duplicates every associated order row.
- **Cost**: Number of injected dimension records ($k$).
- **Action Receipt**:
  $$\text{Receipt}_m = \langle \text{product\_id}, \text{injected\_dimension\_id}, \text{downstream\_row\_multiplication} \rangle$$

---

## 5. Result Taxonomy & Precise Guarantees

Every search outcome must be unambiguously assigned one of five formal status labels:

1. `EXACT_MINIMUM`: Mathematically proven global minimum within the declared action space, supported by a formal prefix optimality proof or completed exhaustive enumeration.
2. `BOUNDED_WITNESS`: Smallest valid witness found within a declared search budget, without claiming global optimality.
3. `NO_REVERSAL_FOUND`: Exhaustive evaluation of the bounded candidate space confirmed that no subset of actions can reverse the decision.
4. `INCOMPLETE_TIMEOUT`: Search halted due to budget or time ceiling; state beyond evaluated space remains unknown.
5. `INAPPLICABLE_FAULT`: The clean baseline already exhibits the target outcome, or no eligible records exist.

---

## 6. Defense Bench Policies & Negative Controls

The Defense Bench tests whether named architectural protections stop the error:

| Defense Policy | Mechanism | Expected Outcome under Fault |
| :--- | :--- | :--- |
| **Idempotency Deduplication** | Deduplicate events on `(event_type, business_id)` within the ingestion window. | Duplicated events blocked; Clean baseline metric restored. |
| **Business-Time Reconciliation** | Reconcile arrival-time reporting against source payment ledger using `refund_timestamp`. | Delayed refunds restored to correct period; Reversal prevented. |
| **Join Cardinality Enforcement** | Enforce strictly $1:1$ product dimension matching; raise error or drop non-unique dimension mapping. | Fan-out blocked; Corrupted metrics prevented. |
| **Legitimate Repeat Control** | Negative control: Two distinct orders from the same customer with identical amounts. | Must **NOT** be deduplicated; True revenue preserved. |

---

## 7. Mathematical Invariant Verification Checks

Every test suite execution validates:
1. $\text{Raw Ledger Source Hash} = \text{Hash}(\text{orders}) \oplus \text{Hash}(\text{refunds})$ remains **identical** before, during, and after fault injection.
2. The witness subset returned by the search engine, when executed against the SQL pipeline, reproduces the **exact** metric and decision reversal.
3. A margin tie (e.g. $\text{Net}(A) = \text{Net}(B)$) is **never** classified as a reversal.
4. Legitimate identical customer orders are **never** eliminated by the deduplication policy.
