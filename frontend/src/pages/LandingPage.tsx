import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  ShoppingBag,
  Lock,
  ShieldCheck,
  Zap,
  Clock,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { SimulationState } from "../types";
import { Hero3DCanvas } from "../components/Hero3DCanvas";
import { Tooltip } from "../components/Tooltip";

interface LandingPageProps {
  simState: SimulationState;
  onSeedDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ simState, onSeedDemo }) => {
  const steps = [
    {
      num: "01",
      title: "Autonomous Reasoning",
      icon: Brain,
      color: "text-neon-cyan border-cyan-500/30 bg-cyan-950/40",
      desc: "Each agent independently evaluates market depth using Groq API (Llama 3 70B) or rule fallbacks.",
      tooltip: "Agents make economic decisions every tick without human mediation.",
    },
    {
      num: "02",
      title: "Decentralized Service Discovery",
      icon: ShoppingBag,
      color: "text-purple-400 border-purple-500/30 bg-purple-950/40",
      desc: "Agents list and discover specialized micro-services (oracles, task-workers, sentiment feeds) on-chain.",
      tooltip: "Agents hire other agents for specialized sub-tasks.",
    },
    {
      num: "03",
      title: "Smart Contract Escrow Lock",
      icon: Lock,
      color: "text-amber-400 border-amber-500/30 bg-amber-950/40",
      desc: "Payment tokens ($CRED) are automatically locked in TradeEscrow.sol until deliverable verification.",
      tooltip: "Ensures trustless execution between autonomous AI entities.",
    },
    {
      num: "04",
      title: "On-Chain Settlement",
      icon: ShieldCheck,
      color: "text-neon-emerald border-emerald-500/30 bg-emerald-950/40",
      desc: "Transactions log directly on Polygon Amoy testnet with verifiable hashes and Polygonscan badges.",
      tooltip: "Every trade is independently traceable on Polygonscan.",
    },
  ];

  return (
    <div className="flex flex-col gap-20 pb-16 max-w-[1400px] mx-auto w-full px-4 relative">
      {/* 3D Interactive Particle & Canvas Hero Backdrop */}
      <Hero3DCanvas />

      {/* 3D Hero Section */}
      <section className="relative pt-16 pb-12 flex flex-col items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-neon-cyan text-xs font-mono mb-6 shadow-neon-cyan backdrop-blur-md"
        >
          <Cpu className="h-3.5 w-3.5 text-neon-cyan animate-pulse" />
          Web3 + Agentic AI Hackathon Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight bg-gradient-to-r from-white via-slate-100 to-neon-cyan bg-clip-text text-transparent mb-6 drop-shadow-sm"
        >
          The Autonomous Agent-to-Agent Micro-Economy
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-slate-400 max-w-3xl font-sans mb-10 leading-relaxed drop-shadow-sm"
        >
          A simulated digital economy where autonomous AI agents independently trade assets, execute paid micro-services, and settle trustlessly on smart contracts.
        </motion.p>

        {/* Primary Hero CTA: "Get Started →" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          <NavLink
            to="/sandbox"
            className="flex items-center gap-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-obsidian font-extrabold px-8 py-4 rounded-2xl text-base shadow-neon-cyan transition-all transform hover:-translate-y-1 cursor-pointer"
          >
            Get Started →
          </NavLink>

          <button
            onClick={onSeedDemo}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 px-6 py-4 rounded-2xl text-sm font-mono transition-all transform hover:-translate-y-1 cursor-pointer backdrop-blur-md"
          >
            <Zap className="h-4 w-4 text-yellow-300 fill-yellow-300" />
            Seed 3-Min Hackathon Demo
          </button>
        </motion.div>
      </section>

      {/* Section 1: Scroll Reveal - "The Machine Economy Problem" */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-800 relative z-10 overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-mono uppercase text-neon-cyan font-bold tracking-widest block mb-2">
              WHY AGENT-TO-AGENT ECONOMIES MATTER
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4 leading-snug">
              Human Mediation Does Not Scale for Machine Commerce
            </h2>
            <p className="text-sm text-slate-400 font-sans leading-relaxed mb-6">
              As populations of autonomous AI agents expand, they must trade data, compute, and sub-services directly without human intervention. Legacy payment systems are slow, manual, and centralized.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3 bg-rose-950/30 p-3 rounded-xl border border-rose-500/20 text-rose-300">
                <Clock className="h-5 w-5 text-rose-400 shrink-0" />
                <span>Human Settlement Latency: <strong>3 to 5 Business Days</strong></span>
              </div>
              <div className="flex items-center gap-3 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20 text-neon-emerald">
                <CheckCircle2 className="h-5 w-5 text-neon-emerald shrink-0" />
                <span>AgentX On-Chain Settlement: <strong>Sub-Second Smart Contracts</strong></span>
              </div>
            </div>
          </div>

          <div className="bg-obsidian-dark/90 p-6 rounded-2xl border border-slate-800 font-mono text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">BENCHMARK COMPARISON</span>
              <span className="text-neon-cyan">REAL-TIME SIMULATION</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Agent Decision Loop</span>
                <span className="text-neon-emerald">2.0s / Tick</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Escrow Locking (`TradeEscrow.sol`)</span>
                <span className="text-neon-cyan">Automated</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>LLM Reasoning Latency (Groq)</span>
                <span className="text-purple-300">~1.2s</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 2: Scroll Reveal - "Interactive 4-Step Protocol Flow" */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-8 relative z-10"
      >
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-mono uppercase text-neon-cyan font-bold tracking-widest block mb-2">
            ARCHITECTURE PIPELINE
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
            Interactive 4-Step Protocol Flow
          </h2>
          <p className="text-xs text-slate-400">
            Hover over cards to inspect how the autonomous agent lifecycle executes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.num}
                whileHover={{ y: -6 }}
                className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-500">{step.num}</span>
                    <div className={`p-2.5 rounded-xl border ${step.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors flex items-center">
                    {step.title}
                    <Tooltip content={step.tooltip} />
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Section 3: Live Protocol Analytics Ticker */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="glass-panel p-6 rounded-3xl border border-slate-800 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-neon-cyan">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Live Protocol Analytics</h3>
            <p className="text-xs text-slate-400 font-mono">Real-time state snapshot from Socket.io orchestrator</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 font-mono text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">SPOT PRICE</span>
            <span className="text-neon-cyan font-bold text-sm">${simState.marketPrice.toFixed(2)} CRED</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">EXECUTED TRADES</span>
            <span className="text-neon-emerald font-bold text-sm">{simState.tradesHistory.length}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">ESCROWS LOGGED</span>
            <span className="text-purple-300 font-bold text-sm">{simState.serviceCallsHistory.length}</span>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
