"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { cn, formatBDT, tintBg } from "@emrix/shared/utils";
import { btn } from "@/components/ui/button";
import { useCatalog } from "@/components/catalog-context";
import { ProductVisual } from "@emrix/shared/ui/product-visual";
import { useCart, type CartItem } from "./cart-context";
import { QtyStepper } from "./qty-stepper";

export function CartDrawer() {
  const { items, count, subtotal, isOpen, close } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <div className={cn("fixed inset-0 z-[60]", !isOpen && "pointer-events-none")} inert={!isOpen}>
      <div
        className={cn("absolute inset-0 bg-sumi/70 backdrop-blur-[2px] transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")}
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l-2 border-ink bg-paper shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b-2 border-ink px-5 py-4">
          <div>
            <p className="font-jp text-[10px] font-bold tracking-[0.3em] text-shu">カート</p>
            <h2 className="font-display text-2xl uppercase leading-none">
              Your cart <span className="text-ink/40">({count})</span>
            </h2>
          </div>
          <button onClick={close} className="grid size-10 place-items-center rounded-lg border-2 border-ink bg-card hover:bg-kin" aria-label="Close cart">
            <X className="size-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <EmptyCart onNavigate={close} />
        ) : (
          <>
            <div className="border-b-2 border-ink px-5 py-3">
              <FreeDeliveryProgress subtotal={subtotal} />
            </div>
            <ul className="flex-1 divide-y-2 divide-ink/10 overflow-y-auto px-5">
              {items.map((item) => (
                <CartRow key={item.key} item={item} onNavigate={close} />
              ))}
            </ul>
            <footer className="space-y-3 border-t-2 border-ink bg-card px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-ink/60">Subtotal</span>
                <span className="text-2xl font-extrabold tabular-nums">{formatBDT(subtotal)}</span>
              </div>
              <p className="text-xs text-ink/55">Delivery charge calculated at checkout. Cash on Delivery available.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={close} className={btn({ variant: "outline", className: "w-full" })}>
                  View cart
                </Link>
                <Link href="/checkout" onClick={close} className={btn({ className: "w-full" })}>
                  Checkout
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function CartRow({ item, onNavigate }: { item: CartItem; onNavigate: () => void }) {
  const { setQty, remove } = useCart();
  const anime = useCatalog().anime(item.product.anime);
  return (
    <li className="flex gap-4 py-4">
      <Link
        href={`/product/${item.product.slug}`}
        onClick={onNavigate}
        className="halftone relative size-24 shrink-0 overflow-hidden rounded-xl border-2 border-ink"
        style={{ backgroundColor: tintBg(anime?.color ?? "#888888") }}
      >
        <ProductVisual product={item.product} color={item.color} className="absolute inset-1" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/50">{anime?.name}</p>
            <Link href={`/product/${item.product.slug}`} onClick={onNavigate} className="line-clamp-2 text-sm font-bold leading-snug hover:text-shu">
              {item.product.name}
            </Link>
            <p className="mt-0.5 text-xs text-ink/60">
              {item.color.name} · Size {item.size}
            </p>
            <StockNote item={item} />
          </div>
          <button onClick={() => remove(item.key)} className="rounded-md p-1.5 text-ink/40 hover:bg-shu/10 hover:text-shu" aria-label={`Remove ${item.product.name}`}>
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <QtyStepper size="sm" value={item.qty} max={item.available} onChange={(q) => setQty(item.key, q)} />
          <span className="font-extrabold tabular-nums">{formatBDT(item.lineTotal)}</span>
        </div>
      </div>
    </li>
  );
}

export function StockNote({ item }: { item: CartItem }) {
  if (item.available === 0) return <p className="mt-0.5 text-xs font-bold text-shu">Sold out: please remove</p>;
  if (item.qty > item.available) return <p className="mt-0.5 text-xs font-bold text-shu">Only {item.available} left: reduce quantity</p>;
  if (item.available <= item.product.lowStockAt) return <p className="mt-0.5 text-xs font-semibold text-amber-700">Only {item.available} left</p>;
  return null;
}

export function FreeDeliveryProgress({ subtotal }: { subtotal: number }) {
  const { freeOver } = useCatalog().settings.delivery;
  if (freeOver <= 0) return null;
  const remaining = freeOver - subtotal;
  const pct = Math.min(100, (subtotal / freeOver) * 100);
  return (
    <div>
      <p className="text-xs font-semibold">
        {remaining > 0 ? (
          <>
            Add <span className="font-extrabold text-shu">{formatBDT(remaining)}</span> more for{" "}
            <span className="font-extrabold">FREE delivery</span> 🚚
          </>
        ) : (
          <>
            <span className="font-extrabold text-shu">Sugoi!</span> You&apos;ve unlocked FREE delivery 🎉
          </>
        )}
      </p>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full border-2 border-ink bg-card">
        <div className="h-full bg-shu transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <div className="relative">
        <span className="absolute -inset-6 rounded-full speedlines" />
        <span className="relative grid size-24 place-items-center rounded-full border-2 border-ink bg-card shadow-panel">
          <ShoppingBag className="size-10" strokeWidth={1.5} />
        </span>
      </div>
      <p className="mt-6 font-jp text-xs font-bold tracking-[0.3em] text-shu">空っぽ</p>
      <h3 className="mt-1 font-display text-2xl uppercase">Your cart is empty</h3>
      <p className="mt-2 max-w-xs text-sm text-ink/60">Emptier than a filler episode. Let&apos;s fix that.</p>
      <Link href="/shop" onClick={onNavigate} className={btn({ className: "mt-6" })}>
        Start shopping
      </Link>
    </div>
  );
}
