"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { filterProducts } from "@emrix/shared/catalog";
import { cn, formatBDT, tintBg } from "@emrix/shared/utils";
import { useCatalog } from "@/components/catalog-context";
import { ProductVisual } from "@emrix/shared/ui/product-visual";

const POPULAR = ["Naruto", "Jujutsu Kaisen", "One Piece", "Oversized", "Solo Leveling", "Demon Slayer"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const catalog = useCatalog();
  const results = q.trim().length > 1 ? filterProducts(catalog.products, catalog.animes, { q }).slice(0, 6) : [];

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const submit = (term: string) => {
    if (!term.trim()) return;
    const lower = term.toLowerCase();
    onClose();
    router.push(lower === "oversized" ? "/shop?fit=oversized" : `/shop?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div className={cn("fixed inset-0 z-[70]", !open && "pointer-events-none")} inert={!open}>
      <div className={cn("absolute inset-0 bg-sumi/70 backdrop-blur-sm transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className={cn(
          "absolute inset-x-0 top-0 border-b-2 border-ink bg-paper transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0",
        )}
      >
        <div className="mx-auto max-w-3xl px-4 py-5 lg:py-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(q);
            }}
            className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-card px-4 shadow-panel"
          >
            <Search className="size-5 shrink-0 text-ink/50" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Naruto, 呪術廻戦, oversized…"
              className="h-14 w-full bg-transparent text-base font-medium outline-none placeholder:text-ink/35"
              aria-label="Search products"
            />
            <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-ink/5" aria-label="Close search">
              <X className="size-5" />
            </button>
          </form>

          {results.length > 0 ? (
            <div className="mt-5">
              <ul className="grid gap-2 sm:grid-cols-2">
                {results.map((p) => {
                  const anime = catalog.anime(p.anime);
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-xl border-2 border-transparent p-2 hover:border-ink hover:bg-card"
                      >
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border-2 border-ink" style={{ backgroundColor: tintBg(anime?.color ?? "#888888") }}>
                          <ProductVisual product={p} className="absolute inset-0.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{p.name}</span>
                          <span className="block truncate text-xs text-ink/55">{anime?.name}</span>
                        </span>
                        <span className="text-sm font-extrabold">{formatBDT(p.price)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <button onClick={() => submit(q)} className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline-offset-4 hover:underline">
                See all results for “{q}” <ArrowRight className="size-4" />
              </button>
            </div>
          ) : (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-ink/50">
                {q.trim().length > 1 ? "No matches — try one of these" : "Popular searches"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    onClick={() => submit(term)}
                    className="rounded-full border-2 border-ink bg-card px-3.5 py-1.5 text-sm font-semibold hover:bg-kin"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
