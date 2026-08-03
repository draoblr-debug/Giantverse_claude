"use client";

// Design Studio — a separate page (not part of the PDF) shown after the
// payment gateway unlocks the dossier. An interactive brainstorm mind map
// covering every visual parameter that goes into drawing the character
// (face, hair, eyes, scars, body, wardrobe, accessories, materials, design
// language), plus world research/setting dimensions and artist/character
// references in the same archetype language. Click-to-expand tree nodes,
// not a draggable canvas (see the plan discussion this was scoped from).
// Notes are local-only (no DB persistence) with a "download my brainstorm"
// export instead.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session.store";
import { usePaymentStore } from "@/stores/payment.store";
import { useVisualStore } from "@/stores/visual.store";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { lookupRealmLore } from "@/engines/dossier/realm-lore-book";
import {
  VISUAL_BRANCHES, worldBranches, buildArtistReferences, ARTIST_SUB_BRANCHES,
} from "@/engines/design-studio/design-studio-content";
import { MindMapNode } from "./MindMapNode";
import { ArtistReferenceBranch } from "./ArtistReferenceBranch";

type NotesState = Record<string, Record<string, string>>; // branchId -> subId -> text
type ArtistNotesState = Record<string, Record<string, string>>; // artistIndex -> subId -> text

function groupByKicker<T extends { kicker: string }>(items: T[]): [string, T[]][] {
  const order: string[] = [];
  const map = new Map<string, T[]>();
  for (const item of items) {
    if (!map.has(item.kicker)) { map.set(item.kicker, []); order.push(item.kicker); }
    map.get(item.kicker)!.push(item);
  }
  return order.map((k) => [k, map.get(k)!]);
}

