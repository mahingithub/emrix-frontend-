"use client";

import { useRouter } from "next/navigation";
import { ArrowDownUp } from "lucide-react";
import { SORTS } from "@emrix/shared/catalog";
import { hrefWith, type ListingParams } from "./href";

const SHORT: Record<string, string> = {
  featured: "Featured",
  new: "Newest",
  popular: "Popular",
  "price-asc": "Price ↑",
  "price-desc": "Price ↓",
};

/** A compact label over a transparent native select: small on screen, but the select keeps
 *  16px text so iOS doesn't zoom the page when it opens. */
export function SortSelect({ base, params }: { base: string; params: ListingParams }) {
  const router = useRouter();
  const value = params.sort ?? "featured";
  return (
    <label className="relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border-2 border-ink/15 bg-card px-3 text-xs font-bold focus-within:border-ink hover:border-ink">
      <ArrowDownUp className="size-3.5" />
      {SHORT[value] ?? "Sort"}
      <span className="sr-only">Sort products</span>
      <select
        value={value}
        onChange={(e) =>
          router.push(hrefWith(base, params, { sort: e.target.value === "featured" ? undefined : e.target.value }), {
            scroll: false,
          })
        }
        className="absolute inset-0 cursor-pointer appearance-none opacity-0 text-base"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
