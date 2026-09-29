"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import type { ProductImage } from "@emrix/shared/types";
import { cn, formatBDT } from "@emrix/shared/utils";
import { btn } from "@/components/ui/button";

export interface ReelScene {
  key: string;
  name: string;
  jp: string;
  kanji: string;
  /** Scene accent, bright enough to glow on the dark stage. */
  glow: string;
  /** Manga sound effect that lands with the tee. */
  sfx: string;
  art: { src: string; alt: string };
  product: { slug: string; name: string; price: number; fit: string; photo: ProductImage };
}

const SCENE_MS = 6000;
/** The first cut waits for the headline to slam in (and gives the art a head start). */
const INTRO = "0.55s";
const EPISODE = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

// Fixed-seed PRNG so server and client render identical embers.
let seed = 11;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const EMBERS = Array.from({ length: 22 }, () => ({
  "--x": `${(rand() * 100).toFixed(1)}%`,
  "--s": `${(2 + rand() * 4).toFixed(1)}px`,
  "--dur": `${(5 + rand() * 6).toFixed(1)}s`,
  "--delay": `${(-rand() * 11).toFixed(1)}s`,
  "--dx": `${((rand() - 0.5) * 140).toFixed(0)}px`,
})) as CSSProperties[];

type Role = "current" | "prev" | "next";
type Cut = { index: number; prev: number | null; dir: 1 | -1; cut: number };

function cutTo(state: Cut, action: { to: number; dir: 1 | -1 }): Cut {
  if (action.to === state.index) return state;
  return { index: action.to, prev: state.index, dir: action.dir, cut: state.cut + 1 };
}

const noopSubscribe = () => () => {};
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const SITE_BLURB =
  "Premium anime tees designed in Dhaka for the nakama of Bangladesh. Heavyweight cotton, prints that don’t crack, and Cash on Delivery to all 64 districts.";
const CARD_SIZES = "(min-width: 1024px) 210px, 156px";

const pad = (n: number) => String(n).padStart(2, "0");
// Bundled (/images) and uploaded (/media) art is resized per screen; only external URLs skip it.
const isLocal = (src: string) => src.startsWith("/");

/** Moves with the mouse on desktop; `depth` in px at the stage edge. */
function parallax(depth: number): CSSProperties {
  return { transform: `translate3d(calc(var(--mx, 0) * ${depth}px), calc(var(--my, 0) * ${depth}px), 0)` };
}

