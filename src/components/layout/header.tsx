"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";
import { ChevronDown, Menu, PackageSearch, Search, ShoppingBag } from "lucide-react";
import { liveDrop } from "@emrix/shared/settings";
import { cn } from "@emrix/shared/utils";
import { Logo } from "@emrix/shared/ui/logo";
import { useCart } from "@/components/cart/cart-context";
import { useCatalog } from "@/components/catalog-context";
import { MobileMenu } from "./mobile-menu";
import { SearchOverlay } from "./search-overlay";

export const NAV = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?tag=new", label: "New Drops" },
  { href: "/shop?fit=oversized", label: "Oversized" },
  { href: "/shop?sort=popular", label: "Best Sellers" },
];

export function Header() {
  const { count, hydrated, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/90 backdrop-blur-md">
        {/* Power meter: fills as you scroll the page */}
        <span
          aria-hidden
          className="scroll-meter pointer-events-none absolute inset-x-0 -bottom-[2px] h-[3px] origin-left bg-[linear-gradient(90deg,var(--color-shu),var(--color-kin))] shadow-[0_0_10px_var(--color-shu)]"
        />
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 lg:h-[72px] lg:gap-6 lg:px-8">
          <button
            className="-ml-2 grid size-10 place-items-center rounded-lg hover:bg-ink/5 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </button>

          <Link href="/" className="mr-auto lg:mr-4" aria-label="EMRIX home">
            <Logo />
          </Link>

          <nav className="hidden h-full items-center gap-1 lg:flex" aria-label="Main">
            <Link href={NAV[0].href} className={navLink}>
              {NAV[0].label}
            </Link>

            <div className="group flex h-full items-center">
              <button className={cn(navLink, "gap-1")} aria-haspopup="true">
                Anime <ChevronDown className="size-4 transition-transform group-hover:rotate-180" />
              </button>
              <AnimeMegaMenu />
            </div>

            {NAV.slice(1).map((item) => (
              <Link key={item.href} href={item.href} className={navLink}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center rounded-lg hover:bg-ink/5 sm:flex sm:w-auto sm:items-center sm:gap-2 sm:rounded-xl sm:border-2 sm:border-ink/15 sm:bg-card sm:px-3 sm:hover:border-ink"
              aria-label="Search"
            >
              <Search className="size-5" />
              <span className="hidden pr-6 text-sm text-ink/50 xl:inline">Search anime, tees…</span>
            </button>
            <Link href="/track" className="hidden size-10 place-items-center rounded-lg hover:bg-ink/5 sm:grid" aria-label="Track order" title="Track order">
              <PackageSearch className="size-5" />
            </Link>
            <button
              onClick={open}
              data-cart-target
              className="relative grid size-10 place-items-center rounded-xl border-2 border-ink bg-kin shadow-panel-sm transition-transform hover:-translate-y-px active:translate-y-px active:shadow-none"
              aria-label={`Open cart${hydrated ? `, ${count} items` : ""}`}
            >
              <ShoppingBag className="size-5" />
              {hydrated && count > 0 && (
                <span
                  key={count}
                  className="absolute -right-2 -top-2 grid h-5 min-w-5 animate-pop place-items-center rounded-full border-2 border-ink bg-shu px-1 text-[10px] font-extrabold text-white"
                >
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}

const navLink =
  "relative inline-flex h-10 items-center rounded-lg px-3 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper";

function AnimeMegaMenu() {
  const { animes, products } = useCatalog();
  const countByAnime = (slug: string) => products.filter((p) => p.anime === slug).length;
  return (
    <div className="invisible absolute inset-x-0 top-full -mt-[2px] translate-y-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="border-y-2 border-ink bg-paper shadow-[0_24px_40px_-20px_rgb(0_0_0/0.35)]">
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-8 py-8">
          <div className="col-span-9">
            <p className="font-jp text-xs font-bold tracking-[0.3em] text-shu">作品から探す · Shop by anime</p>
            <ul className="mt-4 grid grid-cols-4 gap-2">
              {animes.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/anime/${a.slug}`}
                    className="group/item flex items-center gap-3 rounded-xl border-2 border-transparent p-2 transition-colors hover:border-ink hover:bg-card"
                  >
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-lg border-2 border-ink font-display text-lg transition-transform group-hover/item:-rotate-6"
                      style={{ backgroundColor: a.color, color: a.onColor }}
                    >
                      {a.kanji}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{a.name}</span>
                      <span className="block truncate font-jp text-[10px] text-ink/50">
                        {a.jp} · {countByAnime(a.slug)} designs
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <MenuPromo />
        </div>
      </div>
    </div>
  );
}

// Shop pages are cached, so their HTML can outlive a drop. The end time is checked against the
// browser's clock (to the minute); the server's HTML and hydration show the drop while it's set.
function subscribeMinutes(tick: () => void) {
  const id = setInterval(tick, 60_000);
  return () => clearInterval(id);
}
const thisMinute = () => Math.floor(Date.now() / 60_000) * 60_000;

/** The limited drop from Admin → Settings while it runs; otherwise the newest designs. */
function MenuPromo() {
  const { settings, products } = useCatalog();
  const now = useSyncExternalStore(subscribeMinutes, thisMinute, () => 0);
  const drop = liveDrop(settings, products, now);
  const promo = drop
    ? {
        href: `/product/${drop.product.slug}`,
        tag: "Limited · 限定",
        jp: drop.product.jp,
        title: drop.product.name,
        cta: `Only ${drop.total} ${drop.total === 1 ? "piece" : "pieces"}`,
      }
    : { href: "/shop?sort=new", tag: "Just in · 新着", jp: "新作", title: "New drops", cta: "Shop the latest" };

  return (
    <Link
      href={promo.href}
      className="col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-ink bg-shu p-5 text-white speedlines [--line-color:rgb(255_255_255/0.08)]"
    >
      <span className="self-start rounded-md bg-sumi px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-washi">
        {promo.tag}
      </span>
      <span>
        {promo.jp && <span className="block font-jp text-sm font-bold tracking-[0.3em] text-white/70">{promo.jp}</span>}
        {/* Smaller below xl, where the column is narrowest, so long words like "Oversized" fit. */}
        <span className="mt-1 block font-display text-xl uppercase leading-none wrap-break-word xl:text-2xl">{promo.title}</span>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-kin">
          {promo.cta} →
        </span>
      </span>
    </Link>
  );
}
