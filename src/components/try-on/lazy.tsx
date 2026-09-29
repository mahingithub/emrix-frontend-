"use client";

import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";

/** The studio pulls in three.js, so it only loads when someone opens it. */
export const TryOnStudio = dynamic(() => import("./studio").then((m) => m.TryOnStudio), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-sumi text-washi">
      <LoaderCircle className="size-8 animate-spin" aria-label="Opening try-on" />
    </div>
  ),
});
