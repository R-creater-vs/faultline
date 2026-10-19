# FAULTLINE — master build prompt

Read RESEARCH_AND_START_HERE.md alongside this specification. The application is not yet built. Related tools and mathematical ideas exist; do not claim a world-first invention.

Copy everything below this divider into Antigravity in a new project folder.

---

Build FAULTLINE, an Analytics Decision Stress Lab, from scratch into a working, tested, visually exceptional portfolio product.

I study BCA Data Analytics. I want substantial original implementation and a reproducible experiment, a memorable demonstration, and no required paid services. Work as a product engineer who understands SQL, data quality, discrete optimization, and experimental design. Implement and run the project; a mockup or plan is not completion.

## Product promise

Answer: “How few reporting errors would it take to change this dashboard's conclusion?”

A user selects a dataset, analytical rule, and permitted reporting fault. The product evaluates the clean reporting state, constructs isolated faulty copies, searches for a rule reversal, shows the exact changed records and metric path, and exports a reproducible experiment.

The signature journey is baseline dashboard → choose fault model → find a reversal → replay changed records → inspect calculation and search scope → apply a specific check or repair → rerun → export regression evidence.

The original contribution should be the complete workflow and measured benchmark across fault families. Read and credit the prior work in the supplied research brief. Minimal counterexamples, SQL testing, and query causality are established ideas. Do not market them as newly invented methods.

## Constraints and stack

- No paid API, hosted database, commercial asset library, runtime LLM, GPU, subscription, or credit card. Existing device, internet, and coding-agent access are assumed.
- Use React, strict TypeScript, Vite, DuckDB-Wasm in a worker, and a coherent CSS-variable system. Use a suitable open-source chart library only where needed. Small dependency diagrams can be SVG.
- Use Python/native DuckDB for independent reference calculations and optional benchmark generation. Normal frontend startup must not require Python or model training.
- Prepare a static build suitable for public portfolio hosting. Verify its non-root base path, worker assets, fonts, and Wasm bundles. Do not publish or create accounts.
- Bundle licensed assets locally. Prefer an ordinary single-thread worker configuration if hosting cannot provide headers required by threaded Wasm.
- Verify installed package APIs in official documentation, lock dependencies, inspect existing repository instructions, and preserve unrelated files.
- Make routine decisions autonomously. Maintain BUILD_STATUS.md and continue until the acceptance criteria pass or a concrete external blocker prevents work.

## 1. Define truth, observations, and rules

Create docs/EXPERIMENT_CONTRACT.md before implementing experiments.

Use a deterministic synthetic ledger with documented distributions and seeds. Label every generated dataset Synthetic experiment data in the UI, exports, and screenshots. Its purpose is known ground truth for controlled reporting faults, not simulated proof about real companies.

Schema: canonical orders, order lines, refunds, ingestion events, and optionally a product dimension with effective dates. Keep stable business IDs separate from ingestion-event IDs, integer currency minor units, canonical timestamps, and an immutable source manifest. Define expected join cardinalities and each table's grain.

The clean business ledger is immutable. A baseline reporting projection is derived from it. A fault changes a reporting copy or a reporting transformation, never the truth ledger. Fixes change the reporting pipeline or deduplication policy; they must not erase genuine transactions to force the desired result.

Implement three explicit analytical questions:

1. Which of two product groups has higher net recorded revenue in a fixed period?
2. Does a chosen group's net recorded revenue fall below an explicit review threshold?
3. Does a period-to-period net recorded revenue change meet a declared threshold?

Call outputs rankings or review-rule outcomes. Historical revenue does not justify an investment, advertising allocation, or causal conclusion. Define net recorded revenue, refunds, time windows, exact comparison operators, equality behavior, and zero denominators.

Baseline agreement with an independent reference is mandatory. Reject an experiment whose baseline is already invalid. Treat monetary values with integer or exact decimal arithmetic across SQL, UI, and exports. Check overflow before converting database values to JavaScript numbers.

## 2. Fault families and action costs

Implement the first two fully, then add the third. Every action is an explicit transformation with preconditions, target IDs, before/after values, and a reversible receipt.

A. Duplicate ingestion: replay one eligible positive sales ingestion event, preserving its original business ID but assigning a new ingestion-event ID. Each original event can be replayed at most once. Cost is number of replayed events. The intentionally vulnerable reporting query double-counts it; a declared idempotency policy should stop it.

B. Delayed refunds: move selected refund ingestion events beyond an explicit reporting cutoff, without changing the source refund's business-effective timestamp or amount. Cost is delayed event count, with a separate disclosed delay bound. Compare arrival-time reporting with the declared business-time reporting contract. Restored visibility should fix the report; do not pretend a missing event can be recovered without source evidence.

