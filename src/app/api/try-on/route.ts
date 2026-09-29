import { forwardTryOn } from "@/lib/try-on-proxy";

// Google takes 10–20 seconds to make the picture.
export const maxDuration = 60;

/** Try a tee on: the shopper's photo in, a photo of them wearing it out. */
export async function POST(request: Request) {
  return forwardTryOn(request, "");
}
