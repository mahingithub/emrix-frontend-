import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Anime } from "@emrix/shared/types";
import { telHref, walletsOn, type StoreSettings } from "@emrix/shared/settings";
import { PaymentPills } from "@/components/ui/bits";
import { Logo } from "@emrix/shared/ui/logo";
import { FacebookIcon, InstagramIcon, MessengerIcon, TiktokIcon } from "@/components/ui/social-icons";

const columns = (animes: Anime[]) => [
  {
    title: "Shop",
    jp: "ショップ",
    links: [
      { href: "/shop", label: "All T-Shirts" },
      { href: "/shop?tag=new", label: "New Drops" },
      { href: "/shop?fit=oversized", label: "Oversized Fit" },
      { href: "/shop?sort=popular", label: "Best Sellers" },
      { href: "/shop?tag=limited", label: "Limited Edition" },
    ],
  },
  {
    title: "Anime",
    jp: "作品",
    links: [
      ...animes.slice(0, 5).map((a) => ({ href: `/anime/${a.slug}`, label: a.name })),
      { href: "/anime", label: "View all →" },
    ],
  },
  {
    title: "Help",
    jp: "ヘルプ",
    links: [
      { href: "/track", label: "Track Order" },
      { href: "/help#size-guide", label: "Size Guide" },
      { href: "/help#delivery", label: "Delivery Info" },
      { href: "/help#exchange", label: "Exchange & Returns" },
      { href: "/help#faq", label: "FAQ" },
    ],
  },
];

export function Footer({ animes, settings }: { animes: Anime[]; settings: StoreSettings }) {
  const socials = [
    { href: settings.social.facebook, Icon: FacebookIcon, label: "Facebook" },
    { href: settings.social.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: settings.social.tiktok, Icon: TiktokIcon, label: "TikTok" },
    { href: settings.social.messenger, Icon: MessengerIcon, label: "Messenger" },
  ].filter((s) => s.href);
  const contact = [
    { Icon: Phone, text: settings.phone, href: settings.phone && telHref(settings.phone) },
    { Icon: Mail, text: settings.email, href: settings.email && `mailto:${settings.email}` },
    { Icon: MapPin, text: settings.address },
    { Icon: Clock, text: settings.hours },
  ].filter((c) => c.text);
  return (
    <footer className="relative mt-auto overflow-hidden bg-sumi text-washi">
      <div className="halftone absolute inset-0 [--dot-color:rgb(255_255_255/0.05)]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 lg:px-8 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo invert />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-washi/65">
              Anime streetwear designed in Dhaka for the nakama of Bangladesh. Heavy cotton, bold prints, and
              delivery to every district.
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex gap-2">
                {socials.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noreferrer"
                    className="grid size-10 place-items-center rounded-xl border-2 border-washi/25 transition-colors hover:border-kin hover:bg-kin hover:text-sumi"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {columns(animes).map((col) => (
              <div key={col.title}>
                <p className="font-jp text-[10px] font-bold tracking-[0.3em] text-shu">{col.jp}</p>
                <h3 className="mt-1 font-display text-sm uppercase">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-washi/65 transition-colors hover:text-kin">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            {contact.length > 0 && (
              <>
                <p className="font-jp text-[10px] font-bold tracking-[0.3em] text-shu">連絡先</p>
                <h3 className="mt-1 font-display text-sm uppercase">Contact</h3>
                <ul className="mt-4 mb-6 space-y-3 text-sm text-washi/70">
                  {contact.map(({ Icon, text, href }) => (
                    <li key={text} className="flex gap-2.5">
                      <Icon className="mt-0.5 size-4 shrink-0 text-kin" />
                      {href ? (
                        <a href={href} className="break-all hover:text-kin">
                          {text}
                        </a>
                      ) : (
                        text
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="text-[10px] font-bold uppercase tracking-widest text-washi/45">We accept</p>
            <PaymentPills className="mt-2" wallets={walletsOn(settings)} />
          </div>
        </div>

        <div aria-hidden className="relative mt-16 select-none">
          <p className="text-outline font-display text-[22vw] leading-[0.8] tracking-tighter [--stroke-c:rgb(244_241_234/0.18)] [--stroke-w:1.5px] lg:text-[15rem]">
            EMRIX
          </p>
          <p className="absolute bottom-[12%] right-0 font-jp text-sm font-black tracking-[0.5em] text-shu sm:text-lg">
            エムリックス
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-washi/15 py-6 text-xs text-washi/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} EMRIX. Made in Dhaka, Bangladesh 🇧🇩</p>
          <p className="font-jp tracking-widest">ありがとう · Thank you for shopping with us</p>
        </div>
      </div>
    </footer>
  );
}
