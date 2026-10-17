# Requirements: PayBox Vault Scoped Execution & Manifest

## Scope
- **In**:
  - Vault policy validation engine (`src/services/vault-policy.ts`) enforcing user safety limits: default maximum trade limit ($25.00), maximum slippage tolerance (1.5%), and supported networks (`solana`, `base`).
  - Scoped trade execution route `POST /api/vault/execute-trade` producing PayBox-compliant result envelopes (`status: "success"` for autonomous execution within policy, or `status: "pending_approval"` with an `approval_url` when policy limits are exceeded).
  - PayBox marketplace manifest (`paybox-plugin.json`) specifying plugin identity, category (Consumer Finance / Predictions), icons, auth methods, and capabilities.
  - OpenAPI 3.1 specification (`/openapi.json`) defining the typed REST and MCP tool schemas for `/api/intel/signal` and `/api/vault/execute-trade`.
  - Static root export of `paybox-plugin.json` and `openapi.json` for portal upload.
- **Out**:
  - Full end-to-end multi-step interactive CLI runner demo (reserved for Phase 4 / Core Integration & Verification).
  - External database state persistence (stateless by design per `tech-stack.md`).
  - Native private key custody (PayBox uses non-custodial MPC; keys are never handled by the plugin).

---

## Key Decisions
- **Decision 1 (PayBox MCP Result Envelope Schema):** To maintain 100% compatibility with PayBox's request lifecycle, responses from `/api/vault/execute-trade` use the standard PayBox envelope:
  ```json
  {
    "request_id": "req_...",
    "status": "success",
    "output": {
      "transaction_hash": "...",
      "network": "solana",
      "tokenIn": "USDC",
      "tokenOut": "SOL",
      "amountIn": 10,
      "estimatedOutput": "0.0955 SOL",
      "policy_checked": true
    }
  }
  ```
  If an order exceeds the vault policy limit ($25 USD), it returns:
  ```json
  {
    "request_id": "req_...",
    "status": "pending_approval",
    "approval_url": "https://app.paybox.sh/approve/req_...",
    "message": "Order of $50.00 exceeds autonomous limit of $25.00. Passkey approval required."
  }
  ```
- **Decision 2 (OpenAPI 3.1 Specification Standard):** Both PayBox and modern agent hosts (Claude, OpenAI, Cursor) parse OpenAPI 3.1 specs to expose tools to agents.

---

## Context from mission.md
- **Problem addressed:** Traditional bots require raw private keys to execute trades, creating massive security hazards. PayBox provides a non-custodial vault where agents execute under scoped authority.
- **Target User:** AI trading agents executing high-conviction trades safely within predefined policy limits.

---

## Context from tech-stack.md
- **Runtime & Language:** Node.js v20+ with TypeScript v5.8.0.
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
- **US-4 (Execute Scoped Trade):** Allows an authorized AI agent to trigger a trade execution via PayBox within strict user-defined policy limits.
- **US-5 (Audit & Verification):** Provides an auditable status transition and verifiable result envelope.

---

## Engineering Standards (Carried Verbatim from specs/engineering-standards.md)
- **Mocks/stubs/placeholder data:** "Core Demo Path: Real, live data only. Mocks, fake timeouts, and synthetic payloads are strictly forbidden on the live intelligence and payment pathways. DexScreener and GoPlus data feeds must be real on-chain/market responses. x402 Micro-payments: The HTTP 402 handshake must adhere to real headers/body schemas. For local or offline test environments where on-chain settlement is simulated, an explicit SIMULATED_PAYMENT=true environment flag may be accepted, but it must be explicitly declared and never hidden behind mock data in production or demo runs."
- **Debug logging:** "No dangling console.log, console.debug, or ad-hoc debug print statements in committed code. Use structured, leveled output or clean user-facing status messages for the demo runner. Diagnostic logs must only be output if explicitly required for error handling. Code must compile with zero TypeScript errors under strict mode."
- **Definition of done:** "Live End-to-End Execution: The feature must run live end-to-end during the judge walkthrough without crashing or requiring manual code edits. Working Demo Path Prioritization: Favor completing the critical user flow with high reliability and crisp visuals over exhaustive handling of obscure edge cases."
- **Rollback policy:** "If an unrecoverable failure occurs during a verification step: The executor must revert all changes made during the failing group back to the last passing group's committed state (e.g., git checkout -- . or git reset --hard <last-good-commit>). The executor must report BLOCKED against a clean git working tree with a detailed explanation of the failure mode."

---

## External Dependencies
- **PayBox Marketplace Standard:** `paybox-plugin.json` schema and OpenAPI specification per `docs.paybox.sh`.
