import type { ReactNode } from "react";
import { cn } from "@emrix/shared/utils";

export function Marquee({
  items,
  className,
  reverse,
  separator = "✦",
}: {
  items: ReactNode[];
  className?: string;
  reverse?: boolean;
  separator?: ReactNode;
}) {
  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-5">{item}</span>
          <span className="opacity-60">{separator}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("flex overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max motion-reduce:animate-none",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
        )}
      >
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
