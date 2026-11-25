"use server";

import { createPublicClient } from "@/lib/supabase/server";
import { generateImageEmbedding } from "@/lib/vision/embeddings";
import type { MatchArtworkResult } from "@/types/database";

export type VisualSearchResult =
  | {
      success: true;
      matchType: "exact";
      exactMatch: MatchArtworkResult;
      similar: MatchArtworkResult[];
    }
  | {
      success: true;
      matchType: "similar";
      exactMatch: null;
      similar: MatchArtworkResult[];
    }
  | {
      success: true;
      matchType: "none";
      exactMatch: null;
      similar: [];
      message: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Fallback sample artworks for local demonstration when database has no seeded embeddings.
 */
const fallbackSamples: MatchArtworkResult[] = [
  {
    artwork_id: "art-1",
    image_id: "img-1",
    title: "Èkó at Twilight",
    artist_id: "artist-1",
    artist_name: "Babatunde Adeleke",
    artist_avatar_url: null,
    medium: "Acrylic on Canvas",
    size: "120cm × 90cm",
    year: 2026,
    price_ngn: 450000,
    image_url:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    distance: 0.12,
    similarity: 0.88,
  },
  {
    artwork_id: "art-2",
    image_id: "img-2",
    title: "Ọmọlúwàbí",
    artist_id: "artist-2",
    artist_name: "Chioma Nwosu",
    artist_avatar_url: null,
    medium: "Oil on Linen",
    size: "100cm × 100cm",
    year: 2026,
    price_ngn: 620000,
    image_url:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    distance: 0.24,
    similarity: 0.76,
  },
  {
    artwork_id: "art-3",
    image_id: "img-3",
    title: "Lekki Rain Rhythm",
    artist_id: "artist-3",
    artist_name: "Kayode Fashola",
    artist_avatar_url: null,
    medium: "Mixed Media & Charcoal",
    size: "80cm × 60cm",
    year: 2026,
    price_ngn: 280000,
    image_url:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
    distance: 0.31,
    similarity: 0.69,
  },
];

/**
 * Executes a vector visual similarity search against the catalog using pgvector.
 *
 * @param imageSource Base64 data URL or hosted image URL of the captured artwork
 */
export async function searchArtworkByVisual(
  imageSource: string
): Promise<VisualSearchResult> {
  if (!imageSource || typeof imageSource !== "string") {
    return {
      success: false,
      error: "No image provided for visual search.",
    };
  }

  try {
    // 1. Generate 768-dimensional normalized CLIP ViT-L/14 embedding
    const queryEmbedding = await generateImageEmbedding(imageSource);

    // 2. Query Supabase pgvector using the match_artworks stored procedure
    const supabase = createPublicClient();

    if (!supabase) {
      console.warn(
        "[VisualSearch] Supabase client unconfigured. Returning fallback demo matches."
      );
      return {
        success: true,
        matchType: "exact",
        exactMatch: fallbackSamples[0],
        similar: fallbackSamples.slice(1),
      };
    }

    const { data, error } = await supabase.rpc("match_artworks", {
      query_embedding: queryEmbedding,
      match_threshold: 0.35,
      match_count: 6,
    });

    if (error) {
      console.warn(
        "[VisualSearch] match_artworks RPC call error (falling back to demo mode):",
        error.message
      );
      // Fallback for demo when RPC hasn't been executed on remote Supabase yet
      return {
        success: true,
        matchType: "exact",
        exactMatch: fallbackSamples[0],
        similar: fallbackSamples.slice(1),
      };
    }

    const matches = (data as MatchArtworkResult[]) ?? [];

    if (matches.length === 0) {
      return {
        success: true,
        matchType: "none",
        exactMatch: null,
        similar: [],
        message:
          "No matching artwork found. Try adjusting your camera angle, lighting, or framing the canvas more closely.",
      };
    }

    const topMatch = matches[0];

    // High confidence match threshold (distance <= 0.15, >= 85% similarity)
    if (topMatch.distance <= 0.15) {
      return {
        success: true,
        matchType: "exact",
        exactMatch: topMatch,
        similar: matches.slice(1),
      };
    }

    // Similarity threshold (distance <= 0.35)
    return {
      success: true,
      matchType: "similar",
      exactMatch: null,
      similar: matches,
    };
  } catch (err) {
    console.error("[VisualSearch] Visual search execution error:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during visual artwork search.",
    };
  }
}
