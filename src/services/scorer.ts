import { TokenPairData, MarketSignalReport } from "../types/market.js";

export interface ScoreBreakdown {
  liquidityScore: number;
  momentumScore: number;
  turnoverScore: number;
  priceTrendScore: number;
  totalScore: number;
  confidence: MarketSignalReport["signalConfidence"];
}

export function calculateConvictionScore(pair: TokenPairData): ScoreBreakdown {
  const liquidityUsd = pair.liquidity?.usd ?? 0;
  const volume24h = pair.volume?.h24 ?? 0;
  const priceChange24h = pair.priceChange?.h24 ?? 0;
  const priceChange1h = pair.priceChange?.h1 ?? 0;
  const buys24h = pair.txns?.h24?.buys ?? 0;
  const sells24h = pair.txns?.h24?.sells ?? 0;

  // 1. Liquidity Depth (0 to 30 pts)
  let liquidityScore = 0;
  if (liquidityUsd >= 500_000) {
    liquidityScore = 30;
  } else if (liquidityUsd >= 100_000) {
    liquidityScore = 24;
  } else if (liquidityUsd >= 30_000) {
    liquidityScore = 18;
  } else if (liquidityUsd >= 10_000) {
    liquidityScore = 10;
  } else if (liquidityUsd >= 3_000) {
    liquidityScore = 5;
  } else {
    liquidityScore = 0; // Extreme slippage risk
  }

  // 2. Buy/Sell Momentum (0 to 30 pts)
  const totalTxns = buys24h + sells24h;
  const buyRatio = totalTxns > 0 ? buys24h / (sells24h + 1) : 1;
  let momentumScore = 0;

  if (totalTxns < 10) {
    momentumScore = 5; // Low sample size
  } else if (buyRatio >= 1.6) {
    momentumScore = 30; // Heavy accumulation
  } else if (buyRatio >= 1.2) {
    momentumScore = 24;
  } else if (buyRatio >= 0.95) {
    momentumScore = 18; // Balanced flow
  } else if (buyRatio >= 0.7) {
    momentumScore = 10;
  } else {
    momentumScore = 3; // Net dump
  }

  // 3. Volume / Liquidity Turnover (0 to 25 pts)
  const turnover = liquidityUsd > 0 ? volume24h / liquidityUsd : 0;
  let turnoverScore = 0;

  if (turnover >= 0.5 && turnover <= 5.0) {
    turnoverScore = 25; // Healthy, vibrant market activity
  } else if (turnover >= 0.2 && turnover <= 10.0) {
    turnoverScore = 18;
  } else if (turnover > 0.05) {
    turnoverScore = 10;
  } else {
    turnoverScore = 4; // Stagnant or extreme wash
  }

  // 4. Price Trend (0 to 15 pts)
  let priceTrendScore = 0;
  if (priceChange24h > 0 && priceChange1h > 0) {
    priceTrendScore = 15;
  } else if (priceChange1h > 0) {
    priceTrendScore = 10;
  } else if (priceChange24h > -5 && priceChange1h > -2) {
    priceTrendScore = 8;
  } else if (priceChange24h > -15) {
    priceTrendScore = 4;
  } else {
    priceTrendScore = 1;
  }

  const rawTotal = liquidityScore + momentumScore + turnoverScore + priceTrendScore;
  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

  let confidence: MarketSignalReport["signalConfidence"] = "CAUTION";
  if (totalScore >= 80) {
    confidence = "VERY_HIGH";
  } else if (totalScore >= 65) {
    confidence = "HIGH";
  } else if (totalScore >= 50) {
    confidence = "MODERATE";
  } else if (totalScore >= 35) {
    confidence = "LOW";
  } else {
    confidence = "CAUTION";
  }

  return {
    liquidityScore,
    momentumScore,
    turnoverScore,
    priceTrendScore,
    totalScore,
    confidence
  };
}
