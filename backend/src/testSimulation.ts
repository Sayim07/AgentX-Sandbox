import { Server as SocketIOServer } from "socket.io";
import http from "http";
import { SimulationOrchestrator } from "./orchestrator/simulation";

async function runTest() {
  console.log("====================================================");
  console.log("Running AgentX Backend Simulation Test");
  console.log("====================================================\n");

  const mockServer = http.createServer();
  const io = new SocketIOServer(mockServer);

  const orchestrator = new SimulationOrchestrator(io);
  orchestrator.setTickInterval(500); // Fast 500ms ticks for test

  console.log("Initial snapshot state:");
  const initSnap = orchestrator.getSnapshot();
  console.log(`- Is Running: ${initSnap.isRunning}`);
  console.log(`- Market Price: ${initSnap.marketPrice} CRED`);
  console.log(`- Active Agents: ${initSnap.agents.length}`);
  initSnap.agents.forEach((a) => {
    console.log(`  * ${a.name} (${a.persona}) - Address: ${a.walletAddress}`);
  });

  console.log("\nStarting 5 simulation ticks...");
  orchestrator.start();

  await new Promise((resolve) => setTimeout(resolve, 3000));

  orchestrator.injectDemandShock();
  console.log("Injected demand shock into order book!");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  orchestrator.pause();
  console.log("\nSimulation paused. Post-run snapshot:");
  const finalSnap = orchestrator.getSnapshot();
  console.log(`- Total Ticks Executed: ${finalSnap.tickCount}`);
  console.log(`- Final Market Price: ${finalSnap.marketPrice} CRED`);
  console.log(`- Total Executed Trades: ${finalSnap.tradesHistory.length}`);
  console.log(`- Total Service Calls: ${finalSnap.serviceCallsHistory.length}`);
  console.log(`- On-Chain Transaction Feed Items: ${finalSnap.transactionFeed.length}`);
  console.log(`- Network Graph Edges: ${finalSnap.networkGraph.edges.length}`);

  console.log("\nAgent Balances & Summaries:");
  finalSnap.agents.forEach((a) => {
    console.log(`- ${a.name}: ${a.creditBalance} CRED | Summary: ${a.lastActionSummary}`);
  });

  console.log("\n====================================================");
  console.log("Simulation Test Completed Successfully!");
  console.log("====================================================");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
