export const PAYBOX_PLUGIN_MANIFEST = {
  schema_version: "v1",
  name: "AlphaBox",
  version: "0.1.0",
  description: "Autonomous crypto market intelligence & policy-bounded trading plugin for AI agents in PayBox",
  categories: ["Consumer Finance", "Predictions"],
  author: "AlphaBox Team",
  website: "https://paybox.sh",
  contact: {
    email: "support@alphabox.local"
  },
  auth: {
    type: "x402",
    description: "Machine-to-machine HTTP 402 micro-payments in USDC on Solana or Base",
    pricing: "$0.01 USDC per query"
  },
  api: {
    type: "openapi",
    url: "/openapi.json"
  },
  capabilities: [
    "market_signal_analysis",
    "liquidity_audit",
    "conviction_scoring",
    "scoped_vault_trading"
  ],
  tools: [
    {
      name: "get_market_signal",
      description: "Query real-time DEX liquidity, volume, buy/sell momentum, and 0-100 conviction score for any Solana or Base token via x402 payment.",
      endpoint: "/api/intel/signal",
      method: "GET",
      parameters: {
        token: {
          type: "string",
          description: "Contract address or SPL mint of the target token (e.g. Solana USDC or Base WETH)",
          required: true
        }
      }
    },
    {
      name: "execute_scoped_trade",
      description: "Execute a policy-bounded swap order on behalf of the user through PayBox's non-custodial credential vault. Trades <= $25 execute autonomously; larger trades escalate to passkey approval.",
      endpoint: "/api/vault/execute-trade",
      method: "POST",
      parameters: {
        tokenIn: { type: "string", description: "Token to swap from (e.g. USDC)", required: true },
        tokenOut: { type: "string", description: "Token to swap to (e.g. SOL)", required: true },
        amountUsd: { type: "number", description: "Amount in USD to trade (default limit: $25)", required: true },
        slippagePercent: { type: "number", description: "Slippage tolerance percentage (max 1.5%)", default: 1.0 },
        network: { type: "string", enum: ["solana", "base"], default: "solana" }
      }
    }
  ]
};

export const OPENAPI_SPEC = {
  openapi: "3.1.0",
  info: {
    title: "AlphaBox PayBox Plugin API",
    version: "0.1.0",
    description: "x402-monetized market intelligence and scoped autonomous trading plugin for PayBox."
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server"
    }
  ],
  paths: {
    "/health": {
      get: {
        summary: "Service Health Check",
        responses: {
          "200": {
            description: "Service is operational",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/intel/signal": {
      get: {
        summary: "Get Market Signal Report (Protected by x402)",
        description: "Returns deep liquidity, volume velocity, and a 0-100 conviction score. Requires $0.01 USDC x402 payment.",
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            description: "Target token contract address or SPL mint",
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Market signal report successfully unlocked",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "success" },
                    report: { type: "object" }
                  }
                }
              }
            }
          },
          "402": {
            description: "Payment Required - returns payment invoice and accepted payment rails",
            headers: {
              "x402-payment-required": {
                schema: { type: "string", example: "true" }
              }
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "integer", example: 402 },
                    message: { type: "string" },
                    accepts: { type: "array" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/vault/execute-trade": {
      post: {
        summary: "Execute Scoped Trade via PayBox Vault",
        description: "Executes a swap within pre-configured autonomous limits ($25 max) or returns passkey approval URL.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tokenIn", "tokenOut", "amountUsd"],
                properties: {
                  tokenIn: { type: "string", example: "USDC" },
                  tokenOut: { type: "string", example: "SOL" },
                  amountUsd: { type: "number", example: 10 },
                  slippagePercent: { type: "number", example: 0.5 },
                  network: { type: "string", enum: ["solana", "base"], example: "solana" }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "PayBox result envelope (success or pending_approval)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    request_id: { type: "string" },
                    status: { type: "string", enum: ["success", "pending_approval", "denied", "error"] },
                    output: { type: "object" },
                    approval_url: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
