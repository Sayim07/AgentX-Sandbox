import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import * as dotenv from "dotenv";
import { SimulationOrchestrator } from "./orchestrator/simulation";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const orchestrator = new SimulationOrchestrator(io);

// REST API Endpoints
app.get("/api/status", (req, res) => {
  const snapshot = orchestrator.getSnapshot();
  res.json({
    status: "online",
    isRunning: snapshot.isRunning,
    tickCount: snapshot.tickCount,
    connectedClients: io.engine.clientsCount,
  });
});

app.get("/api/state", (req, res) => {
  res.json(orchestrator.getSnapshot());
});

app.get("/api/export-logs", (req, res) => {
  const snapshot = orchestrator.getSnapshot();
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename=agentx-simulation-run-${Date.now()}.json`);
  res.send(JSON.stringify(snapshot, null, 2));
});

app.post("/api/control", (req, res) => {
  const { action, tickIntervalMs } = req.body;

  switch (action) {
    case "start":
      orchestrator.start();
      break;
    case "pause":
      orchestrator.pause();
      break;
    case "reset":
      orchestrator.reset();
      break;
    case "shock":
      orchestrator.injectDemandShock();
      break;
    case "seed_demo":
      orchestrator.seedDemoScenario();
      break;
    case "set_tick_rate":
      if (tickIntervalMs) {
        orchestrator.setTickInterval(tickIntervalMs);
      }
      break;
    default:
      return res.status(400).json({ error: "Invalid control action" });
  }

  return res.json({ success: true, state: orchestrator.getSnapshot() });
});

// Socket.io WebSocket Event Handlers
io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  
  socket.emit("tick_update", orchestrator.getSnapshot());

  socket.on("start_simulation", () => {
    orchestrator.start();
  });

  socket.on("pause_simulation", () => {
    orchestrator.pause();
  });

  socket.on("reset_simulation", () => {
    orchestrator.reset();
  });

  socket.on("inject_shock", () => {
    orchestrator.injectDemandShock();
  });

  socket.on("seed_demo_scenario", () => {
    orchestrator.seedDemoScenario();
  });

  socket.on("set_tick_rate", (intervalMs: number) => {
    orchestrator.setTickInterval(intervalMs);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`AgentX Simulation Orchestrator Backend`);
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint ready at ws://localhost:${PORT}`);
  console.log(`====================================================`);
});
