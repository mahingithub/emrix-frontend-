"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2, PackageSearch, SearchX } from "lucide-react";
import { STATUS_LABEL, type Order } from "@emrix/shared/orders";
import { fmtDateTime } from "@emrix/shared/time";
import { cn } from "@emrix/shared/utils";
import { btn } from "@/components/ui/button";
import { trackOrder } from "@/actions/storefront";
import { OrderTimeline } from "./order-parts";
import { OrderSummaryCard } from "./order-summary-card";

export function TrackOrder({ initialId = "", supportPhone }: { initialId?: string; supportPhone: string }) {
  const [id, setId] = useState(initialId);
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Order | "missing" | null>(null);
  const [pending, startTransition] = useTransition();

  const lookup = (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const order = await trackOrder(id, phone);
      setResult(order ?? "missing");
    });
  };

  const ended = result && result !== "missing" && (result.status === "cancelled" || result.status === "returned");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8 lg:py-14">
      <form
        onSubmit={lookup}
        className="grid gap-4 rounded-3xl border-2 border-ink bg-card p-5 shadow-panel sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider">Order ID</span>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            placeholder="EMX-XXXXXX"
            className="h-12 w-full rounded-xl border-2 border-ink/20 px-3.5 font-mono font-bold uppercase outline-none placeholder:font-sans placeholder:font-medium focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider">Phone number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            type="tel"
            inputMode="numeric"
            placeholder="01XXXXXXXXX"
            className="h-12 w-full rounded-xl border-2 border-ink/20 px-3.5 font-medium outline-none focus:border-ink"
          />
        </label>
        <button type="submit" disabled={pending} className={btn({ className: "h-12" })}>
          {pending ? <Loader2 className="size-5 animate-spin" /> : <PackageSearch className="size-5" />} Track
        </button>
      </form>

      {result === "missing" && (
        <div className="mt-8 flex flex-col items-center rounded-3xl border-2 border-dashed border-ink/30 px-6 py-14 text-center">
          <SearchX className="size-10 text-ink/40" />
          <h2 className="mt-4 font-display text-2xl uppercase">No matching order</h2>
          <p className="mt-2 max-w-sm text-sm text-ink/60">
            Double-check the order ID from your confirmation and the phone number you ordered with.
            {supportPhone && <> Still stuck? Call us at {supportPhone}.</>}
          </p>
        </div>
      )}

      {result && result !== "missing" && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border-2 border-ink bg-paper p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink/50">Order</p>
                <p className="font-display text-2xl">{result.code}</p>
                <p className="text-xs text-ink/55">Placed {fmtDateTime(result.createdAt)}</p>
              </div>
              <span
                className={cn(
                  "rounded-full border-2 border-ink px-3 py-1 text-xs font-extrabold uppercase tracking-wider",
                  ended ? "bg-shu text-white" : "bg-kin",
                )}
              >
                {result.status === "placed" ? "Order placed" : STATUS_LABEL[result.status]}
              </span>
            </div>
            <div className="mt-6">
              <OrderTimeline order={result} />
            </div>
          </div>
          <OrderSummaryCard order={result} />
        </div>
      )}
    </div>
  );
}
