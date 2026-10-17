# Validation: Core Integration & Demo Verification

## Acceptance Criteria
- [ ] Criterion 1: `AgentClient` executes the complete 5-step loop (Discovery $\rightarrow$ 402 Negotiation $\rightarrow$ Settlement $\rightarrow$ Intel Delivery $\rightarrow$ Vault Trade Execution) cleanly and programmatically.
- [ ] Criterion 2: `npm run verify:e2e` runs end-to-end integration across both Solana and Base tokens against live DexScreener endpoints, printing clear step-by-step progress and exiting 0 with `ALL_E2E_CHECKS_PASSED`.
- [ ] Criterion 3: Automated verification validates both autonomous trade execution ($\le \$25$ returning `status: "success"`) and vault policy escalation ($> \$25$ returning `status: "pending_approval"` with user passkey `approval_url`).
- [ ] Criterion 4: All existing endpoints (`/health`, `/paybox-plugin.json`, `/openapi.json`, `/api/intel/signal`, `/api/vault/execute-trade`) remain operational and backwards compatible.

---

## Merge Gate
- [ ] All Group verifies in `plan.md` pass (with pasted evidence, not paraphrase).
- [ ] Phase integrates cleanly without breaking Phase 1, Phase 2, or Phase 3.
- [ ] Typecheck clean:
  ```bash
  npx tsc --noEmit
  ```
  *(Must exit with code 0 and zero errors)*
- [ ] No mocks/stubs/placeholder logic in the live market intelligence pipeline (DexScreener feeds real market data).
- [ ] No debug console.log statements left in committed server code (`src/server.ts`, `src/routes/`, `src/services/`).
- [ ] Installed dependency versions match `tech-stack.md`'s pinned versions:
  ```bash
  npm list express zod ethers @solana/web3.js
  ```
- [ ] Diff summary reviewed:
  ```bash
  git diff --stat 7feac03..HEAD
  ```
- [ ] Demo-able:
  ```bash
  npm run verify:e2e
  ```
  *(Must run full 5-step loop for Solana and Base, verify autonomous & escalated execution, and exit with code 0)*