export function HeroReel({ scenes }: { scenes: ReelScene[] }) {
  const [{ index, prev, dir, cut }, dispatch] = useReducer(cutTo, { index: 0, prev: null, dir: 1, cut: 0 });
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState(true);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia(MOTION_QUERY).matches, () => false);
  const stageRef = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const n = scenes.length;
  const scene = scenes[index];
  // The clock starts once the page is interactive; reduced-motion visitors step through by hand.
  const autoplay = hydrated && !reduced && n > 1;
  const running = !paused && inView;

  const go = useCallback((to: number, direction: 1 | -1) => dispatch({ to: (to + n) % n, dir: direction }), [n]);
  const next = () => go(index + 1, 1);
  const back = () => go(index - 1, -1);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, []);

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || reduced) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
    });
  }

  function onPointerUp(e: PointerEvent<HTMLElement>) {
    const start = swipe.current;
    swipe.current = null;
    if (!start || e.pointerType === "mouse") return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - start.y) * 1.5) {
      if (dx < 0) next();
      else back();
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") back();
    else return;
    e.preventDefault();
  }

  function roleOf(i: number): Role | null {
    if (i === index) return "current";
    if (i === prev) return "prev";
    if (i === (index + 1) % n) return "next";
    return null;
  }

  return (
    <>
      <section
        ref={stageRef}
        aria-roledescription="carousel"
        aria-label="Featured anime drops"
        data-paused={hydrated && !running ? "" : undefined}
        onPointerMove={onPointerMove}
        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
        onKeyDown={onKeyDown}
        className="reel relative isolate h-[calc(100svh-6rem)] max-h-[780px] min-h-[560px] touch-pan-y touch-pinch-zoom overflow-hidden border-b-2 border-ink bg-sumi text-washi lg:h-[calc(100svh-6.5rem)] lg:max-h-[880px] lg:min-h-[620px]"
        style={
          {
            "--glow": scene.glow,
            "--intro": cut === 0 ? INTRO : "0s",
            "--scene-ms": `${SCENE_MS}ms`,
          } as CSSProperties
        }
      >
        {/* Art: one layer per scene in play (outgoing, incoming, preloaded next) */}
        <div className="absolute -inset-4 transition-transform duration-700 ease-out" style={parallax(-8)}>
          {scenes.map((s, i) => {
            const role = roleOf(i);
            return role ? <ArtLayer key={s.key} scene={s} role={role} dir={dir} first={i === 0} intro={cut === 0} /> : null;
          })}
          {/* Desktop panel edge, glowing in the scene colour */}
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-[3] hidden size-full drop-shadow-[0_0_10px_var(--glow)] lg:block"
          >
            <line x1="47.92" y1="0" x2="38" y2="100" strokeWidth="3" vectorEffect="non-scaling-stroke" className="stroke-(--glow)" />
          </svg>
        </div>

        {/* Grade: legibility gradients, scene-colour light, print texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--color-sumi)_6%,rgb(17_17_22/0.8)_34%,transparent_62%),linear-gradient(to_bottom,rgb(17_17_22/0.75),transparent_24%)] lg:bg-[linear-gradient(90deg,rgb(17_17_22/0.72)_0%,rgb(17_17_22/0.5)_38%,transparent_52%),linear-gradient(to_top,rgb(17_17_22/0.9),transparent_28%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_115%,color-mix(in_srgb,var(--glow)_45%,transparent),transparent_60%)] lg:bg-[radial-gradient(ellipse_at_20%_110%,color-mix(in_srgb,var(--glow)_40%,transparent),transparent_55%)]"
        />
        <div aria-hidden className="halftone pointer-events-none absolute inset-0 opacity-25 [--dot-color:rgb(0_0_0/0.6)] [--dot-size:5px] [mask-image:radial-gradient(ellipse_at_60%_30%,transparent_35%,black_80%)]" />

        {/* Speed lines: burst and jitter on every cut, then settle */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_62%_40%,transparent_20%,black_72%)]"
        >
          <div key={cut} className="reel-speed-jitter absolute left-1/2 top-1/2 -ml-[75vmax] -mt-[75vmax] size-[150vmax]">
            <div className="reel-speed-burst speedlines size-full [--line-color:rgb(255_255_255/0.13)]" />
          </div>
        </div>

        {/* Embers drifting up in the scene colour */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden transition-transform duration-700 ease-out [container-type:size]"
          style={parallax(18)}
        >
          {EMBERS.map((style, i) => (
            <span key={i} className="reel-ember" style={style} />
          ))}
        </div>

        {/* Giant outlined kanji */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-55 transition-transform duration-700 ease-out" style={parallax(28)}>
          <span
            key={cut}
            className="reel-kanji text-outline absolute -right-[10%] top-[9%] font-jp text-[62vw] font-black leading-none [--stroke-c:var(--glow)] [--stroke-w:2px] [text-shadow:0_0_40px_color-mix(in_srgb,var(--glow)_45%,transparent)] lg:-right-[3%] lg:top-auto lg:-bottom-[14%] lg:text-[28rem]"
          >
            {scene.kanji}
          </span>
        </div>

        {/* The cut itself: blade slash and impact flash */}
        <div aria-hidden key={`fx-${cut}`} className="pointer-events-none absolute inset-0 z-[4]">
          <div className="absolute inset-0 blur-md">
            <div className="reel-slash absolute inset-0 bg-(--glow)" data-dir={dir < 0 ? "back" : undefined} />
          </div>
          <div className="reel-slash absolute inset-0 bg-washi [--w:0.5%]" data-dir={dir < 0 ? "back" : undefined} />
          <div className="reel-flash absolute inset-0 bg-[radial-gradient(circle_at_62%_40%,white,color-mix(in_srgb,var(--glow)_70%,transparent)_40%,transparent_75%)]" />
        </div>

        {/* Copy and scene UI */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-4 pb-6 pt-3 lg:grid lg:grid-cols-12 lg:grid-rows-[auto_1fr_auto] lg:gap-x-6 lg:px-8 lg:py-8">
          {/* Headline */}
          <div className="order-3 lg:order-none lg:col-span-6 lg:row-span-3 lg:row-start-1 lg:self-center">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-washi/80 bg-sumi/50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-sm sm:text-[11px]">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-shu" />
                <span className="relative size-2 rounded-full bg-shu" />
              </span>
              New drop is live
              <span className="font-jp text-kin">新作</span>
            </span>

            <h1 className="mt-4 font-display text-[clamp(2.6rem,12.5vw,4.4rem)] uppercase leading-[0.88] tracking-tight [text-shadow:0_4px_24px_rgb(0_0_0/0.45)] lg:mt-6 lg:text-[clamp(4rem,11.5svh,5.4rem)] xl:text-[clamp(4rem,12.5svh,6.6rem)]">
              <span className="reel-slam" style={{ "--d": "0.05s" } as CSSProperties}>
                Wear
              </span>
              <br />
              <span className="reel-slam" style={{ "--d": "0.18s" } as CSSProperties}>
                the
              </span>{" "}
              <span className="reel-slam reel-underline isolate" style={{ "--d": "0.32s" } as CSSProperties}>
                <span key={cut} className="reel-glitch text-(--glow)">
                  legend
                </span>
              </span>
              .
            </h1>
            <p className="mt-3 font-jp text-sm font-black tracking-[0.45em] text-washi/75 sm:text-base lg:mt-4 lg:text-lg">伝説を身にまとえ。</p>

            <p className="mt-6 hidden max-w-md text-base leading-relaxed text-washi/75 lg:block">{SITE_BLURB}</p>

            <div className="mt-5 flex gap-2 lg:mt-8 lg:gap-3">
              <Link href="/shop?tag=new" className={btn({ variant: "stage", className: "h-12 px-4 text-[13px] sm:px-6 sm:text-sm lg:h-14 lg:px-8 lg:text-base" })}>
                Shop the drop <ArrowRight className="size-5" />
              </Link>
              <Link href="/anime" className={btn({ variant: "stageOutline", className: "h-12 px-4 text-[13px] sm:px-6 sm:text-sm lg:h-14 lg:px-8 lg:text-base" })}>
                Browse anime
              </Link>
            </div>

            <Stats tone="dark" className="mt-10 hidden lg:tall:grid" />
          </div>

          {/* Scene controls: story-style bars on mobile, bottom-right on desktop */}
          <div className="order-1 flex items-center gap-3 lg:order-none lg:col-span-3 lg:col-start-10 lg:row-start-3 lg:self-end">
            <span className="font-display text-xs tabular-nums">
              {pad(index + 1)}
              <span className="text-washi/45"> / {pad(n)}</span>
            </span>
            <div className="flex flex-1 gap-1.5">
              {scenes.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => go(i, i > index ? 1 : -1)}
                  aria-label={`Show ${s.name}`}
                  aria-current={i === index}
                  className="group relative h-7 flex-1"
                >
                  <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-washi/25 transition-colors group-hover:bg-washi/45">
                    {i === index && autoplay ? (
                      <span
                        key={cut}
                        className="reel-progress absolute inset-0 bg-(--glow)"
                        style={hovering ? { animationPlayState: "paused" } : undefined}
                        onAnimationEnd={(e) => e.animationName === "reel-progress" && next()}
                      />
                    ) : (
                      <span className={cn("absolute inset-0", i === index ? "bg-(--glow)" : i < index && "bg-washi/70")} />
                    )}
                  </span>
                </button>
              ))}
            </div>
            {autoplay ? (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play the reel" : "Pause the reel"}
                className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-washi/60 bg-sumi/40 backdrop-blur-sm transition-colors hover:bg-washi hover:text-sumi"
              >
                {paused ? <Play className="size-3.5 fill-current" /> : <Pause className="size-3.5 fill-current" />}
              </button>
            ) : null}
          </div>

          {/* Episode title card */}
          <div className="order-2 mt-3 lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:mt-0 lg:text-right">
            <div key={cut} className="reel-title">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-washi/80 lg:text-xs">
                <span className="rounded bg-sumi/75 px-1.5 py-0.5 font-jp text-(--glow)">第{EPISODE[index] ?? index + 1}話</span>
                <span className="mx-2 text-washi/40">/</span>
                EP.{pad(index + 1)}
              </p>
              <p className="mt-1 font-display text-2xl uppercase leading-none [text-shadow:0_2px_16px_rgb(0_0_0/0.6)] lg:text-4xl">
                {scene.name}
              </p>
              <p className="mt-1.5 font-jp text-[11px] font-bold tracking-[0.3em] text-washi/70 lg:text-sm">{scene.jp}</p>
            </div>
          </div>

          {/* Featured tee */}
          <div className="order-2 flex flex-1 items-end justify-end pb-5 lg:order-none lg:col-span-3 lg:col-start-7 lg:row-span-2 lg:row-start-2 lg:justify-start lg:self-end lg:pb-2">
            <div className="relative transition-transform duration-700 ease-out" style={parallax(-14)}>
              <div className="reel-float">
                <Link
                  key={cut}
                  href={`/product/${scene.product.slug}`}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
                  onPointerLeave={() => setHovering(false)}
                  className="reel-card group block w-[36vw] max-w-[156px] rounded-2xl border-2 border-ink bg-card p-1.5 text-ink shadow-[5px_5px_0_0_var(--glow)] transition-shadow hover:shadow-[8px_8px_0_0_var(--glow)] lg:w-[210px] lg:max-w-none lg:p-2"
                >
                  <span className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-[#dedbd5]">
                    <Image
                      src={scene.product.photo.url}
                      alt={scene.product.photo.alt}
                      fill
                      sizes={CARD_SIZES}
                      unoptimized={!isLocal(scene.product.photo.url)}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="flex items-end justify-between gap-2 px-1 pb-0.5 pt-1.5">
                    <span className="min-w-0">
                      <span className="block truncate font-jp text-[9px] font-bold tracking-widest text-shu">
                        {scene.product.fit} · 人気
                      </span>
                      <span className="block truncate text-[11px] font-bold leading-tight lg:text-xs">{scene.product.name}</span>
                      <span className="block font-display text-sm lg:text-base">{formatBDT(scene.product.price)}</span>
                    </span>
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform group-hover:-rotate-45">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </span>
                </Link>
              </div>
              <span
                key={`sfx-${cut}`}
                aria-hidden
                className="reel-sfx pointer-events-none absolute -left-12 -top-7 select-none whitespace-nowrap font-display text-4xl text-kin [-webkit-text-stroke:2.5px_var(--color-sumi)] [paint-order:stroke_fill] [filter:drop-shadow(0_0_14px_var(--glow))] lg:left-auto lg:-right-28 lg:-top-10 lg:text-6xl"
              >
                {scene.sfx}
              </span>
            </div>
          </div>
        </div>

        <span aria-hidden className="writing-vertical absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 font-jp text-xs font-black tracking-[0.45em] text-washi/55 lg:block">
          アニメ・ストリートウェア
        </span>

        <p className="sr-only" aria-live={autoplay && running ? "off" : "polite"}>
          {`${scene.name}: ${scene.product.name}, ${formatBDT(scene.product.price)}`}
        </p>
      </section>

      {/* Mobile and short desktop screens: the rest of the pitch sits under the stage */}
      <div className="border-b-2 border-ink px-4 pb-8 pt-6 lg:tall:hidden">
        <div className="lg:mx-auto lg:max-w-7xl lg:px-4">
          <p className="max-w-md text-[15px] leading-relaxed text-ink/70 lg:hidden">{SITE_BLURB}</p>
          <Stats tone="light" className="mt-6 grid lg:mt-0" />
        </div>
      </div>
    </>
  );
}

