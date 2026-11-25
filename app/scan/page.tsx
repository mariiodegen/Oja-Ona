import type { Metadata } from "next";
import Link from "next/link";
import { ArtworkScanner } from "@/components/scan/ArtworkScanner";
import { routes } from "@/utils/routes";

export const metadata: Metadata = {
  title: "Scan & Identify Artwork | Ọjà Ọnà",
  description:
    "Photograph any physical artwork at a gallery or exhibition to instantly verify its provenance, Base L2 digital certificate, and artist details via AI visual search.",
};

export default function ScanPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/80 px-6 py-4 flex items-center justify-between">
        <Link href={routes.home} className="flex items-center gap-2">
          <span className="font-display font-serif text-2xl sm:text-3xl tracking-tight text-stone-950">
            Ọjà Ọnà
          </span>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold px-2 py-0.5 rounded bg-amber-100/60">
            Art Market
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href={routes.catalog}
            className="hover:text-amber-800 transition-colors"
          >
            Catalog
          </Link>
          <Link
            href={routes.home}
            className="text-stone-500 hover:text-stone-900 transition-colors text-xs"
          >
            ← Back
          </Link>
        </nav>
      </header>

      {/* Main Scanner Section */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center">
        <div className="text-center max-w-lg mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-semibold mb-3">
            <span>📷</span> AI Scan-to-Search
          </div>
          <h1 className="font-display font-serif text-3xl sm:text-4xl text-stone-950 tracking-tight">
            Discover Art with Your Camera
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
            Snap a painting in any gallery, studio, or exhibition. Our CLIP vision
            model matches visual brushstrokes against verified on-chain artworks in real time.
          </p>
        </div>

        {/* Interactive Scanner Viewport */}
        <ArtworkScanner />

        {/* Educational Trust Banner */}
        <div className="mt-16 max-w-xl w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200/60">
            <span className="text-xl">⚡</span>
            <h4 className="font-semibold text-xs text-stone-900 mt-1">768-Dim Vector</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Powered by OpenAI CLIP ViT-L/14 &amp; Supabase pgvector
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200/60">
            <span className="text-xl">🛡️</span>
            <h4 className="font-semibold text-xs text-stone-900 mt-1">Base L2 Provenance</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Cryptographically bound to ERC-721 certificates
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200/60">
            <span className="text-xl">🏷️</span>
            <h4 className="font-semibold text-xs text-stone-900 mt-1">NTAG 424 DNA</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Physical anti-tamper NFC verification on canvas
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <p>© 2026 Ọjà Ọnà. Physical art commerce with verified digital provenance.</p>
      </footer>
    </div>
  );
}
