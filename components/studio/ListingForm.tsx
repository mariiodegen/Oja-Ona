"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createArtwork } from "@/app/actions/artworks";
import { formatNgn } from "@/utils/format";
import { routes } from "@/utils/routes";

const POPULAR_MEDIUMS = [
  "Acrylic on Canvas",
  "Oil on Linen",
  "Mixed Media on Wood",
  "Charcoal & Pastel on Paper",
  "Bronze & Copper Sculpture",
  "Wood Carving & Inlay",
  "Textile & Adire Tapestry",
];

export function ListingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [medium, setMedium] = useState("Acrylic on Canvas");
  const [customMedium, setCustomMedium] = useState("");
  const [size, setSize] = useState("");
  const [year, setYear] = useState(2026);
  const [description, setDescription] = useState("");
  const [priceNgn, setPriceNgn] = useState<number | "">("");
  const [priceUsd, setPriceUsd] = useState<number | "">("");
  const [shippingLagos, setShippingLagos] = useState<number>(15000);
  const [shippingNigeria, setShippingNigeria] = useState<number>(30000);
  const [shippingIntl, setShippingIntl] = useState<number>(95000);

  // Image URLs
  const [imageInput, setImageInput] = useState("");
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85",
  ]);

  const handleAddImage = () => {
    if (!imageInput.trim()) return;
    try {
      new URL(imageInput); // Basic URL format validation
      setImages((prev) => [...prev, imageInput.trim()]);
      setImageInput("");
    } catch {
      setErrorMessage("Please enter a valid image URL starting with http:// or https://");
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const effectiveMedium = medium === "Other" ? customMedium.trim() : medium;

    if (!title.trim()) {
      setErrorMessage("Please provide an artwork title.");
      return;
    }

    if (!effectiveMedium) {
      setErrorMessage("Please specify the artistic medium.");
      return;
    }

    if (!size.trim()) {
      setErrorMessage("Please specify dimensions (e.g. 120cm × 90cm).");
      return;
    }

    if (typeof priceNgn !== "number" || priceNgn <= 0) {
      setErrorMessage("Please provide a valid artwork price in Naira (₦).");
      return;
    }

    if (images.length === 0) {
      setErrorMessage("Please attach at least one high-resolution photo of the piece.");
      return;
    }

    setLoading(true);

    try {
      const result = await createArtwork(
        {
          title: title.trim(),
          medium: effectiveMedium,
          size: size.trim(),
          year: Number(year),
          description: description.trim() || null,
          priceNgn: Number(priceNgn),
          priceUsd: priceUsd ? Number(priceUsd) : null,
          shippingLagos: Number(shippingLagos),
          shippingNigeria: Number(shippingNigeria),
          shippingIntl: Number(shippingIntl),
        },
        images
      );

      if (!result.success) {
        setErrorMessage(result.error);
        setLoading(false);
        return;
      }

      setSuccessMessage(
        "Listing created successfully! An NFC tag can now be assigned to this piece."
      );

      // Redirect after brief delay
      setTimeout(() => {
        router.push(routes.catalog);
      }, 1500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Alert Notices */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <strong className="block font-semibold">Listing Error</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3">
          <span className="text-lg">✅</span>
          <div>
            <strong className="block font-semibold">Success</strong>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Artwork Core Details */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-6">
        <h2 className="font-display font-serif text-xl text-stone-950 border-b border-stone-100 pb-3">
          1. Artwork Specifications
        </h2>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
            Artwork Title <span className="text-amber-800">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Èkó at Twilight"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Medium <span className="text-amber-800">*</span>
            </label>
            <select
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 bg-white"
            >
              {POPULAR_MEDIUMS.map((med) => (
                <option key={med} value={med}>
                  {med}
                </option>
              ))}
              <option value="Other">Other (Custom Medium)</option>
            </select>
            {medium === "Other" && (
              <input
                type="text"
                placeholder="Specify medium (e.g. Beads on Burlap)"
                value={customMedium}
                onChange={(e) => setCustomMedium(e.target.value)}
                className="mt-2 w-full px-4 py-2 rounded-xl border border-stone-200 text-stone-900 text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Physical Dimensions <span className="text-amber-800">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 120cm × 90cm or 48in × 36in"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Creation Year <span className="text-amber-800">*</span>
            </label>
            <input
              type="number"
              min={1950}
              max={2050}
              required
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Certificate Provenance
            </label>
            <div className="px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-700 flex items-center gap-2">
              <span>🛡️</span>
              <span>ERC-721 on Base L2 (sub-cent minting fee)</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
            Artwork Story & Technique (Artist Statement)
          </label>
          <textarea
            rows={4}
            placeholder="Share the inspiration, emotional background, and physical techniques used in creating this work..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
          />
        </div>
      </div>

      {/* 2. Photo Gallery & Camera Previews */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-display font-serif text-xl text-stone-950">
            2. High-Resolution Photographs
          </h2>
          <span className="text-xs text-stone-500">
            {images.length} photo{images.length === 1 ? "" : "s"} attached
          </span>
        </div>

        <p className="text-xs text-stone-500">
          First photo becomes the primary exhibition thumbnail and is converted into a 768-dimensional vector embedding for scan-to-search discovery.
        </p>

        {/* Existing Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 bg-stone-100 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-stone-950/80 text-[10px] font-bold text-white uppercase tracking-wider">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add Photo by URL or Storage */}
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Paste high-res image URL (e.g. from Supabase Storage)..."
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="px-4 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            + Add Photo
          </button>
        </div>
      </div>

      {/* 3. Escrow Pricing & Shipping Rates */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-6">
        <h2 className="font-display font-serif text-xl text-stone-950 border-b border-stone-100 pb-3">
          3. Escrow Pricing & Shipping Rates
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Artwork Price (₦ NGN) <span className="text-amber-800">*</span>
            </label>
            <input
              type="number"
              min={1000}
              step={1000}
              required
              placeholder="e.g. 450000"
              value={priceNgn}
              onChange={(e) => setPriceNgn(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
            />
            {typeof priceNgn === "number" && priceNgn > 0 && (
              <span className="block mt-1 text-xs font-semibold text-amber-900">
                Collector pays: {formatNgn(priceNgn)}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Estimated Diaspora Price ($ USD) (Optional)
            </label>
            <input
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 300"
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
            />
          </div>
        </div>

        {/* 3 Flat Courier Tiers */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block">
            Direct Courier Delivery Rates (Covered by Buyer in Escrow)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                Lagos Metropolitan (₦)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                required
                value={shippingLagos}
                onChange={(e) => setShippingLagos(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs"
              />
              <span className="text-[11px] text-stone-400 block mt-0.5">
                {formatNgn(shippingLagos)}
              </span>
            </div>

            <div>
              <label className="block text-xs text-stone-600 mb-1">
                Rest of Nigeria (₦)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                required
                value={shippingNigeria}
                onChange={(e) => setShippingNigeria(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs"
              />
              <span className="text-[11px] text-stone-400 block mt-0.5">
                {formatNgn(shippingNigeria)}
              </span>
            </div>

            <div>
              <label className="block text-xs text-stone-600 mb-1">
                International (DHL/FedEx) (₦)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                required
                value={shippingIntl}
                onChange={(e) => setShippingIntl(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs"
              />
              <span className="text-[11px] text-stone-400 block mt-0.5">
                {formatNgn(shippingIntl)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <p className="text-xs text-stone-500 text-center sm:text-left">
          Listing begins in <strong>Draft</strong> status until your physical NTAG 424 DNA tag is confirmed and linked.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-stone-950 text-stone-50 font-semibold text-sm hover:bg-stone-800 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin text-sm">⏳</span>
              <span>Submitting to Studio...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Publish Artwork Listing</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
