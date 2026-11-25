"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { artworkSchema, type ArtworkInput } from "@/lib/validations/artwork";
import { generateImageEmbedding } from "@/lib/vision/embeddings";
import type { Artwork } from "@/types/database";

export type { ArtworkWithRelations, ArtistProfile } from "@/lib/queries/artworks";

export type CreateArtworkResult =
  | { success: true; artwork: Artwork }
  | { success: false; error: string };

/**
 * Server action for artists to submit a new artwork piece.
 */
export async function createArtwork(
  input: ArtworkInput,
  imageUrls: string[]
): Promise<CreateArtworkResult> {
  try {
    const validated = artworkSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // In local development before auth session is seeded, use fallback or report auth required
    const artistId = user?.id;
    if (!artistId) {
      return {
        success: false,
        error:
          "Authentication required. Please connect your artist wallet or log in to create a live listing.",
      };
    }

    // 1. Insert artwork record
    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .insert({
        artist_id: artistId,
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
      return {
        success: false,
        error: `Failed to create artwork listing: ${artworkError?.message || "Unknown database error"}`,
      };
    }

    // 2. Insert image records with pgvector 768-dim CLIP embedding
    if (imageUrls.length > 0) {
      let primaryEmbedding: number[] | null = null;
      try {
        primaryEmbedding = await generateImageEmbedding(imageUrls[0]);
      } catch (embErr) {
        console.warn("Could not generate image embedding during artwork creation:", embErr);
      }

      const imageRecords = imageUrls.map((url, index) => ({
        artwork_id: artwork.id,
        url,
        embedding: index === 0 ? primaryEmbedding : null,
        is_primary: index === 0,
      }));

      const { error: imageError } = await supabase
        .from("artwork_images")
        .insert(imageRecords);

      if (imageError) {
        console.error("Failed to associate images with artwork:", imageError);
      }
    }

    revalidateTag("artworks", "max");
    return { success: true, artwork };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit artwork listing.";
    return { success: false, error: message };
  }
}
