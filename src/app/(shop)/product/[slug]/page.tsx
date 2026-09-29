import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { relatedTo, totalStock } from "@emrix/shared/catalog";
import { SectionHeading } from "@/components/ui/bits";
import { Breadcrumbs } from "@/components/page-header";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductView } from "@/components/product/product-view";
import { apiUrl, getStorefrontCatalog, tryOnEnabled } from "@/lib/backend";

export async function generateStaticParams() {
  if (!apiUrl()) return [];
  return (await getStorefrontCatalog()).products.map((p) => ({ slug: p.slug }));
}

async function load(slug: string) {
  const { animes, products } = await getStorefrontCatalog();
  const product = products.find((p) => p.slug === slug);
  const anime = product && animes.find((a) => a.slug === product.anime);
  return { product, anime, animes, products };
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  if (!apiUrl()) return {};
  const { product, anime } = await load((await params).slug);
  if (!product) return {};
  return {
    title: `${product.name} — ${anime?.name} T-shirt`,
    description: `${product.description} ৳${product.price}, Cash on Delivery all over Bangladesh.`,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { product, anime, animes, products } = await load((await params).slug);
  if (!product || !anime) notFound();
  const related = relatedTo(products, product, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: "EMRIX" },
    ...(product.reviews > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews },
    }),
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: product.price,
      availability: `https://schema.org/${totalStock(product) > 0 ? "InStock" : "OutOfStock"}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-4 lg:px-8 lg:pb-20 lg:pt-6">
        {/* Phones open straight on the photo; the anime chip under it links back to the collection. */}
        <div className="mb-6 hidden lg:block">
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: `/anime/${anime.slug}`, label: anime.name },
              { label: product.name },
            ]}
          />
        </div>
        <ProductView product={product} anime={anime} tryOn={await tryOnEnabled()} />
      </div>

      <section className="border-t-2 border-ink bg-paper-2/60">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
          <SectionHeading jp="おすすめ" title="You may also like" href={`/anime/${anime.slug}`} linkLabel={`More ${anime.name}`} />
          <ProductGrid products={related} animes={animes} className="mt-10" />
        </div>
      </section>
    </>
  );
}
