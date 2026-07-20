// MediaPipe-backed face localization — the real neural-net face detector
// (Google's BlazeFace, the same model family behind ML Kit's face detection)
// standing in for the skin-tone-blob heuristic used as a last resort in
// face-embedding.service.ts. Runs fully client-side via WASM; the model and
// runtime are self-hosted under public/mediapipe so no photo data or
// analysis ever leaves the browser, and the feature works without depending
// on a third-party CDN being reachable.
//
// This only replaces WHERE we look for the face. The 12-axis measurement
// pipeline in face-embedding.service.ts (what we measure once we have that
// crop) is unchanged — it already measures every axis from real pixel data,
// unlike the Android app's equivalent, which hardcodes several axes.

import type { FaceDetector as MPFaceDetector } from "@mediapipe/tasks-vision";

export type MediaPipeFaceBox = { x: number; y: number; w: number; h: number; confidence: number };

let detectorPromise: Promise<MPFaceDetector> | null = null;

function loadDetector(): Promise<MPFaceDetector> {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FaceDetector, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
      return FaceDetector.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: "/mediapipe/models/blaze_face_short_range.tflite",
          // CPU delegate: this runs once per uploaded photo (not realtime
          // video), so GPU's speed edge isn't needed, and CPU avoids the
          // WebGL-context flakiness GPU delegates hit on some mobile browsers.
          delegate: "CPU",
        },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.5,
      });
    })().catch((err) => {
      detectorPromise = null; // allow retry on a later photo instead of caching a dead promise
      throw err;
    });
  }
  return detectorPromise;
}

/** Locate the primary face in an image via MediaPipe. Returns null if none was found or the detector couldn't load (offline, unsupported browser, etc.) — callers should fall back to a heuristic. */
export async function detectFaceBoxViaMediaPipe(source: HTMLCanvasElement): Promise<MediaPipeFaceBox | null> {
  const detector = await loadDetector();
  const result = detector.detect(source);
  const best = result.detections[0];
  if (!best?.boundingBox) return null;
  const confidence = best.categories[0]?.score ?? 0.5;
  const { originX, originY, width, height } = best.boundingBox;
  return { x: originX, y: originY, w: width, h: height, confidence };
}
