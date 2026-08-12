import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Position,
  Handle,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SimulationState } from "../types";
import { Network, Bot } from "lucide-react";

interface AgentNetworkGraphProps {
  simState: SimulationState;
}

// Custom Custom Node Component for Cyberpunk Fintech Look
const AgentNodeComponent = ({ data }: { data: any }) => {
  return (
    <div className="glass-panel-glow px-4 py-3 rounded-xl border border-cyan-500/40 min-w-[180px] shadow-neon-cyan relative">
      <Handle type="target" position={Position.Top} className="!bg-neon-cyan !w-3 !h-3" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-neon-cyan">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white tracking-wide">{data.label}</h4>
          <span className="text-[10px] text-slate-400 font-mono block">{data.persona}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
        <span className="text-slate-400">Balance:</span>
        <span className="text-neon-emerald font-bold">${data.balance?.toFixed(1) ?? '0.0'} CRED</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-neon-emerald !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = {
  agentNode: AgentNodeComponent,
};

export const AgentNetworkGraph: React.FC<AgentNetworkGraphProps> = ({ simState }) => {
  // Map simulation agents to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    const defaultPositions: Record<string, { x: number; y: number }> = {
      "agent-1": { x: 40, y: 30 },
      "agent-2": { x: 280, y: 30 },
      "agent-3": { x: 40, y: 190 },
      "agent-4": { x: 280, y: 190 },
    };

    return simState.agents.map((agent) => ({
      id: agent.id,
      type: "agentNode",
      position: defaultPositions[agent.id] || { x: 100, y: 100 },
      data: {
        label: agent.name,
        persona: agent.persona,
        balance: agent.creditBalance,
      },
    }));
  }, [simState.agents]);

  // Map simulation interaction graph edges
  const edges: Edge[] = useMemo(() => {
    return simState.networkGraph.edges.map((e, index) => {
      const isTrade = e.type === "trade";
      return {
        id: e.id || `edge-${index}`,
        source: e.source,
        target: e.target,
        animated: true,
        label: e.label,
        style: {
          stroke: isTrade ? "#00F0FF" : "#00FF9D",
          strokeWidth: 2,
        },
        labelStyle: {
          fill: isTrade ? "#00F0FF" : "#00FF9D",
          fontSize: 10,
          fontFamily: "JetBrains Mono",
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: "#090D16",
          fillOpacity: 0.85,
        },
      };
    });
  }, [simState.networkGraph.edges]);

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 p-4 flex flex-col h-full min-h-[360px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-neon-cyan border border-cyan-500/20">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Agent Network Topology</h3>
            <p className="text-[11px] text-slate-400">Live Agent-to-Agent Micro-Service & Trade Graph</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-neon-cyan bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md">
          {nodes.length} Nodes Active
        </span>
      </div>

      <div className="flex-1 w-full rounded-xl overflow-hidden bg-obsidian-dark border border-slate-800/60 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1E293B" />
          <Controls className="!bg-obsidian-card !border-slate-800 !text-slate-300 fill-slate-300" />
        </ReactFlow>
      </div>
    </div>
  );
};
