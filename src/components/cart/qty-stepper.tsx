"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@emrix/shared/utils";
import { MAX_QTY } from "./cart-context";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = MAX_QTY,
  size = "md",
  className,
}: {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const btnCls = cn(
    "grid place-items-center transition-colors hover:bg-ink/5 disabled:opacity-30",
    size === "sm" ? "size-8" : "size-11",
  );
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border-2 border-ink bg-card",
        size === "sm" ? "h-9" : "h-12",
        className,
      )}
    >
      <button type="button" className={btnCls} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="size-4" />
      </button>
      <span className={cn("text-center font-bold tabular-nums", size === "sm" ? "w-6 text-sm" : "w-8")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btnCls} onClick={() => onChange(value + 1)} disabled={value >= Math.min(MAX_QTY, max)} aria-label="Increase quantity">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
