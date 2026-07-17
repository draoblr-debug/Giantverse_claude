"use client";

// ShareCard — canvas-rendered social card ("Who's My Anime Twin?").
// The QR code is cropped at runtime from the official card template (it
// carries the giantverse.com QR), so the share card's QR is real and
// scannable without bundling a QR library.

import { useCallback, useState } from "react";
import type { CharacterMatch } from "@/types/visual.types";

const W = 1080, H = 1350;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function renderShareCard(match: CharacterMatch): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // backdrop
  ctx.fillStyle = "#0E0D0B";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#C9A24B";
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  ctx.textAlign = "center";

  // title
  ctx.fillStyle = "#C9A24B";
  ctx.font = "600 40px Georgia, serif";
  ctx.fillText("WHO'S MY ANIME TWIN?", W / 2, 150);

  ctx.fillStyle = "#8A8478";
  ctx.font = "26px Helvetica, Arial";
  ctx.fillText("Visual design-language match · not identity", W / 2, 200);

  // similarity ring
  const cx = W / 2, cy = 500, R = 190;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(201,162,75,0.25)";
  ctx.lineWidth = 16;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + (match.similarity / 100) * Math.PI * 2);
  ctx.strokeStyle = "#C9A24B";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.fillStyle = "#EFE9DA";
  ctx.font = "700 120px Georgia, serif";
  ctx.fillText(`${match.similarity}%`, cx, cy + 20);
  ctx.fillStyle = "#8A8478";
  ctx.font = "26px Helvetica, Arial";
  ctx.fillText("visual similarity", cx, cy + 70);

  // match name
  ctx.fillStyle = "#C9A24B";
  ctx.font = "28px Helvetica, Arial";
  ctx.fillText("I VISUALLY RESEMBLE", W / 2, 800);
  ctx.fillStyle = "#EFE9DA";
  ctx.font = "700 64px Georgia, serif";
  ctx.fillText(match.character.name, W / 2, 875);
  ctx.fillStyle = "#8A8478";
  ctx.font = "30px Helvetica, Arial";
  ctx.fillText(match.character.series, W / 2, 925);

  // logo (left) + QR (right, cropped from the official card template)
  const [logo, template] = await Promise.all([
    loadImage("/Images/thegianthunt.png"),
    loadImage("/card-template.png"),
  ]);
  if (logo) {
    const lw = 220, lh = (logo.naturalHeight / logo.naturalWidth) * lw;
    ctx.drawImage(logo, 90, H - 260, lw, lh);
  }
  if (template) {
    // QR block location on the 900×1585 template (pixel-scanned)
    ctx.drawImage(template, 687, 356, 190, 190, W - 280, H - 300, 190, 190);
    ctx.fillStyle = "#8A8478";
    ctx.font = "22px Helvetica, Arial";
    ctx.fillText("Discover yours", W - 185, H - 84);
  }

  ctx.fillStyle = "#C9A24B";
  ctx.font = "600 34px Georgia, serif";
  ctx.fillText("giantverse.com", W / 2, H - 120);

  return canvas;
}

export function ShareCard({ match }: { match: CharacterMatch }) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setBusy(true);
    try {
      const canvas = await renderShareCard(match);
      setPreview(canvas.toDataURL("image/png"));
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `anime-twin-${match.character.id}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } finally {
      setBusy(false);
    }
  }, [match]);

  return (
    <div className="txt-center">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Share card preview" className="m-auto mb-3" style={{ maxWidth: 260, borderRadius: 8, border: "1px solid #3a2f12" }} />
      )}
      <button type="button" className="btn bdr-rds2" onClick={generate} disabled={busy} style={{ cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Rendering…" : "⬇ Share Card — Who's My Anime Twin?"}
      </button>
    </div>
  );
}
