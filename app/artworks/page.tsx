import { Suspense } from "react";
import Link from "next/link";
import { getArtworks } from "@/lib/queries/artworks";
import { formatNgn } from "@/utils/format";
import { routes } from "@/utils/routes";

// Fallback artworks for local review before database is seeded
const fallbackArtworks = [
  {
    id: "art-1",
    title: "Èkó at Twilight",
    artist: { id: "artist-1", name: "Babatunde Adeleke", avatar_url: null, bio: null },
    medium: "Acrylic on Canvas",
    size: "120cm × 90cm",
    year: 2026,
    price_ngn: 450000,
    status: "live" as const,
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
        is_primary: true,
      },
    ],
  },
  {
    id: "art-2",
    title: "Ọmọlúwàbí",
    artist: { id: "artist-2", name: "Chioma Nwosu", avatar_url: null, bio: null },
    medium: "Oil on Linen",
    size: "100cm × 100cm",
    year: 2026,
    price_ngn: 620000,
    status: "live" as const,
    images: [
      {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
        is_primary: true,
      },
    ],
  },
  {
    id: "art-3",
    title: "Lekki Rain Rhythm",
    artist: { id: "artist-3", name: "Kayode Fashola", avatar_url: null, bio: null },
    medium: "Mixed Media & Charcoal",
    size: "80cm × 60cm",
    year: 2026,
    price_ngn: 280000,
    status: "live" as const,
    images: [
      {
        id: "img-3",
        url: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
        is_primary: true,
      },
    ],
  },
];

export const metadata = {
  title: "Artworks Catalog | Ọjà Ọnà",
  description: "Browse curated contemporary Nigerian physical paintings and artworks.",
};

function CatalogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-white border border-stone-200/80 overflow-hidden shadow-sm animate-pulse">
          <div className="aspect-[4/3] bg-stone-200" />
          <div className="p-5 flex flex-col gap-3">
            <div className="h-6 bg-stone-200 rounded w-3/4" />
            <div className="h-4 bg-stone-100 rounded w-1/2" />
            <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center">
              <div className="h-6 bg-stone-200 rounded w-1/3" />
              <div className="h-8 bg-stone-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function ArtworkGrid() {
  const liveArtworks = await getArtworks();
  const artworks = liveArtworks.length > 0 ? liveArtworks : fallbackArtworks;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {artworks.map((art) => {
        const primaryImage =
          art.images?.find((img) => img.is_primary)?.url ||
          art.images?.[0]?.url ||
          "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80";

        return (
          <Link
            key={art.id}
            href={routes.artwork(art.id)}
            className="group rounded-2xl bg-white border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryImage}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-stone-950/70 backdrop-blur-sm text-[10px] uppercase font-bold text-stone-50 tracking-wider">
                Base Verified
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1 justify-between">
              <div>
                <h2 className="font-display font-serif text-xl text-stone-950 group-hover:text-amber-900 transition-colors">
                  {art.title}
                </h2>
                <p className="text-xs text-stone-500 mt-1 font-medium">
                  {art.artist?.name || "Independent Artist"} · {art.year}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {art.medium} · {art.size}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-stone-400 block tracking-wider">
                    Price
                  </span>
                  <span className="font-display font-serif text-lg font-bold text-stone-950">
                    {formatNgn(art.price_ngn)}
                  </span>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-800 text-xs font-semibold group-hover:bg-amber-100 group-hover:text-amber-900 transition-colors">
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function ArtworksCatalogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/80 px-6 py-4 flex items-center justify-between">
        <Link href={routes.home} className="flex items-center gap-2">
          <span className="font-display font-serif text-2xl tracking-tight text-stone-950">
            Ọjà Ọnà
          </span>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold px-2 py-0.5 rounded bg-amber-100/60">
            Art Market
          </span>
        </Link>
        <Link
          href={routes.scan}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 text-stone-50 hover:bg-stone-800 transition-all text-xs font-semibold"
        >
          <span>📷</span> Scan with Camera
        </Link>
      </header>

      {/* Catalog Title Section */}
      <main className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-stone-400 font-bold block mb-1">
            Exhibition Catalog
          </span>
          <h1 className="font-display font-serif text-3xl sm:text-5xl text-stone-950">
            Available Works
          </h1>
          <p className="text-stone-600 text-sm mt-2 max-w-xl">
            Each physical piece includes an on-chain ERC-721 certificate on Base L2, an anti-tamper NFC tag, and buyer escrow protection.
          </p>
        </div>

        {/* Streaming Gallery Grid with Suspense Placeholder */}
        <Suspense fallback={<CatalogGridSkeleton />}>
          <ArtworkGrid />
        </Suspense>
      </main>
    </div>
  );
}
