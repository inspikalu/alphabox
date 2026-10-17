# Validation: Project Scaffold & Market Data Engine

## Acceptance Criteria
- [ ] Criterion 1: Project initializes with TypeScript strict mode enabled and compiles with zero errors via `npx tsc --noEmit`.
- [ ] Criterion 2: `DexScreenerService` retrieves live, real-world DEX market pairs for both Solana (e.g. USDC `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`) and Base (e.g. WETH `0x4200000000000000000000000000000000000006`) tokens without authentication.
- [ ] Criterion 3: `ConvictionScorer` calculates a deterministic score strictly bounded between 0 and 100 based on verified liquidity, buy/sell transaction count, and price velocity.
- [ ] Criterion 4: CLI verification tool (`src/cli/verify-market.ts`) runs successfully against a live token and outputs clean JSON report with `"status": "success"` and numeric conviction metrics.

---

## Merge Gate
- [ ] All Group verifies in `plan.md` pass with pasted terminal output evidence.
- [ ] Phase integrates cleanly as the baseline foundation.
- [ ] Typecheck clean:
  ```bash
  npx tsc --noEmit
  ```
  *(Must exit with code 0 and zero errors)*
- [ ] No mocks/stubs/placeholder logic in the live market data path (`fetchTokenPairs` connects to the real DexScreener API).
- [ ] No dangling debug `console.log` statements outside explicit CLI reporting functions.
- [ ] Installed dependency versions match `tech-stack.md`'s pinned versions:
  ```bash
  npm list express zod ethers @solana/web3.js typescript tsx
  ```
  *(Verify output versions match pinned spec)*
- [ ] Working tree status and diff summary reviewed:
  ```bash
  git status --short
  ```
- [ ] Demo-able: Running `npx tsx src/cli/verify-market.ts --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` prints live, real-time token market data and conviction analysis to the console.
