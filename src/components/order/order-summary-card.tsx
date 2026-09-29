"use client";

import { Package } from "lucide-react";
import { PAYMENT_LABEL, type Order } from "@emrix/shared/orders";
import { formatBDT, tintBg } from "@emrix/shared/utils";
import { useCatalog } from "@/components/catalog-context";
import { ProductVisual } from "@emrix/shared/ui/product-visual";

export function OrderSummaryCard({ order }: { order: Order }) {
  const catalog = useCatalog();
  const verifying = order.paymentStatus === "pending";
  return (
    <div className="rounded-3xl border-2 border-ink bg-card p-5 shadow-panel sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg uppercase">Order summary</h2>
        <span className="flex items-center gap-1.5 text-xs font-bold text-ink/55">
          <Package className="size-4" /> {order.lines.reduce((n, l) => n + l.qty, 0)} items
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {order.lines.map((l) => {
          const product = catalog.product(l.productId);
          const color = product?.colors.find((c) => c.name === l.colorName);
          return (
            <li key={`${l.productId}-${l.colorName}-${l.size}`} className="flex items-center gap-3">
              <span
                className="relative size-14 shrink-0 overflow-hidden rounded-xl border-2 border-ink"
                style={{ backgroundColor: tintBg(catalog.anime(l.anime)?.color ?? "#888888") }}
              >
                {product && <ProductVisual product={product} color={color} className="absolute inset-0.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{l.name}</span>
                <span className="block text-xs text-ink/55">
                  {l.colorName} · {l.size} · ×{l.qty}
                </span>
              </span>
              <span className="text-sm font-bold tabular-nums">{formatBDT(l.price * l.qty)}</span>
            </li>
          );
        })}
      </ul>
      <dl className="mt-5 space-y-2 border-t-2 border-dashed border-ink/20 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink/60">Subtotal</dt>
          <dd className="font-semibold tabular-nums">{formatBDT(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/60">Delivery</dt>
          <dd className="font-semibold tabular-nums">{order.delivery === 0 ? "FREE" : formatBDT(order.delivery)}</dd>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-ink/60">Discount {order.coupon && `(${order.coupon})`}</dt>
            <dd className="font-semibold text-shu tabular-nums">−{formatBDT(order.discount)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between border-t-2 border-ink pt-3">
          <dt className="font-bold uppercase">Total</dt>
          <dd className="text-2xl font-extrabold tabular-nums">{formatBDT(order.total)}</dd>
        </div>
      </dl>
      <div className="mt-5 grid gap-4 rounded-2xl bg-paper p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink/50">Deliver to</p>
          <p className="mt-1 font-bold">{order.customer.name}</p>
          <p className="text-ink/65">
            {order.shipping.address}, {order.shipping.area}, {order.shipping.district}
          </p>
          <p className="text-ink/65">{order.customer.phone}</p>
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink/50">Payment</p>
          <p className="mt-1 font-bold">{PAYMENT_LABEL[order.payment.method]}</p>
          {order.payment.method === "cod" ? (
            <p className="text-ink/65">
              {order.paymentStatus === "paid" ? "Paid to rider" : `Pay ${formatBDT(order.total)} to the rider`}
            </p>
          ) : (
            <p className="text-ink/65">
              TrxID <span className="font-mono">{order.payment.trxId}</span> ·{" "}
              {verifying ? "verifying" : order.paymentStatus === "paid" ? "verified" : order.paymentStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
