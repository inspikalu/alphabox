# Plan: x402 Micropayment Server Layer

## Group 1 — Express Server Setup & Configuration Layer
- [x] Task: Create `src/config.ts` loading and validating environment variables with Zod (`PORT`, `NODE_ENV`, `DEFAULT_CHAIN`, `SOLANA_PAYMENT_RECEIVER_ADDRESS`, `BASE_PAYMENT_RECEIVER_ADDRESS`, `SOLANA_USDC_MINT`, `SIMULATE_PAYMENTS`).
- [x] Task: Create `src/server.ts` configuring an Express application with JSON middleware, CORS, and a health check route `GET /health` returning `{ status: "ok", timestamp: string }`.
- [x] Task: Add npm script `"start": "tsx src/server.ts"` to `package.json`.
- [x] **Verify**: `npx tsx -e "import { app } from './src/server.ts'; const s = app.listen(3001, () => { fetch('http://localhost:3001/health').then(r => r.json()).then(d => { s.close(); console.log('HEALTH_STATUS:' + d.status); process.exit(d.status === 'ok' ? 0 : 1); }); });"` → GOT: "HEALTH_STATUS:ok" ✅

---

## Group 2 — x402 Payment Types & Middleware Implementation
- [x] Task: Create `src/types/x402.ts` defining Zod schemas and TypeScript interfaces for `PaymentRequirements`, `PaymentInvoice`, `PaymentProof`, and `X402Headers` compliant with x402 standard and PayBox `accepts` parameter schema.
- [x] Task: Create `src/middleware/x402.ts` implementing `x402PaymentRequired` middleware that checks for incoming payment proofs (`x-payment` or `Authorization: Bearer <proof>`), returns `HTTP 402 Payment Required` with `x402-payment-required: true` header and payment invoice payload when unpaid, and validates authorized requests.
- [x] **Verify**: `npx tsx -e "import { app } from './src/server.ts'; const s = app.listen(3002, () => { fetch('http://localhost:3002/api/intel/signal?token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v').then(r => { s.close(); console.log('HTTP_STATUS:' + r.status + ',HEADER:' + r.headers.get('x402-payment-required')); process.exit(r.status === 402 ? 0 : 1); }); });"` → GOT: "HTTP_STATUS:402,HEADER:true" ✅

---

## Group 3 — Protected Intelligence Signal Route & Verification
- [ ] Task: Create `src/routes/intel.ts` mounting `GET /api/intel/signal` behind `x402PaymentRequired` middleware, accepting `token` query parameter, delegating to `analyzeToken(token)`, and returning the `MarketSignalReport`.
- [ ] Task: Mount `intelRouter` onto `app` in `src/server.ts` under `/api/intel`.
- [ ] **Verify**: `npx tsx -e "import { app } from './src/server.ts'; process.env.SIMULATE_PAYMENTS = 'true'; const s = app.listen(3003, () => { fetch('http://localhost:3003/api/intel/signal?token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', { headers: { 'x-payment': 'simulated_valid_payment_proof' } }).then(r => r.json()).then(d => { s.close(); console.log('SIGNAL_RECEIVED:' + (d.status === 'success' && typeof d.report?.convictionScore === 'number')); process.exit(d.status === 'success' ? 0 : 1); }); });"` → expect `SIGNAL_RECEIVED:true`.
