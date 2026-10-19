# FAULTLINE 60-Second Executive Walkthrough Demo Script

**Objective**: Deliver a clear, evidence-based demonstration of the Analytics Decision Stress Lab in under 60 seconds.  
**Tone**: Rigorous, measured, and honest. Avoid buzzwords like "unprecedented", "game-changing", or "first ever". Focus on discrete optimization, mathematical proof, and defense boundaries.

---

## Storyboard & Script Breakdown (00:00 – 00:60)

| Timestamp | Screen / Visual State | Action on Screen | Spoken Narration (Script) |
| :--- | :--- | :--- | :--- |
| **00:00 – 00:10** | **Decision Room View** | Cursor hovers over baseline ranking showing Product Alpha (₹1,100.00) leading Product Beta (₹1,000.00) by ₹100.00 margin. | *"Dashboards look clean until you test their breaking points. Here, our baseline revenue dashboard shows Product Alpha leading Product Beta by a 100-rupee margin, driving a business decision to fund Alpha."* |
| **00:10 – 00:20** | **Fault Studio View** | Navigate to Fault Studio. Show the three explicit fault families: Duplicate Ingestion, Delayed Refunds, and Dimension Fan-Out. Adjust the duplicate multiplier slider to 1 duplicate. | *"Instead of trusting downstream numbers blindly, FAULTLINE asks: how few reporting errors would it take to invert this decision? In Fault Studio, we select an explicit fault model—here, duplicate webhook ingestion."* |
| **00:20 – 00:35** | **Breaking Point View** | Switch to Breaking Point. Show the discrete SVG cost-vs-outcome curve and the green-to-red threshold at $k=3$. Click the "Inspect Mathematical Proof" evidence drawer. | *"In the Breaking Point lab, the search engine proves that duplicating Beta's largest two rows adds only 80 rupees—not enough to flip the lead. But at exactly three duplicate events, Beta gains 105 rupees, crossing the margin and inverting the recommendation. This is certified as the exact minimal counterexample."* |
| **00:35 – 00:48** | **Defense Bench View** | Switch to Defense Bench. Toggle on "Idempotency Deduplication". Show that Beta drops back to ₹1,000.00 while the Negative Control (`CUST-B-01`'s two legitimate repeat purchases) remains 100% intact. | *"Next, we test defense policies in Defense Bench. Applying business-idempotency restores the correct baseline. Crucially, our negative control verifies that legitimate repeat purchases from real customers are preserved with zero false deductions."* |
| **00:48 – 01:00** | **Experiment Ledger View** | Switch to Experiment Ledger. Click "Download JSON Ledger" and "Export SQL Bundle". Show the reproducible hash `SHA256-4dc02df4-SYNTH` and printable summary. | *"Finally, Experiment Ledger bundles the immutable source hash, action receipts, and SQL assertions into an executable regression test your data engineers can run in CI. That's FAULTLINE: deterministic decision stress-testing for analytical integrity."* |

---

## Live Demo Quick-Check Checklist
- [ ] Browser zoom set to 100% (or standard 1080p).
- [ ] Baseline shows Product A: ₹1,100.00, Product B: ₹1,000.00.
- [ ] Fault Studio selected: `duplicate_ingestion`.
- [ ] Breaking Point confirms $k=3$ with status `EXACT_MINIMUM`.
- [ ] Defense Bench confirms Idempotency active, negative control passing (0% false alert).
- [ ] Export buttons tested and ready to trigger immediate download.
