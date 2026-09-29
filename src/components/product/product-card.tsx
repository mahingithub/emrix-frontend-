import type { CSSProperties } from "react";
import Link from "next/link";
import { totalStock } from "@emrix/shared/catalog";
import type { Anime, Product } from "@emrix/shared/types";
import { sceneFor } from "@emrix/shared/scenes";
import { cn, formatBDT, tintBg } from "@emrix/shared/utils";
import { Badge, DiscountBadge, Stars } from "@/components/ui/bits";
import { CardFx } from "./card-fx";
import { ProductVisual, productPhotos } from "@emrix/shared/ui/product-visual";
import { QuickAdd } from "./quick-add";

export function ProductCard({ product, anime, className }: { product: Product; anime: Anime; className?: string }) {
  const href = `/product/${product.slug}`;
  const soldOut = totalStock(product) === 0;
  const hasHoverPhoto = productPhotos(product).length > 1;

  return (
    <article
      data-cardfx
      data-fx={sceneFor(anime)}
      className={cn("group relative", className)}
      style={{ "--fx": anime.color } as CSSProperties}
    >
      <div className="relative">
        <span aria-hidden className="fx-aura rounded-2xl transition-[translate,opacity] duration-200 group-hover:-translate-y-1" />
        <Link
          href={href}
          className="fx-frame relative block aspect-[4/5] overflow-hidden rounded-2xl border-2 border-ink transition-[transform,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:shadow-panel"
          style={{ backgroundColor: tintBg(anime.color) }}
          aria-label={product.name}
        >
          <span className="halftone absolute inset-0" />
          <span
            aria-hidden
            className="pointer-events-none absolute -left-3 -top-8 select-none font-display text-[9rem] leading-none text-ink/[0.06]"
          >
            {anime.kanji}
          </span>
          <span className="writing-vertical absolute right-2.5 top-3 font-jp text-[10px] font-bold tracking-[0.25em] text-ink/45">
            {anime.jp}
          </span>

          <ProductVisual
            product={product}
            className="absolute inset-[8%] drop-shadow-[0_12px_14px_rgb(0_0_0/0.18)] transition-all duration-300 group-hover:scale-[1.03] md:group-hover:opacity-0"
            photoClassName={cn("transition-all duration-300 group-hover:scale-[1.03]", hasHoverPhoto && "md:group-hover:opacity-0")}
          />
          {hasHoverPhoto && (
            <ProductVisual
              product={product}
              view="back"
              className="absolute inset-[8%] hidden opacity-0 drop-shadow-[0_12px_14px_rgb(0_0_0/0.18)] transition-all duration-300 group-hover:scale-[1.03] group-hover:opacity-100 md:block"
              photoClassName="hidden opacity-0 transition-all duration-300 group-hover:scale-[1.03] group-hover:opacity-100 md:block"
            />
          )}
          <CardFx scene={sceneFor(anime)} />
          {soldOut && (
            <span className="absolute inset-x-0 bottom-4 mx-auto w-fit -rotate-3 rounded-lg border-2 border-ink bg-card px-3 py-1 font-display text-sm uppercase shadow-panel-sm">
              Sold out
            </span>
          )}

          <span className="absolute left-2 top-2 flex flex-wrap gap-1">
            {product.badges.map((b) => (
              <Badge key={b} type={b} compact />
            ))}
            <DiscountBadge price={product.price} compareAt={product.compareAt} compact />
          </span>
        </Link>
        {!soldOut && <QuickAdd product={product} />}
      </div>

      <div className="mt-3 px-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-ink/50">
              {anime.name}
              <span className="hidden sm:inline"> · {product.fit === "oversized" ? "Oversized" : "Regular"}</span>
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug sm:text-[15px]">
              <Link href={href} className="hover:text-shu">
                {product.name}
              </Link>
            </h3>
          </div>
          <div className="shrink-0 text-right leading-tight">
            <p className="font-extrabold tabular-nums">{formatBDT(product.price)}</p>
            {product.compareAt && (
              <s className="text-[11px] tabular-nums text-ink/40">{formatBDT(product.compareAt)}</s>
            )}
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          {product.reviews > 0 ? (
            <span className="flex items-center gap-1 text-[11px] text-ink/55">
              <Stars rating={product.rating} className="[&_svg]:size-3" />
              <span className="tabular-nums">({product.reviews})</span>
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1" aria-label={`${product.colors.length} colours`}>
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="size-3 rounded-full border border-ink/40"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </span>
        </div>
      </div>
    </article>
  );
}
