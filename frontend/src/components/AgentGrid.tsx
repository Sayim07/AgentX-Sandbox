import React from "react";
import { AgentState } from "../types";
import { Bot, Cpu, Shield, Zap, Wallet, Award, CheckCircle } from "lucide-react";

interface AgentGridProps {
  agents: AgentState[];
}

export const AgentGrid: React.FC<AgentGridProps> = ({ agents }) => {
  const getAgentAvatar = (name: string) => {
    switch (name) {
      case "AlphaTrader":
        return <Zap className="h-5 w-5 text-neon-cyan" />;
      case "BetaBuyer":
        return <Shield className="h-5 w-5 text-neon-emerald" />;
      case "OracleNode":
        return <Cpu className="h-5 w-5 text-purple-400" />;
      case "Arbitrageur":
      default:
        return <Bot className="h-5 w-5 text-amber-400" />;
    }
  };

  const getStrategyBadge = (strategy: string) => {
    if (strategy === "llm") {
      return (
        <span className="bg-gradient-to-r from-cyan-950 to-blue-950 text-neon-cyan border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
          Groq Llama 3 AI
        </span>
      );
    }
    return (
      <span className="bg-slate-900 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded text-[10px] font-mono">
        Deterministic Rule Engine
      </span>
    );
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 p-4 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-neon-emerald border border-emerald-500/20">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Autonomous Agent Inventory</h3>
            <p className="text-[11px] text-slate-400">Agent Wallets, Balances, & Reasoning State</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-neon-emerald bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
          {agents.length} Active Agents
        </span>
      </div>

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[320px] pr-1">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-obsidian-dark/90 hover:bg-slate-900/90 transition-all rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between gap-2.5 group"
          >
            {/* Header: Avatar, Name & Strategy */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                  {getAgentAvatar(agent.name)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-neon-cyan transition-colors">
                    {agent.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">{agent.persona}</p>
                </div>
              </div>
              {getStrategyBadge(agent.strategyType)}
            </div>

            {/* Wallet Address Preview */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/60 text-[10px] font-mono text-slate-400">
              <Wallet className="h-3 w-3 text-slate-500" />
              <span>
                {agent.walletAddress.substring(0, 6)}...{agent.walletAddress.substring(agent.walletAddress.length - 4)}
              </span>
            </div>

            {/* Balance & Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800/40 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 text-[9px] block uppercase">Balance</span>
                <span className="text-neon-emerald font-bold">${agent.creditBalance.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] block uppercase">Reputation</span>
                <span className="text-purple-300 font-semibold flex items-center gap-1">
                  <Award className="h-3 w-3 text-purple-400" />
                  {agent.reputationScore}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] block uppercase">Services</span>
                <span className="text-cyan-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-cyan-400" />
                  {agent.servicesCompleted}
                </span>
              </div>
            </div>

            {/* Reasoning Summary */}
            <div className="bg-obsidian/90 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
              <span className="text-[9px] font-mono text-slate-500 block uppercase mb-0.5">
                Last Reasoning Log
              </span>
              <p className="text-[10px] text-slate-300 font-mono line-clamp-2">
                {agent.lastActionSummary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
