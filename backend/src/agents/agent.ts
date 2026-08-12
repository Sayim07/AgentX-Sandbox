import { ethers } from "ethers";
import { AgentConfig, AgentState } from "../types";
import { getGroqDecision, AgentDecision } from "./strategies/groqReasoning";
import { getRuleBasedDecision } from "./strategies/ruleStrategy";

export class Agent {
  public id: string;
  public name: string;
  public persona: string;
  public strategyType: string;
  public wallet: ethers.Wallet;
  public creditBalance: number;
  public reputationScore: number = 100;
  public servicesCompleted: number = 0;
  public activeOrdersCount: number = 0;
  public lastActionSummary: string = "Agent initialized and idle.";

  constructor(config: AgentConfig, provider?: ethers.Provider) {
    this.id = config.id;
    this.name = config.name;
    this.persona = config.persona;
    this.strategyType = config.strategyType;

    // Create programmatic wallet from private key
    this.wallet = new ethers.Wallet(config.privateKey, provider);
    this.creditBalance = config.initialCredits;
  }

  public getWalletAddress(): string {
    return this.wallet.address;
  }

  public getState(): AgentState {
    return {
      id: this.id,
      name: this.name,
      persona: this.persona,
      strategyType: this.strategyType as any,
      walletAddress: this.wallet.address,
      creditBalance: Number(this.creditBalance.toFixed(2)),
      nativeBalance: "1.0 MATIC",
      reputationScore: this.reputationScore,
      activeOrdersCount: this.activeOrdersCount,
      servicesCompleted: this.servicesCompleted,
      lastActionSummary: this.lastActionSummary,
    };
  }

  /**
   * Evaluate market state and generate agent's decision for the current tick.
   */
  public async decide(marketContext: {
    marketPrice: number;
    orderBookState: { bidsCount: number; asksCount: number; bestBid?: number; bestAsk?: number };
    availableServices: { id: string; serviceType: string; price: number; providerAgentId: string }[];
  }): Promise<AgentDecision> {
    let decision: AgentDecision | null = null;

    // Tries LLM reasoning if strategy is LLM or 50% random chance for AI variance
    if (this.strategyType === "llm") {
      decision = await getGroqDecision(
        this.persona,
        this.name,
        this.creditBalance,
        marketContext.marketPrice,
        marketContext.orderBookState,
        marketContext.availableServices,
        1500
      );
    }

    // Fallback to deterministic rule engine if LLM null/unavailable
    if (!decision) {
      decision = getRuleBasedDecision(
        this.strategyType,
        this.persona,
        this.name,
        this.creditBalance,
        marketContext.marketPrice,
        marketContext.availableServices,
        this.id
      );
    }

    this.lastActionSummary = `[${decision.action.toUpperCase()}] ${decision.reasoning}`;
    return decision;
  }

  public updateBalance(delta: number): void {
    this.creditBalance = Math.max(0, this.creditBalance + delta);
  }

  public incrementServicesCompleted(): void {
    this.servicesCompleted += 1;
    this.reputationScore += 5;
  }
}
