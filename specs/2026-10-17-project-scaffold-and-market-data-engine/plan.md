# Plan: Project Scaffold & Market Data Engine

## Group 1 — Project Initialization & TypeScript Configuration
- [ ] Task: Create `package.json` with pinned dependencies (`express: ^5.3.0`, `cors: ^2.8.6`, `dotenv: ^18.0.8`, `zod: ^3.24.2`, `ethers: ^6.17.0`, `@solana/web3.js: ^1.99.0`, and devDependencies `typescript: ^5.8.0`, `tsx: ^4.23.15`, `@types/node: ^22.0.0`, `@types/express: ^5.0.6`, `@types/cors: ^2.8.19`).
- [ ] Task: Create `tsconfig.json` with strict mode, target `ES2022`, module resolution `NodeNext`, and source directories configured.
- [ ] Task: Create `.env.example` documenting default environment configuration (`PORT=3000`, `NODE_ENV=development`, `DEFAULT_CHAIN=solana`).
- [ ] Task: Install project dependencies using `npm install`.
- [ ] **Verify**: `npm run typecheck || npx tsc --noEmit` → expect exit code `0` with no type errors.

---

## Group 2 — DexScreener Market Data Service
- [ ] Task: Create `src/types/market.ts` defining Zod schemas and TypeScript interfaces for `TokenPairData`, `DexScreenerResponse`, and `MarketSignalReport`.
- [ ] Task: Create `src/services/dexscreener.ts` implementing `fetchTokenPairs(tokenAddress: string)` using Node native `fetch` to query `https://api.dexscreener.com/latest/dex/tokens/:tokenAddress` and return validated pairs for Solana and Base tokens.
- [ ] **Verify**: `npx tsx -e "import { fetchTokenPairs } from './src/services/dexscreener.js'; fetchTokenPairs('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v').then(p => { if (!p || p.length === 0) process.exit(1); console.log('PAIRS_FOUND:' + (p.length > 0)); }).catch(() => process.exit(1));"` → expect `PAIRS_FOUND:true`.

---

## Group 3 — Deterministic Conviction & Momentum Scorer
- [ ] Task: Create `src/services/scorer.ts` implementing `calculateConvictionScore(pairData: TokenPairData)` to compute a deterministic 0–100 score based on liquidity depth, volume-to-liquidity ratio, buy/sell transaction momentum, and 1h/24h price trend.
- [ ] Task: Create `src/services/market-engine.ts` implementing `analyzeToken(tokenAddress: string)` that coordinates fetching token pair data from `DexScreenerService`, filters for the primary pool by liquidity, and computes the `MarketSignalReport`.
- [ ] **Verify**: `npx tsx -e "import { analyzeToken } from './src/services/market-engine.js'; analyzeToken('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v').then(r => { if (typeof r.convictionScore !== 'number' || r.convictionScore < 0 || r.convictionScore > 100) process.exit(1); console.log('SCORE_VALID:' + (r.convictionScore >= 0 && r.convictionScore <= 100)); }).catch(() => process.exit(1));"` → expect `SCORE_VALID:true`.

---

## Group 4 — CLI Verification Runner
- [ ] Task: Create `src/cli/verify-market.ts` enabling command-line testing of any Solana or Base token address (e.g. `--token <address>`) and outputting formatted JSON containing token symbol, price USD, liquidity, 24h volume, buy/sell ratio, and conviction score.
- [ ] Task: Add npm script `"verify:market": "tsx src/cli/verify-market.ts"` in `package.json`.
- [ ] **Verify**: `npx tsx src/cli/verify-market.ts --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` → expect exit code `0` and JSON output containing `"status":"success"` and `"convictionScore":`.
