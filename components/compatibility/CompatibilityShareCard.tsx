"use client";

// CompatibilityShareCard — canvas-rendered 9:16 share card for a
// Compatibility Checker result. Carries both the Giantverse Masthead
// (brand banner) and The Giant Hunt logo (event mark), matching the
// canvas-rendering approach already used by components/visual/ShareCard.tsx.

import { useCallback, useState } from "react";
import type { CompatibilityResult } from "@/engines/compatibility/compatibility.engine";

const W = 1080, H = 1920; // 9:16

const ROLE_COLOR: Record<CompatibilityResult["role"], string> = {
  Ally: "#C9A24B",
  Mentor: "#7B8FA3",
  Romance: "#D97BA0",
  Rival: "#D98E3B",
  Villain: "#B4543F",
};

const ROLE_ICON: Record<CompatibilityResult["role"], string> = {
  Ally: "🤝",
  Mentor: "🧭",
  Romance: "💫",
  Rival: "⚔️",
  Villain: "◆",
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function renderCompatibilityCard(result: CompatibilityResult): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const roleColor = ROLE_COLOR[result.role];

  // backdrop + frame
  ctx.fillStyle = "#0E0D0B";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = roleColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  ctx.textAlign = "center";

  // masthead banner
  const masthead = await loadImage("/Giantverse_masthead.png");
  if (masthead) {
    const mw = 680;
    const mh = (masthead.naturalHeight / masthead.naturalWidth) * mw;
    ctx.drawImage(masthead, (W - mw) / 2, 110, mw, mh);
  }

  ctx.fillStyle = "#8A8478";
  ctx.font = "600 30px Helvetica, Arial";
  ctx.fillText("GIANT HUNT COMPATIBILITY", W / 2, 420);

  // the pairing
  ctx.fillStyle = "#EFE9DA";
  ctx.font = "700 46px Georgia, serif";
  ctx.fillText(result.nameA, W / 2, 500);
  ctx.fillStyle = "#6E695F";
  ctx.font = "38px Georgia, serif";
  ctx.fillText("×", W / 2, 555);
  ctx.fillStyle = "#EFE9DA";
  ctx.font = "700 46px Georgia, serif";
  ctx.fillText(result.nameB, W / 2, 615);

  ctx.fillStyle = "#8A8478";
  ctx.font = "28px Helvetica, Arial";
  ctx.fillText(
    `${result.archetypeA.label} (${result.archetypeA.romajiName})  ·  ${result.archetypeB.label} (${result.archetypeB.romajiName})`,
    W / 2, 665,
  );

  // role — the hero moment
  ctx.beginPath();
  ctx.arc(W / 2, 900, 220, 0, Math.PI * 2);
  ctx.strokeStyle = `${roleColor}40`;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = "150px Arial";
  ctx.fillText(ROLE_ICON[result.role], W / 2, 850);

  ctx.fillStyle = roleColor;
  ctx.font = "700 96px Georgia, serif";
  ctx.fillText(result.role.toUpperCase(), W / 2, 1060);

  ctx.fillStyle = "#EFE9DA";
  ctx.font = "700 44px Helvetica, Arial";
  ctx.fillText(`${result.percentage}% — ${result.descriptor} ${result.role}`, W / 2, 1130);

  let taglineStartY = 1220;
  if (result.mentor && result.mentee) {
    ctx.fillStyle = roleColor;
    ctx.font = "600 30px Helvetica, Arial";
    ctx.fillText(`${result.mentor.name} is the Mentor · ${result.mentee.name} is the Mentee`, W / 2, 1180);
    taglineStartY = 1240;
  }

  // tagline
  ctx.fillStyle = "#8A8478";
  ctx.font = "32px Georgia, serif";
  const lines = wrapText(ctx, result.tagline, 780);
  let ty = taglineStartY;
  for (const line of lines) {
    ctx.fillText(line, W / 2, ty);
    ty += 44;
  }

  // footer — Giant Hunt logo + branding
  const logo = await loadImage("/Images/thegianthunt.png");
  if (logo) {
    const lw = 260, lh = (logo.naturalHeight / logo.naturalWidth) * lw;
    ctx.drawImage(logo, (W - lw) / 2, H - 220, lw, lh);
  }
  ctx.fillStyle = "#C9A24B";
  ctx.font = "600 34px Georgia, serif";
  ctx.fillText("giantverse.com", W / 2, H - 90);

  return canvas;
}

export function CompatibilityShareCard({ result }: { result: CompatibilityResult }) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setBusy(true);
    try {
      const canvas = await renderCompatibilityCard(result);
      setPreview(canvas.toDataURL("image/png"));
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `giant-hunt-compatibility-${result.role.toLowerCase()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } finally {
      setBusy(false);
    }
  }, [result]);

  return (
    <div className="txt-center">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Compatibility share card preview"
          className="m-auto mb-3"
          style={{ maxWidth: 220, borderRadius: 8, border: "1px solid #3a2f12" }}
        />
      )}
      <button type="button" className="btn bdr-rds2" onClick={generate} disabled={busy} style={{ cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Rendering…" : "⬇ Share This Result"}
      </button>
    </div>
  );
}
