export enum TransactionStage {
  AGREEMENT = 'agreement',
  EARNEST_MONEY = 'earnest_money',
  TITLE_DEED = 'title_deed',
  COMPLETED = 'completed',
}

export interface Agent {
  _id: string;
  fullName: string;
  email: string;
  role?: 'admin' | 'agent';
}

export interface AgentShare {
  agentId: string;
  agentName: string;
  role: 'listing' | 'selling' | 'both';
  amount: number;
  percentage: number;
}

export interface Commission {
  totalPool: number;
  agencyAmount: number;
  agencyPercentage: number;
  agentShares: AgentShare[];
  calculatedAt: string;
}

export interface StageHistoryEntry {
  from: string;
  to: string;
  changedAt: string;
}

export interface Transaction {
  _id: string;
  propertyAddress: string;
  propertyType: 'sale' | 'rental';
  totalServiceFee: number;
  stage: string;
  listingAgentId: string;
  sellingAgentId: string;
  listingAgent?: Agent;
  sellingAgent?: Agent;
  commission: Commission | null;
  stageHistory: StageHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalTransactions: number;
  byStage: Record<string, number>;
  totalRevenue: number;
  agencyRevenue: number;
  recentTransactions: Transaction[];
  allTransactions: Transaction[];
  topAgents: {
    agentId: string;
    agentName: string;
    totalEarnings: number;
    transactionCount: number;
  }[];
}
