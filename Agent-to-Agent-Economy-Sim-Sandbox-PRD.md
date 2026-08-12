# Product Requirements Document
## Agent-to-Agent Economy Sim Sandbox

**Version:** 1.0
**Prepared for:** Hackathon Submission — Problem Statement
**Author:** Sayim
**Date:** August 2026

---

## 1. Executive Summary

The Agent-to-Agent Economy Sim Sandbox is a simulated digital economy in which autonomous AI agents independently trade assets, execute paid micro-services for one another, and settle transactions through smart contracts on a blockchain testnet. The platform demonstrates a functioning "machine economy" — a core thesis behind agentic AI and Web3 convergence — where every agent has a wallet, a goal, a reasoning engine, and the ability to negotiate, transact, and be held accountable on-chain.

The entire stack is buildable on free tiers, making it hackathon-appropriate: no paid APIs, no paid RPC nodes, no paid hosting required for a working demo.

---

## 2. Problem Statement

Enterprises and researchers increasingly deploy autonomous AI agents to perform tasks on their behalf. As agent populations grow, they will need to transact with each other directly — buying data, paying for compute, hiring other agents for sub-tasks — without constant human mediation. Today there is no accessible sandbox to observe, test, and visualize how such an "agent economy" behaves: how prices form, how trust is established, how fraud or collusion emerges, and how smart contracts can enforce fair settlement.

**Goal:** Build a working sandbox where multiple autonomous agents, each with distinct goals and strategies, trade a simulated asset and pay each other for simulated micro-services, with every transaction settled trustlessly via smart contract, visualized in real time.

---

## 3. Objectives & Success Criteria

| Objective | Success Metric |
|---|---|
| Autonomous agent decision-making | ≥4 agents independently generate buy/sell/service offers using LLM or rule-based reasoning, no human intervention mid-run |
| Real economic dynamics | Visible price discovery / fluctuation over a simulated session (order book or bonding curve responds to trades) |
| Micro-service marketplace | Agents can list, discover, and pay for at least 2 distinct simulated services (e.g. data-cleaning, price-oracle, translation) |
| On-chain settlement | Every trade and service payment is recorded as a transaction on a public testnet, verifiable on a block explorer |
| Live observability | A dashboard shows agent wallets, live trade feed, price chart, and an agent interaction graph updating in real time |
| Judge demo-readiness | Full simulation runs end-to-end in under 3 minutes for a live demo, with a "seed scenario" button |

---

## 4. Target Users (for framing, not literal end users)

- **Hackathon judges** evaluating technical depth (agentic AI + Web3 + systems design)
- **Researchers / builders** who want a reference sandbox for agent-economy experiments
- **Web3 + AI teams** prototyping agent-native payment rails before mainnet deployment

---

## 5. Core Features (MVP scope for hackathon)

### 5.1 Agent Framework
- 4–8 autonomous agents, each configured with: a persona (e.g. "aggressive trader," "conservative service-buyer," "arbitrageur"), a starting wallet balance, and a strategy driven by an LLM prompt or rule set.
- Each agent runs on an independent decision loop ("tick"): observe market state → reason → act (place order / accept trade / call a service / decline).

### 5.2 Asset Trading Engine
- A simple order book or automated market maker (bonding curve) for one simulated token (e.g. `$CRED`).
- Agents submit buy/sell orders; the engine matches them and updates price.
- Price history is charted live.

### 5.3 Micro-service Marketplace
- 2–3 mock "services" agents can list and consume, e.g.:
  - **Data oracle service** — returns a simulated market signal for a fee.
  - **Task-completion service** — one agent "hires" another to complete a scored sub-task for a fee.
- Payment for a service is escrowed and released via smart contract on delivery confirmation.

### 5.4 Smart Contract Settlement Layer
- `AgentCredit` — ERC-20 token representing the economy's currency, minted to agent wallets at simulation start.
- `TradeEscrow` — holds funds during a trade/service exchange and releases on confirmed delivery, or refunds on timeout/dispute.
- `ServiceRegistry` — on-chain log of which agent offered which service, and completion status, for auditability.