C. Duplicate dimension matches: introduce a controlled overlapping product-dimension record that creates fan-out in a deliberately vulnerable join. Cost is number of injected dimension records, not downstream rows. Explain the distinction. A join-cardinality check may block this report, but blocking is not the same as automatically recovering a correct metric.

Restrict experiments to locally created reporting copies. Do not connect to or modify production systems. Avoid arbitrary SQL execution in the first release; expose named, inspectable query recipes and bounded parameters.

Keep fault families separate in initial exact searches. Mixed faults are optional and must not inherit exactness claims from a simpler case. Do not compare a delayed event, duplicated dimension row, and edited cell as if they had an identical real-world cost.

## 3. Search engine and precise guarantees

Define the formal search: find a permitted action set E minimizing its stated cost, such that the rule outcome on the transformed reporting view differs from the clean baseline, subject to the declared scope and constraints.

Implement these result states:

- Exact minimum within the declared action space, supported by an algorithm justification or completed exhaustive enumeration.
- Smallest witness found within a stated search budget, without an optimality claim.
- No reversal within the fully enumerated bounded space.
- Incomplete search or timeout; unknown beyond what was tested.
- Inapplicable fault or invalid baseline.

For a fixed positive-additive duplication problem with equal action cost, independent rows, one replay per row, and an unchanged competing total, use descending contribution order and the shortest prefix that strictly crosses the margin. Explain why no smaller subset can contribute more than the corresponding largest prefix. Document when this argument fails, including mixed signs, ratio metrics, dependent actions, or join fan-out.

Use the supplied feasibility-check.mjs as a narrow reference, not a universal engine. It has been compared against exhaustive subset enumeration on small inputs. Port the mechanism carefully, verify it independently, and rerun the resulting witness through the actual SQL pipeline before displaying it.

For non-additive cases, use bounded exhaustive search over a small, explicitly declared candidate set, or a clearly labeled heuristic. Never choose a candidate subset and claim global minimality over the whole ledger. Include protected records, eligibility rules, costs, search order, bound, number of evaluated candidates, and elapsed time in the result.

A smaller reproducer and a smaller fault set are different objectives. If reducing a case for export, preserve referential integrity, baseline rule behavior, faulty rule behavior, and any claimed minimum. Label a shrunk case illustrative unless those conditions are reverified.

## 4. Product views

### Decision Room

The main view shows clean and stressed reports side by side, with the selected analytical question written in plain language. Include baseline totals, observed totals, the rule, and its current outcome. One large action starts a bounded experiment.

Show a compact source → transformation → metric → rule diagram. Only real computation produces state changes. Clicking a stage opens its formula, SQL recipe, and affected records. Use visible status labels rather than pretending a numerical confidence score measures reliability.

### Fault Studio

Choose the family, scope, eligibility, and budget. Show concrete action previews and their units. Explain the one-replay-per-row rule and other constraints before search. Allow cancel, reset, and exact receipt inspection. Keep the original ledger available for comparison.

### Breaking Point

Display the cost-versus-outcome curve for actually evaluated candidates, mark the first witnessed reversal, and distinguish a certified minimum from a search result. Never interpolate unevaluated outcomes as measurements.

An evidence drawer shows changed records, amount deltas, the rule calculation, and the algorithm's applicable conditions. For the duplication example, show why the largest k-1 eligible contributions cannot cross the margin.

### Defense Bench

Compare vulnerable reporting with named checks or fixes: source-event idempotency, declared source reconciliation, and join-cardinality enforcement. Display correct report, detected-and-blocked report, undetected wrong report, and unavailable result separately.

Show known legitimate repeated purchases to verify that a naive dedupe does not delete real revenue. A fault-free experiment must remain a negative control. Repairs must restore the metric under a stated policy or report why recovery is unavailable.

### Experiment Ledger

Save experiments locally with seed, generator version, schema/query hashes, rule, action receipts, baseline and stressed outputs, result status, tested scope, and benchmark metadata. Provide an export and a verified import/replay path. Local storage failure must be handled without losing the current downloadable experiment.

Generate a readable investigation brief and an executable regression bundle containing fixture data, schema, SQL, experiment metadata, and assertions. Explain that this reproduces a declared model; it is not a certificate of universal data correctness.

## 5. Original benchmark, not invented results

Prepare an experiment matrix across multiple generator seeds, baseline margins, group skew, refund frequency, and fault families. Use an initial bounded set that runs on an ordinary laptop; report actual runtime and scale before expanding it.

