import type { TokenSecurityAudit } from "../types/market.js";
import { TokenSecurityAuditSchema } from "../types/market.js";

export type { TokenSecurityAudit };
export { TokenSecurityAuditSchema };

const GOPLUS_BASE_URL = "https://api.gopluslabs.io/api/v1/token_security/8453";
const GOPLUS_SOLANA_URL = "https://api.gopluslabs.io/api/v1/solana/token_security";

export async function checkTokenSecurity(
  tokenAddress: string,
  network: string = "base"
): Promise<TokenSecurityAudit> {
  const cleanAddress = tokenAddress.trim();
  const normalizedNetwork = network.toLowerCase();
  const isSolana =
    normalizedNetwork === "solana" ||
    (!cleanAddress.startsWith("0x") && cleanAddress.length > 30);

  if (isSolana) {
    return checkSolanaSecurity(cleanAddress);
  } else {
    return checkBaseSecurity(cleanAddress);
  }
}

async function checkBaseSecurity(tokenAddress: string): Promise<TokenSecurityAudit> {
  const url = `${GOPLUS_BASE_URL}?contract_addresses=${tokenAddress}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`GoPlus API error: ${response.status} ${response.statusText}`);
  }

  const json: any = await response.json();
  const lowerAddress = tokenAddress.toLowerCase();
  const tokenData = json?.result?.[lowerAddress] || json?.result?.[tokenAddress];

  if (!tokenData) {
    throw new Error(`No GoPlus security data found for token: ${tokenAddress}`);
  }

  const rawBuyTax = parseFloat(tokenData.buy_tax || "0");
  const rawSellTax = parseFloat(tokenData.sell_tax || "0");
  const buyTaxPercent = rawBuyTax > 0 && rawBuyTax < 1 ? Number((rawBuyTax * 100).toFixed(2)) : Number(rawBuyTax.toFixed(2));
  const sellTaxPercent = rawSellTax > 0 && rawSellTax < 1 ? Number((rawSellTax * 100).toFixed(2)) : Number(rawSellTax.toFixed(2));

  const isHoneypot = tokenData.is_honeypot === "1" || tokenData.cannot_sell_all === "1";
  const isOpenSource = tokenData.is_open_source === "1";
  const isProxy = tokenData.is_proxy === "1";
  const isMintable = tokenData.is_mintable === "1";
  const isFreezable = tokenData.transfer_pausable === "1";
  const isMutableMetadata = tokenData.slippage_modifiable === "1";

  const warnings: string[] = [];
  let riskScore = 0;

  if (isHoneypot) {
    riskScore += 90;
    warnings.push("CRITICAL: Token contract is identified as a honeypot (cannot sell).");
  }

  if (tokenData.cannot_buy === "1") {
    riskScore += 50;
    warnings.push("CRITICAL: Token restricts purchases.");
  }

  if (buyTaxPercent > 5) {
    const taxPenalty = Math.min(30, Math.round(buyTaxPercent * 1.5));
    riskScore += taxPenalty;
    warnings.push(`High buy tax: ${buyTaxPercent}% (exceeds 5% safe threshold).`);
  }

  if (sellTaxPercent > 5) {
    const taxPenalty = Math.min(30, Math.round(sellTaxPercent * 1.5));
    riskScore += taxPenalty;
    warnings.push(`High sell tax: ${sellTaxPercent}% (exceeds 5% safe threshold).`);
  }

  if (!isOpenSource) {
    riskScore += 20;
    warnings.push("Contract source code is unverified.");
  }

  if (isProxy) {
    riskScore += 10;
    warnings.push("Contract is an upgradeable proxy.");
  }

  if (isMintable) {
    riskScore += 15;
    warnings.push("Contract has active minting capability.");
  }

  if (tokenData.trust_list === "1") {
    riskScore = Math.max(0, riskScore - 15);
  }

  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    tokenAddress,
    network: "base",
    isHoneypot,
    buyTaxPercent,
    sellTaxPercent,
    isMintable,
    isFreezable,
    isMutableMetadata,
    isOpenSource,
    isProxy,
    riskScore,
    warnings,
    auditedAt: new Date().toISOString()
  };
}

async function checkSolanaSecurity(tokenAddress: string): Promise<TokenSecurityAudit> {
  const url = `${GOPLUS_SOLANA_URL}?contract_addresses=${tokenAddress}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`GoPlus Solana API error: ${response.status} ${response.statusText}`);
  }

  const json: any = await response.json();
  const tokenData = json?.result?.[tokenAddress];

  if (!tokenData) {
    throw new Error(`No GoPlus Solana security data found for token: ${tokenAddress}`);
  }

  const isHoneypot = tokenData.non_transferable === "1";
  const isMintable =
    tokenData.mintable?.status === "1" &&
    Array.isArray(tokenData.mintable?.authority) &&
    tokenData.mintable.authority.length > 0;
  const isFreezable =
    tokenData.freezable?.status === "1" &&
    Array.isArray(tokenData.freezable?.authority) &&
    tokenData.freezable.authority.length > 0;
  const isMutableMetadata =
    tokenData.metadata_mutable?.status === "1" &&
    Array.isArray(tokenData.metadata_mutable?.metadata_upgrade_authority) &&
    tokenData.metadata_mutable.metadata_upgrade_authority.length > 0;

  let buyTaxPercent = 0;
  let sellTaxPercent = 0;
  if (tokenData.transfer_fee?.rate) {
    const rate = parseFloat(tokenData.transfer_fee.rate);
    const tax = rate > 0 && rate < 1 ? Number((rate * 100).toFixed(2)) : Number(rate.toFixed(2));
    buyTaxPercent = tax;
    sellTaxPercent = tax;
  }

  const warnings: string[] = [];
  let riskScore = 0;

  if (isHoneypot) {
    riskScore += 90;
    warnings.push("CRITICAL: Token is marked non-transferable.");
  }

  if (buyTaxPercent > 5) {
    const taxPenalty = Math.min(30, Math.round(buyTaxPercent * 1.5));
    riskScore += taxPenalty;
    warnings.push(`High transfer fee: ${buyTaxPercent}% (exceeds 5% safe threshold).`);
  }

  if (isMintable) {
    riskScore += 15;
    warnings.push("Mint authority is active (supply can be inflated).");
  }

  if (isFreezable) {
    riskScore += 15;
    warnings.push("Freeze authority is active (accounts can be blacklisted).");
  }

  if (isMutableMetadata) {
    riskScore += 10;
    warnings.push("Token metadata is mutable.");
  }

  if (tokenData.trusted_token === 1) {
    riskScore = Math.max(0, riskScore - 20);
  }

  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    tokenAddress,
    network: "solana",
    isHoneypot,
    buyTaxPercent,
    sellTaxPercent,
    isMintable,
    isFreezable,
    isMutableMetadata,
    isOpenSource: true,
    isProxy: false,
    riskScore,
    warnings,
    auditedAt: new Date().toISOString()
  };
}
