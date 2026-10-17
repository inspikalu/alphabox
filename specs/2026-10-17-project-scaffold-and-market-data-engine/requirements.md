# Requirements: Project Scaffold & Market Data Engine

## Scope
- **In**:
  - Full TypeScript and Node.js project scaffolding (`package.json`, `tsconfig.json`, `.env.example`).
  - DexScreener public API integration (`fetchTokenPairs`) using native `fetch` to retrieve real-time liquidity, volume, price, and 24h buy/sell transactions for both Solana and Base tokens.
  - Zod data validation and TypeScript typing for all market data structures.
  - Deterministic `ConvictionScorer` evaluating momentum, liquidity depth, buy/sell ratio, and price action to generate a 0–100 conviction score.
  - CLI runner (`src/cli/verify-market.ts`) allowing rapid local verification of any token address.
- **Out**:
  - HTTP server, routing, and x402 payment negotiation headers (deferred to Phase 2).
  - PayBox MCP plugin manifest and credential vault tool schemas (deferred to Phase 3).
  - GoPlus security contract rugcheck audits (part of Stretch Phase S-2).
  - Persistent database storage or caching layer (stateless by design per `tech-stack.md`).

---

## Key Decisions
- **Decision 1 (DexScreener as Primary Engine):** DexScreener was chosen because it provides real-time, multi-chain DEX data (Raydium, Orca, Uniswap, Aerodrome) via an open, zero-auth public API requiring no API keys or paid tiers.
- **Decision 2 (Deterministic Scoring vs. Black-box ML):** Use a mathematical, weighted composite algorithm (0–100) instead of an opaque ML model. This ensures predictable, explainable signals for agents and transparent verification for hackathon judges.
- **Decision 3 (Native fetch over Axios):** Node.js v20+ native `fetch` is used to minimize dependencies and eliminate HTTP client bloat.

---

## Context from mission.md
- **Problem addressed:** Autonomous AI agents need reliable, high-speed market intelligence to evaluate token momentum without manual intervention.
- **Target User:** AI agents looking to discover and evaluate crypto alpha before executing financial actions.

---

## Context from tech-stack.md
- **Runtime & Language:** Node.js v20+ LTS with TypeScript v5.8.0.
- **Pinned Dependencies for this phase:**
  - `zod: ^3.24.2`
  - `dotenv: ^18.0.8`
  - `express: ^5.3.0`
  - `cors: ^2.8.6`
  - `ethers: ^6.17.0`
  - `@solana/web3.js: ^1.99.0`
  - `typescript: ^5.8.0`
  - `tsx: ^4.23.15`
  - `@types/node: ^22.0.0`
  - `@types/express: ^5.0.6`
  - `@types/cors: ^2.8.19`
- **Known Issues:** None relevant (no entries in `tech-stack.md`).

---

## User Stories Addressed
- **US-1 (Discover & Query Intelligence):** Lays the algorithmic data foundation for token discovery and alpha telemetry.
- **US-3 (Evaluate Risk & Safety):** Computes normalized conviction scores and liquidity indicators so agents can assess token viability.

---

## Engineering Standards (Carried Verbatim from specs/engineering-standards.md)
- **Mocks/stubs/placeholder data:** "Core Demo Path: Real, live data only. Mocks, fake timeouts, and synthetic payloads are strictly forbidden on the live intelligence and payment pathways. DexScreener and GoPlus data feeds must be real on-chain/market responses."
- **Debug logging:** "No dangling console.log, console.debug, or ad-hoc debug print statements in committed code. Use structured, leveled output or clean user-facing status messages for the demo runner. Diagnostic logs must only be output if explicitly required for error handling. Code must compile with zero TypeScript errors under strict mode."
- **Definition of done:** "Live End-to-End Execution: The feature must run live end-to-end during the judge walkthrough without crashing or requiring manual code edits. Working Demo Path Prioritization: Favor completing the critical user flow with high reliability and crisp visuals over exhaustive handling of obscure edge cases."
- **Rollback policy:** "If an unrecoverable failure occurs during a verification step: The executor must revert all changes made during the failing group back to the last passing group's committed state (e.g., git checkout -- . or git reset --hard <last-good-commit>). The executor must report BLOCKED against a clean git working tree with a detailed explanation of the failure mode."

---

## External Dependencies
- **DexScreener Public API:** `https://api.dexscreener.com/latest/dex/tokens/:tokenAddress` (Free, zero-auth public endpoint documented in `specs/resources.md`).
