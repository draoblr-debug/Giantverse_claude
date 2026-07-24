"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session.store";
import { useAssessmentStore } from "@/stores/assessment.store";
import { useVisualStore } from "@/stores/visual.store";
import { buildScoreHistory } from "@/engines/archetype/journey-history";
import { ArchetypeJourneyPlayer } from "@/components/experience/ArchetypeJourneyPlayer";
import { GiantverseShareCard } from "@/components/visual/GiantverseShareCard";
import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions";
import { REALMS } from "@/engines/realms";
import type { TurnSnapshot } from "@/lib/journey-renderer";
import type { Signal } from "@/types/archetype.types";

// Archetypes are so close to the top that a slightly different run of
// answers could have named them instead — present in your scores, never
// spoken as your name. Always exactly 3, dropping the winner itself.
const INVISIBLE_ARCHETYPE_COUNT = 3;

type RevealedResult = {
  legacyName: string;
  archetype: {
    id: string;
    label: string;
    romajiName: string;
    order: "GIANT" | "HUNTER";
    description: string;
    guidingPromise: string;
    traits: [string, string, string, string];
    traitDescriptions: [string, string, string, string];
  };
  signals: Signal[];
  scoreMap: Record<string, number>;
  scoreHistory: TurnSnapshot[];
  source: "survey" | "chat" | "visual";
};

