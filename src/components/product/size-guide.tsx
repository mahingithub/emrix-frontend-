"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FIT_LABEL, SIZE_CHART } from "@emrix/shared/catalog";
import type { Fit, Size } from "@emrix/shared/types";
import { cn } from "@emrix/shared/utils";

// Garment outlines are instructional diagrams, independent of product photography.
const SHAPES: Record<Fit, { front: string }> = {
  regular: { front: "M82 58 L150 32 Q200 20 250 32 L318 58 L374 150 L328 180 L300 152 L302 446 Q200 456 98 446 L100 152 L72 180 L26 150 Z" },
  oversized: { front: "M70 72 L150 32 Q200 20 250 32 L330 72 L384 182 L336 208 L312 172 L314 450 Q200 460 86 450 L88 172 L64 208 L16 182 Z" },
};

export function SizeTable({ fit, highlight }: { fit: Fit; highlight?: Size | null }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-ink bg-card">
      <table className="w-full text-sm">
        <thead className="bg-ink text-paper">
          <tr>
            {["Size", "Chest", "Length", "Sleeve"].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {SIZE_CHART[fit].map((row) => (
            <tr key={row.size} className={cn(highlight === row.size && "bg-kin/60")}>
              <td className="px-3 py-2.5 font-display">{row.size}</td>
              <td className="px-3 py-2.5 tabular-nums">{row.chest}″</td>
              <td className="px-3 py-2.5 tabular-nums">{row.length}″</td>
              <td className="px-3 py-2.5 tabular-nums">{row.sleeve}″</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MeasureDiagram({ fit }: { fit: Fit }) {
  return (
    <svg viewBox="0 0 400 480" className="h-full w-auto" aria-label="How to measure">
      <path d={SHAPES[fit].front} fill="#fff" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M150 32 C164 66 236 66 250 32" fill="none" stroke="var(--color-ink)" strokeWidth="4" />
      <g stroke="var(--color-shu)" strokeWidth="4" fill="var(--color-shu)">
        <line x1={fit === "regular" ? 108 : 96} y1="176" x2={fit === "regular" ? 292 : 304} y2="176" strokeDasharray="10 7" />
        <line x1="200" y1="70" x2="200" y2="438" strokeDasharray="10 7" />
      </g>
      <g className="font-display" fontSize="26" fill="var(--color-ink)" textAnchor="middle">
        <text x="200" y="160">A</text>
        <text x="222" y="300">B</text>
      </g>
    </svg>
  );
}

export function SizeGuideModal({
  open,
  onClose,
  defaultFit,
  highlight,
}: {
  open: boolean;
  onClose: () => void;
  defaultFit: Fit;
  highlight?: Size | null;
}) {
  const [fit, setFit] = useState<Fit>(defaultFit);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-sumi/70 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Size guide"
        className="relative max-h-[92vh] w-full max-w-xl animate-pop overflow-y-auto rounded-t-3xl border-2 border-ink bg-paper p-5 shadow-panel sm:rounded-3xl sm:p-7"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-jp text-xs font-bold tracking-[0.3em] text-shu">サイズ表</p>
            <h2 className="font-display text-3xl uppercase leading-none">Size guide</h2>
          </div>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-lg border-2 border-ink bg-card hover:bg-kin" aria-label="Close size guide">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 inline-flex rounded-xl border-2 border-ink bg-card p-1">
          {(["regular", "oversized"] as Fit[]).map((f) => (
            <button
              key={f}
              onClick={() => setFit(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                fit === f ? "bg-ink text-paper" : "hover:bg-ink/5",
              )}
            >
              {FIT_LABEL[f]}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_140px]">
          <SizeTable fit={fit} highlight={highlight} />
          <div className="hidden h-44 justify-center sm:flex">
            <MeasureDiagram fit={fit} />
          </div>
        </div>

        <ul className="mt-5 space-y-2 text-sm text-ink/70">
          <li>
            <b className="text-ink">A · Chest:</b> lay a tee flat, measure armpit to armpit, then double it.
          </li>
          <li>
            <b className="text-ink">B · Length:</b> from the highest point of the shoulder down to the hem.
          </li>
          <li>
            <b className="text-ink">Between sizes?</b> Size up for a relaxed fit. Not sure? Message us, we&apos;ll help.
          </li>
        </ul>
      </div>
    </div>
  );
}
