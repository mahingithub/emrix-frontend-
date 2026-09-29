// Passes the shopper's try-on requests (/api/try-on/*) on to the backend (/storefront/try-on/*),
// adding their browser id (kept in a cookie here) and network address for the daily limits.
import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { HEADERS } from "@emrix/shared/api";
import { apiUrl, visitorHeaders } from "./backend";

const SHOPPER_COOKIE = "emrix_shopper";

async function shopperId() {
  const jar = await cookies();
  let id = jar.get(SHOPPER_COOKIE)?.value;
  if (!id || !/^[a-f0-9]{24}$/.test(id)) {
    id = randomBytes(12).toString("hex");
    jar.set(SHOPPER_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return id;
}

const PASS_BACK = ["content-type", "content-length", "content-range", "accept-ranges", "cache-control"];

export async function forwardTryOn(request: Request, path: string) {
  const base = apiUrl();
  if (!base) return Response.json({ error: "Try-on isn't available right now." }, { status: 503 });
  const headers = new Headers({ [HEADERS.shopper]: await shopperId(), ...(await visitorHeaders()) });
  const key = process.env.INTERNAL_API_KEY?.trim();
  if (key) headers.set(HEADERS.key, key);
  for (const name of ["content-type", "range"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  let res: Response;
  try {
    res = await fetch(`${base}/storefront/try-on${path}`, {
      method: request.method,
      headers,
      body: request.method === "POST" ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });
  } catch (e) {
    console.error("[try-on] couldn't reach the backend", e);
    return Response.json({ error: "Try-on is busy right now. Please try again in a minute." }, { status: 503 });
  }
  const out = new Headers();
  for (const name of PASS_BACK) {
    const value = res.headers.get(name);
    if (value) out.set(name, value);
  }
  // fetch has already unzipped a compressed body, so its content-length (the zipped size) would cut
  // the answer short: the shopper's browser would get truncated JSON and a blank try-on.
  if (res.headers.has("content-encoding")) out.delete("content-length");
  return new Response(res.body, { status: res.status, headers: out });
}
