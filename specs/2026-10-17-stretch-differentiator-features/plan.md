# Plan: Stretch Differentiator Features (S-1, S-2, S-3)

## Group 1 — GoPlus Deep Security & Rugcheck Module
- [ ] Task: Create `src/types/security.ts` defining Zod schemas and TypeScript types for `TokenSecurityAudit` (honeypot, buy/sell taxes, mintable, mutable metadata, riskScore 0-100, warnings).
- [ ] Task: Create `src/services/security.ts` querying GoPlus public endpoints for Base (`chainId=8453`) and Solana, computing a 0–100 safety score and warning flags.
- [ ] Task: Update `src/services/market-engine.ts` to enrich `MarketSignalReport` with an optional `securityAudit` field and apply safety penalties to conviction if severe risks exist.
- [ ] **Verify**: `npx tsx -e "import { checkTokenSecurity } from './src/services/security.ts'; const r = await checkTokenSecurity('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'base'); console.log('SECURITY_CHECK:' + (typeof r.riskScore === 'number' && !r.isHoneypot)); process.exit(typeof r.riskScore === 'number' ? 0 : 1);"` → expect `SECURITY_CHECK:true`

---

## Group 2 — Automated Stop-Loss Watchdog Service
- [ ] Task: Create `src/services/watchdog.ts` implementing `evaluateStopLoss(currentPrice, entryPrice, stopLossPercentage)` and `createEmergencyExitOrder(tokenIn, tokenOut, amountUsd, network)`.
- [ ] Task: Add test coverage ensuring stop-loss triggers when price declines exceed the threshold (e.g. -10%), generating a compliant PayBox emergency exit `TradeOrderRequest`.
- [ ] **Verify**: `npx tsx -e "import { evaluateStopLoss } from './src/services/watchdog.ts'; const r1 = evaluateStopLoss(95, 100, 10); const r2 = evaluateStopLoss(88, 100, 10); console.log('WATCHDOG_SAFE:' + !r1.triggered + ',WATCHDOG_TRIGGER:' + r2.triggered); process.exit(!r1.triggered && r2.triggered ? 0 : 1);"` → expect `WATCHDOG_SAFE:true,WATCHDOG_TRIGGER:true`

---

## Group 3 — Interactive Visual Demo Runner & NPM Script
- [ ] Task: Create `src/cli/demo-runner.ts` providing an interactive or cinematic CLI presentation with ASCII banner, colorized conviction meter (`[████████░░]`), live x402 payment handshake, GoPlus security breakdown, and PayBox vault execution receipt.
- [ ] Task: Add `"demo": "tsx src/cli/demo-runner.ts"` to `package.json`.
- [ ] **Verify**: `npm run demo -- --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --network solana` → expect output containing `DEMO_RUN_COMPLETE` and exit code 0
