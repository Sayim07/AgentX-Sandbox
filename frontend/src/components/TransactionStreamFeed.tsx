import React, { useState } from "react";
import { TransactionFeedItem } from "../types";
import { ExternalLink, Copy, Check, ScrollText, ArrowUpRight, Lock, CheckCircle2 } from "lucide-react";

interface TransactionStreamFeedProps {
  feedItems: TransactionFeedItem[];
}

export const TransactionStreamFeed: React.FC<TransactionStreamFeedProps> = ({ feedItems }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTx = (txHash: string, id: string) => {
    navigator.clipboard.writeText(txHash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBadgeStyle = (type: TransactionFeedItem["type"]) => {
    switch (type) {
      case "trade":
        return {
          bg: "bg-cyan-950/80 border-cyan-500/30 text-neon-cyan",
          icon: <ArrowUpRight className="h-3.5 w-3.5" />,
          label: "On-Chain Trade",
        };
      case "service_call":
        return {
          bg: "bg-purple-950/80 border-purple-500/30 text-purple-300",
          icon: <Lock className="h-3.5 w-3.5" />,
          label: "Escrow Locked",
        };
      case "escrow_release":
        return {
          bg: "bg-emerald-950/80 border-emerald-500/30 text-neon-emerald",
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          label: "Escrow Released",
        };
      default:
        return {
          bg: "bg-slate-800 border-slate-700 text-slate-300",
          icon: <ScrollText className="h-3.5 w-3.5" />,
          label: "Settlement",
        };
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 p-4 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ScrollText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">On-Chain Settlement Feed</h3>
            <p className="text-[11px] text-slate-400">Live Agent Transaction & Smart Contract Log Stream</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-md">
          {feedItems.length} Verified Txs
        </span>
      </div>

      {/* Feed List Container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[320px]">
        {feedItems.length > 0 ? (
          feedItems.map((item) => {
            const badge = getBadgeStyle(item.type);
            return (
              <div
                key={item.id}
                className="bg-obsidian-dark/90 hover:bg-slate-900/90 transition-all rounded-xl p-3 border border-slate-800/80 flex flex-col gap-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${badge.bg}`}>
                    {badge.icon}
                    {badge.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/50 text-[11px] font-mono">
                  <span className="text-slate-400 font-semibold">
                    Amount: <span className="text-neon-emerald">${item.amount.toFixed(2)} CRED</span>
                  </span>

                  {item.txHash && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyTx(item.txHash!, item.id)}
                        className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded"
                        title="Copy Tx Hash"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span className="text-[10px]">
                          {item.txHash.substring(0, 6)}...{item.txHash.substring(item.txHash.length - 4)}
                        </span>
                      </button>

                      {item.blockExplorerUrl && (
                        <a
                          href={item.blockExplorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.5 rounded text-[10px]"
                        >
                          Explorer
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 font-mono text-xs">
            <ScrollText className="h-8 w-8 text-slate-600 mb-2 stroke-1" />
            Waiting for simulation transaction ticks...
          </div>
        )}
      </div>
    </div>
  );
};
