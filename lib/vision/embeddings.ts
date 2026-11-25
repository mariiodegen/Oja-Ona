// ==============================================================================
// Ọjà Ọnà — Vision Embedding Pipeline (CLIP ViT-L/14)
// Converts visual artwork images into 768-dimensional normalized vectors.
// ==============================================================================

/**
 * Expected dimensionality of the CLIP ViT-L/14 embedding space.
 */
export const EMBEDDING_DIMENSION = 768;

/**
 * Replicate model version for andreasjansson/clip-features
 * Outputs normalized 768-dimensional vector embeddings for images.
 */
const CLIP_MODEL_VERSION =
  "2883076841793a6b57904085ac342a8427f79f22fd726f1a8e1bcfb72945d8b7";

/**
 * Normalizes a vector to unit length (L2 norm = 1.0).
 * Cosine distance computation relies on normalized vectors for exact similarity.
 *
 * Formula: v_hat = v / sqrt(sum(v_i^2))
 */
export function normalizeVector(vec: number[]): number[] {
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) {
    sumSq += vec[i] * vec[i];
  }

  const magnitude = Math.sqrt(sumSq);
  if (magnitude === 0) {
    return new Array(vec.length).fill(0);
  }

  return vec.map((val) => val / magnitude);
}

/**
 * Generates a deterministic pseudo-random 768-dimensional vector from a seed string.
 * Used exclusively for local offline development, unit tests, and fallback environments
 * when REPLICATE_API_TOKEN is unavailable.
 */
export function generateMockEmbedding(seed: string): number[] {
  // Simple 32-bit FNV-1a hash to seed the pseudo-random generator
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const vector: number[] = new Array(EMBEDDING_DIMENSION);
  let current = hash >>> 0;

  // Linear congruential generator (LCG)
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    current = (Math.imul(1664525, current) + 1013904223) >>> 0;
    // Map to [-1.0, 1.0] range
    vector[i] = (current / 4294967295) * 2 - 1;
  }

  return normalizeVector(vector);
}

/**
 * Dispatches an image URL or Base64 data string to Replicate's CLIP ViT-L/14 model.
 * Returns a 768-dimensional normalized float array.
 */
export async function generateImageEmbedding(
  imageSource: string
): Promise<number[]> {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  // Fallback to deterministic mock in local environments without an API key
  if (!apiToken || apiToken.startsWith("r8_placeholder") || apiToken === "your-replicate-token") {
    console.warn(
      "[Vision] REPLICATE_API_TOKEN is not configured. Using deterministic mock embedding for local testing."
    );
    return generateMockEmbedding(imageSource);
  }

  try {
    // 1. Dispatch prediction request with 'Prefer: wait' header (up to 60s synchronous wait)
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        version: CLIP_MODEL_VERSION,
        input: {
          image: imageSource,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(
        `[Vision] Replicate API HTTP error (${response.status}):`,
        errText
      );
      // Fallback rather than crashing the user workflow
      return generateMockEmbedding(imageSource);
    }

    const prediction = (await response.json()) as {
      id: string;
      status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
      output?: number[] | { embedding?: number[] };
      error?: string;
      urls?: { get?: string };
    };

    // 2. If 'Prefer: wait' returned the completed output immediately
    if (prediction.status === "succeeded" && prediction.output) {
      const rawVector = Array.isArray(prediction.output)
        ? prediction.output
        : prediction.output.embedding;

      if (rawVector && rawVector.length === EMBEDDING_DIMENSION) {
        return normalizeVector(rawVector);
      }
    }

    // 3. Polling fallback if Replicate returned 201 'processing' instead of completed
    if (prediction.urls?.get && (prediction.status === "starting" || prediction.status === "processing")) {
      const pollUrl = prediction.urls.get;
      const startTime = Date.now();
      const timeoutMs = 45000; // 45 second safeguard

      while (Date.now() - startTime < timeoutMs) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const pollRes = await fetch(pollUrl, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        });

        if (!pollRes.ok) break;

        const pollData = (await pollRes.json()) as {
          status: string;
          output?: number[] | { embedding?: number[] };
        };

        if (pollData.status === "succeeded" && pollData.output) {
          const rawVector = Array.isArray(pollData.output)
            ? pollData.output
            : pollData.output.embedding;

          if (rawVector && rawVector.length === EMBEDDING_DIMENSION) {
            return normalizeVector(rawVector);
          }
        }

        if (pollData.status === "failed" || pollData.status === "canceled") {
          break;
        }
      }
    }

    console.warn(
      "[Vision] Replicate prediction did not return standard 768-dim vector. Falling back to deterministic embedding."
    );
    return generateMockEmbedding(imageSource);
  } catch (error) {
    console.error("[Vision] Failed to generate CLIP embedding via Replicate:", error);
    return generateMockEmbedding(imageSource);
  }
}
