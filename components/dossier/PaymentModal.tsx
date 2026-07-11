"use client";

// Dummy checkout UI — wired to lib/payment/gateway's MockPaymentProvider.
// No real payment is ever processed here. Swapping in a real gateway later
// only means changing what setPaymentGateway() is called with; this modal
// and payment.store don't need to change.

import { useState } from "react";
import { usePaymentStore } from "@/stores/payment.store";

const AMOUNT_MINOR_UNITS = 49900; // ₹499.00, placeholder demo price
const CURRENCY = "INR";

export function PaymentModal({
  onClose,
  onUnlocked,
}: {
  onClose: () => void;
  onUnlocked: () => void;
}) {
  const status = usePaymentStore((s) => s.status);
  const error = usePaymentStore((s) => s.error);
  const unlock = usePaymentStore((s) => s.unlock);
  const [method, setMethod] = useState<"card" | "upi">("upi");

  const processing = status === "processing";

  async function handlePay() {
    const ok = await unlock({
      amountMinorUnits: AMOUNT_MINOR_UNITS,
      currency: CURRENCY,
      description: "Giantverse Dossier — Full Unlock",
      metadata: { method },
    });
    if (ok) onUnlocked();
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(8,7,6,0.78)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="wht-cont"
        style={{ width: "100%", maxWidth: 400, position: "relative", border: "1px solid #3a2f12" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 10, right: 10, background: "transparent", border: "none",
            color: "#8A8478", fontSize: 16, cursor: "pointer",
          }}
        >
          ✕
        </button>

        <p className="f-10 txt-upp letter-spacing2" style={{ color: "#6E695F" }}>Demo Checkout</p>
        <h3 className="serif" style={{ color: "#EFE9DA", fontFamily: "Georgia, serif", marginTop: 4 }}>
          Unlock Your Full Dossier
        </h3>
        <p className="f-12" style={{ color: "#8A8478", marginTop: 4 }}>
          105-page Character Genesis Dossier · Premium Collector's Edition
        </p>
        <p className="f-18 fw-700" style={{ color: "#C9A24B", marginTop: 8 }}>₹499.00</p>

        <div style={{ display: "flex", gap: 8, marginTop: 16, marginBottom: 16 }}>
          {(["upi", "card"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              disabled={processing}
              className="btn-outline-sm"
              style={{
                flex: 1,
                background: method === m ? "rgba(201,162,75,0.12)" : "transparent",
                borderColor: method === m ? "#C9A24B" : "#3a2f12",
                color: method === m ? "#C9A24B" : "#8A8478",
              }}
            >
              {m === "upi" ? "UPI" : "Card"}
            </button>
          ))}
        </div>

        {method === "upi" ? (
          <input
            type="text"
            placeholder="yourname@upi"
            disabled={processing}
            className="f-12"
            style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "1px solid #3a2f12", borderRadius: 6, color: "#EFE9DA", marginBottom: 8 }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Card number"
              disabled={processing}
              className="f-12"
              style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "1px solid #3a2f12", borderRadius: 6, color: "#EFE9DA" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="MM/YY"
                disabled={processing}
                className="f-12"
                style={{ flex: 1, padding: "10px 12px", background: "transparent", border: "1px solid #3a2f12", borderRadius: 6, color: "#EFE9DA" }}
              />
              <input
                type="text"
                placeholder="CVV"
                disabled={processing}
                className="f-12"
                style={{ flex: 1, padding: "10px 12px", background: "transparent", border: "1px solid #3a2f12", borderRadius: 6, color: "#EFE9DA" }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={processing}
          className="btn bdr-rds2"
          style={{ width: "100%", marginTop: 8, cursor: processing ? "wait" : "pointer" }}
        >
          {processing ? "Processing…" : "Pay Now"}
        </button>

        {status === "failed" && error && (
          <p className="f-12 mt-2" style={{ color: "#B4543F" }}>{error}</p>
        )}

        <p className="f-10 mt-3" style={{ color: "#6E695F", lineHeight: 1.5 }}>
          This is a placeholder checkout for internal preview only — no real payment is processed and no card details
          are transmitted or stored. A live gateway will replace this screen before public launch.
        </p>
      </div>
    </div>
  );
}
