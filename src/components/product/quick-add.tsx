"use client";

import { Plus } from "lucide-react";
import { SIZES, stockOf } from "@emrix/shared/catalog";
import type { Product } from "@emrix/shared/types";
import { useCart } from "@/components/cart/cart-context";
import { flyToCart } from "@/components/ui/impact";
import { productPhotos } from "@emrix/shared/ui/product-visual";

export function QuickAdd({ product }: { product: Product }) {
  const { add } = useCart();
  // Quick add uses the first colour that has the size in stock.
  const colorFor = (size: (typeof SIZES)[number]) => product.colors.find((c) => stockOf(product, c.name, size) > 0);
  if (!SIZES.some(colorFor)) return null;

  return (
    <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 hidden translate-y-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 md:block">
      <div className="rounded-xl border-2 border-ink bg-card/95 p-2 shadow-panel-sm backdrop-blur">
        <p className="mb-1.5 flex items-center gap-1 px-0.5 text-[10px] font-extrabold uppercase tracking-widest text-ink/60">
          <Plus className="size-3" /> Quick add
        </p>
        <div className="grid grid-cols-5 gap-1">
          {SIZES.map((size) => {
            const color = colorFor(size);
            return (
              <button
                key={size}
                type="button"
                disabled={!color}
                onClick={(e) => color && flyToCart(e.currentTarget, productPhotos(product, color.name)[0]?.url).then(() => add(product, size, color))}
                className="h-8 rounded-md border-2 border-ink/15 text-xs font-bold transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:text-ink/25 disabled:line-through disabled:hover:border-ink/15 disabled:hover:bg-transparent"
                aria-label={color ? `Add ${product.name} size ${size} in ${color.name} to cart` : `Size ${size} sold out`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
