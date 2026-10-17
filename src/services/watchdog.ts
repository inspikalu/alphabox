import { TradeOrderRequest, TradeOrderRequestSchema } from "../types/vault.js";

export interface StopLossEvaluation {
  currentPrice: number;
  entryPrice: number;
  stopLossPercentage: number;
  priceDropPercentage: number;
  triggered: boolean;
  reason: string;
}

/**
 * Evaluates whether current market price breaches an entry price's stop-loss threshold.
 * 
 * @param currentPrice Current asset price in USD
 * @param entryPrice Asset price at time of purchase
 * @param stopLossPercentage Drop percentage that triggers an exit (e.g. 10 for 10% drop)
 */
export function evaluateStopLoss(
  currentPrice: number,
  entryPrice: number,
  stopLossPercentage: number = 10
): StopLossEvaluation {
  if (entryPrice <= 0) {
    throw new Error("entryPrice must be greater than zero");
  }

  const drop = ((entryPrice - currentPrice) / entryPrice) * 100;
  const priceDropPercentage = Number(drop.toFixed(2));
  const triggered = priceDropPercentage >= stopLossPercentage;

  const reason = triggered
    ? `STOP_LOSS_BREACH: Token price dropped ${priceDropPercentage}% from entry ($${entryPrice} -> $${currentPrice}), exceeding ${stopLossPercentage}% threshold.`
    : `STOP_LOSS_SAFE: Token price delta is ${priceDropPercentage <= 0 ? "+" + Math.abs(priceDropPercentage) : "-" + priceDropPercentage}% from entry, within ${stopLossPercentage}% limit.`;

  return {
    currentPrice,
    entryPrice,
    stopLossPercentage,
    priceDropPercentage,
    triggered,
    reason
  };
}

/**
 * Generates an emergency exit swap order request compliant with PayBox policy.
 * 
 * @param tokenIn Depreciating token to swap out of
 * @param tokenOut Safe asset (e.g. USDC / SOL / WETH)
 * @param amountUsd USD value to liquidate
 * @param network Blockchain network ("solana" | "base")
 */
export function createEmergencyExitOrder(
  tokenIn: string,
  tokenOut: string,
  amountUsd: number,
  network: "solana" | "base" = "solana"
): TradeOrderRequest {
  const exitOrder: TradeOrderRequest = {
    tokenIn,
    tokenOut,
    amountUsd,
    slippagePercent: 1.5,
    network
  };

  return TradeOrderRequestSchema.parse(exitOrder);
}
