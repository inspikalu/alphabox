import { fetchTokenPairs } from "./dexscreener.js";
import { calculateConvictionScore } from "./scorer.js";
import { MarketSignalReport, TokenPairData } from "../types/market.js";

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
    convictionScore: scoreResult.totalScore,
    signalConfidence: scoreResult.confidence,
    analyzedAt: new Date().toISOString()
  };
}
