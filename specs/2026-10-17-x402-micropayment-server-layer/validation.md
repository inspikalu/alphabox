# Validation: x402 Micropayment Server Layer

## Acceptance Criteria
- [ ] Criterion 1: Express server starts cleanly, loads typed config, and responds with `{ "status": "ok" }` on `GET /health`.
- [ ] Criterion 2: Unpaid requests to `GET /api/intel/signal?token=<address>` return `HTTP 402 Payment Required` with `x402-payment-required: true` header and valid `accepts` payment requirements array.
- [ ] Criterion 3: Payment requirements include pricing ($0.01 USDC), valid recipient addresses, and multi-rail support (`solana:mainnet`/`solana:devnet` and `eip155:8453`).
- [ ] Criterion 4: Requests with a valid payment proof (`x-payment` or `Authorization`) pass the middleware and return the full `MarketSignalReport` payload with HTTP 200.

---

## Merge Gate
- [ ] All Group verifies in `plan.md` pass with pasted terminal output evidence.
- [ ] Phase integrates without breaking Phase 1 (`npm run verify:market` continues to work).
- [ ] Typecheck clean:
  ```bash
  npx tsc --noEmit
  ```
  *(Must exit with code 0 and zero errors)*
- [ ] No mocks/stubs/placeholder logic in the payment path outside explicit `SIMULATE_PAYMENTS=true` test flag.
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
  # Step 1: Probe unpaid endpoint -> Expect 402 Payment Required
  curl -i http://localhost:3000/api/intel/signal?token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
  # Step 2: Query with payment proof -> Expect 200 OK with conviction metrics
  curl -i -H "x-payment: simulated_valid_payment_proof" http://localhost:3000/api/intel/signal?token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
  ```
