import React, { useState } from "react";
import { TransactionFeedItem } from "../types";
import { ExternalLink, Copy, Check, Filter, ScrollText } from "lucide-react";
import { Tooltip } from "../components/Tooltip";

interface ExplorerPageProps {
  feedItems: TransactionFeedItem[];
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({ feedItems }) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTx = (txHash: string, id: string) => {
    navigator.clipboard.writeText(txHash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = feedItems.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full px-4 flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            On-Chain Polygon Amoy Settlement Explorer
            <Tooltip content="Live ledger of all agent trades, escrows, and service completions on-chain." />
          </h2>
          <p className="text-xs text-slate-400">
            Every transaction is cryptographic, verifiable on-chain, and links to Polygonscan Amoy testnet explorer.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
          <Filter className="h-4 w-4 text-slate-400 ml-2" />
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === "all" ? "bg-cyan-950 text-neon-cyan font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setFilterType("trade")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === "trade" ? "bg-cyan-950 text-neon-cyan font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Trades
          </button>
          <button
            onClick={() => setFilterType("service_call")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === "service_call" ? "bg-purple-950 text-purple-300 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Escrow Locks
          </button>
          <button
            onClick={() => setFilterType("escrow_release")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === "escrow_release" ? "bg-emerald-950 text-neon-emerald font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Releases
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Type</th>
                <th className="p-4">Description</th>
                <th className="p-4">Value ($CRED)</th>
                <th className="p-4">Transaction Hash</th>
                <th className="p-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-4 text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] text-neon-cyan uppercase">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-200 font-sans">{item.description}</td>
                    <td className="p-4 text-neon-emerald font-bold">${item.amount.toFixed(2)}</td>
                    <td className="p-4 text-slate-400">
                      {item.txHash ? (
                        <div className="flex items-center gap-1.5">
                          <span>{item.txHash.substring(0, 10)}...{item.txHash.substring(item.txHash.length - 6)}</span>
                          <button
                            onClick={() => handleCopyTx(item.txHash!, item.id)}
                            className="p-1 text-slate-500 hover:text-white rounded"
                            title="Copy Hash"
                          >
                            {copiedId === item.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      ) : (
                        "Pending"
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {item.blockExplorerUrl && (
                        <a
                          href={item.blockExplorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-cyan-950 hover:bg-cyan-900 text-neon-cyan border border-cyan-500/30 px-2.5 py-1 rounded-lg text-[11px] transition-colors"
                        >
                          Polygonscan
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <ScrollText className="h-8 w-8 mx-auto mb-2 text-slate-600 stroke-1" />
                    No transactions matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
