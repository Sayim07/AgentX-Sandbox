import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { SimulationState } from "../types";

const BACKEND_URL = "http://localhost:5000";

const defaultState: SimulationState = {
  isRunning: false,
  tickCount: 0,
  tickIntervalMs: 2000,
  marketPrice: 10.0,
  priceHistory: [
    { timestamp: Date.now() - 10000, price: 10.0, volume: 0 },
    { timestamp: Date.now(), price: 10.0, volume: 0 },
  ],
  orderBook: { bids: [], asks: [] },
  tradesHistory: [],
  serviceListings: [],
  serviceCallsHistory: [],
  agents: [],
  transactionFeed: [],
  networkGraph: { nodes: [], edges: [] },
};

export function useSimulationSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [simState, setSimState] = useState<SimulationState>(defaultState);

  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("[Socket.io] Connected to backend orchestrator");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("[Socket.io] Disconnected from backend orchestrator");
      setIsConnected(false);
    });

    newSocket.on("tick_update", (state: SimulationState) => {
      setSimState(state);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startSimulation = useCallback(() => {
    socket?.emit("start_simulation");
  }, [socket]);

  const pauseSimulation = useCallback(() => {
    socket?.emit("pause_simulation");
  }, [socket]);

  const resetSimulation = useCallback(() => {
    socket?.emit("reset_simulation");
  }, [socket]);

  const injectShock = useCallback(() => {
    socket?.emit("inject_shock");
  }, [socket]);

  const seedDemoScenario = useCallback(() => {
    socket?.emit("seed_demo_scenario");
  }, [socket]);

  const setTickRate = useCallback(
    (intervalMs: number) => {
      socket?.emit("set_tick_rate", intervalMs);
    },
    [socket]
  );

  const exportLogsJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simState, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `agentx-sim-run-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [simState]);

  return {
    isConnected,
    simState,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    injectShock,
    seedDemoScenario,
    setTickRate,
    exportLogsJSON,
  };
}
