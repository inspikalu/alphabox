import { z } from "zod";

export const TokenInfoSchema = z.object({
  address: z.string(),
  name: z.string().optional().default(""),
  symbol: z.string().optional().default("")
});

export const TxnsPeriodSchema = z.object({
  buys: z.number().optional().default(0),
  sells: z.number().optional().default(0)
});

export const TokenPairDataSchema = z.object({
  chainId: z.string(),
  dexId: z.string().optional().default(""),
  url: z.string().optional().default(""),
  pairAddress: z.string(),
  baseToken: TokenInfoSchema,
  quoteToken: TokenInfoSchema,
  priceNative: z.string().optional().default("0"),
  priceUsd: z.string().optional().default("0"),
  txns: z.object({
    m5: TxnsPeriodSchema.optional().default({}),
    h1: TxnsPeriodSchema.optional().default({}),
    h6: TxnsPeriodSchema.optional().default({}),
    h24: TxnsPeriodSchema.optional().default({})
  }).optional().default({}),
  volume: z.object({
    m5: z.number().optional().default(0),
    h1: z.number().optional().default(0),
    h6: z.number().optional().default(0),
    h24: z.number().optional().default(0)
  }).optional().default({}),
  priceChange: z.object({
    m5: z.number().optional().default(0),
    h1: z.number().optional().default(0),
    h6: z.number().optional().default(0),
    h24: z.number().optional().default(0)
  }).optional().default({}),
  liquidity: z.object({
    usd: z.number().optional().default(0),
    base: z.number().optional().default(0),
    quote: z.number().optional().default(0)
  }).optional().default({}),
  fdv: z.number().optional(),
  marketCap: z.number().optional()
});

export const DexScreenerResponseSchema = z.object({
  schemaVersion: z.string().optional(),
  pairs: z.array(TokenPairDataSchema).nullable().optional()
});

export type TokenInfo = z.infer<typeof TokenInfoSchema>;
export type TokenPairData = z.infer<typeof TokenPairDataSchema>;
export type DexScreenerResponse = z.infer<typeof DexScreenerResponseSchema>;

export interface MarketSignalReport {
  tokenAddress: string;
  symbol: string;
  name: string;
  chainId: string;
  dexId: string;
  pairAddress: string;
  priceUsd: number;
  liquidityUsd: number;
  volume24h: number;
  priceChange24h: number;
  priceChange1h: number;
  buys24h: number;
  sells24h: number;
  buySellRatio24h: number;
  convictionScore: number;
  signalConfidence: "VERY_HIGH" | "HIGH" | "MODERATE" | "LOW" | "CAUTION";
  securityAudit?: TokenSecurityAudit;
  analyzedAt: string;
}

export const TokenSecurityAuditSchema = z.object({
  tokenAddress: z.string(),
  network: z.string(),
  isHoneypot: z.boolean(),
  buyTaxPercent: z.number().default(0),
  sellTaxPercent: z.number().default(0),
  isMintable: z.boolean().default(false),
  isFreezable: z.boolean().default(false),
  isMutableMetadata: z.boolean().default(false),
  isOpenSource: z.boolean().default(true),
  isProxy: z.boolean().default(false),
  riskScore: z.number().min(0).max(100),
  warnings: z.array(z.string()).default([]),
  auditedAt: z.string()
});

export type TokenSecurityAudit = z.infer<typeof TokenSecurityAuditSchema>;

