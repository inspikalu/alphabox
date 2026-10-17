# Validation: Stretch Differentiator Features (S-1, S-2, S-3)

## Acceptance Criteria
- [x] Criterion 1: GoPlus Security integration queries live contract security for Base and Solana tokens, returning parsed `TokenSecurityAudit` with honeypot status, buy/sell tax checks, and 0–100 risk score without errors.
- [x] Criterion 2: Automated Stop-Loss Watchdog accurately evaluates price drop thresholds and generates valid PayBox emergency exit orders when triggered.
- [x] Criterion 3: `npm run demo` executes the interactive visual CLI demonstration showcasing token telemetry, conviction meter, x402 payment, GoPlus security score, and vault execution, exiting 0 with `DEMO_RUN_COMPLETE`.
- [x] Criterion 4: All existing functionality (`/health`, `/paybox-plugin.json`, `/openapi.json`, `/api/intel/signal`, `/api/vault/execute-trade`, `npm run verify:e2e`) remains fully operational.

---

## Merge Gate
- [x] All Group verifies in `plan.md` pass with pasted terminal output evidence.
- [x] Full regression check: `npm run verify:e2e` passes.
- [x] Typecheck clean:
  ```bash
  npx tsc --noEmit
  ```
- [x] Installed dependency versions match `tech-stack.md` pinned versions:
  ```bash
  npm list express zod ethers @solana/web3.js
  ```
- [x] No mocks/stubs on real GoPlus or DexScreener pathways.
- [x] Demo-able:
  ```bash
  npm run demo
  ```
