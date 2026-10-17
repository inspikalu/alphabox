import { PaymentInvoice, PaymentInvoiceSchema } from "../types/x402.js";
import { MarketSignalReport } from "../types/market.js";
import { TradeOrderRequest, ResultEnvelope, TradeOrderRequestSchema } from "../types/vault.js";

export interface ProbeResult {
  isPaymentRequired: boolean;
  statusCode: number;
  invoice?: PaymentInvoice;
  headerPaymentRequired?: boolean;
}

export interface IntelResult {
  status: "success" | "error";
  report?: MarketSignalReport;
  payment?: unknown;
  error?: string;
}

export class AgentClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Step 1: Probe the intelligence endpoint without payment credentials.
   * Expects HTTP 402 with x402-payment-required: true header and PaymentInvoice body.
   */
  async probeIntel(tokenAddress: string): Promise<ProbeResult> {
    const url = `${this.baseUrl}/api/intel/signal?token=${encodeURIComponent(tokenAddress)}`;
    const response = await fetch(url, { method: "GET" });

    const is402 = response.status === 402;
    const headerRequired = response.headers.get("x402-payment-required") === "true";

    let invoice: PaymentInvoice | undefined;
    if (is402) {
      const data = await response.json();
      const parsed = PaymentInvoiceSchema.safeParse(data);
      if (parsed.success) {
        invoice = parsed.data;
      }
    }

    return {
      isPaymentRequired: is402,
      statusCode: response.status,
      invoice,
      headerPaymentRequired: headerRequired
    };
  }

  /**
   * Step 2 & 3 & 4: Settle payment and fetch full market intelligence report.
   * Attaches x-payment header with payment proof token.
   */
  async settleAndFetchIntel(tokenAddress: string, paymentProof: string = "simulated_valid_payment_proof"): Promise<IntelResult> {
    const url = `${this.baseUrl}/api/intel/signal?token=${encodeURIComponent(tokenAddress)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-payment": paymentProof,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errBody = await response.text();
      return {
        status: "error",
        error: `HTTP ${response.status}: ${errBody}`
      };
    }

    const data = await response.json() as { status: string; report?: MarketSignalReport; payment?: unknown; message?: string };
    if (data.status === "success" && data.report) {
      return {
        status: "success",
        report: data.report,
        payment: data.payment
      };
    }

    return {
      status: "error",
      error: data.message || "Failed to receive valid intelligence report"
    };
  }

  /**
   * Step 5: Execute scoped trade order through PayBox vault.
   * Returns ResultEnvelope (status: 'success' for autonomous trade, or 'pending_approval' for escalation).
   */
  async executeVaultTrade(order: TradeOrderRequest): Promise<ResultEnvelope> {
    const parsedOrder = TradeOrderRequestSchema.parse(order);
    const url = `${this.baseUrl}/api/vault/execute-trade`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(parsedOrder)
    });

    const data = await response.json() as ResultEnvelope;
    return data;
  }
}
