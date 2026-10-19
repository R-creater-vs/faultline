# FAULTLINE — Analytics Decision Stress Lab

Prepared on 20 October 2026. This is a new project candidate, separate from TRACE and PULSE. The application is not implemented. A small feasibility check has been implemented and run.

## The idea

Ask: **How few reporting errors would it take to reverse this dashboard's conclusion?**

An analyst defines a rule, such as flagging a product group for review when its net revenue falls below a threshold. FAULTLINE creates an isolated reporting copy, introduces explicit errors, searches for a reversal, and shows the affected records, metric changes, and rule result. It then exports a reproducible experiment and regression test.

The planned signature interaction is a baseline and stressed dashboard side by side, connected by a visible chain from changed records to changed metrics to a changed conclusion. The original source ledger remains unchanged.

The distinguishing deliverable is an original, reproducible benchmark: how different reporting errors change rule outcomes, which checks catch those errors, and the smallest witnessed or certified change under a declared search space. There is no universal reliability score or claim about real-world error probabilities.

## What the search actually established

**This project cannot honestly be described as something never made anywhere.** Related tools and research exist. The reviewed material did not establish an exact match for the whole proposed analyst-facing workflow, but that is a limited search finding, not proof of absence or patent novelty.

| Prior work | Existing capability relevant to this idea | Proposed FAULTLINE emphasis |
| --- | --- | --- |
| [SqlProof](https://sqlproof.com/) | Property-based database tests and reduced counterexamples | Start with a dashboard rule, report its reversal threshold under an explicit fault budget, and replay the metric change visually |
| [dblect](https://github.com/dvryaboy/dblect) and its [demo](https://github.com/dvryaboy/dblect/blob/main/docs/design/demo_walkthrough.md) | Semantic data contracts, deliberately problematic input shapes, and explanations of violations | Compare checks by whether they detect an error before it changes the selected rule's outcome |
| [horizonmonkey](https://github.com/kazuki-sf/horizonmonkey) | Inject semantic faults and inspect propagation through an agent simulation | Focus on deterministic analytical ledgers, SQL, and explicit business rules, with no LLM agent dependency |
| [Query causality and responsibility research](https://www.vldb.org/pvldb/vol4/p34-meliou.pdf) | Existing theory relating changes in input tuples to query answers and minimal contingency sets | Apply established concepts in a bounded, inspectable reporting-error laboratory; do not claim to invent minimal-edit reasoning |

Comparisons are based on public documentation, not installation or exhaustive source audits. Absence of a described feature is not proof that a project cannot support it. Treat the distinction as a product hypothesis that the working implementation and benchmark must substantiate.

Representative searches included: data quality decision reversal tool dashboard; SQL minimal counterexample debugging tool; analytics fault injection dashboard KPI; dashboard minimum data errors decision; business decision SQL counterexample; decision flip SQL; and database query causality responsibility minimum contingency tuples.

## Verified feasibility example

Run from the workspace root:

```powershell
node project-kits/faultline/feasibility-check.mjs
```

The check uses a clearly synthetic ledger, with money represented in integer paise:

- Product A baseline: ₹1,100.
- Product B baseline: ₹1,000.
- Each eligible positive B reporting row may be duplicated at most once.
- Duplicating ₹45, ₹35, and ₹25 produces reported B revenue of ₹1,105.
- The two largest eligible rows total only ₹80, so two such changes cannot overcome the ₹100 margin. Three changes are sufficient and minimal within this model.
- Actual business revenue has not changed. Only the reporting copy is wrong.

Execution passed 400 deterministic randomized comparisons against an independent exhaustive subset checker, four edge cases, and the worked example. This establishes only the narrow positive-additive duplication mechanism. It does not validate a UI, SQL integration, other error families, scalability, or novelty.

## Why it fits the portfolio

The project requires relational modeling, SQL, exact metric definitions, discrete optimization, experimental design, data-quality evaluation, reproducibility, and interface design. Its original work would lie in the implemented experiment system and measured benchmark, not a new name for known mathematics.

The demo can use an openly documented synthetic generator with known truth. Synthetic data is appropriate for controlled experiments; it must never be presented as real commercial activity. No private datasets, paid API, GPU, or runtime LLM are required.

## Build instructions

Open an empty folder in Antigravity. Select your available Gemini 3.8 Flash model with High reasoning. Paste the section below the divider in `ANTIGRAVITY_MASTER_PROMPT.md` and attach this research brief. Copy `feasibility-check.mjs` into the new folder as a reference check if useful; it is not a complete engine.

The specification requires a static app and local preparation/tests. It assumes existing hardware, internet, and coding-agent access. Optional public hosting remains subject to the chosen provider's free limits.

If interrupted, use:

```text
Read the FAULTLINE specification, research brief, and BUILD_STATUS.md. Inspect current source and test results. Resume the first incomplete milestone. Preserve the explicit fault model, separation of truth and reporting copies, exact-versus-bounded result labels, zero-paid-service architecture, and originality limitations. Do not replace tested mechanisms with illustrative numbers.
```

Suggested honest launch hook after the app works: “I built a lab that measures how many reporting errors it takes to change a dashboard's conclusion.” Avoid “first ever,” “never built before,” and invented operational savings.
