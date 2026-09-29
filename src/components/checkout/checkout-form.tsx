"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Banknote, Check, Loader2, Lock, MapPin, Phone, Tag, X } from "lucide-react";
import { DIVISIONS } from "@emrix/shared/districts";
import { couponDiscount, deliveryFee, type CouponInfo, type DeliverySettings, type PaymentMethod } from "@emrix/shared/orders";
import { cn, formatBDT, normalizeBdPhone, tintBg } from "@emrix/shared/utils";
import { checkCoupon, placeOrder } from "@/actions/storefront";
import { btn } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { EmptyCart } from "@/components/cart/cart-drawer";
import { useCatalog } from "@/components/catalog-context";
import { ProductVisual } from "@emrix/shared/ui/product-visual";

type Fields = {
  name: string;
  phone: string;
  email: string;
  district: string;
  area: string;
  address: string;
  note: string;
  sender: string;
  trxId: string;
};

const EMPTY: Fields = { name: "", phone: "", email: "", district: "", area: "", address: "", note: "", sender: "", trxId: "" };

const PAYMENTS: { key: PaymentMethod; label: string; sub: string; badge: ReactNode }[] = [
  {
    key: "cod",
    label: "Cash on Delivery",
    sub: "Pay the rider in cash when it arrives",
    badge: (
      <span className="grid size-10 place-items-center rounded-lg border-2 border-ink bg-kin">
        <Banknote className="size-5" />
      </span>
    ),
  },
  {
    key: "bkash",
    label: "bKash",
    sub: "Send Money, then share the TrxID",
    badge: <span className="grid size-10 place-items-center rounded-lg bg-[#e2136e] text-[10px] font-extrabold text-white">bKash</span>,
  },
  {
    key: "nagad",
    label: "Nagad",
    sub: "Send Money, then share the TrxID",
    badge: <span className="grid size-10 place-items-center rounded-lg bg-[#f6921e] text-[10px] font-extrabold text-white">Nagad</span>,
  },
];