Use the same underlying generated ledger and fault receipts when comparing defenses. Include no-fault controls and legitimate repeated business events. Record metric error, outcome reversals, detection status, false alerts, elapsed time, and search exactness separately.

Report denominators and failure cases. Do not claim broad false-positive rates from a tiny handpicked sample, treat related scenarios as independent observations, or translate synthetic effects into money saved by real companies. The benchmark distribution is an explicit design choice, not an estimate of real incident prevalence.

Publish the generator configuration, seeds, all attempted runs, exclusions, and raw results. Select the visually interesting demo case from completed results with a stated rule; do not silently tune the dataset until every defense appears successful.

## 6. Cinematic visual direction

Design a forensic analytics workspace: warm paper #F3F0E7, graphite #171B22, muted teal for the baseline, and restrained vermilion for changed evidence. Use large, legible tabular numerals, precise editorial headings, thin rules, and generous space around the central comparison.

The signature visual is a comparison of two reports with a highlighted dependency path between them. When a fault is applied, changed rows, calculations, and the final rule light up in order using actual receipts. Keep transitions brief and reversible. No fabricated live feed, glitch effects obscuring data, particle fields, or arbitrary health scores.

At desktop widths, use a slim navigation rail, two dominant report panels, a central difference marker, and a lower evidence timeline. On mobile, stack reports, retain labels, and turn evidence into an accessible drawer. Every key interaction must work by keyboard.

Use self-hosted licensed fonts or system fallbacks, accessible contrast, non-color change indicators, reduced-motion support, 200% zoom support, and clear loading/error/empty/incomplete-search states. Avoid a forced introduction or sign-in.

## 7. Verification and performance

Separate the search mechanism from SQL execution and verify them against each other. Required tests:

- Hand-calculated money totals and exact comparison boundaries, including a tie that must not count as a strict reversal.
- Baseline agrees with an independently written reference implementation.
- Small exact-search results agree with exhaustive enumeration.
- Every displayed witness reproduces the stated outcome in SQL.
- Source hashes remain unchanged through faults and reset.
- Duplicate-event protection preserves distinct legitimate orders.
- Refund timing uses correct business and ingestion timestamps.
- Join expansion cost counts injected source records separately from multiplied output rows.
- No-reversal, inapplicable, timeout, and heuristic outcomes keep their correct labels.
- Cancel and rapid scenario changes cannot display a stale result.
- Export/import round trips preserve experiment identity and reproduce totals.
- Benchmark defenses receive the same experimental inputs.

Run type checking, linting, analytical tests, build, and Playwright for the primary journey. Inspect desktop, tablet, and mobile screenshots, keyboard navigation, reduced motion, and 200% zoom. Perform automated accessibility checks and manual review.

Run the analytical engine off the main thread, cap search budgets, show measured progress, and release query/worker resources. Measure startup, asset size, worker initialization, and search latency under stated dataset conditions. Do not claim arbitrary large-scale support from the tiny feasibility script.

## 8. Milestones and deliverables

1. Inspect environment, write a concise plan and experiment contract, implement the generator and independent baseline checks.
2. Complete one actual slice: ledger → SQL baseline → exact duplication search → replayed reversal → evidence drawer. Open it in the browser.
3. Implement refund and dimension scenarios, precise bounded-search labels, defense comparisons, and experiment export/replay.
4. Run the original benchmark, inspect failures, finish the visual system, and verify accessibility/performance.
5. Complete documentation, static deployment configuration, screenshots, demo script, and final validation.

Deliver locked source, bundled demo fixtures, npm install/dev/build/preview commands, separate benchmark commands, and Windows setup instructions. Keep synthetic provenance prominent.

Also deliver README.md, docs/EXPERIMENT_CONTRACT.md, docs/PRIOR_ART.md, docs/BENCHMARK.md, docs/VALIDATION.md, docs/PERFORMANCE.md, five actual screenshots, a 50–60 second walkthrough, an interview explanation, and an honest LinkedIn draft based only on completed results.

Suggested demo: show the initial ranking → apply a permitted fault → show the reversal → inspect the changed rows and threshold proof → enable a named check → replay and export. Never claim the product or its mathematics has never existed elsewhere.

Completion requires the real computational journey, at least one justified exact result, honest bounded results for other supported cases, unchanged source data, replayable exports, measured benchmark output, passing core tests/build, and inspected browser screens. Save checkpoints if interrupted. Report unexecuted checks and blockers instead of fabricating completion.

Begin now. Inspect the environment, write the short plan, and implement the first verified vertical slice.
