import React, { useState } from "react";
import { SimulationState } from "../types";
import { AgentNetworkGraph } from "../components/AgentNetworkGraph";
import { PriceChartOrderBook } from "../components/PriceChartOrderBook";
import { TransactionStreamFeed } from "../components/TransactionStreamFeed";
import { AgentGrid } from "../components/AgentGrid";
import { Tooltip } from "../components/Tooltip";
import { Network, TrendingUp, ScrollText, Bot, Layers, Activity } from "lucide-react";

interface SandboxPageProps {
  simState: SimulationState;
}

export const SandboxPage: React.FC<SandboxPageProps> = ({ simState }) => {
  const [activeTab, setActiveTab] = useState<"network" | "exchange" | "settlement" | "roster">("network");

  const totalEscrowed = simState.serviceCallsHistory
    .filter((c) => c.status === "escrowed")
    .reduce((acc, c) => acc + c.price, 0);

  return (
    <div className="flex flex-col gap-6 max-w-[1800px] mx-auto w-full px-4 flex-1">
      {/* Top Bar Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
          <div>
            <span className="text-xs text-slate-400 flex items-center">
              Spot Price ($CRED) <Tooltip content="Current market price derived from bid/ask order matching." />
            </span>
            <span className="text-lg font-bold text-neon-cyan">${simState.marketPrice.toFixed(2)} CRED</span>
          </div>
          <TrendingUp className="h-6 w-6 text-neon-cyan opacity-80" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
          <div>
            <span className="text-xs text-slate-400 flex items-center">
              Total Escrowed Tokens <Tooltip content="Funds currently held in TradeEscrow.sol contract." />
            </span>
            <span className="text-lg font-bold text-amber-400">${totalEscrowed.toFixed(2)} CRED</span>
          </div>
          <Layers className="h-6 w-6 text-amber-400 opacity-80" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
          <div>
            <span className="text-xs text-slate-400 flex items-center">
              Network Health <Tooltip content="Polygon Amoy testnet RPC connection status." />
            </span>
            <span className="text-lg font-bold text-neon-emerald flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon-emerald animate-ping" />
              100% Operational
            </span>
          </div>
          <Activity className="h-6 w-6 text-neon-emerald opacity-80" />
        </div>
      </div>

      {/* 4 Workspace Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 flex-wrap">
          <button
            onClick={() => setActiveTab("network")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === "network"
                ? "bg-cyan-950 text-neon-cyan font-bold border border-cyan-500/30 shadow-neon-cyan"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="h-4 w-4" />
            Agent Network Topology
          </button>

          <button
            onClick={() => setActiveTab("exchange")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === "exchange"
                ? "bg-cyan-950 text-neon-cyan font-bold border border-cyan-500/30 shadow-neon-cyan"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Live Exchange & Order Book
          </button>

          <button
            onClick={() => setActiveTab("settlement")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === "settlement"
                ? "bg-purple-950 text-purple-300 font-bold border border-purple-500/30 shadow-neon-purple"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ScrollText className="h-4 w-4" />
            On-Chain Settlement Stream
          </button>

          <button
            onClick={() => setActiveTab("roster")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === "roster"
                ? "bg-emerald-950 text-neon-emerald font-bold border border-emerald-500/30 shadow-neon-emerald"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="h-4 w-4" />
            Autonomous Agent Roster
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400 px-1">
          Active Tab: <span className="text-white capitalize">{activeTab}</span>
        </div>
      </div>

      {/* Main Viewport Content */}
      <div className="flex-1 min-h-[580px]">
        {activeTab === "network" && (
          <div className="h-[580px] w-full">
            <AgentNetworkGraph simState={simState} />
          </div>
        )}

        {activeTab === "exchange" && (
          <div className="h-[580px] w-full">
            <PriceChartOrderBook simState={simState} />
          </div>
        )}

        {activeTab === "settlement" && (
          <div className="h-[580px] w-full">
            <TransactionStreamFeed feedItems={simState.transactionFeed} />
          </div>
        )}

        {activeTab === "roster" && (
          <div className="h-[580px] w-full">
            <AgentGrid agents={simState.agents} />
          </div>
        )}
      </div>
    </div>
  );
};
