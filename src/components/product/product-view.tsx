"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";
import { Banknote, ChevronDown, Flame, Play, RefreshCw, Ruler, ScanFace, Truck } from "lucide-react";
import { FIT_LABEL, SIZES, stockOf, totalStock } from "@emrix/shared/catalog";
import { liveDrop, walletsOn } from "@emrix/shared/settings";
import { useCatalog } from "@/components/catalog-context";
import type { Anime, Product, ProductImage, ProductVideo, Size, TeeColor } from "@emrix/shared/types";
import { cn, formatBDT, tintBg } from "@emrix/shared/utils";
import { btn } from "@/components/ui/button";
import { Badge, DiscountBadge, Price, Stars } from "@/components/ui/bits";
import { MAX_QTY, useCart } from "@/components/cart/cart-context";
import { flyToCart } from "@/components/ui/impact";
import { QtyStepper } from "@/components/cart/qty-stepper";
import { ProductPhoto, ProductVisual, productPhotos, type TeeView } from "@emrix/shared/ui/product-visual";
import { SizeGuideModal } from "./size-guide";
import { TryOnStudio } from "@/components/try-on/lazy";

export function ProductView({ product, anime, tryOn: tryOnEnabled = false }: { product: Product; anime: Anime; tryOn?: boolean }) {
  const { add } = useCart();
  const { settings } = useCatalog();
  const router = useRouter();
  const [color, setColor] = useState<TeeColor>(product.colors[0]);
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [slide, setSlide] = useState(0);
  const [sizeError, setSizeError] = useState(0);
  const [guideOpen, setGuideOpen] = useState(false);
  const closeGuide = useCallback(() => setGuideOpen(false), []);
  const [tryOn, setTryOn] = useState(false);
  const closeTryOn = useCallback(() => setTryOn(false), []);

  // Keep the pictured colour explicit when a variant has no dedicated photograph.
  const photos = productPhotos(product, color.name);
  type Slide = { key: string; label: string; photo: ProductImage | null; view: TeeView; video?: ProductVideo };
  const slides: Slide[] = photos.length
    ? photos.map((photo, i) => ({ key: photo.id, label: photo.id.startsWith("catalog-") ? "Design preview" : `Photo ${i + 1}`, photo, view: "front" as TeeView }))
    : [{ key: "front", label: "Preview", photo: null, view: "front" as TeeView }];
  // The clip sits right after the main photo, for the colour it shows.
  const video = product.video && (!product.video.color || product.video.color === color.name) ? product.video : undefined;
  if (video) slides.splice(1, 0, { key: "video", label: "Video", photo: null, view: "front", video });
  const current = slides[Math.min(slide, slides.length - 1)];

  const available = (s: Size) => stockOf(product, color.name, s);
  const maxQty = size ? Math.min(MAX_QTY, available(size)) : MAX_QTY;
  const colorSoldOut = SIZES.every((s) => available(s) === 0);
  const soldOut = totalStock(product) === 0;
  const pickColor = (c: TeeColor) => {
    setColor(c);
    setSlide(0);
    if (size && stockOf(product, c.name, size) === 0) setSize(null);
    setQty((q) => Math.max(1, Math.min(q, size ? stockOf(product, c.name, size) || 1 : q)));
  };

  const gsm = product.fit === "oversized" ? 220 : 180;
  // Numbered drop (Admin → Settings): pieces left = edition size minus pieces sold.
  const drop = liveDrop(settings, [product]);
  const limitedLeft = drop ? Math.max(0, drop.total - product.sold) : null;
  const { delivery } = settings;
  const wallets = walletsOn(settings);

  const commit = (buyNow: boolean, origin?: Element) => {
    if (soldOut || colorSoldOut) return;
    if (!size) {
      setSizeError((n) => n + 1);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (buyNow) {
      add(product, size, color, qty, false);
      router.push("/checkout");
      return;
    }
    // Snapshot the choice: the tee lands in the cart after its flight.
    const [s, c, q] = [size, color, qty];
    flyToCart(origin ?? null, current.photo?.url ?? photos[0]?.url).then(() => add(product, s, c, q));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12">
      {/* Gallery: photos are 4:5, so the frame is capped by screen height to keep the whole tee in view. */}
      <div className="lg:w-[min(43rem,calc(55vw-2rem),calc((100svh-11rem)*0.8))]">
        <div className="mx-auto max-w-[max(20rem,calc((100svh-9rem)*0.8))] lg:sticky lg:top-24 lg:max-w-none">
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-3xl border-2 border-ink"
            style={{ backgroundColor: tintBg(anime.color) }}
          >
            {current.video ? (
              <>
                {/* The clip is taller than the frame: a blurred copy of its first frame fills the sides. */}
                {current.video.poster && (
                  <Image src={current.video.poster} alt="" fill sizes="320px" className="scale-110 object-cover opacity-80 blur-2xl" />
                )}
                <video
                  key={current.video.url}
                  src={current.video.url}
                  poster={current.video.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label={`${product.name} video`}
                  className="absolute inset-0 size-full object-contain"
                />
              </>
            ) : current.photo ? (
              <ProductPhoto
                key={current.key}
                photo={current.photo}
                eager
                sizes="(max-width: 1024px) 100vw, 640px"
                className="animate-pop"
              />
            ) : (
              <ProductVisual product={product} color={color} />
            )}
            {product.badges.length > 0 && (
              <span className="absolute left-3 top-3 flex flex-wrap gap-1">
                {product.badges.map((b) => (
                  <Badge key={b} type={b} compact />
                ))}
              </span>
            )}
            {tryOnEnabled && photos.length > 0 && (
              <button
                onClick={() => setTryOn(true)}
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border-2 border-sumi bg-kin px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-sumi shadow-[2px_2px_0_0_var(--color-sumi)] transition-transform hover:-translate-y-px"
                data-impact
              >
                <ScanFace className="size-4" /> Try on
              </button>
            )}
          </div>

          {current.photo?.color && current.photo.color !== color.name && (
            <p className="mt-3 text-xs text-ink/65" role="status">
              Shown in {current.photo.color}. You selected {color.name}.
            </p>
          )}
          {slides.length > 1 && <div className={cn("mt-3 grid gap-3", slides.length > 3 ? "grid-cols-4 sm:grid-cols-5" : "grid-cols-3")}>
            {slides.map((v, i) => (
              <button
                key={v.key}
                onClick={() => setSlide(i)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-2xl border-2 transition-all",
                  current.key === v.key ? "border-ink shadow-panel-sm" : "border-ink/15 opacity-70 hover:opacity-100",
                )}
                style={{ backgroundColor: tintBg(anime.color) }}
                aria-label={`Show ${v.label}`}
                aria-pressed={current.key === v.key}
              >
                {v.video ? (
                  <>
                    {v.video.poster && <ProductPhoto photo={{ id: "poster", url: v.video.poster, alt: "" }} sizes="160px" />}
                    <span className="absolute inset-0 grid place-items-center bg-sumi/25">
                      <span className="grid size-9 place-items-center rounded-full bg-washi/90 text-sumi shadow">
                        <Play className="ml-0.5 size-4 fill-current" />
                      </span>
                    </span>
                  </>
                ) : v.photo ? (
                  <ProductPhoto photo={{ ...v.photo, alt: "" }} sizes="160px" />
                ) : (
                  <ProductVisual product={product} color={color} />
                )}
              </button>
            ))}
          </div>}
        </div>
      </div>

      {/* Details */}
      <div className="lg:max-w-xl">
        <Link
          href={`/anime/${anime.slug}`}
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card py-1 pl-1 pr-3 text-xs font-bold hover:bg-kin"
        >
          <span className="grid size-6 place-items-center rounded-full font-jp text-[11px] font-black" style={{ backgroundColor: anime.color, color: anime.onColor }}>
            {anime.kanji}
          </span>
          {anime.name}
        </Link>

        <h1 className="mt-4 font-display text-3xl uppercase leading-[0.95] sm:text-4xl">{product.name}</h1>

        {product.reviews > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/60">
            <Stars rating={product.rating} />
            <span className="font-bold text-ink">{product.rating.toFixed(1)}</span>
            <span>({product.reviews})</span>
            <span className="text-ink/40">·</span>
            <span>{product.sold.toLocaleString("en-IN")}+ sold</span>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Price price={product.price} compareAt={product.compareAt} size="lg" />
          <DiscountBadge price={product.price} compareAt={product.compareAt} />
        </div>

        <div className="my-6 h-0.5 bg-ink/10" />

        {/* Colour */}
        <div>
          <p className="text-sm font-bold">
            Colour: <span className="font-medium text-ink/70">{color.name}</span>
          </p>
          <div className="mt-3 flex gap-3">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => pickColor(c)}
                className={cn(
                  "size-10 rounded-full border-2 border-ink transition-transform hover:scale-105",
                  color.name === c.name && "ring-2 ring-shu ring-offset-2 ring-offset-paper",
                )}
                style={{ backgroundColor: c.hex }}
                aria-label={c.name}
                aria-pressed={color.name === c.name}
              />
            ))}
          </div>
        </div>

        {/* Size */}
        <div id="size-picker" className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">
              Size: <span className="font-medium text-ink/70">{size ?? "Select a size"}</span>
            </p>
            <span className="flex items-center gap-4">
              <button onClick={() => setGuideOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-4 hover:text-shu">
                <Ruler className="size-4" /> Size guide
              </button>
            </span>
          </div>
          <div key={sizeError} className={cn("mt-3 grid grid-cols-5 gap-2", sizeError > 0 && "animate-shake")}>
            {SIZES.map((s) => {
              const out = available(s) === 0;
              return (
                <button
                  key={s}
                  disabled={out}
                  onClick={() => {
                    setSize(s);
                    setQty((q) => Math.min(q, available(s)));
                  }}
                  className={cn(
                    "relative h-12 rounded-xl border-2 text-sm font-extrabold transition-all",
                    size === s
                      ? "border-ink bg-ink text-paper shadow-[3px_3px_0_0_var(--color-shu)]"
                      : "border-ink/20 bg-card hover:border-ink",
                    out && "cursor-not-allowed text-ink/25 line-through hover:border-ink/20",
                    sizeError > 0 && !size && "border-shu",
                  )}
                  aria-pressed={size === s}
                  aria-label={out ? `${s}, sold out in ${color.name}` : s}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {colorSoldOut ? (
            <p className="mt-2 text-sm font-bold text-shu">
              Sold out in {color.name}.{soldOut ? " Restocking soon." : " Try another colour."}
            </p>
          ) : sizeError > 0 && !size ? (
            <p className="mt-2 text-sm font-bold text-shu" role="alert">
              Please pick your size first.
            </p>
          ) : size && available(size) <= product.lowStockAt ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-amber-700">
              <Flame className="size-4" /> Only {available(size)} left in {color.name}, size {size}.
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink/55">
              {FIT_LABEL[product.fit]} ·{" "}
              {product.fit === "oversized" ? "Want a regular look? Size down once." : "True to size."}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <QtyStepper value={qty} max={maxQty} onChange={setQty} />
          <button onClick={(e) => commit(false, e.currentTarget)} disabled={colorSoldOut} className={btn({ className: "flex-1" })}>
            {soldOut ? "Sold out" : colorSoldOut ? `Sold out in ${color.name}` : `Add to cart · ${formatBDT(product.price * qty)}`}
          </button>
        </div>
        <button onClick={() => commit(true)} disabled={colorSoldOut} className={btn({ variant: "dark", className: "mt-3 w-full" })}>
          Buy it now
        </button>

        {drop && limitedLeft !== null && limitedLeft > 0 && (
          <p className="mt-4 flex items-center gap-2 rounded-xl border-2 border-shu bg-shu/10 px-3 py-2 text-sm font-bold text-shu">
            <Flame className="size-4" /> Only {limitedLeft} of {drop.total} left in this numbered drop.
          </p>
        )}

        <ul className="mt-6 space-y-2 text-xs text-ink/65">
          <li className="flex items-center gap-2">
            <Truck className="size-4 shrink-0 text-shu" />
            Dhaka {formatBDT(delivery.insideDhaka)} · Outside {formatBDT(delivery.outsideDhaka)}
            {delivery.freeOver > 0 && <> · Free over {formatBDT(delivery.freeOver)}</>}
          </li>
          <li className="flex items-center gap-2">
            <Banknote className="size-4 shrink-0 text-shu" />
            {["Cash on Delivery", wallets.bkash && "bKash", wallets.nagad && "Nagad"].filter(Boolean).join(" · ")}
          </li>
          <li className="flex items-center gap-2">
            <RefreshCw className="size-4 shrink-0 text-shu" />
            7-day size exchange
          </li>
        </ul>

        <div className="mt-6 divide-y-2 divide-ink/10 border-y-2 border-ink/10">
          <Accordion title="Design story">
            <p>{product.description}</p>
          </Accordion>
          <Accordion title="Fabric & fit">
            <ul className="list-disc space-y-1 pl-5">
              <li>100% combed cotton, {gsm} GSM {product.fit === "oversized" ? "heavyweight" : "mid-weight"} jersey</li>
              <li>Bio-washed and pre-shrunk for a soft hand-feel</li>
              <li>High-density print, wash-tested so it won&apos;t crack or fade</li>
              <li>{FIT_LABEL[product.fit]}</li>
            </ul>
          </Accordion>
          <Accordion title="Wash care">
            <ul className="list-disc space-y-1 pl-5">
              <li>Turn inside out and wash cold (30°C max)</li>
              <li>Don&apos;t bleach, don&apos;t iron directly on the print</li>
              <li>Dry in shade to keep colours vivid</li>
            </ul>
          </Accordion>
        </div>
      </div>

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink/60">
              {color.name} · {size ? `Size ${size}` : "Pick a size"}
            </p>
            <p className="font-extrabold">{formatBDT(product.price * qty)}</p>
          </div>
          <button onClick={(e) => commit(false, e.currentTarget)} disabled={colorSoldOut} className={btn({ size: "md", className: "px-5" })}>
            {colorSoldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>

      <SizeGuideModal open={guideOpen} onClose={closeGuide} defaultFit={product.fit} highlight={size} />
      {tryOn && <TryOnStudio product={product} color={color} initialSize={size} onClose={closeTryOn} />}
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group py-1">
      <summary className="flex cursor-pointer list-none items-center justify-between py-3">
        <span className="text-sm font-extrabold uppercase tracking-wide">{title}</span>
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-4 text-sm leading-relaxed text-ink/70">{children}</div>
    </details>
  );
}
