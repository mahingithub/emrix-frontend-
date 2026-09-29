import type { Metadata } from "next";
import { Check } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getSettings } from "@/lib/backend";

export const metadata: Metadata = { title: "Checkout" };

const STEPS = [
  { label: "Cart", jp: "カート", done: true },
  { label: "Details", jp: "情報入力", active: true },
  { label: "Done", jp: "完了" },
];

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-jp text-xs font-bold tracking-[0.35em] text-shu">ご注文手続き</p>
          <h1 className="mt-1 font-display text-4xl uppercase leading-none sm:text-5xl">Checkout</h1>
        </div>
        <ol className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s.label} className="flex items-center gap-2">
              {i > 0 && <span className="h-0.5 w-6 bg-ink/25" />}
              <span
                className={
                  s.active
                    ? "step-live flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-3 py-1 text-xs font-bold text-paper"
                    : s.done
                      ? "flex items-center gap-2 rounded-full border-2 border-ink bg-kin px-3 py-1 text-xs font-bold"
                      : "flex items-center gap-2 rounded-full border-2 border-ink/20 px-3 py-1 text-xs font-bold text-ink/45"
                }
              >
                {s.done && <Check className="size-3.5" strokeWidth={3} />}
                {s.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <CheckoutForm delivery={settings.delivery} wallets={settings.wallets} />
    </div>
  );
}
