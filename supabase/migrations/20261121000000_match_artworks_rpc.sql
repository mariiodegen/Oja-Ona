-- ==============================================================================
-- Ọjà Ọnà — Visual Search RPC Migration
-- Version: 20261121000000
-- Description: match_artworks stored procedure for pgvector cosine distance search
-- ==============================================================================

-- Function: match_artworks
-- Performs approximate nearest neighbor (ANN) cosine distance search over indexed
-- 768-dimensional CLIP ViT-L/14 image embeddings.
CREATE OR REPLACE FUNCTION public.match_artworks (
    query_embedding vector(768),
    match_threshold float DEFAULT 0.35,
    match_count int DEFAULT 6
)
RETURNS TABLE (
    artwork_id UUID,
    image_id UUID,
    title VARCHAR,
    artist_id UUID,
    artist_name VARCHAR,
    artist_avatar_url TEXT,
    medium VARCHAR,
    size VARCHAR,
    year INT,
    price_ngn NUMERIC,
    image_url TEXT,
    distance FLOAT,
    similarity FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id AS artwork_id,
        img.id AS image_id,
        a.title,
        u.id AS artist_id,
        u.name AS artist_name,
        u.avatar_url AS artist_avatar_url,
        a.medium,
        a.size,
        a.year,
        a.price_ngn,
        img.url AS image_url,
        (img.embedding <=> query_embedding)::float AS distance,
        (1 - (img.embedding <=> query_embedding))::float AS similarity
    FROM public.artwork_images img
    JOIN public.artworks a ON a.id = img.artwork_id
    JOIN public.users u ON u.id = a.artist_id
    WHERE a.status = 'live'
      AND img.embedding IS NOT NULL
      AND (img.embedding <=> query_embedding) <= match_threshold
    ORDER BY img.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- Grant execution permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.match_artworks(vector, float, int) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.match_artworks IS 'Searches live artworks using pgvector cosine distance against a 768-dim CLIP embedding vector.';
