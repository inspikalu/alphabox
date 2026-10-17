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

## Phase 3: PayBox Vault Scoped Execution & Manifest (Est. 1.5 Hours)
- Implement `/api/vault/execute-trade` action handler:
  - Validates trade parameters against safety limits (e.g. max trade size $25, slippage tolerance).
  - Prepares the transaction envelope compliant with PayBox MCP wallet tools (`request_swap` / `request_sign`).
- Generate `paybox-plugin.json` and OpenAPI 3.1 specification for PayBox marketplace registration.
- **Verification Gate:** Schema validation test confirms the manifest and OpenAPI spec pass PayBox plugin verification criteria.

---

## Phase 4: Core Integration & Demo Verification (Est. 1.5 Hours)
- Build an end-to-end integration script executing the complete user journey:
  1. Discovery: Query token signal.
  2. Negotiation: Handle HTTP 402 invoice.
  3. Settlement: Settle micro-payment.
  4. Delivery: Receive conviction & liquidity payload.
  5. Action: Trigger scoped trade execution within vault limits.
- **Verification Gate (CORE MERGE GATE):** Full automated run executes successfully end-to-end with zero errors.

---

## Stretch Phase: Approved Differentiator Features (Optional — Gated on Core Merge Gate)
*Only to be attempted after the Core Merge Gate in Phase 4 has completely passed.*

### S-1: Interactive Visual Demo Runner (Low effort, high visual impact)
- A clean CLI / web visualization runner with ASCII gauges or modern terminal styling, highlighting:
  - Live token telemetry & conviction meter.
  - The live x402 invoice and payment handshake.
  - The PayBox scoped execution confirmation.

### S-2: Deep Security & Rugcheck Gauge (Low effort, high credibility)
- Integrate GoPlus Security API to analyze contract risks:
  - Honeypot check.
  - Mint authority revoked status.
  - Liquidity lock / burn percentage.
  - Dynamic risk penalties applied to the conviction score.

### S-3: Automated Stop-Loss Watchdog (Medium effort, nice-to-have)
- Lightweight sentiment/liquidity watchdog script that monitors post-trade token health and automatically signals an exit swap if momentum crashes.

---

## Phase 5: Submission & Video Production (Est. 1.5 Hours)
- Record 2-minute demo video showing the end-to-end flow.
- Publish demo video to X (Twitter) with required hackathon tags.
- Submit project URL, video link, and repository to the MoonPay hackathons portal before the deadline.