export function DesignStudioMindMap() {
  const router = useRouter();
  const session = useSessionStore((s) => s);
  const legacyName = session.legacyName;
  const archetypeId = session.archetype;
  const archetypeLabel = session.archetypeLabel;
  const order = session.order;
  const unlocked = usePaymentStore((s) => s.status === "unlocked");
  const visualMatches = useVisualStore((s) => s.matches);

  const [notes, setNotes] = useState<NotesState>({});
  const [artistNotes, setArtistNotes] = useState<ArtistNotesState>({});

  useEffect(() => {
    if (!legacyName) { router.replace("/birth"); return; }
    if (!unlocked) { router.replace("/dossier"); }
  }, [legacyName, unlocked, router]);

  const realmId = archetypeId ? ARCHETYPE_DEFINITIONS[archetypeId]?.realmBias ?? "Maruto" : "Maruto";
  const realm = useMemo(() => lookupRealmLore(realmId), [realmId]);
  const world = useMemo(() => worldBranches(realm.realmName, realm.realmJp, realm.symbol, realm.loreRealm), [realm]);
  const artistRefs = useMemo(() => buildArtistReferences(
    (visualMatches ?? []).map((m) => ({
      name: m.character.name, series: m.character.series, designer: m.character.designer,
      studio: m.character.studio, shapeLanguage: m.character.shape_language,
    })),
  ), [visualMatches]);

  const visualGroups = useMemo(() => groupByKicker(VISUAL_BRANCHES), []);
  const worldGroups = useMemo(() => groupByKicker(world), [world]);

  function setNote(branchId: string, subId: string, text: string) {
    setNotes((prev) => ({ ...prev, [branchId]: { ...prev[branchId], [subId]: text } }));
  }
  function setArtistNote(artistKey: string, subId: string, text: string) {
    setArtistNotes((prev) => ({ ...prev, [artistKey]: { ...prev[artistKey], [subId]: text } }));
  }

  function handleDownload() {
    const lines: string[] = [];
    lines.push(`# Character Design Brainstorm — ${legacyName ?? ""}`);
    if (archetypeLabel) lines.push(`*${archetypeLabel}${order ? ` · Order of ${order === "GIANT" ? "Giants" : "Hunters"}` : ""} · ${realm.realmName}*`);
    lines.push("");

    const emitBranch = (branch: { id: string; title: string; sub: { id: string; label: string }[] }) => {
      const vals = notes[branch.id] ?? {};
      const any = branch.sub.some((s) => (vals[s.id] ?? "").trim());
      if (!any) return;
      lines.push(`## ${branch.title}`);
      for (const s of branch.sub) {
        const v = (vals[s.id] ?? "").trim();
        if (v) lines.push(`- **${s.label}:** ${v}`);
      }
      lines.push("");
    };

    lines.push("## Visual Parameters");
    VISUAL_BRANCHES.forEach(emitBranch);
    lines.push("## World");
    world.forEach(emitBranch);

    const artistLines: string[] = [];
    artistRefs.forEach((ref, i) => {
      const vals = artistNotes[String(i)] ?? {};
      const any = ARTIST_SUB_BRANCHES.some((s) => (vals[s.id] ?? "").trim());
      if (!any) return;
      artistLines.push(`### ${ref.name} — ${ref.source}`);
      for (const s of ARTIST_SUB_BRANCHES) {
        const v = (vals[s.id] ?? "").trim();
        if (v) artistLines.push(`- **${s.label}:** ${v}`);
      }
      artistLines.push("");
    });
    if (artistLines.length) {
      lines.push("## Artists & References");
      lines.push(...artistLines);
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(legacyName ?? "character").replace(/[^a-z0-9]+/gi, "-")}-design-brainstorm.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!legacyName || !unlocked) return null;

  return (
    <div className="legacy-container container2" style={{ minHeight: "100vh" }}>
      <div className="head-bdr"></div>
      <div className="container-fluid" style={{ paddingBottom: 48 }}>
        <div className="content" style={{ maxWidth: 760, margin: "0 auto", paddingTop: 32 }}>
          <p className="f-12 txt-center txt-thm-clr-50-2 txt-upp letter-spacing2 mb-1">Design Studio · Brainstorm</p>
          <h1 className="txt-center h2 fw-600 mb-2" style={{ color: "#EFE9DA", fontFamily: "Georgia, serif" }}>
            Every Visual Choice for {legacyName}
          </h1>
          <p className="mxw-450 m-auto txt-center f-12 txt-thm-clr-70-2 line-ht-20 mb-4">
            An interactive mind map of everything that goes into drawing your character — expand any branch and jot
            down notes. Nothing here is saved to your account; download your brainstorm before you leave.
          </p>

          <div className="txt-center mb-4">
            <button type="button" className="btn bdr-rds2" onClick={handleDownload}>
              ⬇ Download My Brainstorm
            </button>
          </div>

          {visualGroups.map(([kicker, branches]) => (
            <div key={kicker} style={{ marginBottom: 18 }}>
              <p className="f-10 txt-upp letter-spacing2 mb-2" style={{ color: "#6E695F" }}>{kicker}</p>
              {branches.map((branch) => (
                <MindMapNode
                  key={branch.id}
                  branch={branch}
                  values={notes[branch.id] ?? {}}
                  onChange={(subId, text) => setNote(branch.id, subId, text)}
                />
              ))}
            </div>
          ))}

          {worldGroups.map(([kicker, branches]) => (
            <div key={kicker} style={{ marginBottom: 18 }}>
              <p className="f-10 txt-upp letter-spacing2 mb-2" style={{ color: "#6E695F" }}>{kicker}</p>
              {branches.map((branch) => (
                <MindMapNode
                  key={branch.id}
                  branch={branch}
                  values={notes[branch.id] ?? {}}
                  onChange={(subId, text) => setNote(branch.id, subId, text)}
                />
              ))}
            </div>
          ))}

          <div style={{ marginBottom: 18 }}>
            <p className="f-10 txt-upp letter-spacing2 mb-2" style={{ color: "#6E695F" }}>REFERENCE</p>
            <ArtistReferenceBranch
              references={artistRefs}
              subBranches={ARTIST_SUB_BRANCHES}
              values={artistNotes}
              onChange={setArtistNote}
            />
          </div>

          <div className="txt-center mt-4">
            <button type="button" className="btn bdr-rds2" onClick={handleDownload}>
              ⬇ Download My Brainstorm
            </button>
          </div>
        </div>
      </div>
      <div className="foot-bdr"></div>
    </div>
  );
}
