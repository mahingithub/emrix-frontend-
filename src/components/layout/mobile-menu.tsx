"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, PackageSearch, Phone, X } from "lucide-react";
import { telHref } from "@emrix/shared/settings";
import { cn, tintBg } from "@emrix/shared/utils";
import { Logo } from "@emrix/shared/ui/logo";
import { useCatalog } from "@/components/catalog-context";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "@/components/ui/social-icons";

const LINKS = [
  { href: "/shop", label: "Shop All", jp: "全商品" },
  { href: "/shop?tag=new", label: "New Drops", jp: "新作" },
  { href: "/shop?fit=oversized", label: "Oversized", jp: "オーバーサイズ" },
  { href: "/shop?sort=popular", label: "Best Sellers", jp: "人気" },
  { href: "/anime", label: "All Anime", jp: "作品一覧" },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { animes, settings } = useCatalog();
  const socials = [
    { href: settings.social.facebook, Icon: FacebookIcon, label: "Facebook" },
    { href: settings.social.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: settings.social.tiktok, Icon: TiktokIcon, label: "TikTok" },
  ].filter((s) => s.href);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-[60] lg:hidden", !open && "pointer-events-none")} inert={!open}>
      <div className={cn("absolute inset-0 bg-sumi/70 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col overflow-y-auto border-r-2 border-ink bg-paper transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
          <Logo />
          <button onClick={onClose} className="grid size-10 place-items-center rounded-lg border-2 border-ink bg-card" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="px-4 py-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className="flex items-center justify-between border-b border-ink/10 py-3.5"
            >
              <span className="font-display text-xl uppercase">{l.label}</span>
              <span className="flex items-center gap-2 font-jp text-[10px] font-bold text-ink/45">
                {l.jp} <ArrowRight className="size-4 text-ink" />
              </span>
            </Link>
          ))}
        </nav>

        <div className="px-4 pb-4">
          <p className="font-jp text-[10px] font-bold tracking-[0.3em] text-shu">作品 · ANIME</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {animes.map((a) => (
              <Link
                key={a.slug}
                href={`/anime/${a.slug}`}
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg border-2 border-ink p-2 text-xs font-bold"
                style={{ backgroundColor: tintBg(a.color) }}
              >
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-md font-jp text-sm font-black"
                  style={{ backgroundColor: a.color, color: a.onColor }}
                >
                  {a.kanji}
                </span>
                <span className="truncate">{a.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-3 border-t-2 border-ink bg-sumi px-4 py-5 text-washi">
          <Link href="/track" onClick={onClose} className="flex items-center gap-2 text-sm font-bold">
            <PackageSearch className="size-4 text-kin" /> Track your order
          </Link>
          {settings.phone && (
            <a href={telHref(settings.phone)} className="flex items-center gap-2 text-sm font-bold">
              <Phone className="size-4 text-kin" /> {settings.phone}
            </a>
          )}
          {socials.length > 0 && (
            <div className="flex gap-2 pt-1">
              {socials.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-9 place-items-center rounded-lg border border-washi/30 hover:bg-washi hover:text-sumi"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
