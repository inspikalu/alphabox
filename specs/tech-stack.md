# Tech Stack: AlphaBox

## 1. Chosen Stack & Rationale

| Layer / Technology | Choice | Rationale |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v20+ LTS) | Stable, ubiquitous runtime with native fetch and broad library support for Web3 and HTTP standards. |
| **Language** | TypeScript (v5.x) | Strict type safety for data models, API envelopes, and PayBox tool schemas. |
| **Server Framework** | Express (v4.19.x) | Minimalist, low-overhead HTTP server ideal for implementing custom x402 payment headers and JSON endpoints. |
| **Payment Protocol** | x402 (HTTP 402 Standard) | Native machine-to-machine payment protocol recognized by PayBox, enabling pay-per-call micropayments. |
| **Agent Tool Protocol** | PayBox Plugin / MCP Manifest | Standard JSON manifest and OpenAPI 3.1 specification compatible with PayBox marketplace discovery. |
| **Market Data Feed** | DexScreener Public API | Free, zero-auth, real-time DEX liquidity, volume, price, and buy/sell transaction velocity. |
| **Contract Security Feed** | GoPlus Security Public API | Free, zero-auth smart contract audit API for detecting honeypots, transfer fees, and mint authority. |
| **Blockchain Rails** | Solana (`solana:mainnet` / `solana:devnet`) & Base (`eip155:8453` / `eip155:84532`) | Fast, sub-cent L1/L2 rails natively supported by MoonPay, PayBox (`usdc_sol` & `usdc_base`), and x402. |

---

## 2. Pinned Dependencies

```json
{
  "dependencies": {
    "express": "^5.3.0",
    "cors": "^2.8.6",
    "dotenv": "^18.0.8",
    "zod": "^3.24.2",
    "ethers": "^6.17.0",
    "@solana/web3.js": "^1.99.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "@types/node": "^22.0.0",
    "@types/express": "^5.0.6",
    "@types/cors": "^2.8.19",
    "tsx": "^4.23.15"
  }
}
```
*Note on versions: Core runtime, framework, and Web3 SDKs are pinned to their latest stable releases on npm. Minor patch increments within the specified semver ranges are acceptable.*

---

## 3. Ruled Out Choices

* **Python / FastAPI:** Ruled out to maintain 100% ecosystem alignment with PayBox's typed TypeScript SDK, Node MCP tool contracts, and standard JS/TS tooling.
* **Complex Database (PostgreSQL / MongoDB):** Ruled out for this hackathon build. The server is stateless; historical tracking is maintained in-memory or persisted via lightweight JSON logs to eliminate database hosting latency and credentials.
* **Heavyweight ML Frameworks (PyTorch / TensorFlow):** Ruled out. Sentiment and conviction scoring uses a deterministic, transparent composite formula based on live liquidity, buy/sell pressure, and security flags.
* **Paid Commercial Data APIs (CoinMarketCap / Moralis Enterprise / Nansen):** Ruled out. Only zero-cost, zero-auth public APIs (DexScreener, GoPlus) are used to ensure the demo has zero running cost and zero external credential blockers.

---

## 4. Change Log

- [2026-10-17] Phase: Scaffold. Added Solana (`solana:mainnet` / `solana:devnet`) as a primary blockchain rail alongside Base, and added `@solana/web3.js`. Rationale: PayBox natively supports Solana wallets and `usdc_sol` micropayments; Solana is central to high-velocity AI agent and DEX token volumes. Confirmed by user.
- [2026-10-17] Phase: Scaffold. Upgraded all stack dependencies to the latest published releases on npm (`express` 5.3.0, `@solana/web3.js` 1.99.0, `ethers` 6.17.0, `dotenv` 18.0.8, `tsx` 4.23.15, and corresponding `@types`). Confirmed by user.

---

## 5. Known Issues

*No entries yet.*
