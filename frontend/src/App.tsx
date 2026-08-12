import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSimulationSocket } from "./hooks/useSimulationSocket";
import { Loader } from "./components/Loader";
import { Header } from "./components/Header";
import { SmoothScroll } from "./components/SmoothScroll";
import { LandingPage } from "./pages/LandingPage";
import { SandboxPage } from "./pages/SandboxPage";
import { AgentDirectoryPage } from "./pages/AgentDirectoryPage";
import { ExplorerPage } from "./pages/ExplorerPage";

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const {
    isConnected,
    simState,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    injectShock,
    seedDemoScenario,
    setTickRate,
    exportLogsJSON,
  } = useSimulationSocket();

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-obsidian text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Full-Screen Web3 Matrix Particle Loader */}
        <AnimatePresence>
          {isLoading && <Loader onComplete={() => setIsLoading(false)} />}
        </AnimatePresence>

        {!isLoading && (
          <>
            {/* Persistent Navigation Header & Quick Judge Controls */}
            <Header
              isConnected={isConnected}
              simState={simState}
              onStart={startSimulation}
              onPause={pauseSimulation}
              onReset={resetSimulation}
              onInjectShock={injectShock}
              onSeedDemo={seedDemoScenario}
              onExportLogs={exportLogsJSON}
              onTickRateChange={setTickRate}
            />

            {/* Main Route Viewport with Page Transitions */}
            <main className="flex-1 py-6 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 flex flex-col"
                >
                  <Routes location={location}>
                    <Route
                      path="/"
                      element={
                        <LandingPage simState={simState} onSeedDemo={seedDemoScenario} />
                      }
                    />
                    <Route
                      path="/sandbox"
                      element={<SandboxPage simState={simState} />}
                    />
                    <Route
                      path="/agents"
                      element={<AgentDirectoryPage simState={simState} />}
                    />
                    <Route
                      path="/explorer"
                      element={<ExplorerPage feedItems={simState.transactionFeed} />}
                    />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
          </>
        )}
      </div>
    </SmoothScroll>
  );
};

export default App;
