-- ==============================================================================
-- Ọjà Ọnà — Initial Schema Migration
-- Version: 20261120000000
-- Description: Core tables, pgvector extension, RLS policies, and performance indexes
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Users Table
-- Extends Supabase auth.users with marketplace profile information
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'artist', 'admin')),
    bio TEXT,
    avatar_url TEXT,
    wallet_address VARCHAR(66), -- Base L2 EVM address (Privy or external)
    bank_details JSONB DEFAULT '{}'::jsonb, -- { account_number, bank_code, account_name, recipient_code }
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Artworks Table
CREATE TABLE IF NOT EXISTS public.artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    medium VARCHAR(100) NOT NULL, -- e.g., 'Acrylic on Canvas', 'Oil on Linen'
    size VARCHAR(100) NOT NULL,   -- e.g., '120cm × 90cm'
    year INT NOT NULL CHECK (year >= 1900 AND year <= 2100),
    description TEXT,
    price_ngn NUMERIC(12, 2) NOT NULL CHECK (price_ngn > 0),
    price_usd NUMERIC(10, 2),
    shipping_lagos NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_lagos >= 0),
    shipping_nigeria NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_nigeria >= 0),
    shipping_intl NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_intl >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'sold')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Artwork Images Table (with pgvector embedding)
CREATE TABLE IF NOT EXISTS public.artwork_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    embedding VECTOR(768), -- 768-dimensional normalized CLIP ViT-L/14 embedding
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Certificates Table (Base L2 ERC-721 provenance)
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL UNIQUE REFERENCES public.artworks(id) ON DELETE RESTRICT,
    token_id VARCHAR(100) NOT NULL,
    contract_address VARCHAR(66) NOT NULL,
    owner_wallet VARCHAR(66) NOT NULL,
    nfc_tag_uid VARCHAR(100) UNIQUE,
    minted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Orders Table (Escrow transactions)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL CHECK (currency IN ('NGN', 'USDC')),
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (
        status IN ('paid', 'shipped', 'delivered', 'paid_out', 'disputed', 'refunded')
    ),
    tracking_number VARCHAR(100),
    courier VARCHAR(100),
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    paid_out_at TIMESTAMPTZ
);

-- 7. Disputes Table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
    opened_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    evidence_photos TEXT[] NOT NULL DEFAULT '{}',
    resolution VARCHAR(20) CHECK (resolution IN ('refund_buyer', 'pay_artist')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

-- ==============================================================================
-- Indexes for High Performance
-- ==============================================================================

-- B-tree indexes for relational foreign keys & status filtering
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON public.artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON public.artworks(status);
CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork_id ON public.artwork_images(artwork_id);
CREATE INDEX IF NOT EXISTS idx_orders_artwork_id ON public.orders(artwork_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_ref ON public.orders(payment_reference);
CREATE INDEX IF NOT EXISTS idx_certificates_nfc_tag_uid ON public.certificates(nfc_tag_uid);

-- HNSW Cosine Distance Index for pgvector 768-dim Visual Search
CREATE INDEX IF NOT EXISTS idx_artwork_images_embedding_hnsw 
ON public.artwork_images 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- 1. Users policies
CREATE POLICY "Public user profiles are viewable by everyone"
ON public.users FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- 2. Artworks policies
CREATE POLICY "Live artworks are viewable by everyone"
ON public.artworks FOR SELECT
USING (status = 'live');

CREATE POLICY "Artists can view all their own artworks (including drafts)"
ON public.artworks FOR SELECT
USING (auth.uid() = artist_id);

CREATE POLICY "Artists can insert their own artworks"
ON public.artworks FOR INSERT
WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own artworks"
ON public.artworks FOR UPDATE
USING (auth.uid() = artist_id);

-- 3. Artwork images policies
CREATE POLICY "Images of live artworks are viewable by everyone"
ON public.artwork_images FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.artworks 
        WHERE artworks.id = artwork_images.artwork_id 
        AND (artworks.status = 'live' OR artworks.artist_id = auth.uid())
    )
);

CREATE POLICY "Artists can insert images for their artworks"
ON public.artwork_images FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.artworks 
        WHERE artworks.id = artwork_images.artwork_id 
        AND artworks.artist_id = auth.uid()
    )
);

-- 4. Certificates policies
CREATE POLICY "Certificates are publicly viewable"
ON public.certificates FOR SELECT
USING (true);

-- 5. Orders policies
CREATE POLICY "Buyers can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Artists can view orders placed for their artworks"
ON public.orders FOR SELECT
USING (
    auth.uid() IN (
        SELECT artist_id FROM public.artworks WHERE artworks.id = orders.artwork_id
    )
);

-- 6. Disputes policies
CREATE POLICY "Parties involved can view disputes"
ON public.disputes FOR SELECT
USING (
    auth.uid() = opened_by OR
    auth.uid() IN (
        SELECT artist_id FROM public.artworks a
        JOIN public.orders o ON o.artwork_id = a.id
        WHERE o.id = disputes.order_id
    )
);
