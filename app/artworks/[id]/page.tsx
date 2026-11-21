import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtworkById } from "@/app/actions/artworks";
import { formatNgn } from "@/utils/format";
import { routes } from "@/utils/routes";

// Sample artwork data for local preview if Supabase is unconfigured
const mockArtworks: Record<string, {
  id: string;
  title: string;
  artist: { id: string; name: string; avatar_url: string | null; bio: string | null };
  medium: string;
  size: string;
  year: number;
  description: string;
  price_ngn: number;
  price_usd: number | null;
  shipping_lagos: number;
  shipping_nigeria: number;
  shipping_intl: number;
  status: "live";
  images: { id: string; url: string; is_primary: boolean }[];
}> = {
  "art-1": {
    id: "art-1",
    title: "Èkó at Twilight",
    artist: {
      id: "artist-1",
      name: "Babatunde Adeleke",
      avatar_url: null,
      bio: "Contemporary visual artist based in Yaba, Lagos. Working with acrylic impasto exploring urban memory and West African architectural silhouettes.",
    },
    medium: "Acrylic on Canvas",
    size: "120cm × 90cm",
    year: 2026,
    description:
      "Capturing the vibrant transition of daylight into the indigo glow of Lagos Island. Layered impasto strokes create rich textural depths that shift under natural gallery lighting.",
    price_ngn: 450000,
    price_usd: 320,
    shipping_lagos: 15000,
    shipping_nigeria: 30000,
    shipping_intl: 95000,
    status: "live",
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85",
        is_primary: true,
      },
    ],
  },
};

interface ArtworkPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return Object.keys(mockArtworks).map((id) => ({ id }));
}

export async function generateMetadata({ params }: ArtworkPageProps) {
  const { id } = await params;
  const artwork = (await getArtworkById(id)) || mockArtworks[id];

  if (!artwork) {
    return { title: "Artwork Not Found | Ọjà Ọnà" };
  }

  return {
    title: `${artwork.title} by ${artwork.artist?.name} | Ọjà Ọnà`,
    description: `${artwork.medium}, ${artwork.year}. Verified on Base L2 with Paystack Escrow.`,
    openGraph: {
      title: artwork.title,
      description: `${artwork.medium} by ${artwork.artist?.name} — ${formatNgn(artwork.price_ngn)}`,
      images: artwork.images?.[0]?.url ? [{ url: artwork.images[0].url }] : [],
    },
  };
}

export default async function ArtworkDetailPage({ params }: ArtworkPageProps) {
  const { id } = await params;
  const artwork = (await getArtworkById(id)) || mockArtworks[id];

  if (!artwork) {
    notFound();
  }

  const primaryImage =
    artwork.images?.find((img) => img.is_primary)?.url ||
    artwork.images?.[0]?.url;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/80 px-6 py-4 flex items-center justify-between">
        <Link href={routes.catalog} className="text-xs font-semibold text-stone-600 hover:text-stone-950 flex items-center gap-1">
          ← Back to Catalog
        </Link>
        <Link href={routes.home} className="font-display font-serif text-2xl text-stone-950">
          Ọjà Ọnà
        </Link>
        <div className="w-16" /> {/* Balance spacer */}
      </header>

      {/* Main Detail View */}
      <main className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: High-Res Photo Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryImage}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-xs font-semibold text-stone-50 flex items-center gap-1.5">
                <span>🛡️</span> On-Chain Certificate (Base L2)
              </div>
            </div>

            {/* Verification Hardware Tag Badge */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/70 flex items-start gap-3">
              <span className="text-xl">🏷️</span>
              <div className="text-xs text-amber-900">
                <strong className="block font-semibold">Physical Tamper-Evident NFC Linked</strong>
                An encrypted NTAG 424 DNA tag is attached to the stretcher bar. Tapping it with your phone verifies authenticity and confirms safe delivery.
              </div>
            </div>
          </div>

          {/* Right Column: Artwork Metadata & Escrow Checkout */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-800 font-bold block mb-1">
                Original Artwork
              </span>
              <h1 className="font-display font-serif text-3xl sm:text-4xl text-stone-950 leading-tight">
                {artwork.title}
              </h1>
              <p className="text-sm font-medium text-stone-600 mt-1">
                by{" "}
                <span className="text-stone-900 font-semibold">
                  {artwork.artist?.name || "Independent Artist"}
                </span>{" "}
                ({artwork.year})
              </p>
            </div>

            {/* Price Card */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
              <span className="text-xs uppercase font-semibold text-stone-400 block tracking-wider">
                Artwork Price
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display font-serif text-3xl font-bold text-stone-950">
                  {formatNgn(artwork.price_ngn)}
                </span>
                {artwork.price_usd && (
                  <span className="text-xs text-stone-500 font-medium">
                    (approx. ${artwork.price_usd} USD)
                  </span>
                )}
              </div>

              {/* Purchase Button */}
              <Link
                href={routes.checkout(artwork.id)}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-stone-950 text-stone-50 text-sm font-semibold hover:bg-stone-800 transition-all shadow-sm"
              >
                <span>🔒</span> Purchase with Escrow Protection
              </Link>
              <p className="text-[11px] text-center text-stone-500 mt-2">
                Funds are held safely in escrow and only released after delivery is confirmed.
              </p>
            </div>

            {/* Physical Specifications */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm flex flex-col gap-3">
              <h2 className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                Specifications
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-400 block">Medium</span>
                  <span className="font-medium text-stone-800">{artwork.medium}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Dimensions</span>
                  <span className="font-medium text-stone-800">{artwork.size}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Creation Year</span>
                  <span className="font-medium text-stone-800">{artwork.year}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Provenance</span>
                  <span className="font-medium text-amber-900">Base L2 (ERC-721)</span>
                </div>
              </div>
            </div>

            {/* Shipping Rates Breakdown */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm flex flex-col gap-3">
              <h2 className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                Direct Courier Shipping Rates
              </h2>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="text-stone-600">Lagos Metropolitan</span>
                  <span className="font-semibold text-stone-900">{formatNgn(artwork.shipping_lagos)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="text-stone-600">Rest of Nigeria</span>
                  <span className="font-semibold text-stone-900">{formatNgn(artwork.shipping_nigeria)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-600">International (DHL / FedEx)</span>
                  <span className="font-semibold text-stone-900">{formatNgn(artwork.shipping_intl)}</span>
                </div>
              </div>
            </div>

            {/* Artist Story */}
            {artwork.artist?.bio && (
              <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm flex flex-col gap-2">
                <h2 className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                  About the Artist
                </h2>
                <p className="text-xs leading-relaxed text-stone-600">
                  {artwork.artist.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
