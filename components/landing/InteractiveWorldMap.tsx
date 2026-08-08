"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

declare global {
  interface Window {
    createUnityInstance?: (
      canvas: HTMLCanvasElement,
      config: UnityConfig,
      onProgress?: (progress: number) => void
    ) => Promise<UnityInstance>;
  }
}

interface UnityConfig {
  arguments?: string[];
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  streamingAssetsUrl?: string;
  companyName?: string;
  productName?: string;
  productVersion?: string;
  matchWebGLToCanvasSize?: boolean;
  devicePixelRatio?: number;
  showBanner?: (msg: string, type: string) => void;
}

interface UnityInstance {
  SetFullscreen: (fullscreen: number) => void;
  Quit?: () => Promise<void>;
  SendMessage?: (gameObject: string, method: string, param?: string | number) => void;
}

export function InteractiveWorldMap() {
  const t = useTranslations("landing");
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const unityInstanceRef = useRef<UnityInstance | null>(null);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCursorInside, setIsCursorInside] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const initUnity = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    setProgress(0);
    setLoadError(null);

    const loaderScriptId = "unity-3dmap-loader-script";
    let script = document.getElementById(loaderScriptId) as HTMLScriptElement | null;

    const startInstance = () => {
      if (!window.createUnityInstance || !canvasRef.current) return;

      const buildUrl = "/3dMap/Build";
      const config: UnityConfig = {
        arguments: [],
        dataUrl: `${buildUrl}/3dMap.data.br`,
        frameworkUrl: `${buildUrl}/3dMap.framework.js.br`,
        codeUrl: `${buildUrl}/3dMap.wasm.br`,
        streamingAssetsUrl: "/3dMap/StreamingAssets",
        companyName: "DefaultCompany",
        productName: "3dMap",
        productVersion: "0.1.0",
        showBanner: (msg: string, type: string) => {
          if (type === "error") {
            console.error("Unity 3D Map Error:", msg);
          }
        },
      };

      window
        .createUnityInstance(canvasRef.current, config, (prog: number) => {
          setProgress(Math.round(prog * 100));
        })
        .then((instance) => {
          unityInstanceRef.current = instance;
          setLoading(false);
        })
        .catch((err) => {
          console.warn("Retrying with uncompressed fallback assets...", err);
          const fallbackConfig: UnityConfig = {
            ...config,
            dataUrl: `${buildUrl}/3dMap.data`,
            frameworkUrl: `${buildUrl}/3dMap.framework.js`,
            codeUrl: `${buildUrl}/3dMap.wasm`,
          };

          if (window.createUnityInstance && canvasRef.current) {
            window
              .createUnityInstance(canvasRef.current, fallbackConfig, (prog: number) => {
                setProgress(Math.round(prog * 100));
              })
              .then((instance) => {
                unityInstanceRef.current = instance;
                setLoading(false);
              })
              .catch((fallbackErr) => {
                console.error("Failed to load 3D Map:", fallbackErr);
                setLoadError("Failed to initialize 3D Map. Please refresh to try again.");
                setLoading(false);
              });
          }
        });
    };

    if (!script) {
      script = document.createElement("script");
      script.id = loaderScriptId;
      script.src = "/3dMap/Build/3dMap.loader.js";
      script.async = true;
      script.onload = () => {
        startInstance();
      };
      script.onerror = () => {
        setLoadError("Unable to load 3D Map engine script.");
        setLoading(false);
      };
      document.body.appendChild(script);
    } else {
      startInstance();
    }
  }, []);

  // Handle high-performance golden cursor movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cursorRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  useEffect(() => {
    initUnity();

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      if (unityInstanceRef.current?.Quit) {
        unityInstanceRef.current.Quit().catch(() => {});
        unityInstanceRef.current = null;
      }
    };
  }, [initUnity]);

  const toggleFullscreen = () => {
    if (unityInstanceRef.current) {
      unityInstanceRef.current.SetFullscreen(1);
    } else if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div className="atlas-map-wrapper-block">
      {/* 3D Map Frame with Exclusive Golden Custom Cursor */}
      <div
        ref={containerRef}
        className="atlas-map-wrap unity-3dmap-container"
        onMouseEnter={() => setIsCursorInside(true)}
        onMouseLeave={() => {
          setIsCursorInside(false);
          setIsDragging(false);
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        <canvas
          ref={canvasRef}
          id="unity-canvas"
          className="unity-3dmap-canvas"
          tabIndex={-1}
        />

        {/* Animated Golden Cursor (Active exclusively on the map frame) */}
        <div
          ref={cursorRef}
          className={`golden-map-cursor ${isCursorInside ? "active" : ""} ${isDragging ? "dragging" : ""}`}
          aria-hidden="true"
        >
          {/* Inner pulsating core */}
          <div className="golden-cursor-core" />
          {/* Rotating celestial ring */}
          <div className="golden-cursor-ring" />
          {/* Orbital golden particle */}
          <div className="golden-cursor-orbit" />
          {/* Glowing pulse halo */}
          <div className="golden-cursor-halo" />
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="unity-loading-overlay">
            <div className="unity-loading-glow" />
            <div className="unity-loading-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" stroke="#C9A84C" strokeDasharray="60" strokeDashoffset="20" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#FFE182" />
                <circle cx="12" cy="12" r="4" fill="#C9A84C" />
              </svg>
            </div>
            <div className="unity-loading-title">Summoning 3D Realm Map</div>
            <div className="unity-loading-sub">
              {progress < 100 ? `Loading World Assets (${progress}%)` : "Initializing Engine..."}
            </div>
            <div className="unity-progress-track">
              <div
                className="unity-progress-fill"
                style={{ width: `${Math.max(5, progress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Banner */}
        {loadError && (
          <div className="unity-error-overlay">
            <p>{loadError}</p>
            <button type="button" onClick={initUnity} className="unity-control-btn">
              Retry Loading
            </button>
          </div>
        )}
      </div>

      {/* Controls Bar Rendered Below the 3D Map Frame */}
      {!loading && !loadError && (
        <div className="unity-controls-footer">
          <div className="unity-controls-badge">
            <span className="unity-pulse-dot" />
            <span>Interactive 3D Map · Drag to Rotate · Scroll to Zoom</span>
          </div>

          <div className="unity-controls-actions">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="unity-control-btn"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              aria-label="Toggle Fullscreen"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
              <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
