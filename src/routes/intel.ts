import { Router, Request, Response } from "express";
import { x402PaymentRequired } from "../middleware/x402.js";
import { analyzeToken } from "../services/market-engine.js";

export const intelRouter: Router = Router();

intelRouter.get("/signal", x402PaymentRequired, async (req: Request, res: Response) => {
  const token = typeof req.query.token === "string" ? req.query.token.trim() : "";

  if (!token) {
    res.status(400).json({
      status: "error",
      message: "Query parameter 'token' is required."
    });
    return;
  }

  try {
    const report = await analyzeToken(token);
    res.status(200).json({
      status: "success",
      payment: (req as any).paymentProof || { verified: true },
      report
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error?.message || "Failed to analyze token market data",
      token
    });
  }
});
