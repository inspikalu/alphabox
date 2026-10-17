import { fetchTokenPairs } from "./dexscreener.js";
import { calculateConvictionScore } from "./scorer.js";
import { MarketSignalReport, TokenPairData } from "../types/market.js";
import { checkTokenSecurity } from "./security.js";

export async function analyzeToken(tokenAddress: string): Promise<MarketSignalReport> {
  const cleanAddress = tokenAddress.trim();
  if (!cleanAddress) {
    throw new Error("Token address is required.");
  }

  const pairs = await fetchTokenPairs(cleanAddress);

  if (!pairs || pairs.length === 0) {
    throw new Error(`No active liquidity pairs found for token: ${cleanAddress}`);
  }

  // Sort by highest USD liquidity to analyze the primary trading pool
  const sortedPairs = [...pairs].sort((a, b) => {
    const liqA = a.liquidity?.usd ?? 0;
    const liqB = b.liquidity?.usd ?? 0;
    return liqB - liqA;
  });

  const primaryPair: TokenPairData = sortedPairs[0];
  const scoreResult = calculateConvictionScore(primaryPair);

  const priceUsd = primaryPair.priceUsd ? parseFloat(primaryPair.priceUsd) : 0;
  const liquidityUsd = primaryPair.liquidity?.usd ?? 0;
  const volume24h = primaryPair.volume?.h24 ?? 0;
  const priceChange24h = primaryPair.priceChange?.h24 ?? 0;
  const priceChange1h = primaryPair.priceChange?.h1 ?? 0;
  const buys24h = primaryPair.txns?.h24?.buys ?? 0;
  const sells24h = primaryPair.txns?.h24?.sells ?? 0;
  const buySellRatio24h = sells24h > 0 ? parseFloat((buys24h / sells24h).toFixed(2)) : buys24h;

  let convictionScore = scoreResult.totalScore;
  let signalConfidence = scoreResult.confidence;
  let securityAudit;

  try {
    securityAudit = await checkTokenSecurity(cleanAddress, primaryPair.chainId);
    if (securityAudit) {
      if (securityAudit.isHoneypot) {
        convictionScore = 0;
        signalConfidence = "CAUTION";
      } else if (securityAudit.riskScore > 50) {
        const penalty = Math.round((securityAudit.riskScore - 50) * 0.8);
        convictionScore = Math.max(0, convictionScore - penalty);
        if (convictionScore < 35) {
          signalConfidence = "CAUTION";
        } else if (convictionScore < 50) {
          signalConfidence = "LOW";
        } else if (convictionScore < 65) {
          signalConfidence = "MODERATE";
        }
      }
    }
  } catch {
    // If security audit is unavailable, retain standard market conviction
  }

  return {
    tokenAddress: cleanAddress,
    symbol: primaryPair.baseToken?.symbol || "UNKNOWN",
    name: primaryPair.baseToken?.name || "Unknown Token",
    chainId: primaryPair.chainId,
    dexId: primaryPair.dexId || "unknown-dex",
    pairAddress: primaryPair.pairAddress,
    priceUsd,
    liquidityUsd,
    volume24h,
    priceChange24h,
    priceChange1h,
    buys24h,
    sells24h,
    buySellRatio24h,
    convictionScore,
    signalConfidence,
    securityAudit,
    analyzedAt: new Date().toISOString()
  };
}

