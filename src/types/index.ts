export type ViewMode = 'decision-room' | 'fault-studio' | 'breaking-point' | 'defense-bench' | 'experiment-ledger';

export interface ProductDimension {
  productId: string;
  productGroup: 'Alpha' | 'Beta' | 'Gamma';
  productName: string;
  effectiveStart: string;
  effectiveEnd: string | null;
}

export interface Order {
  orderId: string;
  customerId: string;
  productId: string;
  orderTimestamp: string;
  grossAmount: number; // in integer paise (₹1 = 100 paise)
  status: 'COMPLETED';
}

export interface Refund {
  refundId: string;
  orderId: string;
  productId: string;
  productGroup: 'Alpha' | 'Beta' | 'Gamma';
  refundTimestamp: string; // Business-effective refund time
  refundAmount: number; // in integer paise
}

export interface IngestionEvent {
  eventId: string;
  eventType: 'ORDER' | 'REFUND';
  businessId: string;
  ingestionTimestamp: string; // Stream arrival time
  productGroup: 'Alpha' | 'Beta' | 'Gamma';
  amount: number; // in integer paise
}

export interface CanonicalLedger {
  id: string;
  name: string;
  seed: number;
  currency: 'INR';
  minorUnitFactor: 100; // 100 paise = 1 INR
  products: ProductDimension[];
  orders: Order[];
  refunds: Refund[];
  events: IngestionEvent[];
  sourceHash: string;
  legitimateRepeatsCount: number;
}

export type AnalyticalQuestionId = 'ranking' | 'threshold' | 'trend';

export interface QuestionConfig {
  id: AnalyticalQuestionId;
  title: string;
  description: string;
  targetGroup: 'Beta';
  competingGroup: 'Alpha';
  reviewThresholdPaise?: number; // for 'threshold'
  growthTargetPaise?: number; // for 'trend'
}

export interface GroupMetric {
  group: 'Alpha' | 'Beta' | 'Gamma';
  grossPaise: number;
  refundsPaise: number;
  netPaise: number;
  orderCount: number;
  refundCount: number;
}

export interface DecisionResult {
  questionId: AnalyticalQuestionId;
  questionText: string;
  outcomeText: string;
  isFlaggedOrSecondary: boolean;
  marginPaise: number;
  metrics: Record<'Alpha' | 'Beta' | 'Gamma', GroupMetric>;
  summary: string;
}

export type FaultFamily = 'duplicate_ingestion' | 'delayed_refunds' | 'dimension_fanout';

export interface FaultActionReceipt {
  actionId: string;
  faultFamily: FaultFamily;
  targetBusinessId: string;
  targetProductGroup: 'Alpha' | 'Beta' | 'Gamma';
  amountPaise: number;
  description: string;
  beforeState: string;
  afterState: string;
}

export type SearchStatus = 
  | 'EXACT_MINIMUM'
  | 'BOUNDED_WITNESS'
  | 'NO_REVERSAL_FOUND'
  | 'INCOMPLETE_TIMEOUT'
  | 'INAPPLICABLE_FAULT';

export interface SearchWitness {
  status: SearchStatus;
  faultFamily: FaultFamily;
  reversalAchieved: boolean;
  cost: number;
  addedRevenuePaise: number;
  receipts: FaultActionReceipt[];
  baselineDecision: DecisionResult;
  stressedDecision: DecisionResult;
  mathematicalProof: string;
  evaluatedCandidatesCount: number;
  elapsedMs: number;
}

export type DefensePolicy = 'none' | 'idempotency' | 'reconciliation' | 'join_guard';

export interface DefenseEvaluation {
  defenseKey: DefensePolicy;
  defenseName: string;
  description: string;
  detectionStatus: 'DETECTED_AND_BLOCKED' | 'RECOVERED_CORRECT' | 'UNDETECTED_WRONG';
  reportedNetBetaPaise: number;
  reportedDecision: DecisionResult;
  explanation: string;
  negativeControlPreserved: boolean; // Confirms legitimate customer repeat was NOT erased
}

export interface ExperimentBundle {
  experimentId: string;
  timestamp: string;
  generatorSeed: number;
  ledgerName: string;
  sourceHash: string;
  question: QuestionConfig;
  faultFamily: FaultFamily;
  witness: SearchWitness;
  defenses: DefenseEvaluation[];
  sqlRecipe: string;
  appVersion: string;
}
