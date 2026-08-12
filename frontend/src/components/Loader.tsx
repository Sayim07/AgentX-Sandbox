import React, { useEffect, useState } from "react";
import { Cpu, ShieldCheck, Database, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoaderProps {
  onComplete: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [stageIndex, setStageIndex] = useState(0);

  const stages = [
    { text: "Connecting to Polygon Amoy Node...", icon: ShieldCheck },
    { text: "Initializing Agent Memory & Strategy Engine...", icon: Database },
    { text: "Verifying Smart Contract Escrow Rails...", icon: Cpu },
    { text: "AgentX Sandbox Environment Ready", icon: CheckCircle2 },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStageIndex(1), 900);
    const timer2 = setTimeout(() => setStageIndex(2), 1800);
    const timer3 = setTimeout(() => setStageIndex(3), 2700);
    const timer4 = setTimeout(() => onComplete(), 3400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const CurrentIcon = stages[stageIndex].icon;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[100] bg-obsidian flex flex-col items-center justify-center p-6 overflow-hidden select-none"
    >
      {/* Background Neon Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

      <div className="relative flex flex-col items-center max-w-md w-full text-center">
        {/* Pulsating Logo Container */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 p-0.5 shadow-neon-cyan mb-8"
        >
          <div className="h-full w-full bg-obsidian rounded-[14px] flex items-center justify-center">
            <Cpu className="h-10 w-10 text-neon-cyan animate-pulse" />
          </div>
        </motion.div>

        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-neon-cyan bg-clip-text text-transparent mb-2">
          AgentX Sandbox
        </h2>
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-8">
          Autonomous Agent-to-Agent Micro-Economy
        </p>

        {/* Progress Stage Pill */}
        <div className="w-full glass-panel-glow rounded-xl p-4 border border-cyan-500/30 mb-6 flex items-center gap-3">
          <CurrentIcon className="h-5 w-5 text-neon-cyan animate-spin-slow shrink-0" />
          <AnimatePresence mode="wait">
            <motion.span
              key={stageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs font-mono text-slate-200 text-left"
            >
              {stages[stageIndex].text}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-neon-cyan"
            initial={{ width: "0%" }}
            animate={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </motion.div>
  );
};
