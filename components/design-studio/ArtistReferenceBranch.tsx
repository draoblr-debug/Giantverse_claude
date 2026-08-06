"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Users } from "lucide-react";
import type { ArtistReference, SubBranch } from "@/engines/design-studio/design-studio-content";

export function ArtistReferenceBranch({
  references,
  subBranches,
  values,
  onChange,
}: {
  references: ArtistReference[];
  subBranches: SubBranch[];
  values: Record<string, Record<string, string>>; // artist index (as string) -> subId -> text
  onChange: (artistKey: string, subId: string, text: string) => void;
}) {
  return (
    <div style={{ position: "relative", paddingLeft: 20, marginBottom: 10 }}>
      <div className="wht-cont" style={{ border: "1px solid #27272a", padding: "10px 12px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Users size={16} color="#C9A24B" />
          <span>
            <span className="f-9 txt-upp letter-spacing2" style={{ color: "#6E695F", display: "block" }}>REFERENCE</span>
            <span className="f-13 fw-600" style={{ color: "#EFE9DA", fontFamily: "Georgia, serif" }}>Artists &amp; Characters, Same Archetype Language</span>
          </span>
        </span>
        <p className="f-11" style={{ color: "#8A8478", marginBottom: 10 }}>
          Real designers and characters whose visual choices speak the same language as your archetype — matched to
          your own face first, then the book&apos;s own master studies. Open any card to note what you&apos;d borrow.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {references.map((ref, i) => (
            <ArtistCard
              key={`${ref.name}-${i}`}
              artistKey={String(i)}
              ref_={ref}
              subBranches={subBranches}
              values={values[String(i)] ?? {}}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtistCard({
  artistKey, ref_, subBranches, values, onChange,
}: {
  artistKey: string;
  ref_: ArtistReference;
  subBranches: SubBranch[];
  values: Record<string, string>;
  onChange: (artistKey: string, subId: string, text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const filledCount = subBranches.filter((s) => (values[s.id] ?? "").trim().length > 0).length;

  return (
    <div style={{ border: "1px solid #27272a", borderRadius: 8, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "transparent", border: "none", cursor: "pointer", padding: "8px 10px", textAlign: "left",
        }}
      >
        <span>
          <span className="f-12 fw-600" style={{ color: "#EFE9DA" }}>{ref_.name}</span>
          {ref_.origin === "matched" && (
            <span className="f-8 txt-upp letter-spacing2" style={{ color: "#C9A24B", marginLeft: 8, border: "1px solid #3a2f12", borderRadius: 4, padding: "1px 5px" }}>
              your match
            </span>
          )}
          <span className="f-10" style={{ color: "#8A8478", display: "block", marginTop: 1 }}>{ref_.source}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {filledCount > 0 && <span className="f-9" style={{ color: "#C9A24B" }}>{filledCount}/{subBranches.length}</span>}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
            <ChevronDown size={13} color="#8A8478" />
          </motion.span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 10px 12px", borderTop: "1px solid #27272a" }}>
              <p className="f-11" style={{ color: "#BDB7A9", lineHeight: 1.5, margin: "8px 0" }}>
                <span style={{ color: "#C9A24B" }}>{ref_.principle}</span> — {ref_.takeaway}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                {subBranches.map((s) => (
                  <div key={s.id}>
                    <label className="f-9 txt-upp letter-spacing2" style={{ color: "#C9A24B", display: "block", marginBottom: 3 }}>{s.label}</label>
                    <textarea
                      value={values[s.id] ?? ""}
                      onChange={(e) => onChange(artistKey, s.id, e.target.value)}
                      placeholder={s.placeholder}
                      rows={2}
                      style={{
                        width: "100%", resize: "vertical", background: "#0A0A0A", border: "1px solid #27272a",
                        borderRadius: 6, color: "#EDEDED", fontSize: 11.5, padding: "6px 8px", fontFamily: "inherit",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
