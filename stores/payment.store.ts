import { create } from "zustand";
import { getPaymentGateway, type ChargeRequest } from "@/lib/payment/gateway";

// Dossier unlock state. Not persisted — a page refresh re-locks the full
// PDF, matching the "preview until you pay" model. The gateway itself is
// swappable (see lib/payment/gateway.ts); this store only ever talks to
// the PaymentGateway interface, so wiring in a real provider later is a
// one-line change there, not here.

type PaymentStatus = "idle" | "processing" | "unlocked" | "failed";

type PaymentStore = {
  status: PaymentStatus;
  transactionId: string | null;
  error: string | null;

  unlock: (req: ChargeRequest) => Promise<boolean>;
  reset: () => void;
};

export const usePaymentStore = create<PaymentStore>((set) => ({
  status: "idle",
  transactionId: null,
  error: null,

  unlock: async (req) => {
    set({ status: "processing", error: null });
    const result = await getPaymentGateway().charge(req);
    if (result.success) {
      set({ status: "unlocked", transactionId: result.transactionId, error: null });
      return true;
    }
    set({ status: "failed", error: result.error });
    return false;
  },

  reset: () => set({ status: "idle", transactionId: null, error: null }),
}));
