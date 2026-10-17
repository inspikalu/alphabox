import { TradeOrderRequest, VaultPolicyConfig, PolicyValidationResult } from "../types/vault.js";

export const DEFAULT_VAULT_POLICY: VaultPolicyConfig = {
  maxAutonomousTradeUsd: 25.0,
  maxSlippagePercent: 1.5,
  allowedNetworks: ["solana", "base"]
};

export function validateTradePolicy(
  order: TradeOrderRequest,
  customPolicy?: Partial<VaultPolicyConfig>
): PolicyValidationResult {
  const policy: VaultPolicyConfig = {
    ...DEFAULT_VAULT_POLICY,
    ...customPolicy
  };

  // 1. Verify network policy
  if (!policy.allowedNetworks.includes(order.network)) {
    return {
      allowed: false,
      requiresApproval: false,
      reason: `Network '${order.network}' is not permitted by vault policy. Allowed: ${policy.allowedNetworks.join(", ")}`
    };
  }

  // 2. Verify slippage policy
  if (order.slippagePercent > policy.maxSlippagePercent) {
    return {
      allowed: false,
      requiresApproval: false,
      reason: `Slippage tolerance of ${order.slippagePercent}% exceeds maximum policy threshold of ${policy.maxSlippagePercent}%.`
    };
  }

  // 3. Verify autonomous trade size policy
  if (order.amountUsd > policy.maxAutonomousTradeUsd) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      allowed: false,
      requiresApproval: true,
      approvalUrl: `https://app.paybox.sh/approve/${requestId}`,
      reason: `Order of $${order.amountUsd.toFixed(2)} exceeds autonomous vault limit of $${policy.maxAutonomousTradeUsd.toFixed(2)}. User passkey approval required.`
    };
  }

  return {
    allowed: true,
    requiresApproval: false
  };
}
