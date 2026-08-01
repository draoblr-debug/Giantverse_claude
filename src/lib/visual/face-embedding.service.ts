// FaceEmbeddingService — client-side visual feature extraction via a real
// facial-landmark model (MediaPipe Face Landmarker), not a luminance guess.
//
// Privacy: the photo never leaves the browser. The landmark model itself is
// a public, non-personal asset fetched once from Google's CDN and cached by
// the browser; no photo pixels or landmarks are ever uploaded or logged.
//
// Scope: this produces geometric/photometric "design axes" that power "you
// visually resemble this design language" — NOT identity, NOT emotion,
// NOT personality.

import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { VisualAxes, VisualEmbedding } from "@/types/visual.types";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ── MediaPipe Face Landmarker — lazy singleton ──────────────────────────
// Loading the WASM runtime + model is expensive (network + init); do it
// once per page session and reuse across every photo analysed.
let landmarkerPromise: Promise<FaceLandmarker> | null = null;

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// MediaPipe's compiled WASM runtime logs its own delegate/GL setup through
// console.error/console.warn (not console.log) — e.g. "INFO: Created
// TensorFlow Lite XNNPACK delegate for CPU." and "gl_context.cc: OpenGL
// error checking is disabled". Both are normal initialization notices, not
// failures, but Next's dev overlay treats any console.error as a crash.
// There's no option on FaceLandmarker to quiet this (it comes from inside
// the compiled runtime), so filter just these known-benign lines through
// to the console without triggering the overlay; everything else still
// surfaces normally.
let consoleFiltersInstalled = false;
const BENIGN_MEDIAPIPE_LOG = /Created TensorFlow Lite .* delegate|gl_context\.cc|OpenGL error checking is disabled/i;

function installBenignLogFilter() {
  if (consoleFiltersInstalled || typeof window === "undefined") return;
  consoleFiltersInstalled = true;
  for (const method of ["error", "warn"] as const) {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      if (typeof args[0] === "string" && BENIGN_MEDIAPIPE_LOG.test(args[0])) return;
      original(...args);
    };
  }
}

async function getLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    installBenignLogFilter();
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
      );
      try {
        return await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          outputFaceBlendshapes: true,
          runningMode: "IMAGE",
          numFaces: 1,
        });
      } catch {
        // GPU delegate isn't available on every device — fall back to CPU.
        return FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
          outputFaceBlendshapes: true,
          runningMode: "IMAGE",
          numFaces: 1,
        });
      }
    })();
  }
  return landmarkerPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = src;
  });
}

// Clamps a requested crop rect into the canvas bounds so getImageData never
// reads past the edge (landmark-derived rects can slightly overshoot on
// tightly-cropped photos).
function cropImageData(ctx: CanvasRenderingContext2D, cw: number, ch: number, x: number, y: number, w: number, h: number): ImageData {
  const cx = Math.max(0, Math.min(cw - 1, x));
  const cy = Math.max(0, Math.min(ch - 1, y));
  const cw2 = Math.max(1, Math.min(cw - cx, w));
  const ch2 = Math.max(1, Math.min(ch - cy, h));
  return ctx.getImageData(cx, cy, cw2, ch2);
}

// ── Landmark geometry ────────────────────────────────────────────────────
type Pt = { x: number; y: number };

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathLength(points: Pt[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) sum += dist(points[i - 1], points[i]);
  return sum;
}

// A jagged/angular contour is measurably longer than the smooth arc a round
// shape would trace between the same two endpoints; a round jaw's path
// length is barely more than the straight-line distance between its ends.
// Baseline/range below are a geometric approximation (not calibrated
// against a labelled photo set) but — unlike the old luminance heuristic —
// genuinely respond to real facial shape differences between photos.
function sharpnessFromContour(points: Pt[]): number {
  const straight = dist(points[0], points[points.length - 1]) || 1;
  const ratio = pathLength(points) / straight;
  return clamp01((ratio - 1.05) / 0.35);
}

type BlendshapeCategory = { categoryName: string; score: number };

function blendshapeScore(categories: BlendshapeCategory[], name: string): number {
  return categories.find((c) => c.categoryName === name)?.score ?? 0;
}

const EXPRESSIVE_BLENDSHAPES = [
  "mouthSmileLeft", "mouthSmileRight", "mouthFrownLeft", "mouthFrownRight",
  "mouthPucker", "jawOpen", "browDownLeft", "browDownRight",
  "browOuterUpLeft", "browOuterUpRight", "browInnerUp",
  "eyeSquintLeft", "eyeSquintRight", "eyeWideLeft", "eyeWideRight",
  "cheekSquintLeft", "cheekSquintRight", "noseSneerLeft", "noseSneerRight",
];

