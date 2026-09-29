// The storefront's link to the backend API (server only). Set API_URL and INTERNAL_API_KEY in
// frontend/.env.local (or the host's environment settings); see .env.example.
import "server-only";
import { headers } from "next/headers";
import { HEADERS, type ApiErrorBody, type StorefrontData } from "@emrix/shared/api";
import type { Order } from "@emrix/shared/orders";

/** httpOnly cookie listing order codes placed from this browser. */
export const ORDERS_COOKIE = "emrix_orders";

/** Shop pages are rebuilt as soon as the backend reports a change; this is only the fallback. */
const REFRESH_SECONDS = 300;

export class BackendError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

export const apiUrl = () => (process.env.API_URL ?? "").trim().replace(/\/+$/, "");

type Init = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } };

/** Calls the backend with the shared key; failures throw BackendError with the backend's message. */
export async function backend<T>(path: string, init: Init = {}): Promise<T> {
  const base = apiUrl();
  if (!base) throw new BackendError(503, "API_URL is not set. Add the backend's address to the frontend's environment (see frontend/.env.example).", "api_not_configured");
  const h = new Headers(init.headers);
  const key = process.env.INTERNAL_API_KEY?.trim();
  if (key) h.set(HEADERS.key, key);
  if (init.body && !h.has("content-type")) h.set("content-type", "application/json");
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { ...init, headers: h });
  } catch (e) {
    throw new BackendError(503, `Couldn't reach the backend at ${base} (${e instanceof Error ? e.message : e}).`, "api_unreachable");
  }
  const data = (await res.json().catch(() => null)) as (T & Partial<ApiErrorBody>) | null;
  if (!res.ok) throw new BackendError(res.status, data?.error ?? `The backend answered ${res.status}.`, data?.code);
  return data as T;
}

/** The visitor's network address, passed to the backend for its rate limits. */
export async function visitorHeaders() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
  return { [HEADERS.clientIp]: ip };
}

/* --- Shop data (cached; the backend asks for a refresh after changes) -------------------------- */

const storefront = () => backend<StorefrontData>("/storefront", { next: { revalidate: REFRESH_SECONDS, tags: ["storefront"] } });

/** Everything the storefront shows: active collections that have active products, and those products. */
export async function getStorefrontCatalog() {
  const { animes, products } = await storefront();
  return { animes, products };
}

export async function getSettings() {
  return (await storefront()).settings;
}

/** Whether the photo try-on is set up on the backend. */
export async function tryOnEnabled() {
  return (await storefront()).tryOn;
}

/** An order as the customer sees it (internal notes removed), or null. */
export async function getOrder(code: string): Promise<Order | null> {
  try {
    return await backend<Order>(`/storefront/orders/${encodeURIComponent(code)}`, { cache: "no-store" });
  } catch (e) {
    if (e instanceof BackendError && e.status === 404) return null;
    throw e;
  }
}

export type SetupProblem = "api-missing" | "api-down" | "db-missing";

/** For the local setup screen: what's missing before the shop can load, or null when all is well. */
export async function setupProblem(): Promise<SetupProblem | null> {
  if (!apiUrl()) return "api-missing";
  try {
    const health = await backend<{ database: boolean }>("/health", { cache: "no-store" });
    return health.database ? null : "db-missing";
  } catch {
    return "api-down";
  }
}
