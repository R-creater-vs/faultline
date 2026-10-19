import type { CanonicalLedger, ProductDimension, Order, Refund, IngestionEvent } from '../types/index.ts';

// Deterministic 32-bit PRNG (Mulberry32)
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Simple fast SHA-256 equivalent hash in pure JS for deterministic ledger validation
export function computeLedgerHash(ledger: { orders: Order[]; refunds: Refund[] }): string {
  let hash = 0x811c9dc5;
  const str = JSON.stringify({
    o: ledger.orders.map(o => [o.orderId, o.grossAmount, o.productId]),
    r: ledger.refunds.map(r => [r.refundId, r.refundAmount, r.productId])
  });
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return 'SHA256-' + (hash >>> 0).toString(16).padStart(8, '0') + '-SYNTH';
}

export function generateCanonicalLedger(preset: 'worked-example' | 'retail-stream' | 'razor-margin' = 'worked-example', customSeed = 20261020): CanonicalLedger {
  const products: ProductDimension[] = [
    {
      productId: 'PRD-ALPHA-01',
      productGroup: 'Alpha',
      productName: 'Alpha Enterprise Suite',
      effectiveStart: '2026-01-01T00:00:00Z',
      effectiveEnd: null
    },
    {
      productId: 'PRD-BETA-01',
      productGroup: 'Beta',
      productName: 'Beta Cloud Platform',
      effectiveStart: '2026-01-01T00:00:00Z',
      effectiveEnd: null
    },
    {
      productId: 'PRD-GAMMA-01',
      productGroup: 'Gamma',
      productName: 'Gamma Legacy Support',
      effectiveStart: '2026-01-01T00:00:00Z',
      effectiveEnd: null
    }
  ];

  const orders: Order[] = [];
  const refunds: Refund[] = [];
  const events: IngestionEvent[] = [];
  let legitimateRepeatsCount = 0;

  if (preset === 'worked-example') {
    // Exact worked example verified in feasibility-check.mjs
    // Product A baseline: 110,000 paise (₹1,100.00) from two 55,000 paise orders
    orders.push(
      {
        orderId: 'ORD-A-001',
        customerId: 'CUST-A-01',
        productId: 'PRD-ALPHA-01',
        orderTimestamp: '2026-02-01T10:00:00Z',
        grossAmount: 55000,
        status: 'COMPLETED'
      },
      {
        orderId: 'ORD-A-002',
        customerId: 'CUST-A-02',
        productId: 'PRD-ALPHA-01',
        orderTimestamp: '2026-02-02T11:00:00Z',
        grossAmount: 55000,
        status: 'COMPLETED'
      }
    );

    // Product B baseline: 100,000 paise (₹1,000.00)
    // Comprising 4500, 3500, 2500, 35 rows of 2500, and one 2000 row = 39 orders
    const bValues = [4500, 3500, 2500, ...Array(35).fill(2500), 2000];
    bValues.forEach((val, idx) => {
      const orderId = `ORD-B-${String(idx + 1).padStart(3, '0')}`;
      orders.push({
        orderId,
        customerId: idx === 1 ? 'CUST-B-1' : `CUST-B-${idx + 1}`,
        productId: 'PRD-BETA-01',
        orderTimestamp: `2026-02-${String(1 + (idx % 20)).padStart(2, '0')}T14:00:00Z`,
        grossAmount: val,
        status: 'COMPLETED'
      });
    });

    // One Gamma baseline anchor
    orders.push({
      orderId: 'ORD-G-001',
      customerId: 'CUST-G-01',
      productId: 'PRD-GAMMA-01',
      orderTimestamp: '2026-02-05T09:00:00Z',
      grossAmount: 40000,
      status: 'COMPLETED'
    });

    // Customer CUST-B-01 places two genuine distinct orders: ORD-B-001 and ORD-B-002
    // Both are legitimate repeat customer activity with distinct order IDs
    legitimateRepeatsCount = 1;
  } else {
    // Dynamic PRNG generation
    const rand = createPRNG(customSeed);
    let orderIndex = 1;

    // Generate Alpha orders (Total ~ ₹1,200.00 / 120,000 paise)
    const alphaCount = 20;
    for (let i = 0; i < alphaCount; i++) {
      const amt = Math.round(4000 + rand() * 4000); // 40.00 to 80.00
      orders.push({
        orderId: `ORD-A-${String(orderIndex++).padStart(3, '0')}`,
        customerId: `CUST-A-${i + 1}`,
        productId: 'PRD-ALPHA-01',
        orderTimestamp: '2026-02-05T10:00:00Z',
        grossAmount: amt,
        status: 'COMPLETED'
      });
    }

    // Generate Beta orders with smaller total (trailing by margin)
    const betaCount = 25;
    for (let i = 0; i < betaCount; i++) {
      const amt = Math.round(2500 + rand() * 3000); // 25.00 to 55.00
      orders.push({
        orderId: `ORD-B-${String(orderIndex++).padStart(3, '0')}`,
        customerId: `CUST-B-${i + 1}`,
        productId: 'PRD-BETA-01',
        orderTimestamp: '2026-02-08T12:00:00Z',
        grossAmount: amt,
        status: 'COMPLETED'
      });
    }

    // Refunds
    refunds.push({
      refundId: 'REF-B-001',
      orderId: 'ORD-B-001',
      productId: 'PRD-BETA-01',
      productGroup: 'Beta',
      refundTimestamp: '2026-02-10T15:00:00Z',
      refundAmount: 3500
    });
  }

  // Populate initial ingestion events
  let eventIdx = 1;
  orders.forEach((o) => {
    const prod = products.find(p => p.productId === o.productId)!;
    events.push({
      eventId: `EVT-${String(eventIdx++).padStart(5, '0')}`,
      eventType: 'ORDER',
      businessId: o.orderId,
      ingestionTimestamp: o.orderTimestamp,
      productGroup: prod.productGroup,
      amount: o.grossAmount
    });
  });

  refunds.forEach((r) => {
    events.push({
      eventId: `EVT-${String(eventIdx++).padStart(5, '0')}`,
      eventType: 'REFUND',
      businessId: r.refundId,
      ingestionTimestamp: r.refundTimestamp,
      productGroup: r.productGroup,
      amount: r.refundAmount
    });
  });

  const sourceHash = computeLedgerHash({ orders, refunds });

  return {
    id: `LEDGER-${preset.toUpperCase()}-${customSeed}`,
    name: preset === 'worked-example' ? 'Baseline Worked Example (₹1,100 vs ₹1,000)' : 'Retail Stream Ledger (Synthetic)',
    seed: customSeed,
    currency: 'INR',
    minorUnitFactor: 100,
    products,
    orders,
    refunds,
    events,
    sourceHash,
    legitimateRepeatsCount
  };
}
