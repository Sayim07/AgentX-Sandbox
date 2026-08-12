import { Server as SocketIOServer } from "socket.io";
import { Agent } from "../agents/agent";
import { OrderBookMatcher } from "../engine/orderBook";
import { ServiceMarketRouter } from "../engine/serviceMarket";
import { BlockchainSettlementService } from "../blockchain/settlement";
import {
  SimulationState,
  AgentConfig,
  PricePoint,
  GraphNode,
  GraphEdge,
} from "../types";

export class SimulationOrchestrator {
  private io: SocketIOServer;
  private isRunning: boolean = false;
  private tickCount: number = 0;
  private tickIntervalMs: number = 2000;
  private timerId: NodeJS.Timeout | null = null;

  private orderBook: OrderBookMatcher;
  private serviceMarket: ServiceMarketRouter;
  private settlementService: BlockchainSettlementService;

  private agents: Agent[] = [];
  private priceHistory: PricePoint[] = [];
  private edgeVolumeMap: Map<string, { count: number; totalAmount: number; type: "trade" | "service" }> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.orderBook = new OrderBookMatcher(10.0);
    this.serviceMarket = new ServiceMarketRouter();
    this.settlementService = new BlockchainSettlementService();

    this.initializeAgents();
    this.recordPricePoint(10.0, 0);
  }

  private initializeAgents(): void {
    const agentConfigs: AgentConfig[] = [
      {
        id: "agent-1",
        name: "AlphaTrader",
        persona: "Aggressive Speculative Trader",
        strategyType: "llm",
        privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        initialCredits: 1000.0,
      },
      {
        id: "agent-2",
        name: "BetaBuyer",
        persona: "Conservative Micro-Service Purchaser",
        strategyType: "rule_buyer",
        privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        initialCredits: 800.0,
      },
      {
        id: "agent-3",
        name: "OracleNode",
        persona: "Data Oracle Service Provider",
        strategyType: "rule_oracle",
        privateKey: "0x5de4111111111111111111111111111111111111111111111111111111111111",
        initialCredits: 600.0,
      },
      {
        id: "agent-4",
        name: "Arbitrageur",
        persona: "Cross-Market Spread Arbitrageur",
        strategyType: "rule_arbitrage",
        privateKey: "0x7c85211111111111111111111111111111111111111111111111111111111111",
        initialCredits: 1200.0,
      },
    ];

    this.agents = agentConfigs.map((cfg) => new Agent(cfg));
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.runTickLoop();
    this.broadcastState();
  }

  public pause(): void {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.broadcastState();
  }

  public reset(): void {
    this.pause();
    this.tickCount = 0;
    this.orderBook.reset();
    this.serviceMarket.reset();
    this.settlementService.reset();
    this.priceHistory = [];
    this.edgeVolumeMap.clear();

    this.initializeAgents();
    this.recordPricePoint(10.0, 0);
    this.broadcastState();
  }

  public setTickInterval(intervalMs: number): void {
    this.tickIntervalMs = Math.max(500, Math.min(10000, intervalMs));
  }

  public injectDemandShock(): void {
    const currentPrice = this.orderBook.getLastPrice();
    const shockPrice = Number((currentPrice * 1.30).toFixed(2));

    this.orderBook.placeOrder("agent-1", "buy", 50, shockPrice);
    this.orderBook.placeOrder("agent-4", "buy", 30, Number((shockPrice * 1.05).toFixed(2)));

    this.broadcastState();
  }

  /**
   * Pre-scripted 3-minute hackathon demo scenario guaranteed to showcase full agent economy dynamics:
   * Price discovery -> Micro-service contract hire -> Escrow release -> Demand shock -> Arbitrage balancing.
   */
  public seedDemoScenario(): void {
    this.reset();
    this.setTickInterval(1500); // 1.5s per tick for lively demo

    // Seed baseline liquidity into order book
    this.orderBook.placeOrder("agent-4", "sell", 20, 10.5);
    this.orderBook.placeOrder("agent-4", "sell", 30, 11.0);
    this.orderBook.placeOrder("agent-1", "buy", 25, 9.8);

    // Hire initial data oracle service
    const srvCall = this.serviceMarket.hireService("agent-2", "srv-oracle-1");
    if (srvCall) {
      const buyer = this.agents.find((a) => a.id === "agent-2");
      if (buyer) buyer.updateBalance(-srvCall.price);
      this.recordInteractionEdge("agent-2", "agent-3", srvCall.price, "service");
      this.settlementService.settleServiceCallAsync(srvCall);
    }

    this.start();
  }

  private runTickLoop(): void {
    if (!this.isRunning) return;

    this.executeTick()
      .catch((err) => console.error("Error in simulation tick:", err))
      .finally(() => {
        if (this.isRunning) {
          this.timerId = setTimeout(() => this.runTickLoop(), this.tickIntervalMs);
        }
      });
  }

  private async executeTick(): Promise<void> {
    this.tickCount++;

    const marketPrice = this.orderBook.getLastPrice();
    const bids = this.orderBook.getBids();
    const asks = this.orderBook.getAsks();

    const orderBookState = {
      bidsCount: bids.length,
      asksCount: asks.length,
      bestBid: bids.length > 0 ? bids[0].price : undefined,
      bestAsk: asks.length > 0 ? asks[0].price : undefined,
    };

    const availableServices = this.serviceMarket.getListings().map((l) => ({
      id: l.id,
      serviceType: l.serviceType,
      price: l.price,
      providerAgentId: l.providerAgentId,
    }));

    let tickVolume = 0;

    // 1. Process agent decisions concurrently
    const decisions = await Promise.all(
      this.agents.map((agent) =>
        agent.decide({
          marketPrice,
          orderBookState,
          availableServices,
        })
      )
    );

    // 2. Execute actions from decisions
    for (let i = 0; i < this.agents.length; i++) {
      const agent = this.agents[i];
      const decision = decisions[i];

      if (decision.action === "buy" || decision.action === "sell") {
        const qty = decision.quantity ?? 10;
        const price = decision.price ?? marketPrice;

        const { executedTrades } = this.orderBook.placeOrder(
          agent.id,
          decision.action,
          qty,
          price
        );

        for (const trade of executedTrades) {
          tickVolume += trade.quantity * trade.price;

          const buyer = this.agents.find((a) => a.id === trade.buyerAgentId);
          const seller = this.agents.find((a) => a.id === trade.sellerAgentId);

          if (buyer) buyer.updateBalance(-(trade.price * trade.quantity));
          if (seller) seller.updateBalance(trade.price * trade.quantity);

          this.recordInteractionEdge(trade.buyerAgentId, trade.sellerAgentId, trade.price * trade.quantity, "trade");
          this.settlementService.settleTradeAsync(trade);
        }
      } else if (decision.action === "hire_service" && decision.serviceId) {
        const serviceCall = this.serviceMarket.hireService(agent.id, decision.serviceId);
        if (serviceCall) {
          agent.updateBalance(-serviceCall.price);
          this.recordInteractionEdge(serviceCall.buyerAgentId, serviceCall.providerAgentId, serviceCall.price, "service");
          this.settlementService.settleServiceCallAsync(serviceCall);
        }
      }
    }

    // 3. Process service completions every 2 ticks
    if (this.tickCount % 2 === 0) {
      const pendingCalls = this.serviceMarket
        .getServiceCalls()
        .filter((c) => c.status === "escrowed");

      for (const call of pendingCalls) {
        const completed = this.serviceMarket.completeServiceCall(call.id, true);
        if (completed) {
          const provider = this.agents.find((a) => a.id === completed.providerAgentId);
          if (provider) {
            provider.updateBalance(completed.price);
            provider.incrementServicesCompleted();
          }

          this.settlementService.releaseEscrowAsync(completed);
        }
      }
    }

    // 4. Record history & broadcast
    this.recordPricePoint(this.orderBook.getLastPrice(), tickVolume);
    this.broadcastState();
  }

  private recordPricePoint(price: number, volume: number): void {
    this.priceHistory.push({
      timestamp: Date.now(),
      price: Number(price.toFixed(2)),
      volume: Number(volume.toFixed(2)),
    });

    if (this.priceHistory.length > 50) {
      this.priceHistory.shift();
    }
  }

  private recordInteractionEdge(source: string, target: string, amount: number, type: "trade" | "service"): void {
    const key = `${source}->${target}`;
    const existing = this.edgeVolumeMap.get(key) || { count: 0, totalAmount: 0, type };
    this.edgeVolumeMap.set(key, {
      count: existing.count + 1,
      totalAmount: existing.totalAmount + amount,
      type,
    });
  }

  public getSnapshot(): SimulationState {
    const nodes: GraphNode[] = this.agents.map((a) => ({
      id: a.id,
      label: a.name,
      persona: a.persona,
      balance: a.creditBalance,
    }));

    const edges: GraphEdge[] = Array.from(this.edgeVolumeMap.entries()).map(([key, val]) => {
      const [source, target] = key.split("->");
      return {
        id: `edge-${key}`,
        source,
        target,
        label: `${val.type === "trade" ? "Trade" : "Service"} (${val.count}x: $${val.totalAmount.toFixed(0)})`,
        value: val.totalAmount,
        type: val.type,
      };
    });

    return {
      isRunning: this.isRunning,
      tickCount: this.tickCount,
      tickIntervalMs: this.tickIntervalMs,
      marketPrice: this.orderBook.getLastPrice(),
      priceHistory: this.priceHistory,
      orderBook: {
        bids: this.orderBook.getBids(),
        asks: this.orderBook.getAsks(),
      },
      tradesHistory: this.orderBook.getTrades(),
      serviceListings: this.serviceMarket.getListings(),
      serviceCallsHistory: this.serviceMarket.getServiceCalls(),
      agents: this.agents.map((a) => a.getState()),
      transactionFeed: this.settlementService.getTransactionFeed(),
      networkGraph: {
        nodes,
        edges,
      },
    };
  }

  private broadcastState(): void {
    this.io.emit("tick_update", this.getSnapshot());
  }
}
