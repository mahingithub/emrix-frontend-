import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { HEADERS } from "@emrix/shared/api";

const digest = (s: string) => createHash("sha256").update(s).digest();

/**
 * The backend calls this after a change that shows in the shop (products, stock, collections,
 * settings), so the cached shop pages are rebuilt on their next visit.
 */
export async function POST(request: Request) {
  const key = process.env.INTERNAL_API_KEY?.trim();
  const sent = request.headers.get(HEADERS.key) ?? "";
  const allowed = key ? timingSafeEqual(digest(sent), digest(key)) : process.env.NODE_ENV !== "production";
  if (!allowed) return Response.json({ error: "Unauthorized" }, { status: 401 });
  revalidatePath("/", "layout");
  return Response.json({ revalidated: true });
}
