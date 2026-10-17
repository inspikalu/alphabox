import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { PaymentInvoice, PaymentRequirement } from "../types/x402.js";

export function x402PaymentRequired(req: Request, res: Response, next: NextFunction): void {
  // Extract payment authorization headers
  const xPaymentHeader = req.headers["x-payment"];
  const authHeader = req.headers["authorization"];

  let paymentToken: string | undefined;

  if (typeof xPaymentHeader === "string" && xPaymentHeader.trim()) {
    paymentToken = xPaymentHeader.trim();
  } else if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    paymentToken = authHeader.slice(7).trim();
  }

  // Verification logic
  if (paymentToken) {
    if (config.SIMULATE_PAYMENTS) {
      // In simulated/test mode, accept non-empty token
      (req as any).paymentProof = {
        proof: paymentToken,
        network: config.DEFAULT_CHAIN,
        verified: true,
        mode: "simulated"
      };
      return next();
    }

    // In production mode, validate format (tx signature / hash)
    const isSolanaTx = /^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(paymentToken);
    const isEvmTx = /^0x[a-fA-F0-9]{64}$/.test(paymentToken);

    if (isSolanaTx || isEvmTx || paymentToken.length > 20) {
      (req as any).paymentProof = {
        proof: paymentToken,
        network: isSolanaTx ? "solana" : isEvmTx ? "base" : config.DEFAULT_CHAIN,
        verified: true,
        mode: "live"
      };
      return next();
    }
  }

  // If no valid payment token provided, return HTTP 402 with invoice
  const resourceUrl = `${req.baseUrl || ""}${req.path || req.originalUrl}`;

  const accepts: PaymentRequirement[] = [
    {
      network: "solana:devnet",
      currency: "USDC",
      amount: "0.01",
      amount_raw: "10000",
      mint: config.SOLANA_USDC_MINT,
      recipient: config.SOLANA_PAYMENT_RECEIVER_ADDRESS,
      resource_url: resourceUrl
    },
    {
      network: "eip155:8453",
      currency: "USDC",
      amount: "0.01",
      amount_raw: "10000",
      token_address: config.BASE_USDC_ADDRESS,
      recipient: config.BASE_PAYMENT_RECEIVER_ADDRESS,
      resource_url: resourceUrl
    }
  ];

  const invoice: PaymentInvoice = {
    status: 402,
    error: "Payment Required",
    message: "Access to AlphaBox real-time market intelligence requires a micropayment of $0.01 USDC.",
    x402_version: 1,
    accepts
  };

  res.setHeader("x402-payment-required", "true");
  res.status(402).json(invoice);
}
