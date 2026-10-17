import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const ConfigSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DEFAULT_CHAIN: z.enum(["solana", "base"]).default("solana"),
  SOLANA_PAYMENT_RECEIVER_ADDRESS: z.string().default("11111111111111111111111111111111"),
  BASE_PAYMENT_RECEIVER_ADDRESS: z.string().default("0x0000000000000000000000000000000000000000"),
  SOLANA_USDC_MINT: z.string().default("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  BASE_USDC_ADDRESS: z.string().default("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"),
  SIMULATE_PAYMENTS: z.preprocess((val) => {
    if (typeof val === "string") return val.toLowerCase() === "true";
    return Boolean(val);
  }, z.boolean()).default(false)
});

export type Config = z.infer<typeof ConfigSchema>;

export const config: Config = ConfigSchema.parse({
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DEFAULT_CHAIN: process.env.DEFAULT_CHAIN,
  SOLANA_PAYMENT_RECEIVER_ADDRESS: process.env.SOLANA_PAYMENT_RECEIVER_ADDRESS,
  BASE_PAYMENT_RECEIVER_ADDRESS: process.env.BASE_PAYMENT_RECEIVER_ADDRESS,
  SOLANA_USDC_MINT: process.env.SOLANA_USDC_MINT,
  BASE_USDC_ADDRESS: process.env.BASE_USDC_ADDRESS,
  SIMULATE_PAYMENTS: process.env.SIMULATE_PAYMENTS
});
