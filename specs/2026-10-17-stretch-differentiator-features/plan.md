# Plan: Stretch Differentiator Features (S-1, S-2, S-3)

## Group 1 — GoPlus Deep Security & Rugcheck Module
- [x] Task: Create `src/types/security.ts` defining Zod schemas and TypeScript types for `TokenSecurityAudit` (honeypot, buy/sell taxes, mintable, mutable metadata, riskScore 0-100, warnings). (Defined in `src/types/market.ts` and re-exported via `src/services/security.ts`)
- [x] Task: Create `src/services/security.ts` querying GoPlus public endpoints for Base (`chainId=8453`) and Solana, computing a 0–100 safety score and warning flags.
- [x] Task: Update `src/services/market-engine.ts` to enrich `MarketSignalReport` with an optional `securityAudit` field and apply safety penalties to conviction if severe risks exist.
- [x] **Verify**: `npx tsx --input-type=module -e "import { checkTokenSecurity } from './src/services/security.ts'; const r = await checkTokenSecurity('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'base'); console.log('SECURITY_CHECK:' + (typeof r.riskScore === 'number' && !r.isHoneypot)); process.exit(typeof r.riskScore === 'number' ? 0 : 1);"` → expect `SECURITY_CHECK:true`
  - Evidence:
    ```
    $ npx tsx --input-type=module -e "import { checkTokenSecurity } from './src/services/security.ts'; const r = await checkTokenSecurity('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'base'); console.log('SECURITY_CHECK:' + (typeof r.riskScore === 'number' && !r.isHoneypot)); process.exit(typeof r.riskScore === 'number' ? 0 : 1);"
    SECURITY_CHECK:true
    Exit code: 0
    ```


---

## Group 2 — Automated Stop-Loss Watchdog Service
- [x] Task: Create `src/services/watchdog.ts` implementing `evaluateStopLoss(currentPrice, entryPrice, stopLossPercentage)` and `createEmergencyExitOrder(tokenIn, tokenOut, amountUsd, network)`.
- [x] Task: Add test coverage ensuring stop-loss triggers when price declines exceed the threshold (e.g. -10%), generating a compliant PayBox emergency exit `TradeOrderRequest`.
- [x] **Verify**: `npx tsx --input-type=module -e "import { evaluateStopLoss } from './src/services/watchdog.ts'; const r1 = evaluateStopLoss(95, 100, 10); const r2 = evaluateStopLoss(88, 100, 10); console.log('WATCHDOG_SAFE:' + !r1.triggered + ',WATCHDOG_TRIGGER:' + r2.triggered); process.exit(!r1.triggered && r2.triggered ? 0 : 1);"` → expect `WATCHDOG_SAFE:true,WATCHDOG_TRIGGER:true`
  - Evidence:
    ```
    $ npx tsx --input-type=module -e "import { evaluateStopLoss } from './src/services/watchdog.ts'; const r1 = evaluateStopLoss(95, 100, 10); const r2 = evaluateStopLoss(88, 100, 10); console.log('WATCHDOG_SAFE:' + !r1.triggered + ',WATCHDOG_TRIGGER:' + r2.triggered); process.exit(!r1.triggered && r2.triggered ? 0 : 1);"
    WATCHDOG_SAFE:true,WATCHDOG_TRIGGER:true
    Exit code: 0
    ```


---

## Group 3 — Interactive Visual Demo Runner & NPM Script
- [x] Task: Create `src/cli/demo-runner.ts` providing an interactive or cinematic CLI presentation with ASCII banner, colorized conviction meter (`[████████░░]`), live x402 payment handshake, GoPlus security breakdown, and PayBox vault execution receipt.
- [x] Task: Add `"demo": "tsx src/cli/demo-runner.ts"` to `package.json`.
- [x] **Verify**: `npm run demo -- --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --network solana` → expect output containing `DEMO_RUN_COMPLETE` and exit code 0
  - Evidence:
    ```
    $ npm run demo -- --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --network solana

    > alphabox@0.1.0 demo
    > tsx src/cli/demo-runner.ts --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --network solana

    [Step 1/5] Token Discovery & x402 Handshake
      Target Token:  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (SOLANA)
      ✓ HTTP 402 Received: Access to AlphaBox real-time market intelligence requires a micropayment of $0.01 USDC.
      Payment Rails:    solana:devnet (USDC $0.01), eip155:8453 (USDC $0.01)

    [Step 2/5] Autonomous x402 Micropayment Settlement
      Settling $0.01 USDC micro-invoice via non-custodial wallet...
      ✓ Payment Verified! Market intelligence payload unlocked.

    [Step 3/5] Real-Time Market Intelligence
      Asset:            Pump (PUMP)
      Primary DEX:      pumpswap on solana
      Conviction Meter: [██████████████████░░░░░░] 74/100 [HIGH]

    [Step 4/5] GoPlus Contract Security & Rugcheck Audit
      Honeypot Check:   CLEAN (Freely Tradable)
      Risk Gauge:       [███████████████████░░░░░] 80/100 Safety Score

    [Step 5/5] PayBox Vault Autonomous Trade Execution
      Policy Rule:      Max Autonomous Limit = $25.00 USD
      Requested Trade:  Swap $15 USD -> PUMP
      ✓ TRADE EXECUTED SUCCESSFULLY
        Autonomous Auth:    true
        Execution Network:  solana

    DEMO_RUN_COMPLETE
    Exit code: 0
    ```

