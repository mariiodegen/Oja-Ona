import Link from "next/link";
import { ListingForm } from "@/components/studio/ListingForm";
import { routes } from "@/utils/routes";

export const metadata = {
  title: "New Artwork Listing | Artist Studio | Ọjà Ọnà",
  description: "List a new physical artwork with Base L2 digital provenance and Paystack escrow protection.",
};

export default function NewListingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/80 px-6 py-4 flex items-center justify-between">
        <Link
          href={routes.catalog}
          className="text-xs font-semibold text-stone-600 hover:text-stone-950 flex items-center gap-1"
        >
          ← Back to Catalog
        </Link>
        <Link href={routes.home} className="font-display font-serif text-2xl text-stone-950">
          Ọjà Ọnà
        </Link>
        <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold px-2 py-0.5 rounded bg-amber-100/60">
          Artist Studio
        </span>
      </header>

      {/* Main Form Container */}
      <main className="max-w-3xl mx-auto px-6 py-10 w-full flex-1">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-stone-400 font-bold block mb-1">
            Studio Creator
          </span>
          <h1 className="font-display font-serif text-3xl sm:text-4xl text-stone-950">
            List New Physical Artwork
          </h1>
          <p className="text-stone-600 text-sm mt-2">
            Each artwork listed on Ọjà Ọnà is paired with an on-chain provenance certificate on Base L2, an anti-tamper NFC tag, and buyer escrow protection.
          </p>
        </div>

        <ListingForm />
      </main>
    </div>
  );
}
