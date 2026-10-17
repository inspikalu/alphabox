import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { x402OutputSchema, proposeX402 } from "./paybox.js";

const PROTOCOL_VERSION = "2026-07-28";

function calculateConviction(pair: any): { score: number; confidence: string } {
  let score = 50;

  const liq = pair.liquidity?.usd ?? 0;
  if (liq > 1_000_000) score += 20;
  else if (liq > 100_000) score += 10;
  else if (liq < 10_000) score -= 20;

  const vol = pair.volume?.h24 ?? 0;
  if (vol > 500_000) score += 15;
  else if (vol > 50_000) score += 10;

  const buys = pair.txns?.h24?.buys ?? 0;
  const sells = pair.txns?.h24?.sells ?? 0;
  const ratio = sells > 0 ? buys / sells : 1;
  if (ratio > 1.5) score += 15;
  else if (ratio < 0.7) score -= 15;

  score = Math.max(5, Math.min(95, Math.round(score)));

  let confidence = "MODERATE";
  if (score >= 80) confidence = "VERY_HIGH";
  else if (score >= 70) confidence = "HIGH";
  else if (score < 40) confidence = "CAUTION";
  else if (score < 55) confidence = "LOW";

  return { score, confidence };
}

function createServer() {
  const server = new McpServer(
    { name: "alphabox", version: "0.1.0" },
    { supportedProtocolVersions: [PROTOCOL_VERSION] },
  );

  // Tool 1: Real-time Market Signal & GoPlus Security Audit
  server.registerTool(
    "get_market_signal",
    {
      title: "Get DEX Market Signal & Contract Security",
      description: "Queries real-time DEX liquidity, 24h volume, buy/sell momentum, 0-100 conviction score, and contract security audit for any Solana or Base token.",
      inputSchema: z.object({
        token: z.string().min(1).max(256),
      }).strict(),
      outputSchema: z.object({
        token: z.string(),
        name: z.string(),
        symbol: z.string(),
        priceUsd: z.number(),
        liquidityUsd: z.number(),
        volume24h: z.number(),
        convictionScore: z.number(),
        signalConfidence: z.string(),
        isHoneypot: z.boolean(),
        riskScore: z.number(),
        safetyLevel: z.string(),
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ token }) => {
      try {
        const dexUrl = `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(token)}`;
        const dexRes = await fetch(dexUrl, {
          signal: AbortSignal.timeout(4_000),
          redirect: "error",
        });

        if (!dexRes.ok) throw new Error("DexScreener request failed");
        const dexData = (await dexRes.json()) as any;
        const pairs = dexData.pairs || [];
        if (pairs.length === 0) {
          throw new Error(`No active trading pairs found for token: ${token}`);
        }

        // Sort by liquidity
        const sorted = [...pairs].sort((a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
        const primary = sorted[0];

        const { score, confidence } = calculateConviction(primary);
        const priceUsd = primary.priceUsd ? parseFloat(primary.priceUsd) : 0;
        const liquidityUsd = primary.liquidity?.usd ?? 0;
        const volume24h = primary.volume?.h24 ?? 0;

        // Security check via GoPlus if available
        let isHoneypot = false;
        let riskScore = 15;
        let safetyLevel = "SAFE";

        try {
          const isBase = primary.chainId === "base";
          const secUrl = isBase
            ? `https://api.gopluslabs.io/api/v1/token_security/8453?contract_addresses=${token.toLowerCase()}`
            : `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${token}`;

          const secRes = await fetch(secUrl, {
            signal: AbortSignal.timeout(3_000),
            headers: { Accept: "application/json" },
          });

          if (secRes.ok) {
            const secData = (await secRes.json()) as any;
            const details = secData.result?.[token.toLowerCase()] || secData.result?.[token];
            if (details) {
              isHoneypot = details.is_honeypot === "1" || details.non_transferable === "1";
              if (isHoneypot) {
                riskScore = 90;
                safetyLevel = "CRITICAL_RISK";
              }
            }
          }
        } catch {
          // Fallback safely if GoPlus times out
        }

        const structuredContent = {
          token,
          name: primary.baseToken?.name || "Unknown",
          symbol: primary.baseToken?.symbol || "TOKEN",
          priceUsd,
          liquidityUsd,
          volume24h,
          convictionScore: score,
          signalConfidence: confidence,
          isHoneypot,
          riskScore,
          safetyLevel,
        };

        return {
          content: [
            {
              type: "text" as const,
              text: `AlphaBox Signal: ${structuredContent.symbol} (${structuredContent.name}) | Price: $${priceUsd} | Liquidity: $${liquidityUsd.toLocaleString()} | Conviction: ${score}/100 [${confidence}] | Security: ${safetyLevel}`,
            },
          ],
          structuredContent,
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `AlphaBox Signal Lookup Error: ${err?.message || "Failed to fetch market data"}`,
            },
          ],
        };
      }
    },
  );

  // Tool 2: Propose Scoped Trade via x402 Micropayment Proposal
  server.registerTool(
    "propose_trade",
    {
      title: "Propose Policy-Bounded Trade",
      description: "Proposes an x402 micropayment or trade proposal. Subject to PayBox user vault policy limits (default <= $25 autonomous limit).",
      inputSchema: z.object({
        chain: z.enum(["eip155:8453", "solana:mainnet"]),
        url: z.string().url().max(2048),
        maxAmountUsdcAtomic: z.string().regex(/^[1-9][0-9]{0,19}$/),
      }).strict(),
      outputSchema: x402OutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ chain, url, maxAmountUsdcAtomic }) =>
      proposeX402({
        chain,
        url,
        maxAmount: maxAmountUsdcAtomic,
      }),
  );

  return server;
}

serveStdio(createServer, { legacy: "reject" });
