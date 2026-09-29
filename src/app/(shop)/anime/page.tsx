import type { Metadata } from "next";
import { AnimeTile } from "@emrix/shared/ui/anime-tile";
import { getStorefrontCatalog } from "@/lib/backend";

export const metadata: Metadata = {
  title: "Shop by anime",
  description: "Find tees from your favourite anime series.",
};

export default async function AnimeIndexPage() {
  const { animes, products } = await getStorefrontCatalog();
  return (
    <>
      <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-4 pt-4 lg:px-8 lg:pt-6">
        <h1 className="font-display text-xl uppercase leading-none sm:text-2xl">Shop by anime</h1>
        <span className="text-xs font-bold tabular-nums text-ink/50">{animes.length} series</span>
      </div>
      <div className="sm-stagger mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 pb-12 pt-4 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:px-8 lg:pb-16 lg:pt-5">
        {animes.map((a, i) => (
          <AnimeTile key={a.slug} anime={a} index={i + 1} count={products.filter((p) => p.anime === a.slug).length} />
        ))}
      </div>
    </>
  );
}
