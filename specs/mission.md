# Mission: AlphaBox

## 1. Problem Statement
AI agents operating in crypto today lack safe, autonomous financial autonomy. Existing intelligence terminals like AIXBT generate valuable market signals and on-chain sentiment, but they are purely read-only and broadcast-based:
1. **Agents cannot act:** When alpha is detected, agents cannot immediately execute trades without holding unprotected private keys.
2. **High access barriers:** Autonomous agents cannot pay thousands of dollars in token gates or recurring monthly subscriptions just to query an endpoint once.
3. **Security hazard:** Giving an autonomous agent full wallet keys creates catastrophic drain risk.

PayBox solves this by providing a non-custodial credential vault where agents act under strict scoped authority, speaking x402 micro-payments natively.

## 2. Target User
- **Autonomous AI Agents & Agent Operators:** AI trading bots, portfolio assistants, and conversational agents looking to query high-signal crypto intelligence on a pay-per-call basis and execute trades securely within preset risk policies.
- **DeFi Traders & Developers:** Users who want an automated terminal that executes on verified market momentum without ever risking raw private keys or exceeding personal trade budgets.

## 3. One-Sentence Value Proposition
AlphaBox is an x402-native market intelligence and scoped trading plugin for the PayBox marketplace, enabling AI agents to pay micro-cents for real-time crypto alpha and execute policy-bounded trades via PayBox's non-custodial credential vault.

---

## 4. Core User Stories
- **US-1 (Discover & Query Intelligence):** As an AI agent, I want to query the `/intel/signal` endpoint for a target token and receive standard `HTTP 402 Payment Required` instructions, so that I can discover the price and payment rail without prior subscription.
- **US-2 (Settle Machine-to-Machine Payment):** As an AI agent with a PayBox wallet credential, I want to fulfill the x402 micro-payment invoice ($0.01 USDC), so that I can unlock the full real-time alpha, momentum, and liquidity metrics for that token.
- **US-3 (Evaluate Risk & Safety):** As an AI agent or trader, I want the intelligence report to include algorithmic conviction scoring and contract safety checks (honeypot, liquidity lock), so that I avoid malicious or illiquid tokens.
- **US-4 (Execute Scoped Trade):** As an authorized AI agent, I want to trigger a trade execution via PayBox within strict user-defined policy limits (e.g. max trade amount, permitted token pairs), so that I capture alpha without risking the user's entire portfolio.
- **US-5 (Audit & Verification):** As a user, I want every trade and payment action to generate an auditable record with explicit status transitions, so that I have full oversight and revocation power over agent activity.

---

## 5. Hackathon Deliverables & Criteria (MoonPay Hackathons: Chapter 1)

### Literal Required Deliverables ("Must-Have to Qualify")
1. **Working PayBox Marketplace Plugin:** A live plugin functioning end-to-end, exposing an OpenAPI/manifest and an x402-compliant endpoint that integrates into the PayBox agent ecosystem.
2. **Demo Video:** A short video showing the live plugin functioning end-to-end, posted to X (Twitter).
3. **Official Submission:** Project registered and submitted on the developer dashboard before the deadline: **Saturday, October 17 at 8:00 PM EDT**.

### Approved Stretch Goals (Gated on Core Completion)
1. **Interactive Visual Demo Runner:** Clean CLI / web demonstration runner displaying live token gauges, x402 invoice settlement, and PayBox execution flow in real-time.
2. **Deep Security & Rugcheck Gauge:** Live GoPlus security verification data (honeypot test, mint authority, LP burn %) embedded in the intelligence response.
3. **Automated Stop-Loss Watchdog:** Simulated monitoring mechanism that triggers a protective exit swap if sentiment or liquidity drops below safe thresholds.

### Judging & Scoring Criteria
- **Quality & Technical Execution:** Live functionality, clean architecture, adherence to x402 and PayBox MCP/plugin standards.
- **Creativity & Utility:** Concrete value for AI agents in Consumer Finance / Predictions tracks.
- **Completeness & Compliance:** End-to-end flow operating without simulated/faked results in the core path.
