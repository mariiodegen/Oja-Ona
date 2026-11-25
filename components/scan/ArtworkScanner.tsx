"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { searchArtworkByVisual, type VisualSearchResult } from "@/app/actions/visualSearch";
import { formatNgn } from "@/utils/format";
import { routes } from "@/utils/routes";
import type { MatchArtworkResult } from "@/types/database";

type ScannerState = "idle" | "streaming" | "analyzing" | "result" | "permission_denied";

export function ArtworkScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [state, setState] = useState<ScannerState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<VisualSearchResult | null>(null);

  // Stop current active media stream tracks
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Toggle front and rear cameras
  const handleToggleFacingMode = () => {
    setErrorMessage(null);
    setState("idle");
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Perform search on an image source (data URL)
  const processImageForSearch = async (dataUrl: string) => {
    setCapturedImage(dataUrl);
    setState("analyzing");
    setErrorMessage(null);

    try {
      const result = await searchArtworkByVisual(dataUrl);
      setSearchResult(result);
      setState("result");
    } catch (err) {
      console.error("[ArtworkScanner] Visual search failed:", err);
      setState("streaming");
      setErrorMessage("Visual search request failed. Please try again.");
    }
  };

  // Capture frame from active video stream
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    stopStream();
    processImageForSearch(dataUrl);
  };

  // Handle manual file upload from camera roll or file picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      stopStream();
      processImageForSearch(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Reset to live camera scan
  const handleReset = () => {
    setCapturedImage(null);
    setSearchResult(null);
    setErrorMessage(null);
    setState("idle");
    setCameraAttempt((prev) => prev + 1);
  };

  // Synchronize external camera stream on mount, camera flip, or reset
  useEffect(() => {
    let cancelled = false;

    async function initCamera() {
      stopStream();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        await Promise.resolve();
        if (!cancelled) {
          setErrorMessage(
            "Camera access is not supported by this browser. You can still upload a photo."
          );
          setState("permission_denied");
        }
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (!cancelled) {
          setState("streaming");
        }
      } catch (err) {
        console.warn("[ArtworkScanner] Camera stream initialization failed:", err);
        if (!cancelled) {
          setErrorMessage(
            "Could not access camera. Please allow camera permissions in your browser or upload a photo from your gallery."
          );
          setState("permission_denied");
        }
      }
    }

    void initCamera();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [facingMode, cameraAttempt, stopStream]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Hidden File Input for fallback uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Viewfinder / Preview Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-stone-950 rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
        {/* State 1: Active Video Stream */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            state === "streaming" ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
          }`}
        />

        {/* State 2: Captured Image or Analyzing Overlay */}
        {capturedImage && (state === "analyzing" || state === "result") && (
          <div className="absolute inset-0 w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImage}
              alt="Captured artwork"
              className="w-full h-full object-cover filter brightness-90"
            />
          </div>
        )}

        {/* Viewfinder Overlays during Streaming */}
        {state === "streaming" && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
            {/* Header info */}
            <div className="flex items-center justify-between text-stone-200">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-xs font-medium border border-stone-700/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Camera
              </span>
              <span className="text-xs text-stone-400 font-mono tracking-wider">
                CLIP ViT-L/14
              </span>
            </div>

            {/* Corner Framing Reticles */}
            <div className="relative w-3/4 max-w-[280px] sm:max-w-[340px] aspect-square mx-auto my-auto border-2 border-amber-400/50 rounded-2xl">
              {/* Corner crosshairs */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

              {/* Center scan line animation */}
              <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />

              <div className="absolute inset-x-0 bottom-3 text-center">
                <span className="text-[11px] font-medium text-amber-200/90 bg-stone-950/70 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Align painting inside frame
                </span>
              </div>
            </div>

            {/* Bottom prompt */}
            <div className="text-center">
              <p className="text-xs text-stone-300 font-medium drop-shadow-md">
                Hold phone steady parallel to the canvas
              </p>
            </div>
          </div>
        )}

        {/* State: Initializing Camera */}
        {state === "idle" && (
          <div className="absolute inset-0 bg-stone-950 flex flex-col items-center justify-center p-6 text-center text-stone-300">
            <div className="w-10 h-10 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin mb-3" />
            <p className="text-xs font-medium tracking-wide">Starting camera...</p>
          </div>
        )}

        {/* State: Analyzing with CLIP */}
        {state === "analyzing" && (
          <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-stone-50">
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-lg">🎨</span>
            </div>
            <h3 className="font-display font-serif text-xl tracking-tight text-amber-300">
              Analyzing Artwork...
            </h3>
            <p className="text-xs text-stone-300 mt-2 max-w-xs leading-relaxed">
              Generating 768-dimensional CLIP embedding & matching against Supabase pgvector catalog.
            </p>
          </div>
        )}

        {/* State: Permission Denied or Not Supported */}
        {state === "permission_denied" && (
          <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center p-6 text-center text-stone-100">
            <span className="text-4xl mb-3">📷</span>
            <h3 className="font-display font-serif text-lg text-amber-200">Camera Unavailable</h3>
            <p className="text-xs text-stone-400 mt-2 max-w-sm leading-relaxed">
              {errorMessage || "Camera access was denied or is not supported on this device."}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-5 px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-semibold transition-all shadow-md"
            >
              Upload Artwork Photo Instead
            </button>
          </div>
        )}
      </div>

      {/* Inline Error Message during Streaming */}
      {errorMessage && state === "streaming" && (
        <div
          role="alert"
          className="w-full mt-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between gap-3"
        >
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-900 font-semibold shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Camera Controls Bar */}
      {state === "streaming" && (
        <div className="w-full mt-6 flex items-center justify-between px-4">
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <span className="w-11 h-11 rounded-full bg-stone-200/80 flex items-center justify-center text-lg shadow-sm">
              📁
            </span>
            <span className="text-[11px] font-medium">Upload</span>
          </button>

          {/* Main Shutter Button */}
          <button
            type="button"
            onClick={handleCaptureFrame}
            className="group relative flex items-center justify-center focus:outline-none"
            aria-label="Capture and search painting"
          >
            <div className="w-20 h-20 rounded-full border-4 border-amber-600 group-hover:scale-105 transition-transform flex items-center justify-center p-1 bg-transparent">
              <div className="w-full h-full rounded-full bg-stone-950 group-hover:bg-amber-700 transition-colors flex items-center justify-center shadow-lg">
                <span className="text-xl">✨</span>
              </div>
            </div>
            <span className="sr-only">Scan Painting</span>
          </button>

          {/* Flip Camera Toggle */}
          <button
            type="button"
            onClick={handleToggleFacingMode}
            className="flex flex-col items-center gap-1 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <span className="w-11 h-11 rounded-full bg-stone-200/80 flex items-center justify-center text-lg shadow-sm">
              🔄
            </span>
            <span className="text-[11px] font-medium">Flip</span>
          </button>
        </div>
      )}

      {/* Search Results Presentation */}
      {state === "result" && searchResult && (
        <div className="w-full mt-8 flex flex-col gap-6 animate-fadeIn">
          {/* 1. Exact Match Result Card (<= 0.15 distance) */}
          {searchResult.success && searchResult.matchType === "exact" && searchResult.exactMatch && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                    High Confidence Match
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-semibold">
                  {(searchResult.exactMatch.similarity * 100).toFixed(0)}% Match
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-center">
                <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <Image
                    src={searchResult.exactMatch.image_url}
                    alt={searchResult.exactMatch.title}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left flex flex-col">
                  <span className="text-xs text-amber-800 font-medium">
                    {searchResult.exactMatch.artist_name}
                  </span>
                  <h3 className="font-display font-serif text-2xl text-stone-950 mt-0.5">
                    {searchResult.exactMatch.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {searchResult.exactMatch.medium} · {searchResult.exactMatch.size} ({searchResult.exactMatch.year})
                  </p>
                  <p className="font-display font-serif text-xl font-semibold text-stone-950 mt-3">
                    {formatNgn(searchResult.exactMatch.price_ngn)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={routes.artwork(searchResult.exactMatch.artwork_id)}
                  className="flex-1 py-3 px-4 rounded-full bg-stone-950 text-stone-50 text-xs font-semibold text-center hover:bg-stone-800 transition-all shadow-sm"
                >
                  View Provenance & Certificate →
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-3 px-6 rounded-full border border-stone-300 text-stone-700 text-xs font-semibold text-center hover:bg-stone-100 transition-all"
                >
                  Scan Another
                </button>
              </div>

              {/* Optional Similar Works if found */}
              {searchResult.similar.length > 0 && (
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-3">
                    Other Visually Related Works
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {searchResult.similar.slice(0, 3).map((item) => (
                      <SimilarArtworkCard key={item.artwork_id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Similar Artworks Result (0.15 < distance <= 0.35) */}
          {searchResult.success && searchResult.matchType === "similar" && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                    Visually Similar Artworks
                  </span>
                </div>
                <span className="text-xs text-stone-500">
                  {searchResult.similar.length} match{searchResult.similar.length === 1 ? "" : "es"}
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                We did not find an identical match, but here are verified pieces sharing a similar visual composition and color palette:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {searchResult.similar.map((item) => (
                  <SimilarArtworkCard key={item.artwork_id} item={item} />
                ))}
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="mt-2 py-3 px-6 rounded-full bg-stone-950 text-stone-50 text-xs font-semibold text-center hover:bg-stone-800 transition-all shadow-sm"
              >
                Scan Another Artwork
              </button>
            </div>
          )}

          {/* 3. No Match Found (> 0.35 distance) */}
          {searchResult.success && searchResult.matchType === "none" && (
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xl text-center flex flex-col items-center">
              <span className="text-3xl mb-2">🔍</span>
              <h3 className="font-display font-serif text-xl text-stone-950">
                No Artwork Recognized
              </h3>
              <p className="text-xs text-stone-500 mt-2 max-w-sm leading-relaxed">
                {searchResult.message}
              </p>

              <div className="mt-5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/50 text-left w-full text-xs text-amber-950 space-y-1.5">
                <span className="font-semibold block">Pro scanning tips:</span>
                <p>• Step closer so the canvas fills 80% of the viewfinder.</p>
                <p>• Avoid sharp reflections or harsh gallery spotlights.</p>
                <p>• Keep the camera perpendicular to the artwork.</p>
              </div>

              <div className="flex gap-3 mt-6 w-full max-w-xs">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 rounded-full bg-stone-950 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-all"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 rounded-full border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-all"
                >
                  Upload File
                </button>
              </div>
            </div>
          )}

          {/* 4. Search Request Error */}
          {!searchResult.success && (
            <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-center flex flex-col items-center">
              <span className="text-3xl mb-2">⚠️</span>
              <h3 className="font-semibold text-red-900 text-sm">Visual Search Failed</h3>
              <p className="text-xs text-red-700 mt-1 max-w-sm">
                {searchResult.error}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 px-5 py-2.5 rounded-full bg-red-900 text-red-50 text-xs font-semibold hover:bg-red-800 transition-all"
              >
                Scan Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact preview card for visually similar pieces in the match carousel
 */
function SimilarArtworkCard({ item }: { item: MatchArtworkResult }) {
  return (
    <Link
      href={routes.artwork(item.artwork_id)}
      className="group flex flex-col rounded-2xl bg-stone-50 border border-stone-200/70 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="relative aspect-square w-full bg-stone-200">
        <Image
          src={item.image_url}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, 200px"
        />
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-sm text-[10px] font-mono font-semibold text-amber-300">
            {(item.similarity * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="p-3 flex flex-col">
        <span className="text-[10px] text-stone-500 truncate">{item.artist_name}</span>
        <h5 className="font-display font-serif text-sm text-stone-900 truncate mt-0.5">
          {item.title}
        </h5>
        <span className="font-display font-serif text-xs font-semibold text-stone-950 mt-1.5">
          {formatNgn(item.price_ngn)}
        </span>
      </div>
    </Link>
  );
}
