import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { Artwork, ArtworkImage, User } from "@/types/database";

export interface ArtworkWithRelations extends Artwork {
  artist: Pick<User, "id" | "name" | "avatar_url" | "bio">;
  images: Pick<ArtworkImage, "id" | "url" | "is_primary">[];
}

export interface ArtistProfile extends User {
  artworks: ArtworkWithRelations[];
}

/**
 * Fetches all active, live artworks for the public catalog.
 * Uses Next.js 16 "use cache" with a 1-minute revalidation profile ("minutes")
 * and an anonymous cookie-free Supabase client for fast static prerendering.
 */
export async function getArtworks(): Promise<ArtworkWithRelations[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("artworks");

  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("artworks")
      .select(`
        *,
        artist:users (id, name, avatar_url, bio),
        images:artwork_images (id, url, is_primary)
      `)
      .eq("status", "live")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not fetch artworks from Supabase:", error.message);
      return [];
    }

    return (data as unknown as ArtworkWithRelations[]) ?? [];
  } catch (err) {
    console.warn("Supabase connection skipped or unconfigured:", err);
    return [];
  }
}

/**
 * Fetches a single artwork by its UUID along with artist details and all photos.
 */
export async function getArtworkById(id: string): Promise<ArtworkWithRelations | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("artworks", `artwork-${id}`);

  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("artworks")
      .select(`
        *,
        artist:users (id, name, avatar_url, bio),
        images:artwork_images (id, url, is_primary)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as unknown as ArtworkWithRelations;
  } catch {
    return null;
  }
}

/**
 * Fetches an artist's public profile along with all their public artworks.
 */
export async function getArtistProfile(id: string): Promise<ArtistProfile | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("artworks", `artist-${id}`);

  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return null;
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .eq("role", "artist")
      .single();

    if (userError || !user) {
      return null;
    }

    const { data: artworks } = await supabase
      .from("artworks")
      .select(`
        *,
        artist:users (id, name, avatar_url, bio),
        images:artwork_images (id, url, is_primary)
      `)
      .eq("artist_id", id)
      .in("status", ["live", "sold"])
      .order("created_at", { ascending: false });

    return {
      ...(user as User),
      artworks: (artworks as unknown as ArtworkWithRelations[]) ?? [],
    };
  } catch {
    return null;
  }
}
