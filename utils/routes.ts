// ==============================================================================
// Ọjà Ọnà — Route Paths Registry
// Note: Hardcoded path literals are prohibited. All routing imports this map.
// ==============================================================================

export const routes = {
  home: "/",
  catalog: "/artworks",
  artwork: (id: string) => `/artworks/${id}`,
  artist: (id: string) => `/artists/${id}`,
  scan: "/scan",
  verify: (uid?: string) => (uid ? `/verify?uid=${encodeURIComponent(uid)}` : "/verify"),
  checkout: (artworkId: string) => `/checkout/${artworkId}`,
  orders: {
    list: "/orders",
    detail: (id: string) => `/orders/${id}`,
    confirmation: (id: string) => `/orders/${id}/confirmation`,
  },
  artistStudio: {
    dashboard: "/studio",
    listings: "/studio/listings",
    createListing: "/studio/listings/new",
    orders: "/studio/orders",
    payoutSettings: "/studio/payouts",
  },
  admin: {
    curation: "/admin/curation",
    disputes: "/admin/disputes",
    payouts: "/admin/payouts",
  },
  auth: {
    login: "/login",
    signup: "/signup",
    logout: "/logout",
  },
} as const;
