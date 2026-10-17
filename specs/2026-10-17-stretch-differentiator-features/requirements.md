# Requirements: Stretch Differentiator Features (S-1, S-2, S-3)

## Scope
- **In**:
  - **S-2 (GoPlus Security & Rugcheck Gauge)**: Implement `src/services/security.ts` querying the public GoPlus Security API for both EVM (Base) and Solana tokens. Check honeypot flags, transfer tax (>5% penalty), mint authority revoked status, and freeze authority. Incorporate a dynamic risk score and penalty into the market intelligence report.
  - **S-3 (Automated Stop-Loss Watchdog)**: Implement `src/services/watchdog.ts` providing an automated risk monitor function `evaluateStopLoss(currentPrice, entryPrice, stopLossPercentage)` that detects downward momentum breaches and generates an authorized PayBox emergency exit swap request.
  - **S-1 (Interactive Visual Demo Runner)**: Implement `src/cli/demo-runner.ts` and add `npm run demo` script in `package.json`. Formats terminal output with ASCII headers, color-coded conviction gauge bars (`[████████░░] 80/100`), live x402 payment negotiation status, security audit breakdown, and trade execution receipt.
- **Out**:
  - Deployment of a hosted frontend web application (CLI visualization provides maximum high-fidelity live demo impact for the hackathon video).
  - Mainnet token transfer transactions with real gas fees (simulated settlement flag handles execution tests; DexScreener & GoPlus live APIs are real).

## Key Decisions
- **GoPlus Public API Integration**: GoPlus is zero-cost, zero-auth, and fast. Provides real on-chain contract audits for both Base (`chainId=8453`) and Solana.
- **Unified Visual Runner (`npm run demo`)**: Combines market discovery, GoPlus security analysis, x402 invoice payment, conviction gauge, and vault execution into a single cinematic CLI presentation ideal for the 2-minute demo video.
- **Defensive Watchdog Strategy**: When token price falls by more than preset threshold (default 10%), watchdog automatically triggers a PayBox exit swap to protect capital.

## Context from mission.md
- **Approved Stretch Goals**:
  - S-1: Interactive Visual Demo Runner
  - S-2: Deep Security & Rugcheck Gauge
  - S-3: Automated Stop-Loss Watchdog
- **Core User Stories**: US-3 (Evaluate Risk & Safety) and US-4 (Execute Scoped Trade).

## Context from tech-stack.md
- **Contract Security Feed**: GoPlus Security Public API (`https://api.gopluslabs.io/api/v1/`).
- **Dependencies**: Node.js v20+, TypeScript strict, Express 5.3, Zod 3.25, Ethers 6.17, @solana/web3.js 1.99.

## Engineering Standards (carried from specs/engineering-standards.md)
- **Mocks, Stubs & Data Integrity**: Core Demo Path: Real, live data only. Mocks, fake timeouts, and synthetic payloads are **strictly forbidden** on the live intelligence, security, and payment pathways. DexScreener and GoPlus data feeds must be real on-chain/market responses.
- **Debug Logging & Code Cleanliness**: No dangling `console.log`, `console.debug`, or ad-hoc debug print statements in committed routes/services code. Clean, deliberate terminal formatting is permitted in CLI runners (`src/cli/demo-runner.ts`).
- **Definition of Done**: Live end-to-end execution without errors.
- **Rollback Policy**: Revert failing group to the last passing group's committed state on unrecoverable failure.

## External Dependencies
- **GoPlus API**: `https://api.gopluslabs.io/api/v1/token_security/` (EVM) and `https://api.gopluslabs.io/api/v1/solana/token_security` (Solana). Public, zero auth.
- **DexScreener API**: `https://api.dexscreener.com/latest/dex/tokens/` (public, zero auth).
