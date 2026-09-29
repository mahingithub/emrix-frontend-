import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import type { Badge as BadgeType } from "@emrix/shared/types";
import { cn, discountPercent, formatBDT } from "@emrix/shared/utils";

const BADGE_STYLE: Record<BadgeType, { label: string; jp: string; className: string }> = {
  new: { label: "New", jp: "新作", className: "bg-kin text-ink" },
  bestseller: { label: "Bestseller", jp: "人気", className: "bg-ink text-paper" },
  limited: { label: "Limited", jp: "限定", className: "bg-shu text-white" },
};

export function Badge({ type, compact }: { type: BadgeType; compact?: boolean }) {
  const b = BADGE_STYLE[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-extrabold uppercase tracking-wider",
        compact ? "px-1.5 py-0.5 text-[9px]" : "border-2 border-ink px-1.5 py-0.5 text-[10px]",
        b.className,
      )}
    >
      {b.label}
      {!compact && <span className="font-jp text-[9px] opacity-80">{b.jp}</span>}
    </span>
  );
}

export function DiscountBadge({ price, compareAt, compact }: { price: number; compareAt?: number; compact?: boolean }) {
  const pct = discountPercent(price, compareAt);
  if (!pct) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-extrabold tracking-wider",
        compact ? "bg-sumi px-1.5 py-0.5 text-[9px] text-white" : "border-2 border-ink bg-card px-1.5 py-0.5 text-[10px] text-shu",
      )}
    >
      −{pct}%
    </span>
  );
}

export function Price({
  price,
  compareAt,
  size = "md",
  className,
}: {
  price: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2 whitespace-nowrap", className)}>
      <span
        className={cn(
          "font-extrabold tabular-nums",
          size === "lg" && "text-3xl",
          size === "md" && "text-base",
          size === "sm" && "text-sm",
        )}
      >
        {formatBDT(price)}
      </span>
      {compareAt && compareAt > price && (
        <s className={cn("tabular-nums text-ink/40", size === "lg" ? "text-lg" : "text-xs")}>
          {formatBDT(compareAt)}
        </s>
      )}
    </span>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("size-3.5", i <= Math.round(rating) ? "fill-kin text-ink" : "fill-transparent text-ink/25")}
          strokeWidth={1.75}
        />
      ))}
    </span>
  );
}

export function SectionHeading({
  index,
  jp,
  title,
  href,
  linkLabel = "View all",
  className,
  invert,
}: {
  index?: string;
  jp: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  invert?: boolean;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        <p className="sm-left flex items-center gap-2 font-jp text-xs font-bold tracking-[0.3em] text-shu">
          {index && <span className="font-display tracking-normal">{index}</span>}
          {index && <span className={cn("h-px w-6", invert ? "bg-washi/40" : "bg-ink/30")} />}
          {jp}
        </p>
        <h2 className="sm-slam mt-2 font-display text-3xl uppercase leading-none sm:text-4xl lg:text-5xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            "group hidden shrink-0 items-center gap-1.5 border-b-2 pb-0.5 text-sm font-bold uppercase tracking-wide sm:inline-flex",
            invert ? "border-washi" : "border-ink",
          )}
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

export function PaymentPills({ className, wallets }: { className?: string; wallets: { bkash: boolean; nagad: boolean } }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {wallets.bkash && <span className="rounded-md bg-[#e2136e] px-2 py-1 text-[11px] font-extrabold text-white">bKash</span>}
      {wallets.nagad && <span className="rounded-md bg-[#f6921e] px-2 py-1 text-[11px] font-extrabold text-white">Nagad</span>}
      <span className="rounded-md border border-current px-2 py-1 text-[11px] font-extrabold">Cash on Delivery</span>
    </div>
  );
}
