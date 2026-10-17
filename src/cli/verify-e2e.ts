import { app } from "../server.js";
import { AgentClient } from "../services/agent-client.js";

async function runE2E() {
  process.env.SIMULATE_PAYMENTS = "true";
  const TEST_PORT = 3088;

  process.stdout.write("=====================================================\n");
  process.stdout.write("  AlphaBox E2E Autonomous Agent Integration Runner   \n");
  process.stdout.write("=====================================================\n\n");

  const server = app.listen(TEST_PORT);
  const baseUrl = `http://localhost:${TEST_PORT}`;
  const client = new AgentClient(baseUrl);

  try {
    // ----------------------------------------------------
    // Scenario 1: Solana Rail (SPL Token) — Autonomous Path
    // ----------------------------------------------------
    const solanaToken = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // Solana USDC
    process.stdout.write(`[1/2] Testing Solana Rail (${solanaToken})...\n`);

    // 1. Discovery
    process.stdout.write("  -> Probing /api/intel/signal (expecting HTTP 402)... ");
    const solProbe = await client.probeIntel(solanaToken);
    if (!solProbe.isPaymentRequired || solProbe.statusCode !== 402) {
      throw new Error(`Expected HTTP 402, received ${solProbe.statusCode}`);
    }
    const hasSolanaRail = solProbe.invoice?.accepts.some(a => a.network.startsWith("solana:"));
    if (!hasSolanaRail) {
      throw new Error("Solana payment rail missing from 402 invoice");
    }
    process.stdout.write("OK (HTTP 402 received with solana payment rail)\n");

    // 2. Settlement & Intelligence Delivery
    process.stdout.write("  -> Settling x402 payment & fetching live market alpha... ");
    const solIntel = await client.settleAndFetchIntel(solanaToken, "simulated_valid_payment_proof");
    if (solIntel.status !== "success" || !solIntel.report) {
      throw new Error(`Failed to receive intelligence: ${solIntel.error}`);
    }
    const { convictionScore, signalConfidence, priceUsd, liquidityUsd } = solIntel.report;
    process.stdout.write(`OK (Conviction: ${convictionScore}/100, Confidence: ${signalConfidence}, Price: $${priceUsd}, Liquidity: $${liquidityUsd.toLocaleString()})\n`);

    // 3. Scoped Autonomous Trade Execution ($15 <= $25 limit)
    process.stdout.write("  -> Executing policy-bounded trade ($15 USDC -> SOL, limit $25)... ");
    const autoTrade = await client.executeVaultTrade({
      tokenIn: "USDC",
      tokenOut: "SOL",
      amountUsd: 15,
      slippagePercent: 0.5,
      network: "solana"
    });
    if (autoTrade.status !== "success" || !autoTrade.output?.transaction_hash) {
      throw new Error(`Expected autonomous trade success, got status: ${autoTrade.status}`);
    }
    process.stdout.write(`OK (Status: success, Tx: ${autoTrade.output.transaction_hash}, Autonomous: ${autoTrade.output.policy.autonomousApproved})\n\n`);

    // ----------------------------------------------------
    // Scenario 2: Base Rail (ERC-20 Token) — Escalation Path
    // ----------------------------------------------------
    const baseToken = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
    process.stdout.write(`[2/2] Testing Base Rail (${baseToken})...\n`);

    // 1. Discovery
    process.stdout.write("  -> Probing /api/intel/signal (expecting HTTP 402)... ");
    const baseProbe = await client.probeIntel(baseToken);
    if (!baseProbe.isPaymentRequired || baseProbe.statusCode !== 402) {
      throw new Error(`Expected HTTP 402, received ${baseProbe.statusCode}`);
    }
    const hasBaseRail = baseProbe.invoice?.accepts.some(a => a.network.startsWith("eip155:"));
    if (!hasBaseRail) {
      throw new Error("Base EVM payment rail missing from 402 invoice");
    }
    process.stdout.write("OK (HTTP 402 received with Base EVM rail)\n");

    // 2. Settlement & Intelligence Delivery
    process.stdout.write("  -> Settling x402 payment & fetching live market alpha... ");
    const baseIntel = await client.settleAndFetchIntel(baseToken, "simulated_valid_payment_proof");
    if (baseIntel.status !== "success" || !baseIntel.report) {
      throw new Error(`Failed to receive intelligence: ${baseIntel.error}`);
    }
    process.stdout.write(`OK (Conviction: ${baseIntel.report.convictionScore}/100, Dex: ${baseIntel.report.dexId})\n`);

    // 3. Over-Limit Trade Execution ($50 > $25 limit)
    process.stdout.write("  -> Triggering trade exceeding policy ($50 USDC -> WETH, limit $25)... ");
    const escalatedTrade = await client.executeVaultTrade({
      tokenIn: "USDC",
      tokenOut: "WETH",
      amountUsd: 50,
      slippagePercent: 1.0,
      network: "base"
    });
    if (escalatedTrade.status !== "pending_approval" || !escalatedTrade.approval_url) {
      throw new Error(`Expected status: pending_approval, got: ${escalatedTrade.status}`);
    }
    process.stdout.write(`OK (Status: pending_approval, Passkey URL: ${escalatedTrade.approval_url})\n\n`);

    // ----------------------------------------------------
    // Summary
    // ----------------------------------------------------
    process.stdout.write("=====================================================\n");
    process.stdout.write("ALL_E2E_CHECKS_PASSED\n");
    process.stdout.write("  - 402 Discovery: Verified on Solana & Base\n");
    process.stdout.write("  - Settlement & Live DexScreener Alpha: Verified\n");
    process.stdout.write("  - Autonomous Trade Execution (<= $25): Verified\n");
    process.stdout.write("  - Policy Escalation Flow (> $25): Verified\n");
    process.stdout.write("=====================================================\n");

    server.close();
    process.exit(0);
  } catch (error: any) {
    process.stderr.write(`\nE2E VERIFICATION FAILED: ${error?.message || error}\n`);
    server.close();
    process.exit(1);
  }
}

runE2E();
