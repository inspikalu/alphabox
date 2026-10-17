# Roadmap: AlphaBox

A fast-paced, sequential implementation plan optimized for delivery under the 10-hour deadline for MoonPay Hackathons: Chapter 1.

---

## Phase 1: Project Scaffold & Market Data Engine (Est. 1.5 Hours)
- Initialize Node.js/TypeScript project (`package.json`, `tsconfig.json`).
- Implement `DexScreenerService` to query real-time token metrics (liquidity, 24h volume, price change, buy/sell ratios).
- Implement deterministic `ConvictionScorer` that evaluates token momentum and volume velocity on a 0–100 scale.
- **Verification Gate:** Command line test script queries a live Base token (e.g., WETH / BRETT / DEGEN) and outputs validated conviction and liquidity scores.

---

## Phase 2: x402 Micropayment Server Layer (Est. 1.5 Hours)
- Setup Express server with typed routing and CORS.
- Implement x402 payment middleware:
  - If request lacks valid payment header, respond with `HTTP 402 Payment Required` carrying pricing ($0.01 USDC), receiver address, and accepted chain (`eip155:8453`).
  - If valid payment proof or signature is present, grant access and forward to intelligence handler.
- Expose `/api/intel/signal` endpoint returning the parsed token alpha report upon successful payment.
- **Verification Gate:** `curl` test verifies the endpoint returns `402 Payment Required` on initial probe, and returns full JSON payload when provided payment authorization.

---

## Phase 3: PayBox Vault Scoped Execution & Manifest (Est. 1.5 Hours) [COMPLETED]
- Implement `/api/vault/execute-trade` action handler:
  - Validates trade parameters against safety limits (e.g. max trade size $25, slippage tolerance).
  - Prepares the transaction envelope compliant with PayBox MCP wallet tools (`request_swap` / `request_sign`).
- Generate `paybox-plugin.json` and OpenAPI 3.1 specification for PayBox marketplace registration.
- **Verification Gate:** Schema validation test confirms the manifest and OpenAPI spec pass PayBox plugin verification criteria.
- **Status:** COMPLETED & VERIFIED (2026-10-17). See `specs/2026-10-17-paybox-vault-scoped-execution-and-manifest/execution-report.md`.

---

## Phase 4: Core Integration & Demo Verification (Est. 1.5 Hours) [COMPLETED]
- Build an end-to-end integration script executing the complete user journey:
  1. Discovery: Query token signal.
  2. Negotiation: Handle HTTP 402 invoice.
  3. Settlement: Settle micro-payment.
  4. Delivery: Receive conviction & liquidity payload.
  5. Action: Trigger scoped trade execution within vault limits.
- **Verification Gate (CORE MERGE GATE):** Full automated run executes successfully end-to-end with zero errors.
- **Status:** COMPLETED & VERIFIED (2026-10-17). See `specs/2026-10-17-core-integration-and-demo-verification/execution-report.md`.

---

## Stretch Phase: Approved Differentiator Features (Optional — Gated on Core Merge Gate) [COMPLETED]
- **S-1: Interactive Visual Demo Runner**: Implemented `src/cli/demo-runner.ts` (`npm run demo`).
- **S-2: Deep Security & Rugcheck Gauge**: Implemented `src/services/security.ts` querying GoPlus API.
- **S-3: Automated Stop-Loss Watchdog**: Implemented `src/services/watchdog.ts`.
- **Status:** COMPLETED & VERIFIED (2026-10-17). See `specs/2026-10-17-stretch-differentiator-features/execution-report.md`.

---

## Phase 5: Submission & Video Production (Est. 1.5 Hours) [COMPLETED]
- Documentation & Demo Script: Production `README.md` created with timed 2-minute pitch script, architecture sequence diagram, and live demo commands.
- Agnostic Systems Verification: Independent black-box testing suite executed with 10/10 test cases passing (`specs/agnostic-test-report.md`).
- Video Recording Guide: `npm run demo` ready for video recording.
- **Status:** COMPLETED & READY FOR SUBMISSION (2026-10-17).
