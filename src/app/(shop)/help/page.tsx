import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown, Clock, Mail, Phone } from "lucide-react";
import { telHref } from "@emrix/shared/settings";
import { formatBDT } from "@emrix/shared/utils";
import { btn } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { MeasureDiagram, SizeTable } from "@/components/product/size-guide";
import { MessengerIcon } from "@/components/ui/social-icons";
import { getSettings } from "@/lib/backend";

export const metadata: Metadata = {
  title: "Help, delivery & exchange",
  description: "Delivery charges, payment options, size guide and exchange policy for EMRIX anime tees.",
};

const SECTIONS = [
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "size-guide", label: "Size guide" },
  { id: "exchange", label: "Exchange" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

const FAQ = [
  {
    q: "What fabric do you use?",
    a: "100% combed cotton: 180 GSM for regular fit and 220 GSM heavyweight for oversized. Bio-washed and pre-shrunk.",
  },
  {
    q: "Will the print crack or fade after washing?",
    a: "Our prints are wash-tested. Turn the tee inside out, wash cold and avoid ironing directly on the print, and it'll stay sharp.",
  },
  {
    q: "Can I open the parcel before paying?",
    a: "Yes. You can check the product in front of the rider before paying for a Cash on Delivery order.",
  },
  {
    q: "Do you take custom or bulk orders?",
    a: "Yes, for clubs, events and friend groups. Message us on Messenger with the design idea and quantity.",
  },
  {
    q: "How do I know my order was received?",
    a: "You'll see an order ID right after checkout, and our team calls to confirm before printing and shipping.",
  },
];

export default async function HelpPage() {
  const { delivery, wallets, phone, email, hours, social } = await getSettings();
  const walletList = [
    wallets.bkash && { name: "bKash", number: wallets.bkash },
    wallets.nagad && { name: "Nagad", number: wallets.nagad },
  ].filter((w): w is { name: string; number: string } => !!w);
  const contact = [
    { Icon: Phone, label: "Call / WhatsApp", value: phone, href: phone && telHref(phone) },
    { Icon: Mail, label: "Email", value: email, href: email && `mailto:${email}` },
    { Icon: Clock, label: "Hours", value: hours },
  ].filter((c) => c.value);
  return (
    <>
      <PageHeader jp="ヘルプ" title="Help centre" kanji="助" crumbs={[{ href: "/", label: "Home" }, { label: "Help" }]}>
        <nav className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4" aria-label="Help sections">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 rounded-full border-2 border-ink bg-card px-3.5 py-1.5 text-sm font-bold hover:bg-kin"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </PageHeader>

      <div className="mx-auto max-w-4xl space-y-16 px-4 py-12 lg:px-8 lg:py-16">
        <Section id="delivery" jp="配送" title="Delivery">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { zone: "Inside Dhaka", fee: formatBDT(delivery.insideDhaka), time: delivery.insideDays },
              { zone: "Outside Dhaka", fee: formatBDT(delivery.outsideDhaka), time: delivery.outsideDays },
              ...(delivery.freeOver > 0 ? [{ zone: `Orders over ${formatBDT(delivery.freeOver)}`, fee: "FREE", time: "Anywhere in BD" }] : []),
            ].map((z) => (
              <div key={z.zone} className="rounded-2xl border-2 border-ink bg-card p-5 shadow-panel-sm">
                <p className="text-xs font-extrabold uppercase tracking-widest text-ink/50">{z.zone}</p>
                <p className="mt-2 font-display text-3xl">{z.fee}</p>
                <p className="mt-1 text-sm text-ink/60">{z.time}</p>
              </div>
            ))}
          </div>
          <p className="mt-5">
            We deliver to all 64 districts through trusted courier partners. Orders are printed and packed within 24 hours
            of confirmation, excluding Fridays and public holidays.
          </p>
        </Section>

        <Section id="payment" jp="お支払い" title="Payment">
          <ul className="space-y-3">
            <li>
              <b>Cash on Delivery:</b> pay the rider in cash when your parcel arrives. Available everywhere in Bangladesh.
            </li>
            {walletList.length > 0 && (
              <li>
                <b>{walletList.map((w) => w.name).join(" / ")}:</b> Send Money to{" "}
                {walletList.map((w, i) => (
                  <span key={w.name}>
                    {i > 0 && " or "}
                    <span className="font-mono">{w.number}</span> ({w.name})
                  </span>
                ))}
                , then enter your number and TrxID at checkout. We verify every payment manually.
              </li>
            )}
          </ul>
        </Section>

        <Section id="size-guide" jp="サイズ表" title="Size guide">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-bold">Regular fit</h3>
              <SizeTable fit="regular" />
            </div>
            <div>
              <h3 className="mb-3 font-bold">Oversized · drop shoulder</h3>
              <SizeTable fit="oversized" />
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-6 rounded-2xl border-2 border-ink bg-card p-5 sm:flex-row sm:items-center">
            <div className="flex h-36 justify-center">
              <MeasureDiagram fit="regular" />
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <b>A · Chest:</b> lay a tee you love flat, measure armpit to armpit, then double it.
              </li>
              <li>
                <b>B · Length:</b> from the highest point of the shoulder down to the hem.
              </li>
              <li>All measurements are in inches, ±0.5″ tolerance.</li>
            </ul>
          </div>
        </Section>

        <Section id="exchange" jp="交換" title="Exchange & returns">
          <ul className="list-disc space-y-2 pl-5">
            <li>Size exchange within 7 days of delivery, as long as the tee is unworn, unwashed and has its tag.</li>
            <li>Received a damaged or wrong item? Tell us within 48 hours and we&apos;ll replace it for free.</li>
            <li>Exchange delivery charge applies for size swaps, based on your zone.</li>
            <li>Limited drops can be exchanged for size only, subject to stock.</li>
          </ul>
        </Section>

        <Section id="faq" jp="よくある質問" title="FAQ">
          <div className="divide-y-2 divide-ink/10 rounded-2xl border-2 border-ink bg-card">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold">
                  {f.q}
                  <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section id="contact" jp="連絡先" title="Contact us">
          {contact.length > 0 && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              {contact.map(({ Icon, label, value, href }) => (
                <div key={label} className="rounded-2xl border-2 border-ink bg-card p-5">
                  <Icon className="size-5 text-shu" />
                  <p className="mt-3 text-xs font-extrabold uppercase tracking-widest text-ink/50">{label}</p>
                  {href ? (
                    <a href={href} className="mt-1 block break-all font-bold hover:text-shu">
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 font-bold">{value}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {social.messenger && (
            <a href={social.messenger} target="_blank" rel="noreferrer" className={btn({ variant: "dark", className: "mb-4" })}>
              <MessengerIcon className="size-5" /> Message us on Messenger
            </a>
          )}
          <p className="text-sm">
            Already ordered?{" "}
            <Link href="/track" className="font-bold underline underline-offset-4">
              Track your order
            </Link>
          </p>
        </Section>
      </div>
    </>
  );
}

function Section({ id, jp, title, children }: { id: string; jp: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <p className="font-jp text-xs font-bold tracking-[0.3em] text-shu">{jp}</p>
      <h2 className="mt-1 font-display text-3xl uppercase">{title}</h2>
      <div className="mt-6 leading-relaxed text-ink/80">{children}</div>
    </section>
  );
}
