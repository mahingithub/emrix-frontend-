import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame, Printer, RefreshCw, Shirt, Truck } from "lucide-react";
import { FIT_LABEL, TEE } from "@emrix/shared/catalog";
import { PRODUCT_CUTOUTS } from "@emrix/shared/catalog-media";
import type { SocialLinks } from "@emrix/shared/settings";
import type { Anime, Fit, Product } from "@emrix/shared/types";
import { cn } from "@emrix/shared/utils";
import { btn } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/bits";
import { Marquee } from "@/components/ui/marquee";
import { FacebookIcon, MessengerIcon } from "@/components/ui/social-icons";
import { Countdown } from "@/components/countdown";
import { ProductCard } from "@/components/product/product-card";
import { ProductVisual, productPhotos } from "@emrix/shared/ui/product-visual";

/* ---------- Crossing marquee bands ---------- */

export function MarqueeBands({ animes }: { animes: Anime[] }) {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16" aria-label="Anime we print">
      <div className="sm-band relative -mx-[10%] -rotate-2 border-y-2 border-ink bg-shu py-3 text-white">
        <Marquee
          items={animes.map((a) => (
            <span key={a.slug} className="flex items-baseline gap-3 whitespace-nowrap">
              <span className="font-display text-xl uppercase sm:text-2xl">{a.name}</span>
              <span className="font-jp text-sm font-bold opacity-80">{a.jp}</span>
            </span>
          ))}
        />
      </div>
      <div className="sm-band sm-band-rev relative -mx-[10%] -mt-3 rotate-[1.5deg] border-y-2 border-sumi bg-kin py-3 text-sumi">
        <Marquee
          reverse
          separator={<span className="text-shu">✦</span>}
          items={[
            "Premium heavyweight cotton",
            "Cash on Delivery",
            "64 districts",
            "bKash · Nagad",
            "7-day exchange",
            "Designed in Dhaka",
          ].map((t) => (
            <span key={t} className="whitespace-nowrap text-sm font-extrabold uppercase tracking-[0.2em]">
              {t}
            </span>
          ))}
        />
      </div>
    </section>
  );
}

/* ---------- Limited drop ---------- */

