# Plan: Core Integration & Demo Verification

## Group 1 — Autonomous Agent Client Module
- [x] Task: Create `src/services/agent-client.ts` defining `AgentClient` with methods: `probeIntel(baseUrl, tokenAddress)`, `settleAndFetchIntel(baseUrl, tokenAddress, paymentProof)`, and `executeVaultTrade(baseUrl, order)`.
- [x] Task: Implement response validation in `src/services/agent-client.ts` to ensure received payloads conform to `PaymentInvoice`, `MarketSignalReport`, and PayBox `ResultEnvelope` Zod schemas.
- [x] **Verify**: `npx tsx -e "import { app } from './src/server.ts'; import { AgentClient } from './src/services/agent-client.ts'; process.env.SIMULATE_PAYMENTS = 'true'; const s = app.listen(3006, async () => { const client = new AgentClient('http://localhost:3006'); const probe = await client.probeIntel('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); const intel = await client.settleAndFetchIntel('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'simulated_proof'); s.close(); console.log('PROBE_402:' + probe.isPaymentRequired + ',INTEL_SUCCESS:' + (intel.status === 'success')); process.exit(probe.isPaymentRequired && intel.status === 'success' ? 0 : 1); });"` → GOT: "PROBE_402:true,INTEL_SUCCESS:true" ✅

---

## Group 2 — Multi-Network E2E Verification Runner & NPM Script
- [x] Task: Create `src/cli/verify-e2e.ts` implementing a structured integration runner that tests the full 5-step agent loop across both Solana and Base tokens:
  1. Discovery: Probes `/api/intel/signal` and extracts HTTP 402 payment requirements.
  2. Negotiation: Selects appropriate payment network (`solana:devnet` or `eip155:8453`).
  3. Settlement: Supplies payment token (`x-payment: simulated_valid_payment_proof`).
  4. Delivery: Receives live DexScreener market report and verifies 0–100 conviction score.
  5. Scoped Trade Execution: Submits trade within limit ($10) $\rightarrow$ verifies `status: "success"`; submits trade over limit ($50) $\rightarrow$ verifies `status: "pending_approval"` with passkey `approval_url`.
- [x] Task: Update `package.json` to add `"verify:e2e": "tsx src/cli/verify-e2e.ts"`.
- [x] **Verify**: `npm run verify:e2e` → GOT: "ALL_E2E_CHECKS_PASSED" (exit code 0) ✅

---

## Group 3 — Core Merge Gate & Clean Lifecycle Verification
- [ ] Task: Run full regression check across all endpoints (`/health`, `/paybox-plugin.json`, `/openapi.json`, `/api/intel/signal`, `/api/vault/execute-trade`).
- [ ] Task: Verify clean server lifecycle management, ensuring graceful shutdown without orphaned background processes or port binding leaks.
- [ ] **Verify**: `npx tsx -e "import { app } from './src/server.ts'; const s = app.listen(3009, async () => { const h = await fetch('http://localhost:3009/health').then(r => r.json()); const m = await fetch('http://localhost:3009/paybox-plugin.json').then(r => r.json()); s.close(); console.log('REGRESSION_CHECK:' + (h.status === 'ok' && m.name === 'AlphaBox')); process.exit(h.status === 'ok' ? 0 : 1); });"` → expect `REGRESSION_CHECK:true`
