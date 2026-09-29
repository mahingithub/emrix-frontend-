"use client";

import Link from "next/link";
import { ArrowRight, Lock, Trash2 } from "lucide-react";
import { freeDeliveryOn } from "@emrix/shared/orders";
import { walletsOn } from "@emrix/shared/settings";
import { formatBDT, tintBg } from "@emrix/shared/utils";
import { btn } from "@/components/ui/button";
import { PaymentPills } from "@/components/ui/bits";
import { useCart } from "@/components/cart/cart-context";
import { EmptyCart, FreeDeliveryProgress, StockNote } from "@/components/cart/cart-drawer";
import { useCatalog } from "@/components/catalog-context";
import { QtyStepper } from "@/components/cart/qty-stepper";
import { Breadcrumbs } from "@/components/page-header";
import { ProductVisual } from "@emrix/shared/ui/product-visual";

export function CartPageView() {
  const { items, subtotal, count, hydrated, setQty, remove } = useCart();
  const catalog = useCatalog();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Cart" }]} />
      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="font-jp text-xs font-bold tracking-[0.35em] text-shu">ショッピングカート</p>
          <h1 className="mt-1 font-display text-4xl uppercase leading-none sm:text-5xl">
            Your cart {hydrated && count > 0 && <span className="text-ink/35">({count})</span>}
          </h1>
        </div>
      </div>

      {!hydrated ? (
        <div className="mt-10 h-64 animate-pulse rounded-3xl bg-ink/5" />
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-3xl border-2 border-ink bg-card">
          <EmptyCart />
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <ul className="space-y-4 lg:col-span-8">
            {items.map((item) => {
              const anime = catalog.anime(item.product.anime);
              return (
                <li key={item.key} className="flex gap-4 rounded-2xl border-2 border-ink bg-card p-3 sm:gap-5 sm:p-4">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="halftone relative size-28 shrink-0 overflow-hidden rounded-xl border-2 border-ink sm:size-36"
                    style={{ backgroundColor: tintBg(anime?.color ?? "#888888") }}
                  >
                    <ProductVisual product={item.product} color={item.color} className="absolute inset-1.5" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/50">{anime?.name}</p>
                        <Link href={`/product/${item.product.slug}`} className="font-bold leading-snug hover:text-shu sm:text-lg">
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-sm text-ink/60">
                          {item.color.name} · Size {item.size} · {formatBDT(item.product.price)} each
                        </p>
                        <StockNote item={item} />
                      </div>
                      <button
                        onClick={() => remove(item.key)}
                        className="rounded-lg p-2 text-ink/40 hover:bg-shu/10 hover:text-shu"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QtyStepper size="sm" value={item.qty} max={item.available} onChange={(q) => setQty(item.key, q)} />
                      <span className="text-lg font-extrabold tabular-nums">{formatBDT(item.lineTotal)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
            <li>
              <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4">
                ← Continue shopping
              </Link>
            </li>
          </ul>

          <aside className="lg:col-span-4">
            <div className="rounded-3xl border-2 border-ink bg-card p-5 shadow-panel sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl uppercase">Order summary</h2>
              <div className="mt-4">
                <FreeDeliveryProgress subtotal={subtotal} />
              </div>
              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink/60">Subtotal</dt>
                  <dd className="font-bold tabular-nums">{formatBDT(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink/60">Delivery</dt>
                  <dd className="text-right font-semibold">
                    {freeDeliveryOn(subtotal, catalog.settings.delivery) ? (
                      <span className="text-shu">FREE</span>
                    ) : (
                      <span className="text-ink/60">
                        {formatBDT(catalog.settings.delivery.insideDhaka)} / {formatBDT(catalog.settings.delivery.outsideDhaka)}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t-2 border-dashed border-ink/20 pt-4">
                <span className="font-bold uppercase tracking-wide">Estimated total</span>
                <span className="text-2xl font-extrabold tabular-nums">{formatBDT(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink/50">Delivery charge is added at checkout based on your district.</p>
              <Link href="/checkout" className={btn({ size: "lg", className: "mt-5 w-full" })}>
                Checkout <ArrowRight className="size-5" />
              </Link>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink/55">
                <Lock className="size-3.5" /> Secure checkout · COD available
              </p>
              <PaymentPills className="mt-3 justify-center" wallets={walletsOn(catalog.settings)} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
