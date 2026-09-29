import { forwardTryOn } from "@/lib/try-on-proxy";

// Gemini takes 20–40 seconds to draw the back view.
export const maxDuration = 60;

/** The shopper from behind, wearing the tee's back print (for designs that have one). */
export async function POST(request: Request, { params }: RouteContext<"/api/try-on/[id]/back">) {
  return forwardTryOn(request, `/${encodeURIComponent((await params).id)}/back`);
}
