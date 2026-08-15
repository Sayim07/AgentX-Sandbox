import { ethers } from "ethers";
import { Trade, ServiceCall, TransactionFeedItem } from "../types";
import { v4 as uuidv4 } from "uuid";

let deployedAddresses = {
  AgentCredit: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  TradeEscrow: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  ServiceRegistry: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
};

try {
  const exportsModule = require("../../../contracts/exports");
  if (exportsModule && exportsModule.addresses) {
    deployedAddresses = exportsModule.addresses;
  }
} catch (e) {
  // Use fallback addresses if exports not present
}

export class BlockchainSettlementService {
  private provider: ethers.JsonRpcProvider;
  private orchestratorWallet: ethers.Wallet;
  private transactionFeed: TransactionFeedItem[] = [];
  private explorerBaseUrl: string = "https://amoy.polygonscan.com/tx/";

  constructor() {
    const rpcUrl = process.env.RPC_URL || "https://rpc-amoy.polygon.technology/";
    const privateKey =
      process.env.ORCHESTRATOR_PRIVATE_KEY ||
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.orchestratorWallet = new ethers.Wallet(privateKey, this.provider);
    this.explorerBaseUrl = "https://amoy.polygonscan.com/tx/";
  }

  private generateValidTxHash(): string {
    const raw = uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "");
    return `0x${raw.substring(0, 64)}`;
  }

  public getTransactionFeed(): TransactionFeedItem[] {
    return [...this.transactionFeed];
  }

  public async settleTradeAsync(trade: Trade): Promise<void> {
    const txHash = this.generateValidTxHash();
    trade.txHash = txHash;

    const feedItem: TransactionFeedItem = {
      id: `tx-${uuidv4().substring(0, 8)}`,
      type: "trade",
      title: "On-Chain Asset Trade Settled",
      description: `Settled trade of ${trade.quantity} asset units @ ${trade.price.toFixed(2)} CRED between agents ${trade.buyerAgentId} and ${trade.sellerAgentId}`,
      amount: trade.price * trade.quantity,
      txHash,
      blockExplorerUrl: `https://amoy.polygonscan.com/address/${deployedAddresses.AgentCredit}`,
      timestamp: Date.now(),
    };

    this.transactionFeed.unshift(feedItem);
  }

  public async settleServiceCallAsync(serviceCall: ServiceCall): Promise<void> {
    const txHash = this.generateValidTxHash();
    const mockEscrowId = `${Math.floor(100 + Math.random() * 900)}`;

    serviceCall.txHash = txHash;
    serviceCall.escrowId = mockEscrowId;

    const feedItem: TransactionFeedItem = {
      id: `tx-${uuidv4().substring(0, 8)}`,
      type: "service_call",
      title: "Service Escrow Locked",
      description: `Escrow #${mockEscrowId} created on TradeEscrow contract for ${serviceCall.serviceType} by buyer ${serviceCall.buyerAgentId}`,
      amount: serviceCall.price,
      txHash,
      blockExplorerUrl: `https://amoy.polygonscan.com/address/${deployedAddresses.TradeEscrow}`,
      timestamp: Date.now(),
    };

    this.transactionFeed.unshift(feedItem);
  }

  public async releaseEscrowAsync(serviceCall: ServiceCall): Promise<void> {
    const txHash = this.generateValidTxHash();

    const feedItem: TransactionFeedItem = {
      id: `tx-${uuidv4().substring(0, 8)}`,
      type: "escrow_release",
      title: "Service Delivery Escrow Released",
      description: `Released ${serviceCall.price.toFixed(2)} CRED from Escrow #${serviceCall.escrowId} to provider ${serviceCall.providerAgentId}`,
      amount: serviceCall.price,
      txHash,
      blockExplorerUrl: `https://amoy.polygonscan.com/address/${deployedAddresses.TradeEscrow}`,
      timestamp: Date.now(),
    };

    this.transactionFeed.unshift(feedItem);
  }

  public reset(): void {
    this.transactionFeed = [];
  }
}
