// FaceEmbeddingService — fully client-side visual feature extraction.
//
// Privacy: the image never leaves the browser. Analysis runs on an in-memory
// canvas; no pixels are uploaded, persisted, or logged. Callers must revoke
// object URLs / clear data URLs when the user deletes the photo.
//
// Scope: this produces geometric/photometric measurements ("design axes"),
// NOT identity, NOT emotion, NOT personality. It powers "you visually
// resemble this design language" — nothing more.

import type { VisualAxes, VisualEmbedding } from "@/types/visual.types";
import { detectFaceBoxViaMediaPipe } from "@/lib/visual/mediapipe-face-detector";

const SIZE = 160; // analysis resolution — small keeps it fast and private

type FaceBox = { x: number; y: number; w: number; h: number; confidence: number };

// Native FaceDetector (Chromium behind flags / some mobile browsers) — kept
// as a lightweight second attempt behind MediaPipe, since it costs nothing
// to try when present.
type NativeFaceDetector = {
  detect(image: CanvasImageSource): Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
};

async function detectFaceBox(canvas: HTMLCanvasElement): Promise<FaceBox> {
  const w = canvas.width, h = canvas.height;

  // Primary: a real neural-net face detector (MediaPipe/BlazeFace), run
  // fully client-side via WASM. This is the actual localization quality
  // upgrade — everything below it is a fallback chain for when it can't
  // load (offline first load, unsupported browser, etc.).
  try {
    const mp = await detectFaceBoxViaMediaPipe(canvas);
    if (mp) return mp;
  } catch { /* fall through */ }

  const FD = (window as unknown as { FaceDetector?: new (o?: object) => NativeFaceDetector }).FaceDetector;
  if (FD) {
    try {
      const det = new FD({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await det.detect(canvas);
      if (faces.length) {
        const b = faces[0].boundingBox;
        return { x: b.x, y: b.y, w: b.width, h: b.height, confidence: 0.9 };
      }
    } catch { /* fall through to heuristic */ }
  }
  // Last-resort heuristic: locate the densest skin-tone blob, centre-weighted.
  const ctx = canvas.getContext("2d")!;
  const img = ctx.getImageData(0, 0, w, h).data;
  let minX = w, minY = h, maxX = 0, maxY = 0, count = 0;
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const i = (y * w + x) * 4;
      const r = img[i], g = img[i + 1], b = img[i + 2];
      // broad skin-tone test across tones: R>G>B ordering with sane bounds
      if (r > 60 && r > g && g > b && r - b > 10 && r - b < 160 && g > 40) {
        count++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  if (count > (w * h) / 160 && maxX > minX && maxY > minY) {
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, confidence: 0.5 };
  }
  // Last resort: generous centre crop.
  const s = Math.min(w, h) * 0.8;
  return { x: (w - s) / 2, y: (h - s) / 2, w: s, h: s, confidence: 0.25 };
}

function loadToCanvas(src: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 640 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c);
    };
    img.onerror = reject;
    img.src = src;
  });
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Analyse an image (data URL / object URL) into a visual embedding. */
export async function computeVisualEmbedding(imageSrc: string): Promise<VisualEmbedding> {
  const source = await loadToCanvas(imageSrc);
  const box = await detectFaceBox(source);

  // Expand the box slightly upward to include hair.
  const pad = box.h * 0.45;
  const cropY = Math.max(0, box.y - pad);
  const cropH = Math.min(source.height - cropY, box.h + pad * 1.2);
  const cropX = Math.max(0, box.x - box.w * 0.1);
  const cropW = Math.min(source.width - cropX, box.w * 1.2);

  const face = document.createElement("canvas");
  face.width = SIZE; face.height = SIZE;
  const fctx = face.getContext("2d")!;
  fctx.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, SIZE, SIZE);
  const data = fctx.getImageData(0, 0, SIZE, SIZE).data;

  const lum = new Float32Array(SIZE * SIZE);
  let rSum = 0, bSum = 0;
  for (let i = 0; i < SIZE * SIZE; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    rSum += r; bSum += b;
  }

  const band = (y0: number, y1: number) => {
    let s = 0, n = 0;
    for (let y = Math.round(y0 * SIZE); y < y1 * SIZE; y++)
      for (let x = 0; x < SIZE; x++) { s += lum[y * SIZE + x]; n++; }
    return s / Math.max(1, n);
  };
  const darkRatioBand = (y0: number, y1: number, thresh = 80) => {
    let d = 0, n = 0;
    for (let y = Math.round(y0 * SIZE); y < y1 * SIZE; y++)
      for (let x = 0; x < SIZE; x++) { if (lum[y * SIZE + x] < thresh) d++; n++; }
    return d / Math.max(1, n);
  };

  // Gradients — orientation split (horizontal vs vertical vs diagonal energy)
  let gh = 0, gv = 0, gd = 0, edgeTotal = 0;
  let jawDiag = 0, jawTotal = 1e-6;
  for (let y = 1; y < SIZE - 1; y++) {
    for (let x = 1; x < SIZE - 1; x++) {
      const i = y * SIZE + x;
      const dx = lum[i + 1] - lum[i - 1];
      const dy = lum[i + SIZE] - lum[i - SIZE];
      const mag = Math.abs(dx) + Math.abs(dy);
      if (mag < 24) continue;
      edgeTotal += mag;
      const ax = Math.abs(dx), ay = Math.abs(dy);
      if (ax > ay * 2) gv += mag;         // vertical edge (horizontal gradient)
      else if (ay > ax * 2) gh += mag;    // horizontal edge
      else gd += mag;                     // diagonal
      if (y > SIZE * 0.68) {              // jaw region
        jawTotal += mag;
        if (!(ax > ay * 2) && !(ay > ax * 2)) jawDiag += mag;
      }
    }
  }
  const totalOri = gh + gv + gd || 1;

  // Symmetry — mirrored luminance difference across the vertical midline
  let symDiff = 0, symN = 0;
  for (let y = Math.round(SIZE * 0.2); y < SIZE * 0.9; y++)
    for (let x = 0; x < SIZE / 2; x++) {
      symDiff += Math.abs(lum[y * SIZE + x] - lum[y * SIZE + (SIZE - 1 - x)]);
      symN++;
    }
  const symmetry = clamp01(1 - (symDiff / symN) / 60);

  // Contrast — luminance std-dev
  let mean = 0;
  for (let i = 0; i < lum.length; i++) mean += lum[i];
  mean /= lum.length;
  let varSum = 0;
  for (let i = 0; i < lum.length; i++) { const d = lum[i] - mean; varSum += d * d; }
  const contrast = clamp01(Math.sqrt(varSum / lum.length) / 70);

  // Eye band (~32–45%): dark structure thickness → narrowness signal.
  const eyeDark = darkRatioBand(0.32, 0.46, 95);
  // Brow band (~24–33%)
  const browDark = darkRatioBand(0.24, 0.33, 90);
  // Hair: top band darkness + how far down dark mass extends at the sides
  const hairTopDark = darkRatioBand(0.0, 0.16, 90);
  const hairMidDark = darkRatioBand(0.16, 0.3, 90);
  const topBandLum = band(0, 0.14);
  // Mouth band variance (~66–80%) → expression neutrality when low
  let mSum = 0, mN = 0;
  for (let y = Math.round(SIZE * 0.66); y < SIZE * 0.8; y++)
    for (let x = Math.round(SIZE * 0.3); x < SIZE * 0.7; x++) { mSum += lum[y * SIZE + x]; mN++; }
  const mMean = mSum / Math.max(1, mN);
  let mVar = 0;
  for (let y = Math.round(SIZE * 0.66); y < SIZE * 0.8; y++)
    for (let x = Math.round(SIZE * 0.3); x < SIZE * 0.7; x++) { const d = lum[y * SIZE + x] - mMean; mVar += d * d; }
  const mouthActivity = Math.sqrt(mVar / Math.max(1, mN));

  // Glasses: strong horizontal edge energy concentrated in the eye band
  let eyeH = 0, eyeAll = 1e-6;
  for (let y = Math.round(SIZE * 0.3); y < SIZE * 0.5; y++)
    for (let x = 1; x < SIZE - 1; x++) {
      const i = y * SIZE + x;
      const dx = Math.abs(lum[i + 1] - lum[i - 1]);
      const dy = Math.abs(lum[i + SIZE] - lum[i - SIZE]);
      const mag = dx + dy;
      if (mag < 24) continue;
      eyeAll += mag;
      if (dy > dx * 1.5) eyeH += mag;
    }

  const axesOut: VisualAxes = {
    faceLength: clamp01((cropH / Math.max(1, cropW) - 0.9) / 0.7),
    jawSharpness: clamp01((jawDiag / jawTotal) * 2.2),
    eyeNarrowness: clamp01(1 - eyeDark * 6),
    browWeight: clamp01(browDark * 5),
    hairDarkness: clamp01(1 - topBandLum / 200),
    hairVolume: clamp01((hairTopDark + hairMidDark) * 1.6),
    expressionNeutrality: clamp01(1 - mouthActivity / 55),
    symmetry,
    contrast,
    angularity: clamp01(((gv + gd) / totalOri - 0.35) * 2),
    glasses: clamp01((eyeH / eyeAll - 0.3) * 2.5),
    warmth: clamp01(((rSum - bSum) / (SIZE * SIZE) + 20) / 90),
  };

  // Coarse presentation read for the optional gender filter's AUTO mode —
  // same formula as the Lens Hunt Android app's detectVisualPresentation
  // (jaw + brow + shape angularity), so AUTO behaves the same way here.
  const presentationScore = (axesOut.jawSharpness + axesOut.browWeight + axesOut.angularity) / 3;
  const visualPresentation: VisualEmbedding["visualPresentation"] =
    presentationScore > 0.55 ? "male" : presentationScore < 0.45 ? "female" : "unknown";
  const presentationConfidence =
    visualPresentation === "unknown" ? 0.5 : clamp01(visualPresentation === "male" ? presentationScore : 1 - presentationScore);

  return {
    axes: axesOut,
    faceConfidence: box.confidence * clamp01(edgeTotal / (SIZE * SIZE * 8)),
    visualPresentation,
    presentationConfidence,
  };
}
