# Engineering Standards: AlphaBox

Mandatory guidelines for this project. Every feature specification, implementation plan, and executor run must strictly adhere to these standards.

---

## 1. Mocks, Stubs & Data Integrity
* **Core Demo Path:** Real, live data only. Mocks, fake timeouts, and synthetic payloads are **strictly forbidden** on the live intelligence and payment pathways. DexScreener and GoPlus data feeds must be real on-chain/market responses.
* **x402 Micro-payments:** The HTTP 402 handshake must adhere to real headers/body schemas. For local or offline test environments where on-chain settlement is simulated, an explicit `SIMULATED_PAYMENT=true` environment flag may be accepted, but it must be explicitly declared and never hidden behind mock data in production or demo runs.

---

## 2. Debug Logging & Code Cleanliness
* No dangling `console.log`, `console.debug`, or ad-hoc debug print statements in committed code.
* Use structured, leveled output or clean user-facing status messages for the demo runner. Diagnostic logs must only be output if explicitly required for error handling.
* Code must compile with zero TypeScript errors under strict mode (`"strict": true`).

---

## 3. Definition of Done (Hackathon Project Type)
* **Live End-to-End Execution:** The feature must run live end-to-end during the judge walkthrough without crashing or requiring manual code edits.
* **Working Demo Path Prioritization:** Favor completing the critical user flow (Query $\rightarrow$ 402 invoice $\rightarrow$ Payment $\rightarrow$ Intel Delivery $\rightarrow$ Scoped Execution) with high reliability and crisp visuals over exhaustive handling of obscure edge cases.
* **Manifest Validity:** The plugin manifest and OpenAPI documentation must strictly conform to PayBox marketplace registration standards.

---

## 4. What Counts as a Passing Verify Step
Every `Verify` step in any future implementation plan (`plan.md`) must be a literal, executable command with the exact expected output (or, for visual steps, literal manual steps with the exact expected screen state).
* **Invalid:** "Verify the server starts and works properly."
* **Valid:** 
  ```bash
  curl -i http://localhost:3000/api/intel/signal?token=0x4200000000000000000000000000000000000006
  # Expected: HTTP/1.1 402 Payment Required
  # Expected Header: x402-payment-request: ...
  # Expected Body contains: "price_usdc": "0.01"
  ```

---

## 5. Rollback Policy
If an unrecoverable failure occurs during a verification step:
* The executor must revert all changes made during the failing group back to the last passing group's committed state (e.g., `git checkout -- .` or `git reset --hard <last-good-commit>`).
* The executor must report **BLOCKED** against a clean git working tree with a detailed explanation of the failure mode.

---

## 6. Standards-Amendment Protocol
This file is living but protected from silent mid-build alterations.
If a recurring blocker, tech stack limitation, or architectural insight arises across multiple tasks, the executor must propose the amendment rather than making unilateral edits.
Approved amendments are recorded in the history below.

### Amendment History
*No entries yet.*
