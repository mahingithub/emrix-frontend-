"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@emrix/shared/utils";

function subscribe(tick: () => void) {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}
const nowSeconds = () => Math.floor(Date.now() / 1000);

export function Countdown({ target, className }: { target: string; className?: string }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, () => null);
  const end = Math.floor(new Date(target).getTime() / 1000);
  const left = now === null ? null : Math.max(0, end - now);

  const parts = [
    { label: "Days", jp: "日", value: left === null ? null : Math.floor(left / 86400) },
    { label: "Hours", jp: "時", value: left === null ? null : Math.floor((left % 86400) / 3600) },
    { label: "Mins", jp: "分", value: left === null ? null : Math.floor((left % 3600) / 60) },
    { label: "Secs", jp: "秒", value: left === null ? null : left % 60 },
  ];

  return (
    <div className={cn("flex gap-2 sm:gap-3", className)} role="timer" aria-label="Time left in this drop">
      {parts.map((p) => (
        <div key={p.label} className="w-16 rounded-xl border-2 border-washi/80 bg-washi py-2 text-center text-sumi sm:w-20">
          <span className="block font-display text-2xl tabular-nums leading-none sm:text-3xl">
            {p.value === null ? "--" : String(p.value).padStart(2, "0")}
          </span>
          <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-widest text-sumi/55">
            {p.label} <span className="font-jp text-shu">{p.jp}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
