# FAULTLINE Prior Art & Contextual Landscape

## 1. Ethical Disclosure & Academic Positioning

FAULTLINE is an **Analytics Decision Stress Lab**. It evaluates how resilient a business dashboard's analytical conclusion is against discrete, quantifiable reporting errors.

**This project cannot honestly be described as something never made anywhere.** Related tools and academic research exist. The reviewed material did not establish an exact match for the whole proposed analyst-facing workflow, but that is a limited search finding, not proof of absence or patent novelty.

The algorithmic core of finding the smallest subset of positive records that overcomes a decision boundary is a constrained instance of the classic **0-1 Knapsack / Subset Sum** problem. When action costs are unit values ($c_i = 1$) and records are independent and positive-additive, this reduces to greedy prefix selection over sorted contributions. FAULTLINE implements these established principles in an inspectable laboratory workflow.

---

## 2. Related Tools & Prior Research

| Prior Work / Tool | Core Capability | Distinction in FAULTLINE |
| :--- | :--- | :--- |
| **[SqlProof](https://sqlproof.com/)** | Property-based testing for database queries; generates reduced counterexamples when assertions fail. | FAULTLINE starts with a business dashboard rule, reports its minimum reversal threshold under an explicit fault budget, and visually steps through the changed records. |
| **[dblect](https://github.com/dvryaboy/dblect)** | Semantic data contracts, deliberately problematic input shapes, and explanations of schema violations. | FAULTLINE compares data quality checks by whether they detect an error *before* it alters the selected business rule's outcome, testing false-negative defense boundaries. |
| **[horizonmonkey](https://github.com/kazuki-sf/horizonmonkey)** | Injects semantic faults and inspects propagation through agent simulations. | FAULTLINE focuses strictly on deterministic analytical ledgers, SQL transformations, and explicit mathematical rules, with no LLM agent or runtime non-determinism. |
| **[Query Causality & Responsibility](https://www.vldb.org/pvldb/vol4/p34-meliou.pdf)** *(Meliou et al., VLDB 2011)* | Seminal database theory relating changes in input tuples to query answers, minimal contingency sets, and tuple responsibility. | FAULTLINE applies established contingency set concepts to an analyst-accessible reporting laboratory; it does not claim to invent minimal-edit reasoning. |

---

## 3. Scope of Original Contribution

The original engineering contribution of FAULTLINE consists of:
1. **The End-to-End Visual Workflow**: Seamlessly connecting an analytical dashboard rule to an isolated reporting copy, a discrete reversal search engine, a visual data-flow dependency path, a defense comparison bench, and an exported regression test.
2. **Empirical Defense Bench**: Demonstrating that defensive deduplication and source reconciliation policies can be empirically tested against certified minimal witnesses to quantify their protective boundaries.
3. **Negative Control Verification**: Ensuring that defensive policies are tested against legitimate repeated business events to guarantee that anti-corruption measures do not artificially suppress genuine business revenue.
4. **Reproducible Experiment Matrix**: Publishing complete generator parameters, seeds, algorithms, and raw execution logs for all evaluated fault families.
