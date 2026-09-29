import Link from "next/link";
import { filterProducts } from "@emrix/shared/catalog";
import { liveDrop } from "@emrix/shared/settings";
import { SectionHeading } from "@/components/ui/bits";
import { btn } from "@/components/ui/button";
import { AnimeTile } from "@emrix/shared/ui/anime-tile";
import { Hero } from "@/components/home/hero";
import { PowerUp } from "@/components/home/power-up";
import { FitPicker, LimitedDrop, MarqueeBands, Perks, ProductRail, RequestCta } from "@/components/home/sections";
import { ProductGrid } from "@/components/product/product-grid";
import { getSettings, getStorefrontCatalog } from "@/lib/backend";

// Admin changes refresh the page instantly; this also retires an ended limited drop within the hour.
export const revalidate = 3600;

export default async function HomePage() {
  const [{ animes, products }, settings] = await Promise.all([getStorefrontCatalog(), getSettings()]);
  if (!products.length) return <FirstDropSoon />;

  const newDrops = filterProducts(products, animes, { sort: "new" }).slice(0, 8);
  const bestSellers = filterProducts(products, animes, { sort: "popular" }).slice(0, 8);
  const drop = liveDrop(settings, products);

  return (
    <>
      <Hero products={products} animes={animes} />
      <MarqueeBands animes={animes} />

      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8 lg:pb-24">
        <SectionHeading index="01" jp="作品から探す" title="Shop by anime" href="/anime" linkLabel="All anime" />
        <div className="sm-stagger mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {animes.slice(0, 8).map((a, i) => (
            <AnimeTile key={a.slug} anime={a} index={i + 1} count={products.filter((p) => p.anime === a.slug).length} />
          ))}
        </div>
      </section>

      <PowerUp animes={animes.map((a) => ({ slug: a.slug, name: a.name }))} />

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <SectionHeading index="02" jp="新作" title="New drops" href="/shop?sort=new" />
        <ProductGrid products={newDrops} animes={animes} className="mt-10" />
      </section>

      {drop && <LimitedDrop drop={drop} anime={animes.find((a) => a.slug === drop.product.anime)} />}

      {products.length > 4 && (
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <SectionHeading index="03" jp="人気商品" title="Best sellers" href="/shop?sort=popular" />
          </div>
          <div className="mt-8">
            <ProductRail products={bestSellers} animes={animes} />
          </div>
        </section>
      )}

      <Perks />
      <FitPicker products={products} />
      <RequestCta social={settings.social} />
    </>
  );
}

/** Shown until the first product is published, so a fresh deployment never looks broken. */
function FirstDropSoon() {
  return (
    <section className="relative overflow-hidden">
      <div className="speedlines absolute inset-0 [--line-color:rgb(255_255_255/0.035)]" />
      <div className="relative mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
        <p className="font-jp text-sm font-bold tracking-[0.4em] text-shu">近日公開</p>
        <h1 className="mt-4 font-display text-4xl uppercase leading-none sm:text-6xl">
          The first drop
          <span className="mt-2 block text-shu">is loading</span>
        </h1>
        <p className="mt-6 max-w-md leading-relaxed text-ink/65">
          Anime tees designed in Dhaka, with Cash on Delivery across all 64 districts. Our first designs land here very soon.
        </p>
        <Link href="/help" className={btn({ variant: "outline", size: "lg", className: "mt-8" })}>
          Delivery & payment info
        </Link>
      </div>
    </section>
  );
}
