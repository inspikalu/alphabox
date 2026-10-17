# Requirements: x402 Micropayment Server Layer

## Scope
- **In**:
  - Express server initialization with typed configuration and CORS handling.
  - Type definitions and Zod schemas for x402 payment requirements, invoices, and payment verification proofs compliant with PayBox MCP conventions (`pay_x402`, `use_service`).
  - `x402PaymentRequired` middleware generating RFC-compliant `HTTP 402 Payment Required` responses with `accepts` specs for both Solana (`solana:devnet`, `solana:mainnet`) and Base (`eip155:8453`).
  - Payment proof verification supporting cryptographic payment signatures, transaction verification, and `SIMULATE_PAYMENTS=true` for headless testing.
  - Protected `GET /api/intel/signal` endpoint that returns full market conviction reports only upon valid payment.
- **Out**:
  - PayBox MCP manifest file generation (`paybox-plugin.json` / OpenAPI schema deferred to Phase 3).
  - Client-side execution of automated wallet trades via PayBox credential vault (deferred to Phase 3/4).
  - External database billing or session tables (stateless payment verification by design).

---

## Key Decisions
- **Decision 1 (Standard HTTP 402 Response Shape):** The 402 response payload adheres directly to the `accepts` format expected by PayBox's `pay_x402` and `use_service` tools:
  ```json
  {
    "status": 402,
    "message": "Payment Required",
    "accepts": [
      {
        "network": "solana:mainnet",
        "currency": "USDC",
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "amount": "0.01",
        "recipient": "..."
      },
      {
        "network": "eip155:8453",
        "currency": "USDC",
        "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "amount": "0.01",
        "recipient": "..."
      }
    ]
  }
  ```
- **Decision 2 (Dual Rail Payment Acceptance):** Supporting both Solana and Base simultaneously ensures compatibility with any agent wallet credential in PayBox.
- **Decision 3 (Explicit Test Simulation Flag):** Per `engineering-standards.md`, headless/test environments use an explicit `SIMULATE_PAYMENTS=true` flag to verify the middleware pipeline without moving live testnet/mainnet funds during automated checks.

---

## Context from mission.md
- **Problem addressed:** Agents cannot afford monthly SaaS plans or high token gates. They require pay-per-call micropayments ($0.01 USDC) to unlock intelligence on demand.
- **Target User:** AI trading agents and automated collectors querying real-time market signals.

---

## Context from tech-stack.md
- **Runtime & Framework:** Node.js v20+ with Express v5.3.0.
- **Pinned Dependencies for this phase:**
  - `express: ^5.3.0`
  - `cors: ^2.8.6`
  - `dotenv: ^18.0.8`
  - `zod: ^3.24.2`
  - `ethers: ^6.17.0`
  - `@solana/web3.js: ^1.99.0`
  - `typescript: ^5.8.0`
  - `tsx: ^4.23.15`
  - `@types/express: ^5.0.6`
  - `@types/cors: ^2.8.19`
- **Known Issues:** None relevant (no entries in `tech-stack.md`).

---

## User Stories Addressed
- **US-1 (Discover & Query Intelligence):** Enables an agent to query the endpoint and receive actionable `HTTP 402` payment instructions.
- **US-2 (Settle Machine-to-Machine Payment):** Validates incoming payment headers and unlocks the market conviction report.

---

## Engineering Standards (Carried Verbatim from specs/engineering-standards.md)
- **Mocks/stubs/placeholder data:** "Core Demo Path: Real, live data only. Mocks, fake timeouts, and synthetic payloads are strictly forbidden on the live intelligence and payment pathways. DexScreener and GoPlus data feeds must be real on-chain/market responses. x402 Micro-payments: The HTTP 402 handshake must adhere to real headers/body schemas. For local or offline test environments where on-chain settlement is simulated, an explicit SIMULATED_PAYMENT=true environment flag may be accepted, but it must be explicitly declared and never hidden behind mock data in production or demo runs."
- **Debug logging:** "No dangling console.log, console.debug, or ad-hoc debug print statements in committed code. Use structured, leveled output or clean user-facing status messages for the demo runner. Diagnostic logs must only be output if explicitly required for error handling. Code must compile with zero TypeScript errors under strict mode."
- **Definition of done:** "Live End-to-End Execution: The feature must run live end-to-end during the judge walkthrough without crashing or requiring manual code edits. Working Demo Path Prioritization: Favor completing the critical user flow with high reliability and crisp visuals over exhaustive handling of obscure edge cases."
- **Rollback policy:** "If an unrecoverable failure occurs during a verification step: The executor must revert all changes made during the failing group back to the last passing group's committed state (e.g., git checkout -- . or git reset --hard <last-good-commit>). The executor must report BLOCKED against a clean git working tree with a detailed explanation of the failure mode."

---

## External Dependencies
- **Solana RPC Endpoint:** `https://api.devnet.solana.com` or `https://api.mainnet-beta.solana.com` (documented in `specs/resources.md`).
- **Base RPC Endpoint:** `https://mainnet.base.org` or `https://sepolia.base.org` (documented in `specs/resources.md`).
- **DexScreener API:** Real-time token market data feed built in Phase 1.
