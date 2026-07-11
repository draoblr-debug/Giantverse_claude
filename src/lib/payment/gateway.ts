// Payment gateway abstraction for unlocking the full Giantverse Dossier
// PDF. Only a mock provider is wired in today — this interface exists so
// a real gateway (Razorpay, Stripe, etc.) can be dropped in later without
// touching any calling code: swap the provider passed to
// createPaymentGateway(), nothing else changes.

export type ChargeRequest = {
  amountMinorUnits: number; // e.g. paise for INR, cents for USD
  currency: string;         // ISO 4217, e.g. "INR"
  description: string;
  metadata?: Record<string, string>;
};

export type ChargeResult =
  | { success: true; transactionId: string; provider: string }
  | { success: false; error: string };

export interface PaymentGateway {
  readonly provider: string;
  charge(req: ChargeRequest): Promise<ChargeResult>;
}

// Simulates a checkout round-trip (network delay + success) with no real
// money movement and no external service call. Stands in for whichever
// real gateway management wires up later — the UI and store only ever
// talk to the PaymentGateway interface above, never to this class directly.
export class MockPaymentProvider implements PaymentGateway {
  readonly provider = "mock";

  async charge(req: ChargeRequest): Promise<ChargeResult> {
    await new Promise((resolve) => setTimeout(resolve, 1400));
    return {
      success: true,
      transactionId: `MOCK-${Date.now().toString(36).toUpperCase()}`,
      provider: this.provider,
    };
  }
}

let activeGateway: PaymentGateway = new MockPaymentProvider();

export function getPaymentGateway(): PaymentGateway {
  return activeGateway;
}

// Test/ops hook for swapping in a real provider without changing callers.
export function setPaymentGateway(gateway: PaymentGateway): void {
  activeGateway = gateway;
}
