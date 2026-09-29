import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SIZES } from "@emrix/shared/catalog";
import { productPhotos } from "@emrix/shared/ui/product-visual";
import { TryOnPage } from "@/components/try-on/try-on-page";
import { btn } from "@/components/ui/button";
import { getStorefrontCatalog, tryOnEnabled } from "@/lib/backend";

// Product page → "Try on". The colour and size picked there come along as ?color= and ?size=.

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function load(slug: string) {
  return (await getStorefrontCatalog()).products.find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]/try-on">): Promise<Metadata> {
  const product = await load((await params).slug);
  return product ? { title: `Try on ${product.name}`, robots: { index: false } } : {};
}

export default async function TryOn({ params, searchParams }: PageProps<"/product/[slug]/try-on">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = await load(slug);
  if (!product) notFound();
  const color = product.colors.find((c) => c.name === first(query.color)) ?? product.colors[0];
  const size = SIZES.find((s) => s === first(query.size)) ?? null;

  if (!(await tryOnEnabled()) || productPhotos(product, color.name).length === 0) {
    return (
      <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <p className="font-jp text-sm font-black tracking-[0.5em] text-shu">準備中</p>
        <h1 className="mt-2 font-display text-3xl uppercase">Try-on is coming soon</h1>
        <p className="mt-3 text-ink/65">You can&apos;t try this tee on yet, but the photos and size guide will help you pick.</p>
        <Link href={`/product/${product.slug}`} className={btn({ className: "mt-8" })}>
          Back to {product.name}
        </Link>
      </section>
    );
  }

  return <TryOnPage product={product} color={color} initialSize={size} />;
}