export function CheckoutForm({
  delivery,
  wallets,
}: {
  delivery: DeliverySettings;
  wallets: { bkash: string; nagad: string };
}) {
  const { items, subtotal, hydrated, clear } = useCart();
  const catalog = useCatalog();
  const router = useRouter();
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [formError, setFormError] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, startCouponCheck] = useTransition();
  const [placing, startPlacing] = useTransition();
  const [placed, setPlaced] = useState(false);

  const fee = deliveryFee(f.district, subtotal, delivery);
  const discount = couponDiscount(coupon, subtotal);
  const total = subtotal - discount + (fee ?? 0);
  const wallet = payment === "bkash" ? wallets.bkash : wallets.nagad;

  const set = (key: keyof Fields) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const applyCoupon = () =>
    startCouponCheck(async () => {
      const res = await checkCoupon(couponInput, subtotal);
      if (res.ok) {
        setCoupon(res.coupon);
        setCouponError("");
        setCouponInput("");
      } else {
        setCouponError(res.error);
      }
    });

  const validate = () => {
    const e: typeof errors = {};
    if (f.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!normalizeBdPhone(f.phone)) e.phone = "Enter a valid 11-digit number, e.g. 01712345678.";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "That email doesn't look right.";
    if (!f.district) e.district = "Select your district.";
    if (f.area.trim().length < 2) e.area = "Enter your area or thana.";
    if (f.address.trim().length < 6) e.address = "Add house, road and landmark so the rider can find you.";
    if (payment !== "cod") {
      if (!normalizeBdPhone(f.sender)) e.sender = `Enter the ${payment === "bkash" ? "bKash" : "Nagad"} number you paid from.`;
      if (f.trxId.trim().length < 6) e.trxId = "Enter the transaction ID from your payment SMS.";
    }
    return e;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setFormError("");
    startPlacing(async () => {
      const res = await placeOrder({
        ...f,
        payment,
        coupon: coupon?.code,
        items: items.map((i) => ({ productId: i.product.id, colorName: i.color.name, size: i.size, qty: i.qty })),
      });
      if (!res.ok) {
        if (res.errors) setErrors(res.errors);
        if (res.errors?.coupon) setCoupon(null);
        setFormError(res.message ?? "Please fix the highlighted fields.");
        return;
      }
      setPlaced(true);
      router.push(`/order/${res.code}`);
      clear();
    });
  };

  if (!hydrated) return <div className="mt-10 h-96 animate-pulse rounded-3xl bg-ink/5" />;
  if (items.length === 0 && !placing && !placed) {
    return (
      <div className="mt-10 rounded-3xl border-2 border-ink bg-card">
        <EmptyCart />
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        {/* Contact */}
        <Panel step="01" jp="連絡先" title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Full name" error={errors.name} className="sm:col-span-2">
              <input id="f-name" value={f.name} onChange={set("name")} autoComplete="name" placeholder="e.g. Tahmid Rahman" className={input(errors.name)} />
            </Field>
            <Field id="phone" label="Mobile number" error={errors.phone} hint="We'll call this number to confirm your order.">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-1.5 pl-3 text-sm font-bold text-ink/50">
                  <Phone className="size-4" /> +88
                </span>
                <input
                  id="f-phone"
                  value={f.phone}
                  onChange={set("phone")}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="01XXXXXXXXX"
                  className={cn(input(errors.phone), "pl-[4.5rem]")}
                />
              </div>
            </Field>
            <Field id="email" label="Email" optional error={errors.email} hint="For your order receipt.">
              <input id="f-email" value={f.email} onChange={set("email")} type="email" autoComplete="email" placeholder="you@example.com" className={input(errors.email)} />
            </Field>
          </div>
        </Panel>

        {/* Address */}
        <Panel step="02" jp="配送先" title="Delivery address">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="district" label="District" error={errors.district}>
              <select id="f-district" value={f.district} onChange={set("district")} className={cn(input(errors.district), !f.district && "text-ink/40")}>
                <option value="">Select district</option>
                {Object.entries(DIVISIONS).map(([division, districts]) => (
                  <optgroup key={division} label={`${division} Division`}>
                    {districts.map((d) => (
                      <option key={d} value={d} className="text-ink">
                        {d}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field id="area" label="Area / Thana" error={errors.area}>
              <input id="f-area" value={f.area} onChange={set("area")} autoComplete="address-level3" placeholder="e.g. Mirpur 10" className={input(errors.area)} />
            </Field>
            <Field id="address" label="Full address" error={errors.address} className="sm:col-span-2">
              <textarea
                id="f-address"
                value={f.address}
                onChange={set("address")}
                rows={2}
                autoComplete="street-address"
                placeholder="House, road, block, nearby landmark"
                className={cn(input(errors.address), "h-auto py-3")}
              />
            </Field>
            <Field id="note" label="Note for rider" optional className="sm:col-span-2">
              <input id="f-note" value={f.note} onChange={set("note")} placeholder="e.g. Call before coming, gate code…" className={input()} />
            </Field>
          </div>

          <div
            className={cn(
              "mt-5 flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 text-sm",
              f.district ? "border-ink bg-kin/30" : "border-ink/25 text-ink/55",
            )}
          >
            <MapPin className="size-5 shrink-0" />
            {f.district ? (
              <p>
                <b>{f.district === "Dhaka" ? "Inside Dhaka" : "Outside Dhaka"}</b> ·{" "}
                {f.district === "Dhaka" ? delivery.insideDays : delivery.outsideDays} ·{" "}
                <b>{fee === 0 ? "FREE delivery" : formatBDT(fee ?? 0)}</b>
              </p>
            ) : (
              <p>
                Select a district to see delivery charge. Inside Dhaka {formatBDT(delivery.insideDhaka)}, outside{" "}
                {formatBDT(delivery.outsideDhaka)}.
              </p>
            )}
          </div>
        </Panel>

        {/* Payment */}
        <Panel step="03" jp="お支払い" title="Payment">
          <div className="grid gap-3" role="radiogroup" aria-label="Payment method">
            {PAYMENTS.filter((p) => p.key === "cod" || !!wallets[p.key].trim()).map((p) => (
              <label
                key={p.key}
                className={cn(
                  "flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-3.5 transition-all",
                  payment === p.key ? "border-ink bg-card shadow-panel-sm" : "border-ink/15 bg-card/60 hover:border-ink/50",
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={p.key}
                  checked={payment === p.key}
                  onChange={() => setPayment(p.key)}
                  className="sr-only"
                />
                {p.badge}
                <span className="flex-1">
                  <span className="block font-bold">{p.label}</span>
                  <span className="block text-xs text-ink/55">{p.sub}</span>
                </span>
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full border-2 border-ink",
                    payment === p.key ? "bg-shu text-white" : "bg-card",
                  )}
                >
                  {payment === p.key && <Check className="size-3.5 animate-pop" strokeWidth={3} />}
                </span>
              </label>
            ))}
          </div>

          {payment !== "cod" && (
            <div className="mt-5 rounded-2xl border-2 border-ink bg-card p-4 sm:p-5">
              <ol className="space-y-2 text-sm">
                <li className="flex gap-3">
                  <StepDot n={1} />
                  <span>
                    Open your {payment === "bkash" ? "bKash" : "Nagad"} app and <b>Send Money</b> of{" "}
                    <b className="text-shu">{formatBDT(total)}</b> to <b className="font-mono">{wallet}</b>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <StepDot n={2} />
                  <span>Copy the Transaction ID (TrxID) from the confirmation SMS.</span>
                </li>
                <li className="flex gap-3">
                  <StepDot n={3} />
                  <span>Enter your number and TrxID below. We verify every payment by hand.</span>
                </li>
              </ol>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field id="sender" label={`Your ${payment === "bkash" ? "bKash" : "Nagad"} number`} error={errors.sender}>
                  <input id="f-sender" value={f.sender} onChange={set("sender")} type="tel" inputMode="numeric" placeholder="01XXXXXXXXX" className={input(errors.sender)} />
                </Field>
                <Field id="trxId" label="Transaction ID" error={errors.trxId}>
                  <input id="f-trxId" value={f.trxId} onChange={set("trxId")} placeholder="e.g. 9FT4K2LM7Q" className={cn(input(errors.trxId), "font-mono uppercase")} />
                </Field>
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Summary */}
      <aside className="lg:col-span-5">
        <div className="rounded-3xl border-2 border-ink bg-card p-5 shadow-panel sm:p-6 lg:sticky lg:top-24">
          <h2 className="flex items-baseline justify-between font-display text-xl uppercase">
            Order summary <span className="font-jp text-xs tracking-widest text-shu">注文内容</span>
          </h2>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {items.map((i) => (
              <li key={i.key} className="flex items-center gap-3">
                <span
                  className="relative size-16 shrink-0 overflow-hidden rounded-xl border-2 border-ink"
                  style={{ backgroundColor: tintBg(catalog.anime(i.product.anime)?.color ?? "#888888") }}
                >
                  <ProductVisual product={i.product} color={i.color} className="absolute inset-0.5" />
                  <span className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-paper">
                    {i.qty}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{i.product.name}</span>
                  <span className="block text-xs text-ink/55">
                    {i.color.name} · {i.size}
                  </span>
                </span>
                <span className="text-sm font-bold tabular-nums">{formatBDT(i.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t-2 border-dashed border-ink/20 pt-5">
            {coupon ? (
              <div className="flex items-center justify-between rounded-xl border-2 border-ink bg-kin/40 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 font-bold">
                  <Tag className="size-4" /> {coupon.code} · {coupon.label}
                </span>
                <button type="button" onClick={() => setCoupon(null)} className="rounded p-1 hover:bg-ink/10" aria-label="Remove coupon">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCoupon();
                      }
                    }}
                    placeholder="Coupon code"
                    aria-label="Coupon code"
                    className={cn(input(couponError), "h-11 uppercase placeholder:normal-case")}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={checkingCoupon || !couponInput.trim()}
                    className={btn({ variant: "outline", size: "sm", className: "h-11" })}
                  >
                    {checkingCoupon ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponError && <p className="mt-1.5 text-xs font-semibold text-shu">{couponError}</p>}
              </div>
            )}
          </div>

          <dl className="mt-5 space-y-2.5 text-sm">
            <Row label="Subtotal" value={formatBDT(subtotal)} />
            <Row
              label="Delivery"
              value={fee === null ? <span className="text-ink/45">Select district</span> : fee === 0 ? <span className="text-shu">FREE</span> : formatBDT(fee)}
            />
            {discount > 0 && <Row label="Discount" value={<span className="text-shu">−{formatBDT(discount)}</span>} />}
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t-2 border-ink pt-4">
            <span className="font-bold uppercase tracking-wide">Total</span>
            <span className="text-3xl font-extrabold tabular-nums">{formatBDT(total)}</span>
          </div>

          {formError && (
            <p className="mt-4 rounded-xl border-2 border-shu bg-shu/10 px-3 py-2 text-sm font-semibold text-shu" role="alert">
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={placing || placed}
            className={btn({ size: "lg", className: cn("relative mt-5 w-full overflow-hidden", (placing || placed) && "is-charging") })}
          >
            {(placing || placed) && <span aria-hidden className="charge-meter" />}
            {placing || placed ? (
              <span className="relative flex items-center gap-2">
                <Shuriken className="size-5 animate-[fx-spin_0.6s_linear_infinite]" /> Placing order…
              </span>
            ) : (
              <>Place order · {formatBDT(total)}</>
            )}
          </button>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink/55">
            <Lock className="mt-0.5 size-3.5 shrink-0" />
            <span>
              We&apos;ll call you to confirm before shipping. By ordering you agree to our{" "}
              <Link href="/help#exchange" className="underline">
                exchange policy
              </Link>
              .
            </span>
          </p>
        </div>
      </aside>
    </form>
  );
}

function input(error?: string) {
  return cn(
    "h-12 w-full rounded-xl border-2 bg-card px-3.5 text-base font-medium outline-none sm:text-[15px] transition-colors placeholder:text-ink/35 focus:border-ink focus:shadow-panel-sm",
    error ? "border-shu" : "border-ink/20",
  );
}

function Panel({ step, jp, title, children }: { step: string; jp: string; title: string; children: ReactNode }) {
  return (
    <section className="sm-rise rounded-3xl border-2 border-ink bg-paper p-5 sm:p-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl border-2 border-ink bg-ink font-display text-sm text-paper">{step}</span>
        <div>
          <p className="font-jp text-[10px] font-bold tracking-[0.3em] text-shu">{jp}</p>
          <h2 className="font-display text-xl uppercase leading-none">{title}</h2>
        </div>
      </header>
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={`f-${id}`} className="mb-1.5 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider">
        {label}
        {optional && <span className="font-semibold normal-case tracking-normal text-ink/40">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-shu" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ink/50">{hint}</p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink/60">{label}</dt>
      <dd className="font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function StepDot({ n }: { n: number }) {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink bg-kin text-xs font-extrabold">{n}</span>
  );
}

function Shuriken({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 1.5 14.2 9.8 22.5 12 14.2 14.2 12 22.5 9.8 14.2 1.5 12 9.8 9.8Z"
        fill="currentColor"
        stroke="var(--color-sumi)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="var(--color-shu)" stroke="var(--color-sumi)" strokeWidth="1" />
    </svg>
  );
}
