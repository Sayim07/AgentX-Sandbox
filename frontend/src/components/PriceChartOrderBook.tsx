import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { TrendingUp, Layers } from "lucide-react";
import { SimulationState } from "../types";

interface PriceChartOrderBookProps {
  simState: SimulationState;
}

export const PriceChartOrderBook: React.FC<PriceChartOrderBookProps> = ({ simState }) => {
  const chartData = simState.priceHistory.map((p) => ({
    time: new Date(p.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    price: p.price,
    volume: p.volume,
  }));

  const bids = simState.orderBook.bids.slice(0, 5);
  const asks = simState.orderBook.asks.slice(0, 5);

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 p-4 flex flex-col h-full gap-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-neon-emerald border border-emerald-500/20">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">$CRED Token Price Curve</h3>
            <p className="text-[11px] text-slate-400">Live Asset Exchange Rate & Order Book Depth</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-400 block">Spot Price</span>
          <span className="text-base font-bold font-mono text-neon-emerald">
            ${simState.marketPrice.toFixed(2)} CRED
          </span>
        </div>
      </div>

      {/* Recharts Area Price Chart */}
      <div className="h-48 w-full bg-obsidian-dark/80 rounded-xl p-2 border border-slate-800/60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#475569"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              orientation="right"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                borderColor: "#00F0FF",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "JetBrains Mono",
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#00F0FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Order Book Depth Visualizer */}
      <div className="flex-1 bg-obsidian-dark/90 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800">
          <Layers className="h-3.5 w-3.5 text-neon-cyan" />
          <span className="text-xs font-bold font-mono text-slate-300">Order Book Depth</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
          {/* Bids Column */}
          <div>
            <div className="flex justify-between text-slate-500 mb-1 font-semibold border-b border-slate-800/50 pb-0.5">
              <span>BID (QTY)</span>
              <span>PRICE</span>
            </div>
            <div className="space-y-1">
              {bids.length > 0 ? (
                bids.map((b) => (
                  <div key={b.id} className="flex justify-between items-center bg-emerald-950/20 px-2 py-0.5 rounded border-l-2 border-neon-emerald">
                    <span className="text-slate-300">{b.quantity}</span>
                    <span className="text-neon-emerald font-bold">${b.price.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-600 italic text-[10px] block py-1">No active bids</span>
              )}
            </div>
          </div>

          {/* Asks Column */}
          <div>
            <div className="flex justify-between text-slate-500 mb-1 font-semibold border-b border-slate-800/50 pb-0.5">
              <span>PRICE</span>
              <span>ASK (QTY)</span>
            </div>
            <div className="space-y-1">
              {asks.length > 0 ? (
                asks.map((a) => (
                  <div key={a.id} className="flex justify-between items-center bg-rose-950/20 px-2 py-0.5 rounded border-r-2 border-rose-500">
                    <span className="text-rose-400 font-bold">${a.price.toFixed(2)}</span>
                    <span className="text-slate-300">{a.quantity}</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-600 italic text-[10px] block py-1">No active asks</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
