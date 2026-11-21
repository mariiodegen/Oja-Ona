import { z } from "zod";

export const artworkSchema = z.object({
  title: z
    .string()
    .min(2, "Artwork title must be at least 2 characters")
    .max(255, "Title is too long"),
  medium: z
    .string()
    .min(2, "Please specify the medium (e.g. Acrylic on Canvas)")
    .max(100),
  size: z
    .string()
    .min(2, "Please specify dimensions (e.g. 120cm × 90cm)")
    .max(100),
  year: z
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(2050, "Year cannot be in the distant future"),
  description: z.string().max(2000).optional().nullable(),
  priceNgn: z
    .number()
    .positive("Price must be greater than ₦0"),
  priceUsd: z.number().positive().optional().nullable(),
  shippingLagos: z
    .number()
    .min(0, "Shipping fee cannot be negative")
    .default(0),
  shippingNigeria: z
    .number()
    .min(0, "Shipping fee cannot be negative")
    .default(0),
  shippingIntl: z
    .number()
    .min(0, "Shipping fee cannot be negative")
    .default(0),
});

export type ArtworkInput = z.infer<typeof artworkSchema>;