// Standard MediaPipe Face Mesh landmark indices (478-point topology).
const IDX = {
  foreheadTop: 10, chin: 152, cheekLeft: 234, cheekRight: 454,
  eyeOuterL: 33, eyeInnerL: 133, eyeUpperL: 159, eyeLowerL: 145,
  eyeInnerR: 362, eyeOuterR: 263, eyeUpperR: 386, eyeLowerR: 374,
  browL: 105, browR: 334,
  mouthL: 61, mouthR: 291,
};

// Per-side jaw contour, cheek-jaw corner down to the chin — used to measure
// how sharply the jawline turns vs. sweeping in a smooth curve.
const JAW_LEFT = [136, 150, 149, 176, 148, 152];
const JAW_RIGHT = [365, 379, 378, 400, 377, 152];

// Open path across the WHOLE lower face (right cheek -> chin -> left cheek)
// — broader "shape language" read than the jaw alone. Deliberately an open
// path (not the full closed face-oval loop) so start/end never coincide.
const LOWER_FACE_PATH = [454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234];

// All face-oval landmarks (unordered) — used only for a bounding box, to
// crop the region contrast/warmth/hair sampling reads from.
const FACE_OVAL_ALL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function lumAt(data: Uint8ClampedArray, i: number): number {
  return 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
}

