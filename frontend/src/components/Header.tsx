import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Cpu,
  ShieldCheck,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Sparkles,
  Download,
  Menu,
} from "lucide-react";
import { SimulationState } from "../types";
import { HamburgerMenu } from "./HamburgerMenu";

interface HeaderProps {
  isConnected: boolean;
  simState: SimulationState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onInjectShock: () => void;
  onSeedDemo: () => void;
  onExportLogs: () => void;
  onTickRateChange: (ms: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  simState,
  onStart,
  onPause,
  onReset,
  onInjectShock,
  onSeedDemo,
  onExportLogs,
  onTickRateChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isWorkspace = location.pathname === "/sandbox";

  return (
    <>
      <header className="w-full glass-panel border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-50">
        {/* Left: Branding Logo Only */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-neon-cyan group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-obsidian rounded-[10px] flex items-center justify-center">
              <Cpu className="h-5 w-5 text-neon-cyan animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-neon-cyan bg-clip-text text-transparent">
              AgentX Sandbox
            </h1>
            <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">
              Machine Economy Sim
            </span>
          </div>
        </NavLink>

        {/* Workspace Active Simulation Control Panel Toolbar (Visible in /sandbox) */}
        {isWorkspace && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800">
              <Activity className="h-3.5 w-3.5 text-neon-cyan" />
              <span className="text-slate-400">Tick:</span>
              <span className="text-white font-bold">#{simState.tickCount}</span>
            </div>

            <button
              onClick={onSeedDemo}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-obsidian font-bold px-3 py-1 rounded-lg text-xs shadow-neon-cyan transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 fill-obsidian" />
              ⚡ Seed Demo Scenario (3-Min)
            </button>

            <button
              onClick={onInjectShock}
              className="flex items-center gap-1 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300" />
              💥 Inject Shock
            </button>

            {simState.isRunning ? (
              <button
                onClick={onPause}
                className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-semibold cursor-pointer"
              >
                <Pause className="h-3.5 w-3.5 fill-amber-400" /> Pause
              </button>
            ) : (
              <button
                onClick={onStart}
                className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-semibold cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-emerald-400" /> Start
              </button>
            )}

            <button
              onClick={onReset}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
              title="Reset Simulation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <select
              value={simState.tickIntervalMs}
              onChange={(e) => onTickRateChange(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value={1000}>1s Tick</option>
              <option value={2000}>2s Tick</option>
              <option value={5000}>5s Tick</option>
            </select>

            <button
              onClick={onExportLogs}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Export Run JSON Log"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Right: Network Status Pill & Hamburger Menu Trigger Icon */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-neon-emerald" />
            <span className="text-neon-emerald font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-emerald animate-ping" />
              Polygon Amoy
            </span>
          </div>

          {/* Hamburger Drawer Icon Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 text-slate-200 border border-slate-800/80 hover:border-cyan-500/40 transition-all shadow-sm cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu className="h-5 w-5 text-neon-cyan" />
          </button>
        </div>
      </header>

      {/* Slide-over Hamburger Drawer Menu */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};
