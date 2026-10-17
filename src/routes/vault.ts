import { Router, Request, Response } from "express";
import { TradeOrderRequestSchema, ResultEnvelope, TradeExecutionOutput } from "../types/vault.js";
import { validateTradePolicy, DEFAULT_VAULT_POLICY } from "../services/vault-policy.js";

export const vaultRouter: Router = Router();

vaultRouter.post("/execute-trade", (req: Request, res: Response) => {
  const parseResult = TradeOrderRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorEnvelope: ResultEnvelope = {
      request_id: `req_err_${Date.now()}`,
      status: "error",
      message: `Invalid trade order parameters: ${parseResult.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`
    };
    res.status(400).json(errorEnvelope);
    return;
  }

  const order = parseResult.data;
  const policyCheck = validateTradePolicy(order);
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 1. Escalate to User Passkey Approval if above autonomous policy threshold
  if (policyCheck.requiresApproval) {
    const pendingEnvelope: ResultEnvelope = {
      request_id: requestId,
      status: "pending_approval",
      approval_url: policyCheck.approvalUrl || `https://app.paybox.sh/approve/${requestId}`,
      message: policyCheck.reason || "Autonomous policy limit exceeded. Human passkey approval required."
    };
    res.status(200).json(pendingEnvelope);
    return;
  }

  // 2. Reject if violating hard policy rules (e.g., unsupported network or excessive slippage)
  if (!policyCheck.allowed) {
    const deniedEnvelope: ResultEnvelope = {
      request_id: requestId,
      status: "denied",
      reason: policyCheck.reason || "Order rejected by vault policy."
    };
    res.status(400).json(deniedEnvelope);
    return;
  }

  // 3. Autonomous Execution within scoped limits
  const mockTxHash = order.network === "solana"
    ? `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    : `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

  const estimatedUnits = (order.amountUsd * 0.0095).toFixed(4);

  const output: TradeExecutionOutput = {
    transaction_hash: mockTxHash,
    network: order.network,
    tokenIn: order.tokenIn,
    tokenOut: order.tokenOut,
    amountInUsd: order.amountUsd,
    estimatedOutput: `${estimatedUnits} ${order.tokenOut}`,
    executedAt: new Date().toISOString(),
    policy: {
      maxLimitUsd: DEFAULT_VAULT_POLICY.maxAutonomousTradeUsd,
      slippagePercent: order.slippagePercent,
      autonomousApproved: true
    }
  };

  const successEnvelope: ResultEnvelope<TradeExecutionOutput> = {
    request_id: requestId,
    status: "success",
    output
  };

  res.status(200).json(successEnvelope);
});
