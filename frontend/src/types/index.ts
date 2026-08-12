export type StrategyType = "llm" | "rule_trader" | "rule_buyer" | "rule_oracle" | "rule_arbitrage";

export interface AgentState {
  id: string;
  name: string;
  persona: string;
  strategyType: StrategyType;
  walletAddress: string;
  creditBalance: number;
  nativeBalance: string;
  reputationScore: number;
  activeOrdersCount: number;
  servicesCompleted: number;
  lastActionSummary: string;
}

export type OrderSide = "buy" | "sell";
export type OrderStatus = "open" | "filled" | "cancelled";

export interface Order {
  id: string;
  agentId: string;
  side: OrderSide;
  quantity: number;
  price: number;
  status: OrderStatus;
  timestamp: number;
}

export interface Trade {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  buyerAgentId: string;
  sellerAgentId: string;
  price: number;
  quantity: number;
  txHash?: string;
  timestamp: number;
}

export interface ServiceListing {
  id: string;
  providerAgentId: string;
  serviceType: string;
  price: number;
  description: string;
  active: boolean;
}

export type ServiceCallStatus = "pending" | "escrowed" | "delivered" | "refunded" | "disputed";

export interface ServiceCall {
  id: string;
  buyerAgentId: string;
  providerAgentId: string;
  listingId: string;
  serviceType: string;
  price: number;
  escrowId?: string;
  status: ServiceCallStatus;
  txHash?: string;
  resultHash?: string;
  timestamp: number;
}

export interface TransactionFeedItem {
  id: string;
  type: "trade" | "service_call" | "escrow_release" | "escrow_refund";
  title: string;
  description: string;
  amount: number;
  txHash?: string;
  blockExplorerUrl?: string;
  timestamp: number;
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface GraphNode {
  id: string;
  label: string;
  persona: string;
  balance: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  value: number;
  type: "trade" | "service";
}

export interface SimulationState {
  isRunning: boolean;
  tickCount: number;
  tickIntervalMs: number;
  marketPrice: number;
  priceHistory: PricePoint[];
  orderBook: {
    bids: Order[];
    asks: Order[];
  };
  tradesHistory: Trade[];
  serviceListings: ServiceListing[];
  serviceCallsHistory: ServiceCall[];
  agents: AgentState[];
  transactionFeed: TransactionFeedItem[];
  networkGraph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}
