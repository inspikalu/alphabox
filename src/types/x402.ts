import { z } from "zod";

export const PaymentRequirementSchema = z.object({
  network: z.string(), // e.g. "solana:devnet", "solana:mainnet", "eip155:8453"
  currency: z.string().default("USDC"),
  amount: z.string().default("0.01"),
  amount_raw: z.string().optional(), // 10000 for 0.01 USDC (6 decimals)
  mint: z.string().optional(), // Solana SPL token mint
  token_address: z.string().optional(), // EVM ERC-20 token address
  recipient: z.string(), // recipient address
  resource_url: z.string()
});

export const PaymentInvoiceSchema = z.object({
  status: z.literal(402),
  error: z.string().default("Payment Required"),
  message: z.string(),
  x402_version: z.number().default(1),
  accepts: z.array(PaymentRequirementSchema)
});

export const PaymentProofSchema = z.object({
  proof: z.string(),
  network: z.string().optional(),
  payer: z.string().optional(),
  verified: z.boolean().default(false)
});

export type PaymentRequirement = z.infer<typeof PaymentRequirementSchema>;
export type PaymentInvoice = z.infer<typeof PaymentInvoiceSchema>;
export type PaymentProof = z.infer<typeof PaymentProofSchema>;