### 5.5 Real-Time Observability Dashboard
- Live agent network graph (who is trading with whom).
- Live price/volume chart for the traded asset.
- Live transaction feed (trade, service call, on-chain settlement, each tagged with a Polygonscan link).
- Per-agent wallet balance panel.
- "Run scenario" / "pause" / "inject shock" controls (e.g. sudden demand spike) for a compelling live demo.

### 5.6 Simulation Control
- Configurable tick rate and agent count.
- Seeded scenarios for reproducible demo runs.
- Event log exportable as JSON for post-run analysis.

---

## 6. Recommended Tech Stack (100% free-tier)

### 6.1 Frontend
| Layer | Tool | Why |
|---|---|---|
| Framework | React 18 + Vite + TypeScript | Fast dev loop, matches your existing stack experience |
| Styling | Tailwind CSS + shadcn/ui | Rapid, clean UI without design overhead |
| State | Zustand | Lightweight global state for live-updating agent/market data |
| Charts | Recharts | Price/volume charts, wallet balance bars |
| Network graph | React Flow | Visualizes agent-to-agent trade/service links |
| Realtime client | Socket.io-client | Subscribes to live simulation ticks from backend |

### 6.2 Backend / Simulation Orchestrator
| Layer | Tool | Why |
|---|---|---|
| Runtime | Node.js + Express, or Python FastAPI | Either works; Node pairs naturally with Socket.io, FastAPI pairs naturally with agent/LLM tooling |
| Realtime server | Socket.io | Broadcasts tick-by-tick simulation state to the dashboard |
| Simulation clock | Custom tick loop (setInterval / asyncio loop) | Drives agent decision cycles at a fixed cadence |
| Matching engine | Custom order-book module (in-memory, snapshotted to Mongo) | No existing free SaaS does this — build it small, it's the core IP of the demo |

### 6.3 Agent Intelligence Layer
| Layer | Tool | Why |
|---|---|---|
| LLM reasoning | **Groq API (free tier)** — Llama 3.1/3.3 70B | Extremely low latency, free, ideal for many agents "thinking" per tick |
| Agent orchestration framework | **Fetch.ai `uAgents`** (open-source Python framework purpose-built for autonomous agent economies) — or **LangGraph** if you prefer a more general agent-graph approach | uAgents is literally designed for this problem class and looks strong to judges since it name-matches "agent economy" |
| Fallback logic | Simple rule-based strategy per agent | Keeps the demo reliable if LLM calls are slow/rate-limited during judging |

### 6.4 Blockchain / Smart Contract Layer
| Layer | Tool | Why |
|---|---|---|
| Language | Solidity | Standard, well-documented |
| Dev environment | Hardhat | Free, local testing + scripted deployment |
| Testnet | **Polygon Amoy** (free faucet MATIC) | Fast, cheap, well-supported test network — you've used this before on ReliefChain |
| RPC provider | Alchemy or Infura free tier | Reliable node access without running your own |
| Client library | ethers.js (or viem) | Connects backend/frontend to deployed contracts |
| Explorer | Polygonscan Amoy | Lets judges verify real transactions live |

### 6.5 Data & Messaging
| Layer | Tool | Why |
|---|---|---|
| Primary DB | MongoDB Atlas (free 512MB tier) | Agent profiles, trade history, service logs |
| Pub/Sub & queues | Upstash Redis (free tier) | Agent "mailbox" messaging, rate limiting LLM calls |

### 6.6 Hosting & Deployment (all free)
| Layer | Tool |
|---|---|
| Frontend | Vercel |
| Backend | Render or Railway (free web service tier) |
| Database | MongoDB Atlas free cluster |
| Redis | Upstash free tier |
| Contracts | Deployed to Polygon Amoy via Hardhat, verified on Polygonscan |

### 6.7 Optional Polish (if time allows)
- Clerk (free tier) for judge login / demo access control.
- Gamma (already in your workflow) for the pitch deck.
- OpenZeppelin Contracts library for audited ERC-20/Escrow base contracts — free and saves dev time.

---

## 7. System Architecture (high level)

```
Frontend (React dashboard)
        │  Socket.io (live ticks)
        ▼
Simulation Orchestrator (Node.js)
   ├── Agent Intelligence (Groq LLM + uAgents/LangGraph)
   └── Data & Queue (MongoDB Atlas + Upstash Redis)
        │  ethers.js
        ▼
Blockchain Settlement (Polygon Amoy: AgentCredit, TradeEscrow, ServiceRegistry)
```

