"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { stockOf } from "@emrix/shared/catalog";
import type { Product, Size, TeeColor } from "@emrix/shared/types";
import { useCatalog } from "@/components/catalog-context";

export interface CartLine {
  key: string;
  productId: string;
  colorName: string;
  size: Size;
  qty: number;
}

export interface CartItem extends CartLine {
  product: Product;
  color: TeeColor;
  lineTotal: number;
  /** Units available for this colour/size right now. */
  available: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product, size: Size, color: TeeColor, qty?: number, openDrawer?: boolean) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export const MAX_QTY = 10;

/* --- localStorage-backed store ------------------------------------ */

const STORAGE_KEY = "emrix-cart";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cache: CartLine[] | null = null;

function read(): CartLine[] {
  if (cache === null) {
    try {
      cache = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as CartLine[];
    } catch {
      cache = [];
    }
  }
  return cache;
}

function update(fn: (prev: CartLine[]) => CartLine[]) {
  cache = fn(read());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

/* ------------------------------------------------------------------ */

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog();
  const lines = useSyncExternalStore(subscribe, read, () => EMPTY);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((product: Product, size: Size, color: TeeColor, qty = 1, openDrawer = true) => {
    const key = `${product.id}:${color.name}:${size}`;
    const cap = Math.min(MAX_QTY, stockOf(product, color.name, size));
    if (cap <= 0) return;
    update((prev) =>
      prev.some((l) => l.key === key)
        ? prev.map((l) => (l.key === key ? { ...l, qty: Math.min(cap, l.qty + qty) } : l))
        : [...prev, { key, productId: product.id, colorName: color.name, size, qty: Math.min(cap, qty) }],
    );
    if (openDrawer) setIsOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    update((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => update((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => update(() => []), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const items: CartItem[] = [];
    for (const line of lines) {
      const product = catalog.product(line.productId);
      const color = product?.colors.find((c) => c.name === line.colorName);
      if (!product || !color) continue; // removed from the store since it was added
      items.push({
        ...line,
        product,
        color,
        lineTotal: product.price * line.qty,
        available: stockOf(product, color.name, line.size),
      });
    }
    return {
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.lineTotal, 0),
      hydrated,
      isOpen,
      open,
      close,
      add,
      setQty,
      remove,
      clear,
    };
  }, [lines, catalog, hydrated, isOpen, open, close, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
