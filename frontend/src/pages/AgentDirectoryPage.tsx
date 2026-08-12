import React, { useState } from "react";
import { AgentState, SimulationState } from "../types";
import { Bot, Cpu, Shield, Zap, Wallet, Award, CheckCircle, X, Terminal, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "../components/Tooltip";

interface AgentDirectoryPageProps {
  simState: SimulationState;
}

export const AgentDirectoryPage: React.FC<AgentDirectoryPageProps> = ({ simState }) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentState | null>(null);

  const getAgentAvatar = (name: string) => {
    switch (name) {
      case "AlphaTrader":
        return <Zap className="h-6 w-6 text-neon-cyan" />;
      case "BetaBuyer":
        return <Shield className="h-6 w-6 text-neon-emerald" />;
      case "OracleNode":
        return <Cpu className="h-6 w-6 text-purple-400" />;
      case "Arbitrageur":
      default:
        return <Bot className="h-6 w-6 text-amber-400" />;
    }
  };

  const getAgentPromptDetails = (name: string) => {
    switch (name) {
      case "AlphaTrader":
        return "System Strategy: High-Frequency Speculative Order Book Trader. Evaluates bids/asks and places aggressive orders around asset price to capture price momentum.";
      case "BetaBuyer":
        return "System Strategy: Conservative Micro-Service Consumer. Evaluates marketplace for data-oracle and task services to outsource compute and analytics.";
      case "OracleNode":
        return "System Strategy: Data Oracle Service Provider. Registers sentiment & market data services on-chain, earning CRED fees for verified data delivery.";
      case "Arbitrageur":
      default:
        return "System Strategy: Cross-Market Spread Arbitrageur. Exploits bid/ask spread discrepancies to rebalance market liquidity and maintain equilibrium.";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full px-4 flex-1">
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            Autonomous Agent Directory
            <Tooltip content="Overview of all AI agents running in the sandbox with active wallets and strategies." />
          </h2>
          <p className="text-xs text-slate-400">
            Click any agent profile card to view LLM reasoning history, wallet receipts, and prompt configuration.
          </p>
        </div>
        <span className="text-xs font-mono text-neon-cyan bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 rounded-lg">
          {simState.agents.length} Registered Agents
        </span>
      </div>

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {simState.agents.map((agent) => (
          <motion.div
            key={agent.id}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedAgent(agent)}
            className="glass-panel hover:glass-panel-glow p-5 rounded-2xl border border-slate-800 cursor-pointer transition-all flex flex-col justify-between gap-4 group relative"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                  {getAgentAvatar(agent.name)}
                </div>
                <span className="text-[10px] font-mono text-neon-cyan bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                  {agent.strategyType.toUpperCase()}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors mb-1">
                {agent.name}
              </h3>
              <p className="text-xs text-slate-400 font-sans mb-3">{agent.persona}</p>

              <div className="bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-400 mb-3 flex items-center justify-between">
                <span>Wallet:</span>
                <span className="text-slate-200">
                  {agent.walletAddress.substring(0, 6)}...{agent.walletAddress.substring(agent.walletAddress.length - 4)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">BALANCE</span>
                  <span className="text-neon-emerald font-bold">${agent.creditBalance.toFixed(1)} CRED</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">REPUTATION</span>
                  <span className="text-purple-300 font-bold">{agent.reputationScore} PTS</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-neon-cyan">
              <span>View Agent Diagnostics</span>
              <span>→</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal Drawer */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-glow max-w-2xl w-full rounded-2xl border border-cyan-500/40 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedAgent(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  {getAgentAvatar(selectedAgent.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedAgent.name}</h3>
                  <p className="text-xs text-slate-400">{selectedAgent.persona}</p>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono mb-4 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]">PROGRAMMATIC ETHERS WALLET</span>
                  <span className="text-cyan-400">{selectedAgent.walletAddress}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">CURRENT BALANCE</span>
                  <span className="text-neon-emerald font-bold">${selectedAgent.creditBalance.toFixed(2)} CRED</span>
                </div>
              </div>

              {/* Strategy & Prompt */}
              <div className="mb-4">
                <h4 className="text-xs font-bold font-mono text-slate-300 mb-1 flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-neon-cyan" />
                  Strategy & Prompt Specification
                </h4>
                <p className="text-xs text-slate-300 bg-obsidian-dark p-3 rounded-xl border border-slate-800 leading-relaxed font-mono">
                  {getAgentPromptDetails(selectedAgent.name)}
                </p>
              </div>

              {/* Reasoning Log */}
              <div className="mb-4">
                <h4 className="text-xs font-bold font-mono text-slate-300 mb-1">
                  Live Agent Decision Log
                </h4>
                <div className="bg-obsidian-dark p-3 rounded-xl border border-slate-800 text-xs font-mono text-neon-cyan">
                  {selectedAgent.lastActionSummary}
                </div>
              </div>

              {/* Historical Service Purchases */}
              <div>
                <h4 className="text-xs font-bold font-mono text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-purple-400" />
                  Escrow & Service Receipts
                </h4>
                <div className="space-y-1.5">
                  {simState.serviceCallsHistory.filter(
                    (c) => c.buyerAgentId === selectedAgent.id || c.providerAgentId === selectedAgent.id
                  ).length > 0 ? (
                    simState.serviceCallsHistory
                      .filter((c) => c.buyerAgentId === selectedAgent.id || c.providerAgentId === selectedAgent.id)
                      .map((call) => (
                        <div key={call.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono flex items-center justify-between">
                          <span className="text-slate-300">Service: {call.serviceType}</span>
                          <span className="text-neon-emerald font-bold">${call.price} CRED</span>
                          <span className="text-slate-500 uppercase text-[10px]">{call.status}</span>
                        </div>
                      ))
                  ) : (
                    <span className="text-xs text-slate-500 font-mono italic">No service receipts logged yet.</span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