/** Analyse an image (data URL / object URL) into a visual embedding. */
export async function computeVisualEmbedding(imageSrc: string): Promise<VisualEmbedding> {
  const [landmarker, img] = await Promise.all([getLandmarker(), loadImage(imageSrc)]);

  const scale = Math.min(1, 640 / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const result = landmarker.detect(canvas);
  const landmarks = result.faceLandmarks[0];
  if (!landmarks) throw new Error("No face detected");

  const w = canvas.width, h = canvas.height;
  const px = (i: number): Pt => ({ x: landmarks[i].x * w, y: landmarks[i].y * h });

  // ── Geometry-based axes ────────────────────────────────────────────
  const forehead = px(IDX.foreheadTop), chin = px(IDX.chin);
  const cheekL = px(IDX.cheekLeft), cheekR = px(IDX.cheekRight);
  const faceWidth = dist(cheekL, cheekR) || 1;

  const faceLength = clamp01((dist(forehead, chin) / faceWidth - 1.05) / 0.7);

  const jawLeftPts = JAW_LEFT.map(px), jawRightPts = JAW_RIGHT.map(px);
  const jawSharpness = clamp01((sharpnessFromContour(jawLeftPts) + sharpnessFromContour(jawRightPts)) / 2);
  const angularity = sharpnessFromContour(LOWER_FACE_PATH.map(px));

  const eyeOuterL = px(IDX.eyeOuterL), eyeInnerL = px(IDX.eyeInnerL), eyeUpperL = px(IDX.eyeUpperL), eyeLowerL = px(IDX.eyeLowerL);
  const eyeInnerR = px(IDX.eyeInnerR), eyeOuterR = px(IDX.eyeOuterR), eyeUpperR = px(IDX.eyeUpperR), eyeLowerR = px(IDX.eyeLowerR);
  const eyeWidthL = dist(eyeOuterL, eyeInnerL) || 1, eyeWidthR = dist(eyeInnerR, eyeOuterR) || 1;
  const ear = (dist(eyeUpperL, eyeLowerL) / eyeWidthL + dist(eyeUpperR, eyeLowerR) / eyeWidthR) / 2; // eye aspect ratio
  const eyeNarrowness = clamp01(1 - ear / 0.32);

  const interocular = dist(eyeInnerL, eyeInnerR) || 1;
  const browL = px(IDX.browL), browR = px(IDX.browR);
  const browGap = (dist(browL, eyeUpperL) + dist(browR, eyeUpperR)) / 2;
  const browWeight = clamp01(1 - browGap / (interocular * 0.55));

  // Structural (not expression) symmetry — how evenly key feature pairs sit
  // either side of the face's own vertical centerline.
  const centerX = (cheekL.x + cheekR.x) / 2;
  const mouthL = px(IDX.mouthL), mouthR = px(IDX.mouthR);
  const symPairs: [Pt, Pt][] = [
    [eyeOuterL, eyeOuterR], [eyeInnerL, eyeInnerR], [browL, browR], [mouthL, mouthR],
    [jawLeftPts[jawLeftPts.length - 2], jawRightPts[jawRightPts.length - 2]],
  ];
  const asym = symPairs.reduce((sum, [l, r]) => sum + Math.abs((centerX - l.x) - (r.x - centerX)) / faceWidth, 0) / symPairs.length;
  const symmetry = clamp01(1 - asym * 6);

  // ── Blendshape-based axes ───────────────────────────────────────────
  const categories = result.faceBlendshapes[0]?.categories ?? [];
  const activity = EXPRESSIVE_BLENDSHAPES.reduce((s, name) => s + blendshapeScore(categories, name), 0) / EXPRESSIVE_BLENDSHAPES.length;
  const expressionNeutrality = clamp01(1 - activity * 2.5);

  // ── Photometric axes — pixel-based, but cropped precisely off the real
  // face-oval bounding box instead of a guessed region ────────────────
  const ovalPts = FACE_OVAL_ALL.map(px);
  const minX = Math.min(...ovalPts.map((p) => p.x)), maxX = Math.max(...ovalPts.map((p) => p.x));
  const minY = Math.min(...ovalPts.map((p) => p.y)), maxY = Math.max(...ovalPts.map((p) => p.y));

  const faceData = cropImageData(ctx, w, h, minX, minY, maxX - minX, maxY - minY).data;
  let lumSum = 0, lumSq = 0, rSum = 0, bSum = 0;
  const n = faceData.length / 4;
  for (let i = 0; i < n; i++) {
    const lum = lumAt(faceData, i);
    lumSum += lum; lumSq += lum * lum; rSum += faceData[i * 4]; bSum += faceData[i * 4 + 2];
  }
  const lumMean = lumSum / n;
  const contrast = clamp01(Math.sqrt(Math.max(0, lumSq / n - lumMean * lumMean)) / 70);
  const warmth = clamp01(((rSum - bSum) / n + 20) / 90);

  // Hair band — above the detected forehead point, since hair falls outside
  // the face mesh's own coverage.
  const faceOvalH = maxY - minY;
  const hairTop = Math.max(0, minY - faceOvalH * 0.4);
  const hairData = cropImageData(ctx, w, h, minX, hairTop, maxX - minX, minY - hairTop).data;
  let hairDark = 0;
  const hn = hairData.length / 4;
  for (let i = 0; i < hn; i++) if (lumAt(hairData, i) < 90) hairDark++;
  const hairDarkRatio = hn > 0 ? hairDark / hn : 0;
  const hairDarkness = clamp01(hairDarkRatio * 1.3);
  const hairVolume = clamp01(hairDarkRatio * 1.6);

  // Glasses — strong horizontal edge energy concentrated right at the known
  // eye-landmark band (frames read as sharp horizontal rims there).
  const eyeBandMinX = Math.min(eyeOuterL.x, eyeOuterR.x);
  const eyeBandMinY = Math.min(eyeUpperL.y, eyeUpperR.y) - interocular * 0.15;
  const eyeBandW = Math.max(1, Math.max(eyeOuterL.x, eyeOuterR.x) - eyeBandMinX);
  const eyeBandH = Math.max(1, Math.max(eyeLowerL.y, eyeLowerR.y) + interocular * 0.15 - eyeBandMinY);
  const eyeBandImg = cropImageData(ctx, w, h, eyeBandMinX, eyeBandMinY, eyeBandW, eyeBandH);
  const ebW = eyeBandImg.width, ebH = eyeBandImg.height, ebData = eyeBandImg.data;
  let eyeH = 0, eyeAll = 1e-6;
  for (let y = 1; y < ebH - 1; y++) {
    for (let x = 1; x < ebW - 1; x++) {
      const i = y * ebW + x;
      const dx = Math.abs(lumAt(ebData, i + 1) - lumAt(ebData, i - 1));
      const dy = Math.abs(lumAt(ebData, i + ebW) - lumAt(ebData, i - ebW));
      const mag = dx + dy;
      if (mag < 24) continue;
      eyeAll += mag;
      if (dy > dx * 1.5) eyeH += mag;
    }
  }
  const glasses = clamp01((eyeH / eyeAll - 0.3) * 2.5);

  const axesOut: VisualAxes = {
    faceLength, jawSharpness, eyeNarrowness, browWeight, hairDarkness,
    hairVolume, expressionNeutrality, symmetry, contrast, angularity,
    glasses, warmth,
  };

  return { axes: axesOut, faceConfidence: 0.95 };
}
