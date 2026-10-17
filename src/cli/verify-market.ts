import { analyzeToken } from "../services/market-engine.js";

async function main() {
  const args = process.argv.slice(2);
  let tokenAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // Default: Solana USDC

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "--token" || args[i] === "-t") && args[i + 1]) {
      tokenAddress = args[i + 1];
      i++;
    }
  }

  try {
    const report = await analyzeToken(tokenAddress);
    const output = {
      status: "success",
      timestamp: new Date().toISOString(),
      report
    };
    process.stdout.write(JSON.stringify(output, null, 2) + "\n");
    process.exit(0);
  } catch (error: any) {
    const errorOutput = {
      status: "error",
      message: error?.message || "Unknown error analyzing market data",
      tokenAddress
    };
    process.stderr.write(JSON.stringify(errorOutput, null, 2) + "\n");
    process.exit(1);
  }
}

main();
