# Validation: PayBox Vault Scoped Execution & Manifest

## Acceptance Criteria
- [ ] Criterion 1: Vault policy engine enforces trade limits: approvals granted for trades $\le$ $25 USD, and rejected or escalated for trades exceeding policy.
- [ ] Criterion 2: `POST /api/vault/execute-trade` returns a valid PayBox `ResultEnvelope` with `status: "success"` and transaction payload for compliant orders.
- [ ] Criterion 3: `POST /api/vault/execute-trade` returns `status: "pending_approval"` with an `approval_url` when order amounts exceed autonomous policy limits ($25 USD).
- [ ] Criterion 4: `GET /paybox-plugin.json` and `GET /openapi.json` serve valid schemas conforming to the PayBox marketplace plugin standard, and static copies exist in root.

---

## Merge Gate
- [ ] All Group verifies in `plan.md` pass with pasted terminal output evidence.
- [ ] Phase integrates cleanly without breaking Phase 1 or Phase 2 (`/health` and `/api/intel/signal` remain operational).
- [ ] Typecheck clean:
  ```bash
  npx tsc --noEmit
  ```
  *(Must exit with code 0 and zero errors)*
- [ ] No mocks/stubs/placeholder logic in the live execution pipeline.
- [ ] No debug console.log statements left in committed server code.
- [ ] Installed dependency versions match `tech-stack.md`'s pinned versions:
  ```bash
  npm list express zod ethers @solana/web3.js
  ```
- [ ] Working tree status and diff summary reviewed:
  ```bash
  git status --short
  ```
- [ ] Demo-able:
  ```bash
  # Test 1: Sub-$25 autonomous trade -> Expect status "success"
  curl -i -X POST http://localhost:3000/api/vault/execute-trade -H "Content-Type: application/json" -d '{"tokenIn":"USDC","tokenOut":"SOL","amountUsd":10,"slippagePercent":0.5,"network":"solana"}'
  # Test 2: Over-$25 trade -> Expect status "pending_approval"
  curl -i -X POST http://localhost:3000/api/vault/execute-trade -H "Content-Type: application/json" -d '{"tokenIn":"USDC","tokenOut":"SOL","amountUsd":50,"slippagePercent":0.5,"network":"solana"}'
  # Test 3: Manifest check -> Expect 200 OK
  curl -s http://localhost:3000/paybox-plugin.json | grep -o '"name": "AlphaBox"'
  ```
