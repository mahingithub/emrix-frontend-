import type { Metadata } from "next";
import { parseListingParams } from "@/components/listing/href";
import { ProductListing } from "@/components/listing/product-listing";
import { getStorefrontCatalog } from "@/lib/backend";

export const metadata: Metadata = {
  title: "Shop all anime T-shirts",
  description: "Browse every EMRIX anime tee: Naruto, One Piece, Jujutsu Kaisen, Demon Slayer and more.",
};

const TITLES: Record<string, string> = {
  new: "New drops",
  bestseller: "Bestsellers",
  limited: "Limited edition",
  oversized: "Oversized fit",
  popular: "Best sellers",
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = parseListingParams(await searchParams);
  const { animes, products } = await getStorefrontCatalog();
  const title =
    (params.tag && TITLES[params.tag]) ||
    (params.fit === "oversized" && TITLES.oversized) ||
    (params.sort === "popular" && TITLES.popular) ||
    animes.find((a) => a.slug === params.anime)?.name ||
    (params.q ? `Results for “${params.q}”` : "All T-shirts");

  return <ProductListing base="/shop" title={title} params={params} animes={animes} products={products} />;
}
