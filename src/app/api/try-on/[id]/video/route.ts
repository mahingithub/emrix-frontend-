import { forwardTryOn } from "@/lib/try-on-proxy";

/** The finished clip, in byte ranges (Safari needs them to play video). */
export async function GET(request: Request, { params }: RouteContext<"/api/try-on/[id]/video">) {
  return forwardTryOn(request, `/${encodeURIComponent((await params).id)}/video`);
}
