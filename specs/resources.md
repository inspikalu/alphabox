# Resources: AlphaBox

External services, APIs, and public infrastructure required for AlphaBox. Never store private keys or API secrets directly in this repository.

---

## 1. External APIs & Data Feeds

| Service / API | Purpose | Auth / Credentials | Documentation & Endpoint |
| :--- | :--- | :--- | :--- |
| **DexScreener API** | Live token price, 24h volume, liquidity, buy/sell transaction count | **None required** (Public, free) | `https://api.dexscreener.com/latest/dex/tokens/:tokenAddress` |
| **GoPlus Security API** | Smart contract rugcheck, honeypot detection, mint authority status | **None required** (Public, free) | `https://api.gopluslabs.io/api/v1/token_security/:chainId` |
| **Base RPC Endpoint** | On-chain payment verification and PayBox wallet transaction routing (EVM) | Public RPC or Alchemy/Infura (Public: `https://mainnet.base.org` or `https://sepolia.base.org`) | Base Developer Documentation (`https://docs.base.org`) |
| **Solana RPC Endpoint** | On-chain payment verification and PayBox wallet transaction routing (Solana) | Public RPC or Helius/Triton (Public: `https://api.mainnet-beta.solana.com` or `https://api.devnet.solana.com`) | Solana Developer Documentation (`https://docs.solana.com`) |

---

## 2. PayBox Ecosystem Services

| Service / Tool | Purpose | Requirements / Access |
| :--- | :--- | :--- |
| **PayBox Developer Portal** | Register plugin, obtain client credentials, submit hackathon entry | Registered via `https://developer.paybox.sh/` |
| **PayBox MCP Server** | Connects to PayBox non-custodial wallet & credential vault | `https://api.paybox.sh/mcp` (Streamable HTTP, OAuth 2.1 / passkey) |
| **x402 Protocol Specification** | Standard HTTP 402 header and response schemas | `https://x402.org` / PayBox docs |

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env` when deploying:

```bash
PORT=3000
NODE_ENV=development

# Blockchain Rail Configuration (Supports Solana & Base)
DEFAULT_CHAIN=solana # "solana" or "base"

# Base (EVM) Configuration
BASE_PAYMENT_RECEIVER_ADDRESS=0x0000000000000000000000000000000000000000
BASE_CHAIN_ID=8453 # 8453 for Base Mainnet, 84532 for Base Sepolia

# Solana Configuration
SOLANA_PAYMENT_RECEIVER_ADDRESS=11111111111111111111111111111111 # Base58 Solana payout address
SOLANA_RPC_URL=https://api.devnet.solana.com # Or https://api.mainnet-beta.solana.com
SOLANA_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v # Mainnet USDC mint (or Devnet mint)

# Testing & Execution Flags
SIMULATE_PAYMENTS=false # Set to true only in headless CI / offline test runs
```
