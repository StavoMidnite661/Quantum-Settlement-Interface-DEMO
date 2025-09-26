export enum PaymentStatus {
  PENDING = "pending_approval",
  PROCESSING = "processing_settlement",
  SETTLED = "settled",
  FAILED = "failed",
  CANCELED = "canceled"
}

export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export interface User {
  id: string; // Can be a UUID or a blockchain address
  name: string;
  type: 'First Adopter' | 'Partner' | 'Client';
}

export interface Amount {
  amount_in_tokens: number;
  amount_in_usd_cents: number;
}

export interface SettlementData {
  status: string;
  tx_id: string | null;
  blockchain_tx_hash: string | null;
  settled_at: string | null;
  notes: string[];
  block_number: number;
}

export interface RoutingTrace {
  service: string;
  action: string;
  timestamp: string;
  status: "success" | "failure";
  details: Record<string, any>;
}

export interface Payment {
  id: string; // Transaction hash
  user: User;
  description: string; // e.g., Retailer ID or purchase description
  payment_type: "debit";
  amount: Amount;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  settlement_data: SettlementData;
  routing_trace: RoutingTrace[];
  priority: Priority;
  transactionDataHash: string;
  complianceDataHash: string;
  ai_flag?: {
    reason: string;
  };
  isLive?: boolean;
}

export interface MonitoredContract {
  id: string; // uuid
  name: string;
  network: string; // RPC URL
  address: string;
  abi: string; // JSON string of the ABI
}

export interface NormalizedEvent {
  id: string; // uuid
  contractId: string;
  contractName: string;
  contractAddress: string;
  network: string;
  eventName: string;
  args: Record<string, any>;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}