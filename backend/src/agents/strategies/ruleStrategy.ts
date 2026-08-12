import { AgentDecision } from "./groqReasoning";

export function getRuleBasedDecision(
  strategyType: string,
  persona: string,
  agentName: string,
  creditBalance: number,
  marketPrice: number,
  availableServices: { id: string; serviceType: string; price: number; providerAgentId: string }[],
  agentId: string
): AgentDecision {
  const rand = Math.random();

  // If balance is critically low, hold or sell assets
  if (creditBalance < 20) {
    return {
      action: "sell",
      quantity: 10,
      price: Number((marketPrice * 1.05).toFixed(2)),
      reasoning: "Low balance threshold reached; liquidating asset inventory to raise CRED liquidity.",
    };
  }

  switch (strategyType) {
    case "rule_trader": {
      // Aggressive Trader persona: 45% buy, 45% sell, 10% hire service
      if (rand < 0.45) {
        const targetPrice = Number((marketPrice * (0.97 + Math.random() * 0.05)).toFixed(2));
        return {
          action: "buy",
          quantity: Math.floor(5 + Math.random() * 20),
          price: Math.max(0.5, targetPrice),
          reasoning: `Aggressive buy order placed at ${targetPrice} CRED anticipating upward price momentum.`,
        };
      } else if (rand < 0.90) {
        const targetPrice = Number((marketPrice * (0.98 + Math.random() * 0.06)).toFixed(2));
        return {
          action: "sell",
          quantity: Math.floor(5 + Math.random() * 20),
          price: targetPrice,
          reasoning: `Limit sell order placed at ${targetPrice} CRED to lock in trading margins.`,
        };
      } else {
        const hireable = availableServices.filter((s) => s.providerAgentId !== agentId);
        if (hireable.length > 0) {
          const srv = hireable[Math.floor(Math.random() * hireable.length)];
          return {
            action: "hire_service",
            serviceId: srv.id,
            reasoning: `Purchasing ${srv.serviceType} micro-service to optimize trading algorithms.`,
          };
        }
      }
      break;
    }

    case "rule_buyer": {
      // Service Buyer persona: high preference for hiring services
      const hireable = availableServices.filter((s) => s.providerAgentId !== agentId && creditBalance >= s.price);
      if (rand < 0.65 && hireable.length > 0) {
        const srv = hireable[Math.floor(Math.random() * hireable.length)];
        return {
          action: "hire_service",
          serviceId: srv.id,
          reasoning: `Contracting ${srv.serviceType} service from provider agent for task delegation.`,
        };
      } else if (rand < 0.85) {
        const targetPrice = Number((marketPrice * 0.96).toFixed(2));
        return {
          action: "buy",
          quantity: 10,
          price: Math.max(0.5, targetPrice),
          reasoning: `Accumulating ${targetPrice} CRED position for future service purchases.`,
        };
      }
      break;
    }

    case "rule_oracle": {
      // Oracle / Provider persona: mostly trades or offers services
      if (rand < 0.50) {
        const targetPrice = Number((marketPrice * 0.99).toFixed(2));
        return {
          action: "buy",
          quantity: 15,
          price: targetPrice,
          reasoning: "Providing buy liquidity to maintain active market presence.",
        };
      } else if (rand < 0.80) {
        const targetPrice = Number((marketPrice * 1.03).toFixed(2));
        return {
          action: "sell",
          quantity: 15,
          price: targetPrice,
          reasoning: "Selling token reserves to rebalance oracle operational treasury.",
        };
      }
      break;
    }

    case "rule_arbitrage":
    default: {
      // Arbitrageur persona: exploits price variance
      const spreadModifier = (Math.random() - 0.5) * 0.08;
      const targetPrice = Number((marketPrice * (1 + spreadModifier)).toFixed(2));
      const action = spreadModifier < 0 ? "buy" : "sell";
      return {
        action,
        quantity: 25,
        price: Math.max(0.5, targetPrice),
        reasoning: `Executing arbitrage ${action} order at ${targetPrice} CRED based on order book spread analysis.`,
      };
    }
  }

  return {
    action: "hold",
    reasoning: "Observing market dynamics; no immediate trade condition met.",
  };
}
