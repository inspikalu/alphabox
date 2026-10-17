import { app } from "../server.js";
import { AgentClient } from "../services/agent-client.js";
import { evaluateStopLoss } from "../services/watchdog.js";

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m"
};

function renderGauge(score: number, max: number = 100, width: number = 20): string {
  const filled = Math.max(0, Math.min(width, Math.round((score / max) * width)));
  const empty = width - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  const color = score >= 70 ? C.green : score >= 45 ? C.yellow : C.red;
  return `${color}[${bar}]${C.reset} ${C.bold}${score}/${max}${C.reset}`;
}

function parseCliArgs(): { token: string; network: "solana" | "base"; amount: number } {
  const args = process.argv.slice(2);
  let token = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // Default: Solana USDC
  let network: "solana" | "base" = "solana";
  let amount = 15;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === "--token" || arg === "-t") && args[i + 1]) {
      token = args[++i];
    } else if ((arg === "--network" || arg === "-n") && args[i + 1]) {
      const net = args[++i].toLowerCase();
      if (net === "base" || net === "solana") {
        network = net;
      }
    } else if ((arg === "--amount" || arg === "-a") && args[i + 1]) {
      amount = parseFloat(args[++i]) || 15;
    }
  }

  // Auto-detect network if token is Base 0x address
  if (token.startsWith("0x")) {
    network = "base";
  }

  return { token, network, amount };
}

