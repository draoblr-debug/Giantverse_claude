"use client";

// A single expandable "branch" of the Design Studio mind map. Deliberately
// not a draggable/zoomable canvas (see the plan discussion) — this is a
// click-to-expand tree node styled to read as a mind map: a gold connector
// spine on the left, an icon + title header, and (when open) the branch's
// seed/reference content followed by its brainstorm sub-branch textareas.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Smile, Scissors, Eye, Zap, Ruler, User, Shirt, Footprints, Layers, Gem, Palette, Globe, Mountain, Users,
  ChevronDown,
} from "lucide-react";
import type { Branch, SubBranch } from "@/engines/design-studio/design-studio-content";

const ICONS = { Smile, Scissors, Eye, Zap, Ruler, User, Shirt, Footprints, Layers, Gem, Palette, Globe, Mountain, Users };

export function MindMapNode({
  branch,
  values,
  onChange,
  defaultOpen = false,
}: {
  branch: Branch;
  values: Record<string, string>;
  onChange: (subId: string, text: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = ICONS[branch.icon];
  const filledCount = branch.sub.filter((s) => (values[s.id] ?? "").trim().length > 0).length;

  return (
    <div style={{ position: "relative", paddingLeft: 20, marginBottom: 10 }}>
      <div
        style={{
          position: "absolute", left: 0, top: 14, bottom: open ? 14 : "auto", width: 1,
          height: open ? undefined : 0, background: "#3a2f12",
        }}
      />
      <div
        style={{
          position: "absolute", left: -3, top: 12, width: 7, height: 7, borderRadius: "50%",
          background: filledCount > 0 ? "#C9A24B" : "#3a2f12", border: "1px solid #C9A24B",
        }}
      />
      <div className="wht-cont" style={{ border: "1px solid #27272a", overflow: "hidden" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "transparent", border: "none", cursor: "pointer", padding: "10px 12px", textAlign: "left",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon size={16} color="#C9A24B" />
            <span>
              <span className="f-9 txt-upp letter-spacing2" style={{ color: "#6E695F", display: "block" }}>{branch.kicker}</span>
              <span className="f-13 fw-600" style={{ color: "#EFE9DA", fontFamily: "Georgia, serif" }}>{branch.title}</span>
            </span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {filledCount > 0 && (
              <span className="f-9" style={{ color: "#C9A24B" }}>{filledCount}/{branch.sub.length}</span>
            )}
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
              <ChevronDown size={15} color="#8A8478" />
            </motion.span>
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "0 12px 14px", borderTop: "1px solid #27272a" }}>
                {branch.seed && branch.seed.length > 0 && (
                  <div style={{ marginTop: 10, marginBottom: 10, padding: "8px 10px", background: "rgba(201,162,75,0.06)", borderLeft: "2px solid #C9A24B" }}>
                    {branch.seed.map((line, i) => (
                      <p key={i} className="f-11" style={{ color: "#BDB7A9", lineHeight: 1.5, marginBottom: i < branch.seed!.length - 1 ? 4 : 0 }}>{line}</p>
                    ))}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
                  {branch.sub.map((s) => (
                    <SubBranchField key={s.id} sub={s} value={values[s.id] ?? ""} onChange={(t) => onChange(s.id, t)} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SubBranchField({ sub, value, onChange }: { sub: SubBranch; value: string; onChange: (t: string) => void }) {
  return (
    <div>
      <label className="f-9 txt-upp letter-spacing2" style={{ color: "#C9A24B", display: "block", marginBottom: 3 }}>
        {sub.label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={sub.placeholder}
        rows={2}
        style={{
          width: "100%", resize: "vertical", background: "#0A0A0A", border: "1px solid #27272a",
          borderRadius: 6, color: "#EDEDED", fontSize: 11.5, padding: "6px 8px", fontFamily: "inherit",
        }}
      />
    </div>
  );
}
