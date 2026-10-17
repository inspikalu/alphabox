import { app } from "../server.js";
import { evaluateStopLoss, createEmergencyExitOrder } from "../services/watchdog.js";
import { Server } from "http";

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details: string;
  error?: string;
}

const results: TestResult[] = [];

async function recordTest(id: string, name: string, fn: () => Promise<string>): Promise<void> {
  const start = Date.now();
  try {
    const details = await fn();
    const durationMs = Date.now() - start;
    results.push({ id, name, passed: true, durationMs, details });
    process.stdout.write(`  [PASS] ${id}: ${name} (${durationMs}ms) -> ${details}\n`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    const errorMsg = err?.message || String(err);
    results.push({ id, name, passed: false, durationMs, details: "Failed", error: errorMsg });
    process.stderr.write(`  [FAIL] ${id}: ${name} (${durationMs}ms) -> ERROR: ${errorMsg}\n`);
  }
}

async function runAgnosticTests() {
  process.env.SIMULATE_PAYMENTS = "true";
  const TEST_PORT = 3199;
  let server: Server;

  process.stdout.write("========================================================================\n");
  process.stdout.write("       AlphaBox Agnostic Black-Box Systems Verification Suite          \n");
  process.stdout.write("========================================================================\n\n");

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => resolve());
  });

  const baseUrl = `http://localhost:${TEST_PORT}`;

  try {
    // TC-01: Health Check
    await recordTest("TC-01", "Health Endpoint Verification (GET /health)", async () => {
      const res = await fetch(`${baseUrl}/health`);
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const body = await res.json() as any;
      if (body.status !== "ok" || body.service !== "AlphaBox x402 Server") {
        throw new Error(`Unexpected payload: ${JSON.stringify(body)}`);
      }
      return `HTTP 200 OK, status: ${body.status}, service: ${body.service}`;
    });

    // TC-02: PayBox Plugin Manifest
    await recordTest("TC-02", "PayBox Plugin Marketplace Manifest (GET /paybox-plugin.json)", async () => {
      const res = await fetch(`${baseUrl}/paybox-plugin.json`);
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const manifest = await res.json() as any;
      if (manifest.name !== "AlphaBox" || manifest.schema_version !== "v1" || !Array.isArray(manifest.tools)) {
        throw new Error(`Manifest schema validation failed: ${JSON.stringify(manifest)}`);
      }
      if (manifest.tools.length < 2) throw new Error(`Expected >= 2 tools, got ${manifest.tools.length}`);
      return `Valid PayBox v1 manifest, name: ${manifest.name}, tools: [${manifest.tools.map((t: any) => t.name).join(", ")}]`;
    });

    // TC-03: OpenAPI Specification
    await recordTest("TC-03", "OpenAPI 3.1.0 Specification (GET /openapi.json)", async () => {
      const res = await fetch(`${baseUrl}/openapi.json`);
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const openapi = await res.json() as any;
      if (openapi.openapi !== "3.1.0" || !openapi.paths["/api/intel/signal"] || !openapi.paths["/api/vault/execute-trade"]) {
        throw new Error("Missing required OpenAPI paths or version mismatch");
      }
      return `Valid OpenAPI 3.1.0 schema with ${Object.keys(openapi.paths).length} endpoints`;
    });

    // TC-04: x402 Payment Enforcement
    await recordTest("TC-04", "x402 Micropayment Enforcement (Unpaid probe)", async () => {
      const res = await fetch(`${baseUrl}/api/intel/signal?token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`);
      if (res.status !== 402) throw new Error(`Expected HTTP 402, got ${res.status}`);
      const headerReq = res.headers.get("x402-payment-required");
      if (headerReq !== "true") throw new Error(`Expected x402-payment-required: true, got ${headerReq}`);
      const body = await res.json() as any;
      if (!Array.isArray(body.accepts) || body.accepts.length < 2) {
        throw new Error("Missing dual-rail payment requirement");
      }
      return `HTTP 402 received with ${body.accepts.length} payment rails (Solana & Base)`;
    });

    // TC-05: Intel Route Validation (Missing token parameter)
    await recordTest("TC-05", "Input Validation: Missing Token Query Parameter", async () => {
      const res = await fetch(`${baseUrl}/api/intel/signal`);
      // Since it's unpaid, 402 or 400 is triggered. If paid without token:
      const paidRes = await fetch(`${baseUrl}/api/intel/signal`, {
        headers: { "x-payment": "simulated_valid_payment_proof" }
      });
      if (paidRes.status !== 400) throw new Error(`Expected HTTP 400 Bad Request, got ${paidRes.status}`);
      const body = await paidRes.json() as any;
      return `HTTP 400 returned cleanly with message: "${body.message}"`;
    });

    // TC-06: Intelligence & GoPlus Security Audit Delivery
    await recordTest("TC-06", "Live DEX Intelligence & GoPlus Security Delivery (Paid access)", async () => {
      const res = await fetch(`${baseUrl}/api/intel/signal?token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`, {
        headers: { "x-payment": "simulated_valid_payment_proof" }
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const body = await res.json() as any;
      if (body.status !== "success" || !body.report) throw new Error("Invalid response format");
      const { convictionScore, priceUsd, liquidityUsd, securityAudit } = body.report;
      if (typeof convictionScore !== "number" || convictionScore < 0 || convictionScore > 100) {
        throw new Error(`Conviction score out of bounds: ${convictionScore}`);
      }
      if (!securityAudit || typeof securityAudit.riskScore !== "number") {
        throw new Error("Missing GoPlus security audit payload");
      }
      return `HTTP 200, Conviction: ${convictionScore}/100, Price: $${priceUsd}, Liq: $${liquidityUsd.toLocaleString()}, Security Risk: ${securityAudit.riskScore}/100`;
    });

    // TC-07: PayBox Autonomous Vault Trade Execution (<= $25 limit)
    await recordTest("TC-07", "PayBox Vault Autonomous Execution (Amount <= $25)", async () => {
      const order = {
        tokenIn: "USDC",
        tokenOut: "SOL",
        amountUsd: 15.00,
        slippagePercent: 0.5,
        network: "solana"
      };
      const res = await fetch(`${baseUrl}/api/vault/execute-trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const envelope = await res.json() as any;
      if (envelope.status !== "success" || !envelope.output?.transaction_hash || !envelope.output?.policy?.autonomousApproved) {
        throw new Error(`Trade output invalid: ${JSON.stringify(envelope)}`);
      }
      return `status: "success", Tx: ${envelope.output.transaction_hash}, Autonomous: true`;
    });

    // TC-08: PayBox Vault Policy Escalation (> $25 limit)
    await recordTest("TC-08", "PayBox Vault Policy Escalation (Amount > $25)", async () => {
      const order = {
        tokenIn: "USDC",
        tokenOut: "SOL",
        amountUsd: 75.00,
        slippagePercent: 1.0,
        network: "solana"
      };
      const res = await fetch(`${baseUrl}/api/vault/execute-trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const envelope = await res.json() as any;
      if (envelope.status !== "pending_approval" || !envelope.approval_url || !envelope.approval_url.includes("app.paybox.sh/approve/")) {
        throw new Error(`Escalation output invalid: ${JSON.stringify(envelope)}`);
      }
      return `status: "pending_approval", Passkey URL: ${envelope.approval_url}`;
    });

    // TC-09: Trade Input Validation (Negative trade amount)
    await recordTest("TC-09", "Input Validation: Negative Amount Order", async () => {
      const order = {
        tokenIn: "USDC",
        tokenOut: "SOL",
        amountUsd: -10,
        network: "solana"
      };
      const res = await fetch(`${baseUrl}/api/vault/execute-trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
      if (res.status !== 400) throw new Error(`Expected HTTP 400 Bad Request, got ${res.status}`);
      const envelope = await res.json() as any;
      if (envelope.status !== "error") throw new Error(`Expected status: "error", got ${envelope.status}`);
      return `HTTP 400 Bad Request returned with error envelope: "${envelope.message}"`;
    });

    // TC-10: Automated Stop-Loss Watchdog Logic
    await recordTest("TC-10", "Automated Stop-Loss Watchdog Calculation", async () => {
      const safeCheck = evaluateStopLoss(95, 100, 10);
      const breachCheck = evaluateStopLoss(85, 100, 10);
      if (safeCheck.triggered !== false) throw new Error("Expected 5% drop to not trigger 10% stop-loss");
      if (breachCheck.triggered !== true) throw new Error("Expected 15% drop to trigger 10% stop-loss");

      const exitOrder = createEmergencyExitOrder("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "USDC", 20, "solana");
      if (exitOrder.tokenIn !== "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" || exitOrder.tokenOut !== "USDC") {
        throw new Error("Emergency exit order structure malformed");
      }
      return `Watchdog evaluated safe: ${!safeCheck.triggered}, breach trigger: ${breachCheck.triggered}, emergency exit order generated`;
    });

  } finally {
    server.close();
  }

  process.stdout.write("\n========================================================================\n");
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  process.stdout.write(`SUMMARY: ${passedCount}/${results.length} PASSED, ${failedCount} FAILED\n`);
  process.stdout.write("========================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAgnosticTests();
