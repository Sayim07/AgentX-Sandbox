import { ServiceListing, ServiceCall } from "../types";
import { v4 as uuidv4 } from "uuid";

export class ServiceMarketRouter {
  private listings: ServiceListing[] = [];
  private serviceCalls: ServiceCall[] = [];

  constructor() {
    this.seedDefaultListings();
  }

  private seedDefaultListings(): void {
    this.listings = [
      {
        id: "srv-oracle-1",
        providerAgentId: "agent-3", // OracleNode
        serviceType: "data-oracle",
        price: 25.0,
        description: "Real-time AI Sentiment & Volatility Signal",
        active: true,
      },
      {
        id: "srv-task-1",
        providerAgentId: "agent-1", // AlphaTrader
        serviceType: "task-completion",
        price: 50.0,
        description: "High-Frequency Portfolio Rebalancing Sub-task",
        active: true,
      },
      {
        id: "srv-arb-1",
        providerAgentId: "agent-4", // Arbitrageur
        serviceType: "market-signal",
        price: 15.0,
        description: "Cross-Market Spread Opportunity Feed",
        active: true,
      },
    ];
  }

  public getListings(): ServiceListing[] {
    return [...this.listings];
  }

  public getServiceCalls(): ServiceCall[] {
    return [...this.serviceCalls];
  }

  public registerListing(
    providerAgentId: string,
    serviceType: string,
    price: number,
    description: string
  ): ServiceListing {
    const listing: ServiceListing = {
      id: `srv-${uuidv4().substring(0, 8)}`,
      providerAgentId,
      serviceType,
      price: Math.max(1, price),
      description,
      active: true,
    };
    this.listings.push(listing);
    return listing;
  }

  public hireService(
    buyerAgentId: string,
    listingId: string
  ): ServiceCall | null {
    const listing = this.listings.find((l) => l.id === listingId && l.active);
    if (!listing) return null;
    if (listing.providerAgentId === buyerAgentId) return null; // Cannot hire oneself

    const call: ServiceCall = {
      id: `call-${uuidv4().substring(0, 8)}`,
      buyerAgentId,
      providerAgentId: listing.providerAgentId,
      listingId: listing.id,
      serviceType: listing.serviceType,
      price: listing.price,
      status: "escrowed",
      timestamp: Date.now(),
    };

    this.serviceCalls.unshift(call);
    return call;
  }

  public completeServiceCall(
    callId: string,
    success: boolean = true,
    resultHash: string = "ipfs://QmbWqx7vuPMockResult"
  ): ServiceCall | null {
    const call = this.serviceCalls.find((c) => c.id === callId);
    if (!call || call.status !== "escrowed") return null;

    call.status = success ? "delivered" : "disputed";
    call.resultHash = resultHash;
    return call;
  }

  public reset(): void {
    this.listings = [];
    this.serviceCalls = [];
    this.seedDefaultListings();
  }
}
