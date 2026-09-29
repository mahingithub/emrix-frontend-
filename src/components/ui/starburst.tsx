import type { ReactNode } from "react";
import { cn } from "@emrix/shared/utils";

const POINTS = Array.from({ length: 36 }, (_, i) => {
  const a = (i * Math.PI * 2) / 36;
  const r = i % 2 ? 41 : 49;
  return `${Math.round((50 + r * Math.cos(a)) * 10) / 10},${Math.round((50 + r * Math.sin(a)) * 10) / 10}`;
}).join(" ");

/** Manga-style price/impact sticker. Caller sets positioning (relative/absolute). */
export function Starburst({
  children,
  className,
  fill = "var(--color-kin)",
}: {
  children: ReactNode;
  className?: string;
  fill?: string;
}) {
  return (
    <div className={cn("grid place-items-center", className)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <polygon points={POINTS} fill={fill} stroke="var(--color-sumi)" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <div className="relative text-center leading-none text-sumi">{children}</div>
    </div>
  );
}