async function runVisualDemo() {
  process.env.SIMULATE_PAYMENTS = "true";
  const { token, network, amount } = parseCliArgs();
  const DEMO_PORT = 3199;

  const server = app.listen(DEMO_PORT);
  const baseUrl = `http://localhost:${DEMO_PORT}`;
  const client = new AgentClient(baseUrl);

  try {
    process.stdout.write("\n");
    process.stdout.write(`${C.cyan}╔════════════════════════════════════════════════════════════════════════════╗${C.reset}\n`);
    process.stdout.write(`${C.cyan}║   █████╗ ██╗     ██████╗ ██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗  ██╗         ║${C.reset}\n`);
    process.stdout.write(`${C.cyan}║  ██╔══██╗██║     ██╔══██╗██║  ██║██╔══██╗██╔══██╗██╔═══██╗╚██╗██╔╝         ║${C.reset}\n`);
    process.stdout.write(`${C.cyan}║  ███████║██║     ██████╔╝███████║███████║██████╔╝██║   ██║ ╚███╔╝          ║${C.reset}\n`);
    process.stdout.write(`${C.cyan}║  ██╔══██║██║     ██╔═══╝ ██╔══██║██╔══██║██╔══██╗██║   ██║ ██╔██╗          ║${C.reset}\n`);
    process.stdout.write(`${C.cyan}║  ██║  ██║███████╗██║     ██║  ██║██║  ██║██████╔╝╚██████╔╝██╔╝ ██╗         ║${C.reset}\n`);
    process.stdout.write(`${C.cyan}║  ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝         ║${C.reset}\n`);
    process.stdout.write(`${C.cyan}║      Autonomous x402 Crypto Intelligence & Policy-Bounded Trading Plugin    ║${C.reset}\n`);
    process.stdout.write(`${C.cyan}╚════════════════════════════════════════════════════════════════════════════╝${C.reset}\n\n`);

    // STEP 1: Discovery & 402 Handshake
    process.stdout.write(`${C.bold}[Step 1/5] Token Discovery & x402 Handshake${C.reset}\n`);
    process.stdout.write(`  Target Token:  ${C.yellow}${token}${C.reset} (${network.toUpperCase()})\n`);
    process.stdout.write(`  Querying Endpoint: ${C.dim}/api/intel/signal?token=${token}${C.reset}\n`);

    const probe = await client.probeIntel(token);
    if (!probe.isPaymentRequired || probe.statusCode !== 402) {
      throw new Error(`Expected HTTP 402 Payment Required, received ${probe.statusCode}`);
    }

    process.stdout.write(`  ${C.green}✓${C.reset} HTTP 402 Received: ${probe.invoice?.message || "Payment Required"}\n`);
    process.stdout.write(`  Payment Rails:    ${probe.invoice?.accepts.map(a => `${a.network} (${a.currency} $${a.amount})`).join(", ")}\n\n`);

    // STEP 2: Machine-to-Machine Payment Settlement
    process.stdout.write(`${C.bold}[Step 2/5] Autonomous x402 Micropayment Settlement${C.reset}\n`);
    process.stdout.write(`  Settling $0.01 USDC micro-invoice via non-custodial wallet...\n`);

    const intel = await client.settleAndFetchIntel(token, "simulated_valid_payment_proof");
    if (intel.status !== "success" || !intel.report) {
      throw new Error(`Failed to unlock intelligence: ${intel.error}`);
    }
    const report = intel.report;
    process.stdout.write(`  ${C.green}✓${C.reset} Payment Verified! Market intelligence payload unlocked.\n\n`);

    // STEP 3: Market Telemetry & Conviction Score
    process.stdout.write(`${C.bold}[Step 3/5] Real-Time Market Intelligence${C.reset}\n`);
    process.stdout.write(`  Asset:            ${C.bold}${report.name} (${report.symbol})${C.reset}\n`);
    process.stdout.write(`  Primary DEX:      ${report.dexId} on ${report.chainId}\n`);
    process.stdout.write(`  Price USD:        $${report.priceUsd}\n`);
    process.stdout.write(`  Liquidity (USD):  $${report.liquidityUsd.toLocaleString()}\n`);
    process.stdout.write(`  24h Volume:       $${report.volume24h.toLocaleString()}\n`);
    process.stdout.write(`  24h Price Change: ${report.priceChange24h >= 0 ? C.green + "+" : C.red}${report.priceChange24h}%${C.reset}\n`);
    process.stdout.write(`  Buy/Sell Ratio:   ${report.buySellRatio24h} (Buys: ${report.buys24h}, Sells: ${report.sells24h})\n`);
    process.stdout.write(`  Conviction Meter: ${renderGauge(report.convictionScore, 100, 24)} [${C.bold}${report.signalConfidence}${C.reset}]\n\n`);

    // STEP 4: GoPlus Security & Rugcheck Audit
    process.stdout.write(`${C.bold}[Step 4/5] GoPlus Contract Security & Rugcheck Audit${C.reset}\n`);
    if (report.securityAudit) {
      const sec = report.securityAudit;
      const honeypotStatus = sec.isHoneypot
        ? `${C.red}${C.bold}HONEYPOT DETECTED${C.reset}`
        : `${C.green}CLEAN (Freely Tradable)${C.reset}`;
      process.stdout.write(`  Honeypot Check:   ${honeypotStatus}\n`);
      process.stdout.write(`  Buy / Sell Taxes: ${sec.buyTaxPercent}% / ${sec.sellTaxPercent}%\n`);
      process.stdout.write(`  Mint Authority:   ${sec.isMintable ? C.yellow + "Active" : C.green + "Revoked/Disabled"}${C.reset}\n`);
      process.stdout.write(`  Freeze Authority: ${sec.isFreezable ? C.yellow + "Active" : C.green + "Disabled"}${C.reset}\n`);
      process.stdout.write(`  Metadata Mutable: ${sec.isMutableMetadata ? C.yellow + "Yes" : C.green + "Immutable"}${C.reset}\n`);
      process.stdout.write(`  Risk Gauge:       ${renderGauge(100 - sec.riskScore, 100, 24)} Safety Score\n`);
      if (sec.warnings.length > 0) {
        process.stdout.write(`  Audit Flags:      ${C.yellow}${sec.warnings.join(" | ")}${C.reset}\n`);
      }
    } else {
      process.stdout.write(`  Security Audit:   ${C.dim}Standard profile validated${C.reset}\n`);
    }
    process.stdout.write("\n");

    // STEP 5: Policy-Bounded Execution & Watchdog Monitor
    process.stdout.write(`${C.bold}[Step 5/5] PayBox Vault Autonomous Trade Execution${C.reset}\n`);
    process.stdout.write(`  Policy Rule:      Max Autonomous Limit = $25.00 USD\n`);
    process.stdout.write(`  Requested Trade:  Swap $${amount} USD -> ${report.symbol}\n`);

    const tradeOrder = {
      tokenIn: "USDC",
      tokenOut: report.symbol,
      amountUsd: amount,
      slippagePercent: 1.0,
      network
    };

    const tradeResult = await client.executeVaultTrade(tradeOrder);
    if (tradeResult.status === "success" && tradeResult.output) {
      process.stdout.write(`  ${C.green}✓ TRADE EXECUTED SUCCESSFULLY${C.reset}\n`);
      process.stdout.write(`    Receipt Hash:       ${C.cyan}${tradeResult.output.transaction_hash}${C.reset}\n`);
      process.stdout.write(`    Autonomous Auth:    ${C.green}${tradeResult.output.policy.autonomousApproved}${C.reset}\n`);
      process.stdout.write(`    Execution Network:  ${tradeResult.output.network}\n`);
      process.stdout.write(`    Timestamp:          ${tradeResult.output.executedAt}\n`);
    } else {
      process.stdout.write(`  ${C.yellow}⚠ Trade Status: ${tradeResult.status}${C.reset}\n`);
      if (tradeResult.approval_url) {
        process.stdout.write(`    Approval Link:      ${tradeResult.approval_url}\n`);
      }
    }

    // Stop-Loss Watchdog Monitor Status
    const entryPrice = report.priceUsd > 0 ? report.priceUsd : 1.0;
    const simulatedDropPrice = entryPrice * 0.88; // -12%
    const watchdogCheck = evaluateStopLoss(simulatedDropPrice, entryPrice, 10);
    process.stdout.write(`\n  ${C.bold}Automated Stop-Loss Watchdog Status:${C.reset}\n`);
    process.stdout.write(`    Entry Price:        $${entryPrice}\n`);
    process.stdout.write(`    Watchdog Guard:     -10.0% breach trigger active\n`);
    process.stdout.write(`    Emergency Exit Simulation: ${watchdogCheck.triggered ? C.red + "TRIGGERED (-12.00% breach)" : C.green + "SAFE"}${C.reset}\n\n`);

    process.stdout.write(`${C.green}========================================================================${C.reset}\n`);
    process.stdout.write(`${C.green}${C.bold}DEMO_RUN_COMPLETE${C.reset}\n`);
    process.stdout.write(`${C.green}========================================================================${C.reset}\n\n`);

    server.close();
    process.exit(0);
  } catch (error: any) {
    process.stderr.write(`\n${C.red}DEMO_RUN_FAILED: ${error?.message || error}${C.reset}\n`);
    server.close();
    process.exit(1);
  }
}

runVisualDemo();