/** The numbered drop picked in Admin → Settings: countdown to its end, real pieces sold vs edition size. */
export function LimitedDrop({ drop, anime }: { drop: { product: Product; endsAt: string; total: number }; anime?: Anime }) {
  const p = drop.product;
  const claimed = Math.min(drop.total, p.sold);
  const left = drop.total - claimed;
  // A background-free version sits best on the coloured disc; otherwise the product's own photo.
  const cutout = PRODUCT_CUTOUTS[p.slug];
  const photo = productPhotos(p)[0];
  const words = p.name.split(" ");
  const cut = Math.max(1, Math.ceil(words.length / 2));
  return (
    <section className="relative overflow-hidden border-y-2 border-ink bg-sumi bg-[radial-gradient(ellipse_at_28%_50%,rgb(109_40_217/0.35),transparent_60%),radial-gradient(ellipse_at_90%_10%,rgb(229_50_43/0.18),transparent_50%)] text-washi">
      <div className="speedlines absolute inset-0 [--line-color:rgb(255_255_255/0.035)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="relative order-2 min-w-0 lg:order-1">
          <div className="sm-spin relative mx-auto aspect-square max-w-[480px]">
            <div className="absolute inset-[1%] rounded-full border-2 border-dashed border-washi/20" />
            <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_50%_35%,var(--color-shu),var(--color-shu-dark))]" />
            {cutout ? (
              <div className="absolute inset-[9%]">
                <Image
                  src={cutout}
                  alt={`${p.name} tee`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-contain drop-shadow-[0_24px_28px_rgb(0_0_0/0.55)]"
                />
              </div>
            ) : photo ? (
              <div className="absolute inset-[11%] overflow-hidden rounded-full border-4 border-sumi">
                <Image src={photo.url} alt={photo.alt} fill sizes="(max-width: 1024px) 80vw, 400px" className="object-cover" />
              </div>
            ) : (
              <ProductVisual product={p} className="absolute inset-[14%]" />
            )}
            {p.jp && (
              <span className="writing-vertical absolute left-0 top-2 select-none font-jp text-3xl font-black tracking-[0.2em] text-washi sm:text-5xl">
                {p.jp}
              </span>
            )}
            {left > 0 && (
              <span className="absolute bottom-[8%] right-0 rotate-6 rounded-lg border-2 border-ink bg-kin px-3 py-1.5 font-display text-sm text-sumi shadow-panel-shu sm:text-base">
                No. {claimed + 1} / {drop.total}
              </span>
            )}
          </div>
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          <span className="inline-flex items-center gap-2 rounded-md bg-shu px-2.5 py-1 text-xs font-extrabold uppercase tracking-widest">
            <Flame className="size-4" /> Limited drop · <span className="font-jp">限定</span>
          </span>
          <h2 className="sm-slam mt-5 font-display text-[2.6rem] uppercase leading-[0.9] sm:text-6xl lg:text-7xl">
            {words.slice(0, cut).join(" ")}
            {words.length > cut && (
              <>
                <br />
                <span className="text-outline [--stroke-c:var(--color-washi)]">{words.slice(cut).join(" ")}</span>
              </>
            )}
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-washi/70">
            {p.description} Only {drop.total} numbered pieces. When they&apos;re gone, they&apos;re gone.
          </p>

          <Countdown target={drop.endsAt} className="mt-8" />

          <div className="mt-8 max-w-sm">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-kin">{claimed} claimed</span>
              <span className="text-washi/50">{left ? `${left} left` : "All claimed"}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-washi/80 bg-sumi">
              <div className="h-full bg-kin" style={{ width: `${(claimed / drop.total) * 100}%` }} />
            </div>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={`/product/${p.slug}`} className={btn({ size: "lg" })}>
              {left ? <>Get yours — ৳{p.price}</> : "See the drop"} <ArrowRight className="size-5" />
            </Link>
            {anime && (
              <Link href={`/anime/${anime.slug}`} className={btn({ variant: "ghost", size: "lg", className: "text-washi hover:bg-washi/10" })}>
                Full {anime.name} collection
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Horizontal product rail ---------- */

export function ProductRail({ products, animes }: { products: Product[]; animes: Anime[] }) {
  return (
    <div className="sm-stagger no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-2 scroll-px-4 sm:gap-5 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
      {products.map((p) => {
        const anime = animes.find((a) => a.slug === p.anime);
        return anime ? (
          <ProductCard key={p.id} product={p} anime={anime} className="w-[64vw] shrink-0 snap-start sm:w-64 lg:w-[17.5rem]" />
        ) : null;
      })}
    </div>
  );
}

/* ---------- Fit picker ---------- */

const FITS: { fit: Fit; slug: string; jp: string; desc: string; specs: string[]; bg: string; muted: string; chip: string }[] = [
  {
    fit: "regular",
    slug: "shadow-monarch-tee",
    jp: "レギュラー",
    desc: "Classic cut, true to size. The everyday tee you'll reach for first.",
    specs: ["180 GSM", "Chest 38–46″", "True to size"],
    bg: "bg-card",
    muted: "text-ink/70",
    chip: "border-ink bg-paper",
  },
  {
    fit: "oversized",
    slug: "arise-oversized",
    jp: "オーバーサイズ",
    desc: "Boxy body, dropped shoulders, longer sleeves. The streetwear silhouette.",
    specs: ["220 GSM", "Chest 42–50″", "Drop shoulder"],
    bg: "bg-kin text-sumi",
    muted: "text-sumi/70",
    chip: "border-sumi bg-washi",
  },
];

export function FitPicker({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
      <SectionHeading index="04" jp="シルエット" title="Pick your fit" href="/help#size-guide" linkLabel="Size guide" />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {FITS.map((f) => {
          const product = products.find((p) => p.slug === f.slug) ?? products.find((p) => p.fit === f.fit);
          if (!product) return null;
          return (
            <Link
              key={f.fit}
              href={`/shop?fit=${f.fit}`}
              className={cn(
                f.fit === "regular" ? "sm-left" : "sm-right",
                "group relative flex min-h-[320px] overflow-hidden rounded-3xl border-2 border-ink p-6 shadow-panel-sm transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-panel sm:p-8",
                f.bg,
              )}
            >
              <div className="relative z-10 flex max-w-[60%] flex-col sm:max-w-[55%]">
                <p className="font-jp text-xs font-bold tracking-[0.3em] text-shu">{f.jp}</p>
                <h3 className="mt-2 font-display text-3xl uppercase leading-none sm:text-4xl">
                  {f.fit === "regular" ? "Regular" : "Oversized"}
                </h3>
                <p className={cn("mt-3 text-sm leading-relaxed", f.muted)}>{f.desc}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {f.specs.map((s) => (
                    <li key={s} className={cn("rounded-md border-2 px-2 py-0.5 text-[11px] font-bold", f.chip)}>
                      {s}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-extrabold uppercase tracking-wide">
                  Shop {FIT_LABEL[f.fit].split(" ·")[0].toLowerCase()}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
              <ProductVisual
                product={product}
                color={product.colors.find((c) => c.name === (f.fit === "regular" ? TEE.black : TEE.white).name) ?? product.colors[0]}
                photoClassName="left-auto! w-[45%]! rounded-2xl"
                className="absolute -right-[14%] bottom-2 h-[56%] w-auto drop-shadow-[0_18px_18px_rgb(0_0_0/0.25)] transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105 sm:-right-[6%] sm:top-0 sm:bottom-0 sm:my-auto sm:h-[92%]"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Perks ---------- */

const PERKS = [
  { Icon: Shirt, title: "Heavyweight cotton", text: "180–220 GSM combed cotton, bio-washed & pre-shrunk." },
  { Icon: Printer, title: "Prints that last", text: "Wash-tested prints that won't crack, peel or fade." },
  { Icon: Truck, title: "COD in 64 districts", text: "Pay cash when it reaches your door. bKash & Nagad too." },
  { Icon: RefreshCw, title: "7-day exchange", text: "Wrong size? We'll swap it, no stress." },
];

export function Perks() {
  return (
    <section className="border-y-2 border-ink bg-card/60">
      <div className="sm-stagger mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {PERKS.map(({ Icon, title, text }) => (
          <div
            key={title}
            className="flex flex-col gap-3 border-ink p-5 odd:border-r-2 [&:nth-child(-n+2)]:border-b-2 sm:flex-row sm:items-start sm:p-7 lg:border-r-2 lg:first:border-l-2 lg:[&:nth-child(-n+2)]:border-b-0"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-kin shadow-panel-sm">
              <Icon className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wide">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink/60 sm:text-[13px]">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Request a design ---------- */

export function RequestCta({ social }: { social: SocialLinks }) {
  if (!social.messenger && !social.facebook) return null;
  return (
    <section className="px-4 pb-16 lg:px-8 lg:pb-24">
      <div className="sm-zoom relative mx-auto max-w-7xl overflow-hidden rounded-3xl border-2 border-ink bg-shu text-white shadow-panel">
        <div className="halftone absolute inset-0 [--dot-color:rgb(255_255_255/0.16)] [--dot-size:12px]" />
        <span aria-hidden className="sm-drift absolute -right-6 -top-14 select-none font-display text-[14rem] leading-none text-white/10 sm:text-[18rem]">
          願
        </span>
        <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-5 lg:items-center lg:p-16">
          <div className="lg:col-span-3">
            <p className="font-jp text-sm font-bold tracking-[0.4em] text-white/75">リクエスト受付中</p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] sm:text-5xl lg:text-6xl">
              Your anime
              <br />
              isn&apos;t here yet?
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-white/85">
              Tell us which series or character you want next. The most-requested designs make it into the next drop.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2 lg:flex-col lg:items-end">
            {social.messenger && (
              <a href={social.messenger} target="_blank" rel="noreferrer" className={btn({ variant: "kin", size: "lg" })}>
                <MessengerIcon className="size-5" /> Request on Messenger
              </a>
            )}
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noreferrer" className={btn({ variant: "outline", size: "lg" })}>
                <FacebookIcon className="size-5" /> Join the community
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
