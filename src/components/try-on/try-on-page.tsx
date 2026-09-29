"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Product, Size, TeeColor } from "@emrix/shared/types";
import { TryOnStudio } from "./lazy";

/** The try-on studio as its own page. Closing it goes back to the tee. */
export function TryOnPage({ product, color, initialSize }: { product: Product; color: TeeColor; initialSize: Size | null }) {
  const router = useRouter();
  const close = useCallback(() => {
    // Opened from the product page: step back so Back doesn't reopen the studio. Opened from a
    // shared link in a fresh tab: there's nothing to go back to, so show the tee instead.
    if (window.history.length > 1) router.back();
    else router.replace(`/product/${product.slug}`);
  }, [router, product.slug]);

  return <TryOnStudio product={product} color={color} initialSize={initialSize} onClose={close} />;
}
