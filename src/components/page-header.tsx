import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@emrix/shared/utils";

export function Breadcrumbs({
  items,
  className,
  tone = "ink",
}: {
  items: { href?: string; label: string }[];
  className?: string;
  tone?: "ink" | "current";
}) {
  const inherit = tone === "current";
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center gap-1 text-xs font-semibold", inherit ? "opacity-75" : "text-ink/55", className)}
    >
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3" />}
          {item.href ? (
            <Link href={item.href} className={inherit ? "hover:underline" : "hover:text-ink"}>
              {item.label}
            </Link>
          ) : (
            <span className={inherit ? "font-bold" : "text-ink"}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  jp,
  title,
  kanji,
  crumbs,
  children,
}: {
  jp: string;
  title: string;
  kanji: string;
  crumbs: { href?: string; label: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink">
      <div className="halftone absolute inset-0 [mask-image:linear-gradient(90deg,transparent_30%,black)]" />
      <span
        aria-hidden
        className="sm-drift pointer-events-none absolute -bottom-10 right-2 select-none font-display text-[10rem] leading-none text-ink/[0.06] sm:text-[14rem]"
      >
        {kanji}
      </span>
      <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        <Breadcrumbs items={crumbs} />
        <p className="mt-6 font-jp text-xs font-bold tracking-[0.35em] text-shu">{jp}</p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none sm:text-6xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}
