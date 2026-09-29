import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseListingParams } from "@/components/listing/href";
import { ProductListing } from "@/components/listing/product-listing";
import { apiUrl, getStorefrontCatalog } from "@/lib/backend";

export async function generateStaticParams() {
  if (!apiUrl()) return [];
  return (await getStorefrontCatalog()).animes.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/anime/[slug]">): Promise<Metadata> {
  if (!apiUrl()) return {};
  const { slug } = await params;
  const anime = (await getStorefrontCatalog()).animes.find((a) => a.slug === slug);
  if (!anime) return {};
  return {
    title: `${anime.name} T-shirts`,
    description: `${anime.blurb} Shop ${anime.name} (${anime.jp}) anime tees with Cash on Delivery across Bangladesh.`,
  };
}

export default async function AnimePage({ params, searchParams }: PageProps<"/anime/[slug]">) {
  const { slug } = await params;
  const { animes, products } = await getStorefrontCatalog();
  const anime = animes.find((a) => a.slug === slug);
  if (!anime) notFound();

  const listing = parseListingParams(await searchParams);
  return (
    <ProductListing
      base={`/anime/${anime.slug}`}
      title={anime.name}
      params={listing}
      lockedAnime={anime.slug}
      animes={animes}
      products={products}
    />
  );
}
