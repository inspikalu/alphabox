# Plan: PayBox Vault Scoped Execution & Manifest

## Group 1 — PayBox Vault Policy Validator & Trade Execution Types
- [x] Task: Create `src/types/vault.ts` defining Zod schemas and TypeScript interfaces for `TradeOrderRequest`, `VaultPolicyConfig`, `TradeExecutionResult`, and the PayBox MCP `ResultEnvelope` (`status: "success" | "pending_approval" | "denied" | "error"`).
- [x] Task: Create `src/services/vault-policy.ts` implementing `validateTradePolicy(order: TradeOrderRequest, policy?: Partial<VaultPolicyConfig>)` enforcing strict guardrails: max trade amount ($25.00), maximum slippage tolerance (1.5%), supported networks (`solana`, `base`), and valid token addresses.
- [x] **Verify**: `npx tsx -e "import { validateTradePolicy } from './src/services/vault-policy.ts'; const r = validateTradePolicy({ tokenIn: 'USDC', tokenOut: 'SOL', amountUsd: 15, slippagePercent: 1.0, network: 'solana' }); console.log('POLICY_VALID:' + r.allowed); process.exit(r.allowed ? 0 : 1);"` → GOT: "POLICY_VALID:true" ✅

---

## Group 2 — Vault Trade Execution API Route
- [x] Task: Create `src/routes/vault.ts` mounting `POST /api/vault/execute-trade` that parses `TradeOrderRequest`, checks vault policy limits, and returns a PayBox-compliant status envelope (`status: "success"` with signed transaction details when within policy limits, or `status: "pending_approval"` with an `approval_url` when policy limits are exceeded).
- [x] Task: Mount `vaultRouter` onto `app` in `src/server.ts` under `/api/vault`.
- [x] **Verify**: `npx tsx -e "import { app } from './src/server.ts'; const s = app.listen(3004, async () => { const res = await fetch('http://localhost:3004/api/vault/execute-trade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tokenIn: 'USDC', tokenOut: 'SOL', amountUsd: 10, slippagePercent: 0.5, network: 'solana' }) }); const d = await res.json(); s.close(); console.log('TRADE_STATUS:' + d.status); process.exit(d.status === 'success' ? 0 : 1); });"` → GOT: "TRADE_STATUS:success" ✅

---

## Group 3 — PayBox Plugin Manifest & OpenAPI Specification
- [x] Task: Create `src/manifest.ts` generating `paybox-plugin.json` and OpenAPI 3.1 specification describing AlphaBox metadata, x402 payment requirements, and tools (`/api/intel/signal`, `/api/vault/execute-trade`) compliant with PayBox marketplace discovery standards.
- [x] Task: Mount `GET /paybox-plugin.json` and `GET /openapi.json` routes onto `app` in `src/server.ts`.
- [x] Task: Write static `paybox-plugin.json` and `openapi.json` to the project root directory.
- [x] **Verify**: `npx tsx -e "import { app } from './src/server.ts'; const s = app.listen(3005, async () => { const r1 = await fetch('http://localhost:3005/paybox-plugin.json'); const d1 = await r1.json(); const r2 = await fetch('http://localhost:3005/openapi.json'); const d2 = await r2.json(); s.close(); console.log('MANIFEST_VALID:' + (d1.name === 'AlphaBox' && Boolean(d2.paths['/api/vault/execute-trade']))); process.exit(d1.name === 'AlphaBox' ? 0 : 1); });"` → GOT: "MANIFEST_VALID:true" ✅
