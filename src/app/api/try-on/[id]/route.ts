import { forwardTryOn } from "@/lib/try-on-proxy";

/** Poll a video (or fetch a photo again). */
export async function GET(request: Request, { params }: RouteContext<"/api/try-on/[id]">) {
  return forwardTryOn(request, `/${encodeURIComponent((await params).id)}`);
}

/** Make a short video from a finished try-on photo. */
export async function POST(request: Request, { params }: RouteContext<"/api/try-on/[id]">) {
  return forwardTryOn(request, `/${encodeURIComponent((await params).id)}`);
}
