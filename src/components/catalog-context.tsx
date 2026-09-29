"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { StoreSettings } from "@emrix/shared/settings";
import type { Anime, Product } from "@emrix/shared/types";

interface Catalog {
  animes: Anime[];
  products: Product[];
  settings: StoreSettings;
  product: (id: string) => Product | undefined;
  anime: (slug: string) => Anime | undefined;
}

const CatalogContext = createContext<Catalog | null>(null);

/** Live storefront catalogue and store settings (from the database) for client components. */
export function CatalogProvider({
  animes,
  products,
  settings,
  children,
}: {
  animes: Anime[];
  products: Product[];
  settings: StoreSettings;
  children: ReactNode;
}) {
  const value = useMemo<Catalog>(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    const bySlug = new Map(animes.map((a) => [a.slug, a]));
    return { animes, products, settings, product: (id) => byId.get(id), anime: (slug) => bySlug.get(slug) };
  }, [animes, products, settings]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
