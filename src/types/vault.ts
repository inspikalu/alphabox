import { z } from "zod";

export const TradeOrderRequestSchema = z.object({
  tokenIn: z.string().min(1, "tokenIn is required"),
  tokenOut: z.string().min(1, "tokenOut is required"),
  amountUsd: z.number().positive("amountUsd must be greater than 0"),
  slippagePercent: z.number().min(0.01).max(10).default(1.0),
  network: z.enum(["solana", "base"]).default("solana"),
  recipientWallet: z.string().optional()
});

export const VaultPolicyConfigSchema = z.object({
  maxAutonomousTradeUsd: z.number().default(25.0),
  maxSlippagePercent: z.number().default(1.5),
  allowedNetworks: z.array(z.string()).default(["solana", "base"]),
  allowedTokens: z.array(z.string()).optional()
});

export interface PolicyValidationResult {
  allowed: boolean;
  requiresApproval: boolean;
  reason?: string;
  approvalUrl?: string;
}

export interface ResultEnvelope<T = any> {
  request_id: string;
  status: "success" | "pending_approval" | "denied" | "error";
  output?: T;
  approval_url?: string;
  reason?: string;
  message?: string;
}

export interface TradeExecutionOutput {
  transaction_hash: string;
  network: "solana" | "base";
  tokenIn: string;
  tokenOut: string;
  amountInUsd: number;
  estimatedOutput: string;
  executedAt: string;
  policy: {
    maxLimitUsd: number;
    slippagePercent: number;
    autonomousApproved: boolean;
  };
}

export type TradeOrderRequest = z.infer<typeof TradeOrderRequestSchema>;
export type VaultPolicyConfig = z.infer<typeof VaultPolicyConfigSchema>;
