import { Order, Trade, OrderSide } from "../types";
import { v4 as uuidv4 } from "uuid";

export class OrderBookMatcher {
  private bids: Order[] = []; // Buy orders, highest price first
  private asks: Order[] = []; // Sell orders, lowest price first
  private trades: Trade[] = [];
  private lastPrice: number = 10.0; // Default baseline token price in CRED

  constructor(initialPrice: number = 10.0) {
    this.lastPrice = initialPrice;
  }

  public getLastPrice(): number {
    return this.lastPrice;
  }

  public setLastPrice(price: number): void {
    if (price > 0) {
      this.lastPrice = price;
    }
  }

  public getBids(): Order[] {
    return [...this.bids];
  }

  public getAsks(): Order[] {
    return [...this.asks];
  }

  public getTrades(): Trade[] {
    return [...this.trades];
  }

  /**
   * Submit a new limit order into the matching engine.
   * Matches immediately against resting opposite orders if price criteria met.
   */
  public placeOrder(
    agentId: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): { newOrder: Order; executedTrades: Trade[] } {
    const newOrder: Order = {
      id: `ord-${uuidv4().substring(0, 8)}`,
      agentId,
      side,
      quantity,
      price: Math.max(0.1, Number(price.toFixed(2))),
      status: "open",
      timestamp: Date.now(),
    };

    const executedTrades: Trade[] = [];

    if (side === "buy") {
      this.matchBuyOrder(newOrder, executedTrades);
    } else {
      this.matchSellOrder(newOrder, executedTrades);
    }

    return { newOrder, executedTrades };
  }

  private matchBuyOrder(buyOrder: Order, executedTrades: Trade[]): void {
    // Sort asks: lowest price first, then oldest timestamp
    this.asks.sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);

    let remainingQty = buyOrder.quantity;

    for (let i = 0; i < this.asks.length && remainingQty > 0; i++) {
      const ask = this.asks[i];

      // Buy price must be >= Sell ask price
      if (buyOrder.price >= ask.price) {
        // Cannot trade with self
        if (ask.agentId === buyOrder.agentId) continue;

        const tradeQty = Math.min(remainingQty, ask.quantity);
        const matchPrice = ask.price; // Execute at resting ask price

        remainingQty -= tradeQty;
        ask.quantity -= tradeQty;

        this.lastPrice = matchPrice;

        const trade: Trade = {
          id: `trd-${uuidv4().substring(0, 8)}`,
          buyOrderId: buyOrder.id,
          sellOrderId: ask.id,
          buyerAgentId: buyOrder.agentId,
          sellerAgentId: ask.agentId,
          price: matchPrice,
          quantity: tradeQty,
          timestamp: Date.now(),
        };

        this.trades.unshift(trade);
        executedTrades.push(trade);

        if (ask.quantity === 0) {
          ask.status = "filled";
          this.asks.splice(i, 1);
          i--;
        }
      } else {
        break; // No more matching asks
      }
    }

    if (remainingQty > 0) {
      buyOrder.quantity = remainingQty;
      this.bids.push(buyOrder);
      this.bids.sort((a, b) => b.price - a.price || a.timestamp - b.timestamp);
    } else {
      buyOrder.status = "filled";
    }
  }

  private matchSellOrder(sellOrder: Order, executedTrades: Trade[]): void {
    // Sort bids: highest price first, then oldest timestamp
    this.bids.sort((a, b) => b.price - a.price || a.timestamp - b.timestamp);

    let remainingQty = sellOrder.quantity;

    for (let i = 0; i < this.bids.length && remainingQty > 0; i++) {
      const bid = this.bids[i];

      // Sell price must be <= Buy bid price
      if (sellOrder.price <= bid.price) {
        if (bid.agentId === sellOrder.agentId) continue;

        const tradeQty = Math.min(remainingQty, bid.quantity);
        const matchPrice = bid.price; // Execute at resting bid price

        remainingQty -= tradeQty;
        bid.quantity -= tradeQty;

        this.lastPrice = matchPrice;

        const trade: Trade = {
          id: `trd-${uuidv4().substring(0, 8)}`,
          buyOrderId: bid.id,
          sellOrderId: sellOrder.id,
          buyerAgentId: bid.agentId,
          sellerAgentId: sellOrder.agentId,
          price: matchPrice,
          quantity: tradeQty,
          timestamp: Date.now(),
        };

        this.trades.unshift(trade);
        executedTrades.push(trade);

        if (bid.quantity === 0) {
          bid.status = "filled";
          this.bids.splice(i, 1);
          i--;
        }
      } else {
        break; // No more matching bids
      }
    }

    if (remainingQty > 0) {
      sellOrder.quantity = remainingQty;
      this.asks.push(sellOrder);
      this.asks.sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);
    } else {
      sellOrder.status = "filled";
    }
  }

  public cancelOrder(orderId: string): boolean {
    const bidIndex = this.bids.findIndex((o) => o.id === orderId);
    if (bidIndex !== -1) {
      this.bids[bidIndex].status = "cancelled";
      this.bids.splice(bidIndex, 1);
      return true;
    }

    const askIndex = this.asks.findIndex((o) => o.id === orderId);
    if (askIndex !== -1) {
      this.asks[askIndex].status = "cancelled";
      this.asks.splice(askIndex, 1);
      return true;
    }

    return false;
  }

  public reset(): void {
    this.bids = [];
    this.asks = [];
    this.trades = [];
    this.lastPrice = 10.0;
  }
}
