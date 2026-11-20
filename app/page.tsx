import Link from "next/link";
import { formatNgn } from "@/utils/format";
import { routes } from "@/utils/routes";

interface SampleArtwork {
  id: string;
  title: string;
  artist: string;
  medium: string;
  size: string;
  year: number;
  priceNgn: number;
  imageUrl: string;
}

const sampleArtworks: SampleArtwork[] = [
  {
    id: "art-1",
    title: "Èkó at Twilight",
    artist: "Babatunde Adeleke",
    medium: "Acrylic on Canvas",
    size: "120cm × 90cm",
    year: 2026,
    priceNgn: 450000,
    imageUrl:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "art-2",
    title: "Ọmọlúwàbí",
    artist: "Chioma Nwosu",
    medium: "Oil on Linen",
    size: "100cm × 100cm",
    year: 2026,
    priceNgn: 620000,
    imageUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "art-3",
    title: "Lekki Rain Rhythm",
    artist: "Kayode Fashola",
    medium: "Mixed Media & Charcoal",
    size: "80cm × 60cm",
    year: 2026,
    priceNgn: 280000,
    imageUrl:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/80 px-6 py-4 flex items-center justify-between">
        <Link href={routes.home} className="flex items-center gap-2 group">
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
            href={routes.scan}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 text-stone-50 hover:bg-stone-800 transition-all text-xs font-semibold"
          >
            <span>📷</span> Scan Painting
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-12 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-semibold mb-6">
          <span>✨</span> Base L2 Provenance · Paystack Escrow · NTAG 424 DNA
        </div>
        <h1 className="font-display font-serif text-4xl sm:text-6xl lg:text-7xl tracking-tight text-stone-950 max-w-3xl leading-[1.1]">
          Original Nigerian Art, Authenticated & Escrow-Protected.
        </h1>
        <p className="mt-6 text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
          Direct from artist studios to collectors worldwide. Each physical piece
          is bound to an on-chain authenticity certificate and a tamper-evident NFC tag.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
          <Link
            href={routes.catalog}
            className="px-6 py-3.5 rounded-full bg-stone-950 text-stone-50 font-medium text-sm hover:bg-stone-800 transition-all shadow-sm"
          >
            Browse Featured Artworks
          </Link>
          <Link
            href={routes.scan}
            className="px-6 py-3.5 rounded-full bg-white border border-stone-300 text-stone-900 font-medium text-sm hover:bg-stone-50 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>📷</span> Open Camera Scanner
          </Link>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full border-t border-stone-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
            <div className="text-2xl mb-3">🛡️</div>
            <h2 className="font-display font-serif text-lg font-bold text-stone-950">
              Escrow Protection
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              Your payment is held safely until the physical piece arrives and you confirm receipt via phone tap.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
            <div className="text-2xl mb-3">🔍</div>
            <h2 className="font-display font-serif text-lg font-bold text-stone-950">
              Visual Scan-to-Search
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              Point your smartphone camera at any artwork at an exhibition to instantly pull up its profile via CLIP vector AI.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
            <div className="text-2xl mb-3">📜</div>
            <h2 className="font-display font-serif text-lg font-bold text-stone-950">
              On-Chain Certificate
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              Every artwork has a permanent ERC-721 certificate minted on Base L2 containing the artwork image SHA-256 hash.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
            <div className="text-2xl mb-3">🏷️</div>
            <h2 className="font-display font-serif text-lg font-bold text-stone-950">
              Tamper-Evident NFC
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              Encrypted NTAG 424 DNA tags attached to the canvas stretcher prevent tag swapping or counterfeit duplication.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Catalog Grid */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-serif text-2xl sm:text-3xl text-stone-950">
              Curated Works
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Fresh from contemporary artist studios in Lagos, Enugu, and Abuja.
            </p>
          </div>
          <Link
            href={routes.catalog}
            className="text-xs sm:text-sm font-semibold text-amber-900 hover:underline"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleArtworks.map((art) => (
            <article
              key={art.id}
              className="group rounded-2xl bg-white border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2 py-1 rounded bg-stone-950/70 backdrop-blur-sm text-[10px] uppercase font-bold text-stone-50 tracking-wider">
                  Base Verified
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-display font-serif text-xl text-stone-950 group-hover:text-amber-900 transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5 font-medium">
                    {art.artist} · {art.year}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    {art.medium} · {art.size}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-stone-400 block tracking-wider">
                      Price
                    </span>
                    <span className="font-display font-serif text-lg font-bold text-stone-950">
                      {formatNgn(art.priceNgn)}
                    </span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-800 text-xs font-semibold hover:bg-stone-200 transition-colors">
                    View Piece
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white px-6 py-8 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display font-serif text-base text-stone-800">
            Ọjà Ọnà · Art Market
          </p>
          <p>© 2026–2027 Ọjà Ọnà. Built for Nigerian artists and global collectors.</p>
        </div>
      </footer>
    </div>
  );
}
