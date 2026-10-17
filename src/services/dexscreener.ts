import { DexScreenerResponseSchema, TokenPairData } from "../types/market.js";

const DEXSCREENER_API_BASE = "https://api.dexscreener.com/latest/dex/tokens";

export async function fetchTokenPairs(tokenAddress: string): Promise<TokenPairData[]> {
  const cleanAddress = tokenAddress.trim();
  if (!cleanAddress) {
    return [];
  }

  const endpoint = `${DEXSCREENER_API_BASE}/${encodeURIComponent(cleanAddress)}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "User-Agent": "AlphaBox/0.1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`DexScreener API error: HTTP ${response.status} ${response.statusText}`);
  }

  const rawData = await response.json();
  const parsed = DexScreenerResponseSchema.safeParse(rawData);

  if (!parsed.success) {
    throw new Error(`DexScreener schema validation failed: ${parsed.error.message}`);
  }

  const pairs = parsed.data.pairs;
  return Array.isArray(pairs) ? pairs : [];
}
