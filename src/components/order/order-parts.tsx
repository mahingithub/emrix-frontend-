import { Ban, Check, CircleDot, PackageCheck, Phone, Printer, Truck, Undo2 } from "lucide-react";
import { ORDER_STEPS, type Order, type OrderStatus } from "@emrix/shared/orders";
import { fmtDateTime } from "@emrix/shared/time";
import { cn } from "@emrix/shared/utils";

const ICONS: Record<OrderStatus, typeof Check> = {
  placed: CircleDot,
  confirmed: Phone,
  printing: Printer,
  shipped: Truck,
  delivered: PackageCheck,
  cancelled: Ban,
  returned: Undo2,
};

/** Customer-facing progress for an order. */
export function OrderTimeline({ order }: { order: Order }) {
  const ended = order.status === "cancelled" || order.status === "returned";
  const reachedAt = (s: OrderStatus) => order.events.find((e) => e.status === s)?.at;
  // For cancelled/returned orders, progress stops at the last step reached.
  const lastReached = ended
    ? Math.max(0, ...ORDER_STEPS.map((s, i) => (reachedAt(s.key) ? i : 0)))
    : ORDER_STEPS.findIndex((s) => s.key === order.status);
  const endEvent = ended ? [...order.events].reverse().find((e) => e.status === order.status) : undefined;
  const steps = ended ? ORDER_STEPS.slice(0, lastReached + 1) : ORDER_STEPS;

  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const Icon = ICONS[step.key];
        const done = i < lastReached || (ended && i === lastReached);
        const active = !ended && i === lastReached;
        const at = reachedAt(step.key);
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {(i < steps.length - 1 || ended) && (
              <span className={cn("absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5", done ? "bg-ink" : "bg-ink/15")} />
            )}
            <span
              className={cn(
                "relative grid size-10 shrink-0 place-items-center rounded-xl border-2",
                done && "border-ink bg-ink text-paper",
                active && "border-ink bg-shu text-white shadow-panel-sm",
                !done && !active && "border-ink/20 bg-card text-ink/35",
              )}
            >
              {done ? <Check className="size-5" strokeWidth={3} /> : <Icon className="size-5" />}
              {active && step.key !== "delivered" && <span className="absolute -right-1 -top-1 size-3 animate-ping rounded-full bg-kin" />}
            </span>
            <div className={cn("pt-1", !done && !active && "opacity-50")}>
              <p className="font-bold">
                {step.label} <span className="ml-1 font-jp text-[10px] text-shu">{step.jp}</span>
              </p>
              <p className="text-sm text-ink/60">
                {step.key === "shipped" && order.courier && (done || active)
                  ? `${order.courier.name} · ${order.courier.trackingNo}`
                  : step.hint}
              </p>
              {at && (done || active) && <p className="mt-0.5 text-xs text-ink/45">{fmtDateTime(at)}</p>}
            </div>
          </li>
        );
      })}
      {ended && (
        <li className="relative flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-shu bg-shu/10 text-shu">
            {order.status === "cancelled" ? <Ban className="size-5" /> : <Undo2 className="size-5" />}
          </span>
          <div className="pt-1">
            <p className="font-bold text-shu">{order.status === "cancelled" ? "Order cancelled" : "Order returned"}</p>
            <p className="text-sm text-ink/60">{endEvent?.message}</p>
            {endEvent && <p className="mt-0.5 text-xs text-ink/45">{fmtDateTime(endEvent.at)}</p>}
          </div>
        </li>
      )}
    </ol>
  );
}
