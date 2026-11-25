// ==============================================================================
// Ọjà Ọnà — Database Types
// Note: Pure TypeScript types only; zero runtime code.
// ==============================================================================

export type UserRole = "buyer" | "artist" | "admin";

export type ArtworkStatus = "draft" | "live" | "sold";

export type OrderStatus =
  | "paid"
  | "shipped"
  | "delivered"
  | "paid_out"
  | "disputed"
  | "refunded";

export type OrderCurrency = "NGN" | "USDC";

export type DisputeResolution = "refund_buyer" | "pay_artist";

export interface UserBankDetails {
  account_number: string;
  bank_code: string;
  account_name: string;
  recipient_code?: string;
}

export interface User {
  id: string; // UUID references auth.users.id
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  bio: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
  bank_details: UserBankDetails;
  created_at: string;
  updated_at: string;
}

export interface Artwork {
  id: string;
  artist_id: string;
  title: string;
  medium: string;
  size: string;
  year: number;
  description: string | null;
  price_ngn: number;
  price_usd: number | null;
  shipping_lagos: number;
  shipping_nigeria: number;
  shipping_intl: number;
  status: ArtworkStatus;
  created_at: string;
  updated_at: string;
}

export interface ArtworkImage {
  id: string;
  artwork_id: string;
  url: string;
  embedding?: number[] | null; // 768-dimensional float vector
  is_primary: boolean;
  created_at: string;
}

export interface Certificate {
  id: string;
  artwork_id: string;
  token_id: string;
  contract_address: string;
  owner_wallet: string;
  nfc_tag_uid: string | null;
  minted_at: string;
}

export interface ShippingAddress {
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
}

export interface Order {
  id: string;
  artwork_id: string;
  buyer_id: string;
  amount: number;
  currency: OrderCurrency;
  payment_reference: string;
  status: OrderStatus;
  tracking_number: string | null;
  courier: string | null;
  shipping_address: ShippingAddress;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  paid_out_at: string | null;
}

export interface Dispute {
  id: string;
  order_id: string;
  opened_by: string;
  reason: string;
  evidence_photos: string[];
  resolution: DisputeResolution | null;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface MatchArtworkResult {
  artwork_id: string;
  image_id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  artist_avatar_url: string | null;
  medium: string;
  size: string;
  year: number;
  price_ngn: number;
  image_url: string;
  distance: number;
  similarity: number;
}

