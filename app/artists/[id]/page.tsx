import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtistProfile } from "@/lib/queries/artworks";
import { formatNgn } from "@/utils/format";
import { routes } from "@/utils/routes";

// Fallback artist profile for local preview before database is seeded
const mockArtists: Record<string, {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  role: "artist";
  created_at: string;
  updated_at: string;
  artworks: {
    id: string;
    title: string;
    artist: { id: string; name: string; avatar_url: string | null; bio: string | null };
    medium: string;
    size: string;
    year: number;
    price_ngn: number;
    status: "live" | "sold";
    images: { id: string; url: string; is_primary: boolean }[];
  }[];
}> = {
  "artist-1": {
    id: "artist-1",
    name: "Babatunde Adeleke",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bio: "Contemporary visual artist based in Yaba, Lagos. Working with acrylic impasto exploring urban memory, transit geometry, and West African architectural silhouettes.",
    role: "artist",
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-01-15T00:00:00Z",
    artworks: [
      {
        id: "art-1",
        title: "Èkó at Twilight",
        artist: { id: "artist-1", name: "Babatunde Adeleke", avatar_url: null, bio: null },
        medium: "Acrylic on Canvas",
        size: "120cm × 90cm",
        year: 2026,
        price_ngn: 450000,
        status: "live",
        images: [
          {
            id: "img-1",
            url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
            is_primary: true,
          },
        ],
      },
    ],
  },
};

interface ArtistPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return Object.keys(mockArtists).map((id) => ({ id }));
}

export async function generateMetadata({ params }: ArtistPageProps) {
  const { id } = await params;
  const profile = (await getArtistProfile(id)) || mockArtists[id];

  if (!profile) {
    return { title: "Artist Not Found | Ọjà Ọnà" };
  }

  return {
    title: `${profile.name} — Artist Studio | Ọjà Ọnà`,
    description: profile.bio || `Explore contemporary original artworks by ${profile.name}. Verified on Base L2.`,
    openGraph: {
      title: `${profile.name} | Ọjà Ọnà`,
      description: profile.bio || `Explore original works by ${profile.name}`,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
    },
  };
}

function ArtistProfileSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="p-8 rounded-3xl bg-white border border-stone-200/80 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-stone-200" />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="h-8 bg-stone-200 rounded w-1/3" />
          <div className="h-4 bg-stone-100 rounded w-2/3" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-2xl bg-stone-200" />
        ))}
      </div>
    </div>
  );
}

async function ArtistProfileBody({ params }: ArtistPageProps) {
  const { id } = await params;
  const profile = (await getArtistProfile(id)) || mockArtists[id];

  if (!profile) {
    notFound();
  }

  const liveWorks = profile.artworks.filter((art) => art.status === "live");
  const pastWorks = profile.artworks.filter((art) => art.status === "sold");

  return (
    <div className="space-y-12">
      {/* Artist Profile Card */}
      <section className="p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar or Monogram */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-amber-100 border-2 border-stone-100 flex-shrink-0 flex items-center justify-center shadow-inner">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display font-serif text-3xl font-bold text-amber-900">
              {profile.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Bio & Credentials */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
            <h1 className="font-display font-serif text-3xl sm:text-4xl text-stone-950">
              {profile.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-semibold">
              <span>🛡️</span> Base Verified Artist
            </span>
          </div>

          <p className="text-xs font-medium text-stone-500 mb-4">
            Lagos, Nigeria · {profile.artworks.length} Exhibited Work{profile.artworks.length === 1 ? "" : "s"}
          </p>

          {profile.bio && (
            <p className="text-sm leading-relaxed text-stone-600 max-w-2xl">
              {profile.bio}
            </p>
          )}
        </div>
      </section>

      {/* Available Artworks Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display font-serif text-2xl text-stone-950">
              Available Works
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Original pieces backed by smart contract provenance certificates and tamper-evident NFC tags.
            </p>
          </div>
          <span className="text-xs font-bold text-stone-400">
            {liveWorks.length} Available
          </span>
        </div>

        {liveWorks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-stone-200/80 text-center text-sm text-stone-500">
            No active works currently listed. Check back soon for new studio drops.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveWorks.map((art) => {
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
                      <h3 className="font-display font-serif text-xl text-stone-950 group-hover:text-amber-900 transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-xs text-stone-400 mt-1">
                        {art.medium} · {art.size} ({art.year})
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
        )}
      </section>

      {/* Past Collected Works Section */}
      {pastWorks.length > 0 && (
        <section className="pt-6 border-t border-stone-200">
          <div className="mb-6">
            <h2 className="font-display font-serif text-2xl text-stone-950">
              Collected & Provenanced Archive
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Historical works sold with on-chain ERC-721 provenance records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80">
            {pastWorks.map((art) => (
              <div
                key={art.id}
                className="rounded-2xl bg-white border border-stone-200/80 overflow-hidden shadow-sm flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden grayscale">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art.images?.[0]?.url}
                    alt={art.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-stone-800 text-[10px] uppercase font-bold text-stone-100 tracking-wider">
                    Collected
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-serif text-lg text-stone-800">
                    {art.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {art.medium} · {art.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ArtistPage({ params }: ArtistPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/80 px-6 py-4 flex items-center justify-between">
        <Link
          href={routes.catalog}
          className="text-xs font-semibold text-stone-600 hover:text-stone-950 flex items-center gap-1"
        >
          ← Back to Catalog
        </Link>
        <Link href={routes.home} className="font-display font-serif text-2xl text-stone-950">
          Ọjà Ọnà
        </Link>
        <Link
          href={routes.artistStudio.createListing}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-900 text-stone-50 hover:bg-stone-800 transition-all text-xs font-semibold"
        >
          <span>🎨</span> Artist Studio
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        <Suspense fallback={<ArtistProfileSkeleton />}>
          <ArtistProfileBody params={params} />
        </Suspense>
      </main>
    </div>
  );
}
