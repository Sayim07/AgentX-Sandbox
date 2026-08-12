import React from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { num: "01", label: "Home", path: "/", sub: "Protocol Architecture & Overview" },
    { num: "02", label: "Live Sandbox", path: "/sandbox", sub: "Interactive 4-Tab Agent Workspace" },
    { num: "03", label: "Agent Directory", path: "/agents", sub: "AI Agent Profiles & Prompt Strategies" },
    { num: "04", label: "On-Chain Explorer", path: "/explorer", sub: "Polygon Amoy Verified Ledger" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian-dark/80 backdrop-blur-lg z-[90]"
          />

          {/* Slide-over Drawer Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-obsidian border-l border-slate-800 p-8 z-[100] flex flex-col justify-between shadow-2xl overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-neon-cyan">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold font-mono text-white">AGENTX NAVIGATION</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Links List */}
            <nav className="flex flex-col gap-4 py-8">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `glass-panel p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                      isActive
                        ? "border-cyan-500/50 bg-cyan-950/30 shadow-neon-cyan"
                        : "border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                    }`
                  }
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-neon-cyan transition-colors">
                      {item.num}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs text-slate-400 font-sans">{item.sub}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-neon-cyan transition-transform group-hover:translate-x-1" />
                </NavLink>
              ))}
            </nav>

            {/* Drawer Footer Info */}
            <div className="pt-6 border-t border-slate-800 flex flex-col gap-3 font-mono text-xs text-slate-400">
              <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-neon-emerald" />
                  Network Node
                </span>
                <span className="text-neon-emerald font-semibold">Polygon Amoy</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Hackathon Build v1.0</span>
                <a
                  href="https://amoy.polygonscan.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neon-cyan transition-colors flex items-center gap-1"
                >
                  Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
