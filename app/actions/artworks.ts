"use server";

import { createClient, createPublicClient } from "@/lib/supabase/server";
import { artworkSchema, type ArtworkInput } from "@/lib/validations/artwork";
import type { Artwork, ArtworkImage, User } from "@/types/database";

export interface ArtworkWithRelations extends Artwork {
  artist: Pick<User, "id" | "name" | "avatar_url" | "bio">;
  images: Pick<ArtworkImage, "id" | "url" | "is_primary">[];
}

/**
 * Fetches all active, live artworks for the public catalog.
 * Uses public client (no cookies) for fast edge caching and static prerendering.
 */
export async function getArtworks(): Promise<ArtworkWithRelations[]> {
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
 * Fetches single artwork by its UUID along with artist details and all photos.
 * Uses public client (no cookies) for open sharing and link previews.
 */
export async function getArtworkById(id: string): Promise<ArtworkWithRelations | null> {
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
 * Server action for artists to submit a new artwork piece.
 */
export async function createArtwork(input: ArtworkInput, imageUrls: string[]) {
  const validated = artworkSchema.parse(input);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized. Please log in as an artist to list artwork.");
  }

  // 1. Insert artwork record
  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .insert({
      artist_id: user.id,
      title: validated.title,
      medium: validated.medium,
      size: validated.size,
      year: validated.year,
      description: validated.description ?? null,
      price_ngn: validated.priceNgn,
      price_usd: validated.priceUsd ?? null,
      shipping_lagos: validated.shippingLagos,
      shipping_nigeria: validated.shippingNigeria,
      shipping_intl: validated.shippingIntl,
      status: "draft", // Starts as draft until approved & NFC tagged
    })
    .select()
    .single();

  if (artworkError || !artwork) {
    throw new Error(`Failed to create artwork: ${artworkError?.message}`);
  }

  // 2. Insert image records
  if (imageUrls.length > 0) {
    const imageRecords = imageUrls.map((url, index) => ({
      artwork_id: artwork.id,
      url,
      is_primary: index === 0,
    }));

    const { error: imageError } = await supabase
      .from("artwork_images")
      .insert(imageRecords);

    if (imageError) {
      console.error("Failed to associate images with artwork:", imageError);
    }
  }

  return artwork;
}
