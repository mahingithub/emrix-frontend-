import type { ReactNode } from "react";
import { liveDrop } from "@emrix/shared/settings";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CatalogProvider } from "@/components/catalog-context";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ImpactLayer } from "@/components/ui/impact";
import { getSettings, getStorefrontCatalog } from "@/lib/backend";

export default async function ShopLayout({ children }: { children: ReactNode }) {
  const [{ animes, products }, settings] = await Promise.all([getStorefrontCatalog(), getSettings()]);
  // A drop that has already ended when the page is built stays out of it; pages cached before
  // the end hide it in the browser instead (useLiveDrop).
  const catalogSettings = liveDrop(settings, products) ? settings : { ...settings, drop: null };
  return (
    <CatalogProvider animes={animes} products={products} settings={catalogSettings}>
      <CartProvider>
        <div className="theme-night flex flex-1 flex-col">
          <AnnouncementBar settings={settings} />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer animes={animes} settings={settings} />
          <CartDrawer />
          <ImpactLayer />
        </div>
      </CartProvider>
    </CatalogProvider>
  );
}
