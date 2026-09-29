import Link from "next/link";
import type { ReactNode } from "react";
import { SearchX, X } from "lucide-react";
import { filterProducts, SIZES } from "@emrix/shared/catalog";
import type { Anime, Product } from "@emrix/shared/types";
import { cn } from "@emrix/shared/utils";
import { btn } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";
import { hrefWith, type ListingParams } from "./href";
import { SortSelect } from "./sort-select";

const TAGS = [
  { value: "new", label: "New" },
  { value: "bestseller", label: "Bestseller" },
  { value: "limited", label: "Limited" },
];

const FITS = [
  { value: "regular", label: "Regular" },
  { value: "oversized", label: "Oversized" },
];

export function ProductListing({
  base,
  params,
  lockedAnime,
  animes,
  products: all,
  title,
}: {
  base: string;
  params: ListingParams;
  animes: Anime[];
  products: Product[];
  title: string;
  /** Set on collection pages, where the anime filter is implied by the URL. */
  lockedAnime?: string;
}) {
  const products = filterProducts(all, animes, { ...params, anime: lockedAnime ?? params.anime });
  const filtered = (["fit", "size", "tag", "q", ...(lockedAnime ? [] : ["anime"])] as (keyof ListingParams)[]).some(
    (k) => params[k],
  );
  const locked = lockedAnime ? animes.find((a) => a.slug === lockedAnime) : undefined;

  // Everything above the grid stays within a few slim rows so the first products show without scrolling.
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 lg:px-8 lg:pb-16 lg:pt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {locked && (
            <span
              className="grid size-8 shrink-0 place-items-center rounded-lg border-2 border-ink font-jp text-sm font-black"
              style={{ backgroundColor: locked.color, color: locked.onColor }}
              aria-hidden
            >
              {locked.kanji}
            </span>
          )}
          <h1 className="truncate font-display text-xl uppercase leading-none sm:text-2xl">{title}</h1>
          <span className="hidden shrink-0 text-xs font-bold tabular-nums text-ink/50 sm:inline">
            {products.length} {products.length === 1 ? "design" : "designs"}
          </span>
        </div>
        <SortSelect base={base} params={params} />
      </div>

      {!lockedAnime && (
        <div className="no-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
          <Pill href={hrefWith(base, params, { anime: undefined })} active={!params.anime}>
            All anime
          </Pill>
          {animes.map((a) => (
            <Pill
              key={a.slug}
              href={hrefWith(base, params, { anime: params.anime === a.slug ? undefined : a.slug })}
              active={params.anime === a.slug}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: a.color }} />
              {a.name}
            </Pill>
          ))}
        </div>
      )}

      <div className="no-scrollbar -mx-4 mt-2 flex items-center gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
        {params.q && (
          <Pill href={hrefWith(base, params, { q: undefined })} active>
            “{params.q}” <X className="size-3" />
          </Pill>
        )}
        {FITS.map((f) => (
          <Pill key={f.value} href={hrefWith(base, params, { fit: params.fit === f.value ? undefined : f.value })} active={params.fit === f.value}>
            {f.label}
          </Pill>
        ))}
        <Divider />
        {SIZES.map((s) => (
          <Pill key={s} href={hrefWith(base, params, { size: params.size === s ? undefined : s })} active={params.size === s} square>
            {s}
          </Pill>
        ))}
        <Divider />
        {TAGS.map((t) => (
          <Pill key={t.value} href={hrefWith(base, params, { tag: params.tag === t.value ? undefined : t.value })} active={params.tag === t.value}>
            {t.label}
          </Pill>
        ))}
        {filtered && (
          <Link href={base} scroll={false} className="shrink-0 px-2 text-xs font-bold text-shu underline underline-offset-2">
            Clear
          </Link>
        )}
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} animes={animes} className="mt-5" />
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-3xl border-2 border-dashed border-ink/30 px-6 py-20 text-center">
          <SearchX className="size-10 text-ink/40" />
          <p className="mt-4 font-jp text-xs font-bold tracking-[0.3em] text-shu">見つかりません</p>
          <h2 className="mt-1 font-display text-2xl uppercase">No designs found</h2>
          <p className="mt-2 max-w-sm text-sm text-ink/60">
            Try a different filter, or request this design and we might drop it next.
          </p>
          <Link href={base} className={btn({ className: "mt-6" })}>
            Clear filters
          </Link>
        </div>
      )}
    </div>
  );
}

function Pill({ href, active, square, children }: { href: string; active: boolean; square?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border-2 text-xs font-bold transition-[transform,background-color,border-color] active:scale-95",
        square ? "min-w-8 px-1.5" : "px-3",
        active ? "border-ink bg-ink text-paper" : "border-ink/15 bg-card hover:border-ink",
      )}
    >
      {children}
    </Link>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-ink/15" />;
}