export default function SharedRevealPage() {
  const router = useRouter();
  const { birthName, acceptLegacyName } = useSessionStore();
  const result = useAssessmentStore((state) => state.result);
  const visualMatches = useVisualStore((state) => state.matches);
  const visualPhoto = useVisualStore((state) => state.photoDataUrl);

  const [revealed, setRevealed] = useState<RevealedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The 3 next-highest scoring archetypes, dropping the winner — present
  // in the answers, close enough that a slightly different run could have
  // named them instead, but never surfaced as anyone's identity.
  const invisibleArchetypes = useMemo(() => {
    if (!revealed) return [];
    return Object.entries(revealed.scoreMap)
      .filter(([id]) => id !== revealed.archetype.id)
      .sort((a, b) => b[1] - a[1])
      .slice(0, INVISIBLE_ARCHETYPE_COUNT)
      .map(([id]) => ARCHETYPE_DEFINITIONS[id])
      .filter((profile): profile is NonNullable<typeof profile> => !!profile);
  }, [revealed]);

  const realm = useMemo(() => {
    if (!revealed) return null;
    const realmBias = ARCHETYPE_DEFINITIONS[revealed.archetype.id]?.realmBias;
    return realmBias ? REALMS[realmBias] ?? null : null;
  }, [revealed]);

  useEffect(() => {
    if (!birthName) {
      router.replace("/birth");
      return;
    }
    if (!result) {
      router.replace("/choose");
      return;
    }

    let isMounted = true;

    async function processResult() {
      try {
        let topArchetype: { id: string; label: string; romajiName: string; order: "GIANT" | "HUNTER"; normalized: number };
        let scores: { id: string; normalized: number }[];
        let apiScoreHistory: TurnSnapshot[] | undefined;

        if (result!.source === "chat" && result!.currentVector) {
          const archetypeRes = await fetch("/api/scenario-chat/archetype", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              currentVector: result!.currentVector,
              vectorHistory: result!.vectorHistory,
              chatThemes: result!.chatThemes,
            }),
          });
          if (!archetypeRes.ok) throw new Error("Could not determine your archetype.");
          const data = await archetypeRes.json();
          topArchetype = data.topArchetype;
          scores = data.scores;
          apiScoreHistory = data.scoreHistory;
        } else if (result!.source === "visual" && result!.archetypeId) {
          // Archetype already decided by summing similarity across the top-5
          // character matches (see archetype-vote.engine.ts) — the same
          // mechanism the reference app uses. No signals-based scoring pass
          // for this source; the vote result is the ground truth.
          const profile = ARCHETYPE_DEFINITIONS[result!.archetypeId];
          if (!profile) throw new Error("Could not determine your archetype.");
          const voteScoreMap = result!.archetypeScoreMap ?? {};
          topArchetype = {
            id: profile.id,
            label: profile.label,
            romajiName: profile.romajiName,
            order: profile.order,
            normalized: voteScoreMap[profile.id] ?? 1,
          };
          scores = Object.keys(ARCHETYPE_DEFINITIONS).map((id) => ({ id, normalized: voteScoreMap[id] ?? 0 }));
        } else {
          const archetypeRes = await fetch("/api/archetype", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ signals: result!.signals }),
          });
          if (!archetypeRes.ok) throw new Error("Could not determine your archetype.");
          const data = await archetypeRes.json();
          topArchetype = data.topArchetype;
          scores = data.scores;
        }

        const scoreMap: Record<string, number> = Object.fromEntries(
          scores.map((s) => [s.id, s.normalized]),
        );

        const legacyRes = await fetch("/api/legacy-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birthName, archetypeId: topArchetype.id }),
        });

        if (!legacyRes.ok) throw new Error("Could not build your legacy name.");
        const { legacyName, archetype } = await legacyRes.json();

        if (isMounted) {
          setRevealed({ 
            legacyName, 
            archetype, 
            signals: result!.signals, 
            scoreMap, 
            scoreHistory: result!.source === "chat" && apiScoreHistory ? apiScoreHistory : buildScoreHistory(result!.signals),
            source: result!.source
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      }
    }

    processResult();

    return () => {
      isMounted = false;
    };
  }, [birthName, result, router]);

  function handleConfirm() {
    if (!revealed) return;
    const { legacyName, archetype, scoreMap, scoreHistory } = revealed;
    acceptLegacyName(legacyName, archetype.id, archetype.order, archetype.label, archetype.guidingPromise, archetype.traits, scoreMap, scoreHistory);
    // The selfie was kept alive only so the share card above could use it —
    // drop it now that the ritual is finishing (retaking already clears it
    // via reset() in the branch below).
    if (revealed.source === "visual") useVisualStore.getState().clearPhoto();
    router.push("/ending");
  }

  function handleRetake() {
    if (!revealed) return;
    // Don't clear assessment.store's result here — this page's own effect
    // redirects to /choose the instant result is falsy, which raced the
    // navigation below. Retaking naturally overwrites the old result once
    // the survey/chat/photo is completed again, so nothing needs clearing early.
    if (revealed.source === "chat") {
      import("@/stores/scenario.store").then((m) => m.useScenarioStore.getState().reset());
      router.push("/scenario-chat");
    } else if (revealed.source === "visual") {
      import("@/stores/visual.store").then((m) => m.useVisualStore.getState().reset());
      router.push("/visual-discovery");
    } else {
      router.push("/survey");
    }
  }

  if (error) {
    return (
      <div className="legacy-container">
        <div className="head-bdr"></div>
        <div className="container-fluid">
          <p className="txt-center text-red-500 mt-5">{error}</p>
          <div className="txt-center mt-4 mb-4">
            <button type="button" className="btn pse-3 bdr-rds2" onClick={() => router.push("/choose")}>Try Again</button>
          </div>
        </div>
        <div className="foot-bdr"></div>
      </div>
    );
  }

  if (!revealed) {
    return (
      <div className="legacy-container">
        <div className="head-bdr"></div>
        <div className="global-loader">
          <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
            <tbody>
              <tr>
                <td>
                  <div className="gl-cont">
                    <div className="gl-cirle"></div>
                    <p className="f-12 mb-0 txt-center">Crystallising your name...</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="foot-bdr"></div>
      </div>
    );
  }

  const { archetype } = revealed;
  return (
    <div className="legacy-container">
      <div className="head-bdr"></div>
      <div className="container-fluid">
        <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
          <tbody>
            <tr>
              <td>
                <div className="content">
                  <p className="txt-thm-clr-50-2 txt-center txt-upp mb-0">Based on your answers, your Legacy Name is</p>
                  <h1 className="h5 txt-center fw-700">{revealed.legacyName}</h1>
                  <p className="txt-thm-clr-50-2 txt-center mb-4">
                    {archetype.label} ({archetype.romajiName}) &middot; Order of {archetype.order === "GIANT" ? "Giant" : "Hunter"}
                  </p>
                  
                  <ArchetypeJourneyPlayer
                    signals={revealed.signals}
                    scoreHistory={revealed.scoreHistory}
                    finalArchetypeId={archetype.id}
                    scoreMap={revealed.scoreMap}
                    hideSurveyProgression={revealed.source === "chat" || revealed.source === "visual"}
                    highlightArchetypeIds={invisibleArchetypes.map((a) => a.id)}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="container-fluid mxw-900">
        <div className="content">
          <div className="mxw-450 m-auto wht-cont pse-3 mt-4 pb-3">
            <p className="txt-thm-clr-70-2 line-ht-20 mb-2">{archetype.description}</p>
            <p className="txt-thm-clr-70-2 fst-italic line-ht-20 mb-2">&ldquo;{archetype.guidingPromise}&rdquo;</p>
            <div className="grid-list">
              <div className="row float-none">
                {archetype.traits.map((trait, i) => (
                  <div className="col-4" key={trait}>
                    <p className="f-12 txt-upp mb-0 txt-thm-clr-70-2">{trait}</p>
                    <p className="f-12 txt-thm-clr-50-2">{archetype.traitDescriptions[i]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {realm && (
            <div className="mxw-450 m-auto wht-cont pse-3 mt-3 pb-3">
              <p className="f-10 txt-upp txt-thm-clr-50-2 mb-1">Born Of</p>
              <p className="txt-thm-clr-5 line-ht-20 mb-1">
                {realm.name} <span className="txt-thm-clr-6">({realm.japanese})</span> &mdash; {realm.tagline}
              </p>
              <p className="f-12 txt-thm-clr-70-2 line-ht-20 mb-0">{realm.description}</p>
            </div>
          )}

          {invisibleArchetypes.length > 0 && (
            <div className="mxw-450 m-auto wht-cont pse-3 mt-3 pb-3">
              <p className="f-10 txt-upp txt-thm-clr-50-2 mb-1">The Invisible Archetypes</p>
              <p className="f-12 txt-thm-clr-70-2 line-ht-20 mb-2">
                Three other archetypes moved beneath your answers — close enough that a slightly different run
                could have named them instead. They never became your identity, but they shaped how you arrived at it.
              </p>
              <div className="row float-none">
                {invisibleArchetypes.map((a) => (
                  <div className="col-4" key={a.id}>
                    <p className="f-12 txt-upp mb-0 txt-thm-clr-5">{a.label}</p>
                    <p className="f-10 txt-thm-clr-50-2">{a.romajiName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {revealed.source === "visual" && visualMatches && (
            <div className="mxw-450 m-auto wht-cont pse-3 mt-3 pb-3">
              <p className="f-10 txt-upp txt-thm-clr-50-2 mb-2 txt-center">Your Giantverse Identity Card</p>
              <GiantverseShareCard
                matches={visualMatches}
                photoDataUrl={visualPhoto}
                legacyName={revealed.legacyName}
                romajiName={archetype.romajiName}
              />
            </div>
          )}

          <div className="txt-center mt-4 mb-4">
            <button type="button" className="btn pse-3 bdr-rds2 me-2" onClick={handleConfirm}>This Is Me</button>
            <button type="button" className="btn-outline pse-3 bdr-rds2 me-2" onClick={handleRetake}>
              Retake the {revealed.source === "chat" ? "Chat" : revealed.source === "visual" ? "Photo" : "Survey"}
            </button>
          </div>
        </div>
      </div>
      <div className="foot-bdr"></div>
    </div>
  );
}