Each simulation tick: agents observe state → reason (LLM or rule-based) → submit intents → orchestrator matches trades / dispatches service calls → settlement transactions are sent on-chain → results broadcast back to the dashboard in real time.

---

## 8. Data Model (core entities)

- **Agent**: `id, name, persona, strategy_type, wallet_address, credit_balance, reputation_score`
- **Order**: `id, agent_id, side (buy/sell), quantity, price, status, timestamp`
- **Trade**: `id, buy_order_id, sell_order_id, price, quantity, tx_hash, timestamp`
- **ServiceListing**: `id, provider_agent_id, service_type, price, description`
- **ServiceCall**: `id, buyer_agent_id, listing_id, status (pending/escrowed/delivered/disputed), tx_hash`
- **SimulationRun**: `id, config, start_time, end_time, seed`

---

## 9. Smart Contract Design (summary)

1. **AgentCredit.sol** — ERC-20 token, minted once at simulation start, distributed to agent wallets.
2. **TradeEscrow.sol** — `openEscrow(buyer, seller, amount)`, `release(escrowId)`, `refund(escrowId)` with a timeout fallback.
3. **ServiceRegistry.sol** — `registerService(agent, serviceType, price)`, `logCompletion(callId, success)` — emits events the frontend can subscribe to for the live feed.

All three built with OpenZeppelin base contracts where possible to minimize custom security surface.

---

## 10. Non-Functional Requirements

- **Latency:** agent decision + settlement round-trip visible within ~2–5 seconds per tick for a legible live demo.
- **Reliability:** rule-based fallback ensures the demo never stalls if the LLM API is slow/rate-limited.
- **Reproducibility:** seeded runs so the same demo can be re-run identically for judges.
- **Auditability:** every trade/service payment must be traceable to a real Polygon Amoy transaction hash shown in the UI.
- **Cost:** entire stack must run within free tiers for the full development + demo period.

---

## 11. Hackathon Build Roadmap (suggested)

| Phase | Deliverable |
|---|---|
| Day 1 AM | Repo scaffold, Hardhat + contracts deployed to Amoy, wallets funded via faucet |
| Day 1 PM | Simulation orchestrator with mock agents (rule-based only), in-memory order book, Socket.io broadcasting |
| Day 2 AM | Wire orchestrator to real contracts (on-chain settlement working end-to-end for one trade) |
| Day 2 PM | Add LLM-driven agent reasoning (Groq) for at least 2 of the agents; add micro-service marketplace flow |
| Day 3 AM | Build dashboard: price chart, agent graph, live feed, wallet panel |
| Day 3 PM | Seeded demo scenario, polish, deploy to Vercel/Render, pitch deck |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| LLM API rate limits during live demo | Rule-based fallback strategies per agent; cache/pre-warm before judging |
| Testnet RPC congestion or faucet drying up | Fund wallets early, keep a backup faucet/account, batch transactions where possible |
| Real-time sync bugs between chain state and UI | Treat chain as source of truth; UI reconciles via event logs, not just optimistic updates |
| Scope creep (full DEX-grade matching engine) | Keep the order book intentionally simple — a basic price-time priority matcher is enough to show price discovery |

---

## 13. Future Scope (beyond hackathon)

- Multi-asset economy (several tradeable tokens/services forming a small market graph).
- Reputation system feeding back into agent trust/pricing decisions.
- Agent-to-agent negotiation via natural language (visible chat-style transcripts in the UI).
- Cross-chain settlement or mainnet deployment.
- Public "Agentverse"-style discovery registry so external agents could join the sandbox.

---

## 14. Why This Stands Out to Judges

- Combines three hard technical domains cleanly: **agentic AI (LLM reasoning per agent)**, **real-time systems (live simulation + dashboard)**, and **Web3 (actual on-chain settlement, not just a mocked ledger)**.
- Every transaction is independently verifiable on a public block explorer — a strong, concrete demo moment.
- 100% free-tier stack means it is fully reproducible by anyone reviewing the submission after the event.
