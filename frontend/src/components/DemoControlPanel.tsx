import React from "react";
import { Sparkles, Zap, Download, Info, ShieldAlert } from "lucide-react";

interface DemoControlPanelProps {
  onSeedDemo: () => void;
  onInjectShock: () => void;
  onExportLogs: () => void;
}

export const DemoControlPanel: React.FC<DemoControlPanelProps> = ({
  onSeedDemo,
  onInjectShock,
  onExportLogs,
}) => {
  return (
    <div className="glass-panel-glow rounded-2xl border border-cyan-500/30 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left Title & Status */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-obsidian font-bold shadow-neon-cyan">
          <Sparkles className="h-5 w-5 fill-obsidian" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Hackathon Judge Demo Control Suite
            <span className="text-[10px] font-mono bg-cyan-950 text-neon-cyan border border-cyan-500/30 px-2 py-0.5 rounded">
              3-Min Scripted Scenario
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            One-click triggers to showcase price discovery, micro-service escrows, and AI agent reasoning
          </p>
        </div>
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onSeedDemo}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-obsidian font-bold px-4 py-2 rounded-xl text-xs shadow-neon-cyan transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="h-4 w-4 fill-obsidian animate-spin-slow" />
          Seed Demo Scenario
        </button>

        <button
          onClick={onInjectShock}
          className="flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold px-3.5 py-2 rounded-xl text-xs shadow-neon-purple transition-all active:scale-95 cursor-pointer"
        >
          <Zap className="h-4 w-4 text-yellow-300 fill-yellow-300" />
          Inject Market Shock
        </button>

        <button
          onClick={onExportLogs}
          className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all active:scale-95 cursor-pointer"
          title="Export simulation run event log as JSON for post-run audit"
        >
          <Download className="h-4 w-4 text-cyan-400" />
          Export JSON Log
        </button>
      </div>
    </div>
  );
};
