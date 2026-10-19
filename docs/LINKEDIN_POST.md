# LinkedIn Announcement Post: FAULTLINE

*Engineering writeup formatted for LinkedIn publication. Written with rigorous humility, crediting existing prior art, and citing actual verified benchmark measurements.*

---

## Post Copy

I built an analytical laboratory that measures how many reporting errors it takes to change an executive dashboard's conclusion: **FAULTLINE**.

Here is the problem it explores:

In data engineering and BI, we spend weeks setting up dashboards and writing alerting rules. But we rarely test the *breaking point* of the decisions those dashboards drive. If Product Alpha leads Product Beta by ₹100, how many dropped refunds, duplicate webhooks, or fan-out join rows would it take before downstream stakeholders fund the wrong product?

Rather than inventing a vague "data health score" or estimating speculative incident probabilities, FAULTLINE approaches this as a bounded discrete optimization problem:

1. **Explicit Fault Models**: We define concrete, isolated reporting error mechanisms—duplicate ingestion, delayed refund processing, and dimension join fan-outs. Crucially, the underlying source-of-truth ledger is immutable (`sourceHash` is cryptographically preserved throughout all tests).
2. **Certified Minimums vs. Bounded Witnesses**: For duplicate event ingestion under greedy prefix ordering, we can mathematically prove that $k=3$ is the exact minimal counterexample. The largest two eligible rows ($₹45 + ₹35 = ₹80$) cannot overcome the ₹100 margin; the third row ($₹25$) crosses it to ₹105. We strictly label when an outcome is an exact minimum versus a bounded heuristic witness.
3. **Defenses with Negative Controls**: Deduplication algorithms are tested against intentional negative controls—such as legitimate repeat purchases from the same customer—to guarantee a 0% false deduction rate.
4. **Executable SQL Regression Bundles**: Every experiment exports an auditable JSON ledger and an executable SQL test suite with schema, seed data, and assertions that data platform teams can run directly in CI/CD pipelines.

In an empirical benchmark across 45 trials (5 seeds × 3 margin tiers × 3 fault families):
- Tight margins (₹35) break with as few as 1–2 duplicates.
- Deduplication and business-time reconciliation defenses achieved 100% recovery with 0.0% false alerts on legitimate customer repeat purchases.
- The entire discrete optimization search runs in-memory in under 1 millisecond with zero external server dependencies or API costs.

Prior work like SqlProof, dblect, and classic query causality research (Meliou et al., VLDB) laid great foundational groundwork for counterexample generation and contingency tuples. FAULTLINE applies these principles to the business decision layer, turning an abstract data quality question into an interactive, reproducible stress lab.

The project is built with React, strict TypeScript, and Vite, running completely client-side.

All source code, mathematical contract specifications, and benchmark reproducibility scripts are open and documented.

Would love to hear how data platform teams approach decision vulnerability testing in their production dbt/SQL pipelines!

#DataEngineering #Analytics #SQL #SoftwareEngineering #DataQuality #DiscreteOptimization #TypeScript
