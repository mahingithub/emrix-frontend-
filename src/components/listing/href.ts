export interface ListingParams {
  anime?: string;
  fit?: string;
  size?: string;
  tag?: string;
  q?: string;
  sort?: string;
}

const KEYS: (keyof ListingParams)[] = ["anime", "fit", "size", "tag", "q", "sort"];

export function hrefWith(base: string, current: ListingParams, patch: Partial<ListingParams>) {
  const merged = { ...current, ...patch };
  const params = new URLSearchParams();
  for (const k of KEYS) {
    const v = merged[k];
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Picks the known listing keys out of Next's raw searchParams. */
export function parseListingParams(raw: Record<string, string | string[] | undefined>): ListingParams {
  const out: ListingParams = {};
  for (const k of KEYS) {
    const v = raw[k];
    if (typeof v === "string" && v) out[k] = v;
  }
  return out;
}