function ArtLayer({ scene, role, dir, first, intro }: {
  scene: ReelScene;
  role: Role;
  dir: 1 | -1;
  /** The scene on screen at page load: fetched eagerly. */
  first: boolean;
  intro: boolean;
}) {
  const local = isLocal(scene.art.src);
  return (
    <div
      className="reel-layer"
      data-role={role}
      data-dir={dir < 0 ? "back" : undefined}
      data-intro={intro && role === "current" ? "" : undefined}
      aria-hidden={role !== "current"}
    >
      {/* Desktop: a blurred copy of the art lights the stage behind the panel */}
      <div className="absolute inset-0 hidden bg-sumi lg:block">
        <Image
          src={scene.art.src}
          alt=""
          fill
          sizes="128px"
          unoptimized={!local}
          loading={first ? "eager" : "lazy"}
          className="scale-110 object-cover opacity-50 blur-2xl saturate-150"
        />
      </div>
      <div className="absolute inset-0 overflow-hidden bg-sumi lg:left-auto lg:w-[62%] lg:[clip-path:polygon(16%_0,100%_0,100%_100%,0_100%)]">
        <div className="reel-punch absolute inset-0">
          <div className="reel-drift absolute inset-0">
            <Image
              src={scene.art.src}
              alt={role === "current" ? scene.art.alt : ""}
              fill
              sizes="(min-width: 1024px) 62vw, 100vw"
              unoptimized={!local}
              loading={first ? "eager" : "lazy"}
              fetchPriority={first ? "high" : "low"}
              className="object-cover object-[center_28%] lg:object-[center_22%]"
            />
          </div>
        </div>
      </div>
      {/* Warm the cache so the tee lands with its photo already loaded */}
      {role === "next" ? (
        <span className="absolute size-px overflow-hidden opacity-0">
          <Image
            src={scene.product.photo.url}
            alt=""
            fill
            sizes={CARD_SIZES}
            unoptimized={!isLocal(scene.product.photo.url)}
          />
        </span>
      ) : null}
    </div>
  );
}

function Stats({ tone, className }: { tone: "dark" | "light"; className?: string }) {
  const dark = tone === "dark";
  return (
    <dl
      className={cn(
        "max-w-lg grid-cols-3 overflow-hidden rounded-2xl border-2",
        dark ? "border-washi/25 bg-sumi/40 backdrop-blur-sm" : "border-ink bg-card shadow-panel-sm",
        className,
      )}
    >
      {[
        { value: "COD", label: "Pay on delivery" },
        { value: "64", label: "Districts we deliver to" },
        { value: "7 days", label: "Easy exchange" },
      ].map((s, i) => (
        <div key={s.label} className={cn("px-3 py-3 sm:px-4", i > 0 && (dark ? "border-l-2 border-washi/25" : "border-l-2 border-ink"))}>
          <dt className="sr-only">{s.label}</dt>
          <dd className="font-display text-xl leading-none sm:text-2xl">{s.value}</dd>
          <dd
            className={cn(
              "mt-1 text-[10px] font-bold uppercase leading-tight tracking-wider sm:text-[11px]",
              dark ? "text-washi/55" : "text-ink/55",
            )}
          >
            {s.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}
