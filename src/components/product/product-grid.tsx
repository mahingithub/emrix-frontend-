import type { Anime, Product } from "@emrix/shared/types";
import { cn } from "@emrix/shared/utils";
import { ProductCard } from "./product-card";

export function ProductGrid({ products, animes, className }: { products: Product[]; animes: Anime[]; className?: string }) {
  const bySlug = new Map(animes.map((a) => [a.slug, a]));
  return (
    <div className={cn("sm-stagger grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4", className)}>
      {products.map((p) => {
        const anime = bySlug.get(p.anime);
        return anime ? <ProductCard key={p.id} product={p} anime={anime} /> : null;
      })}
    </div>
  );
}
