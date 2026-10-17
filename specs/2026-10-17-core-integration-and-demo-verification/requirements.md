# Requirements: Core Integration & Demo Verification

## Scope
- **In**:
  - Implementation of an autonomous agent client module (`src/services/agent-client.ts`) that executes the 5-step loop: Probe $\rightarrow$ 402 Invoice extraction $\rightarrow$ Settlement $\rightarrow$ Intel Delivery $\rightarrow$ Vault Trade Execution.
  - Implementation of the automated end-to-end integration and verification runner (`src/cli/verify-e2e.ts`) testing the complete flow for both Solana and Base tokens.
  - Verification of both policy execution paths: autonomous execution ($\le \$25$) returning `status: "success"` and policy escalation ($> \$25$) returning `status: "pending_approval"` with user passkey `approval_url`.
  - Integration script registration in `package.json` under `npm run verify:e2e`.
  - Successful passage of the Core Merge Gate (live end-to-end execution without errors).
- **Out**:
  - Interactive ASCII UI / terminal dashboard visualization (deferred to Stretch Phase S-1).
  - GoPlus security & rugcheck audit API integration (deferred to Stretch Phase S-2).
  - Automated stop-loss watchdog monitoring daemon (deferred to Stretch Phase S-3).
  - Live mainnet real-dollar capital funding (simulated settlement flag permitted for automated tests; real DexScreener market data used).

## Key Decisions
- **Unified Agent Client:** Encapsulate the consumer-side logic into `src/services/agent-client.ts` to mirror how an autonomous AI agent in the PayBox ecosystem interacts with AlphaBox over HTTP/x402 and PayBox MCP tools.
- **Dual-Rail Verification:** Test both Solana (SPL mint) and Base (ERC-20 contract) tokens against DexScreener live API feeds to prove multi-chain capability.
- **Strict Verification Gate:** The Core Merge Gate requires 100% clean automated execution (`exit code 0`) with literal terminal evidence of all 5 steps: Discovery, Negotiation, Settlement, Delivery, and Scoped Execution.

## Context from mission.md
- **Problem Statement:** AI agents need financial autonomy without holding unprotected private keys or paying expensive subscriptions.
- **Core User Stories Addressed:**
  - `US-1 (Discover & Query Intelligence)`: Query `/api/intel/signal` and receive `HTTP 402 Payment Required` instructions.
  - `US-2 (Settle Machine-to-Machine Payment)`: Fulfill x402 invoice with micropayment token.
  - `US-4 (Execute Scoped Trade)`: Trigger PayBox vault trade execution bounded by policy limits ($\le \$25$).
  - `US-5 (Audit & Verification)`: Verify explicit status transitions (`success`, `pending_approval`) and auditable execution outputs.
- **Deliverable 1:** Working PayBox Marketplace Plugin operating end-to-end.

## Context from tech-stack.md
- **Runtime:** Node.js v20+ LTS with `tsx` TypeScript runner.
- **Server:** Express v5.3.0.
- **Protocol:** x402 HTTP 402 Payment Required.
- **Market Data:** DexScreener Public API (live, zero-auth).
- **Pinned Dependencies:**
  - `@solana/web3.js: ^1.99.0`
  - `ethers: ^6.17.0`
  - `express: ^5.3.0`
  - `zod: ^3.24.2`
- **Known Issues:** None relevant.

## Engineering Standards (carried from specs/engineering-standards.md)
- **Mocks, Stubs & Data Integrity:** Core Demo Path: Real, live data only. Mocks, fake timeouts, and synthetic payloads are **strictly forbidden** on the live intelligence and payment pathways. DexScreener data feeds must be real on-chain/market responses. x402 Micro-payments: The HTTP 402 handshake must adhere to real headers/body schemas. For local or offline test environments where on-chain settlement is simulated, an explicit `SIMULATED_PAYMENT=true` environment flag may be accepted, but it must be explicitly declared and never hidden behind mock data in production or demo runs.
- **Debug Logging & Code Cleanliness:** No dangling `console.log`, `console.debug`, or ad-hoc debug print statements in committed code. Structured CLI output is permitted for CLI test runners. Code must compile with zero TypeScript errors under strict mode (`"strict": true`).
- **Definition of Done:** The feature must run live end-to-end during the judge walkthrough without crashing or requiring manual code edits.
- **Rollback Policy:** If an unrecoverable failure occurs during a verification step, revert all changes made during the failing group back to the last passing group's committed state (`git checkout -- .`).

## External Dependencies
- **DexScreener API:** Public endpoint `https://api.dexscreener.com/latest/dex/tokens/:tokenAddress` (no auth required).
- **Environment Configuration:** `SIMULATE_PAYMENTS=true` for automated local verification; `PORT=3000` (or ephemeral test port).
