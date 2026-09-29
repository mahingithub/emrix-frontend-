import Link from "next/link";
import { Check, PackageSearch } from "lucide-react";
import type { Order } from "@emrix/shared/orders";
import { btn } from "@/components/ui/button";
import { Starburst } from "@/components/ui/starburst";
import { Celebration, DoneStamp } from "./celebration";
import { CopyButton } from "@emrix/shared/ui/copy-button";
import { OrderTimeline } from "./order-parts";
import { OrderSummaryCard } from "./order-summary-card";

export function OrderNotFound({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-jp text-xs font-bold tracking-[0.3em] text-shu">見つかりません</p>
      <h1 className="mt-2 font-display text-3xl uppercase">Can&apos;t show this order</h1>
      <p className="mt-3 text-ink/60">
        Order <b>{id}</b> wasn&apos;t placed from this browser. Track it with the phone number you ordered with.
      </p>
      <Link href={`/track?id=${encodeURIComponent(id)}`} className={btn({ className: "mt-8" })}>
        Track an order
      </Link>
    </div>
  );
}

export function OrderConfirmation({ order }: { order: Order }) {
  return (
    <>
      <section className="relative overflow-hidden border-b-2 border-ink">
        <div className="speedlines spin-slow absolute inset-[-50%]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-14 text-center lg:py-20">
          <div className="relative">
            <Celebration />
            <Starburst className="relative size-28 animate-pop" fill="var(--color-shu)">
              <Check className="size-12 text-white" strokeWidth={3.5} />
            </Starburst>
            <DoneStamp className="absolute -right-12 -top-3" />
          </div>
          <p className="mt-6 font-jp text-sm font-black tracking-[0.4em] text-shu">ありがとうございます！</p>
          <h1 className="slam-in mt-2 font-display text-5xl uppercase leading-none sm:text-7xl">Arigatou!</h1>
          <p className="mt-4 max-w-md text-ink/70">
            Your order is in, {order.customer.name.split(" ")[0]}. We&apos;ll call{" "}
            <b className="text-ink">{order.customer.phone}</b> shortly to confirm it before printing.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border-2 border-ink bg-card py-2 pl-5 pr-2 shadow-panel">
            <span className="text-left">
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-ink/50">Order ID</span>
              <span className="block font-display text-xl tracking-wide">{order.code}</span>
            </span>
            <CopyButton
              value={order.code}
              label="Copy order ID"
              className="size-10 rounded-xl border-2 border-ink bg-kin hover:-translate-y-px"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="font-jp text-xs font-bold tracking-[0.3em] text-shu">次のステップ</p>
          <h2 className="mt-1 font-display text-2xl uppercase">What happens next</h2>
          <div className="mt-6">
            <OrderTimeline order={order} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/track?id=${order.code}`} className={btn({ variant: "dark" })}>
              <PackageSearch className="size-4" /> Track order
            </Link>
            <Link href="/shop" className={btn({ variant: "outline" })}>
              Keep shopping
            </Link>
          </div>
        </div>
        <OrderSummaryCard order={order} />
      </div>
    </>
  );
}
