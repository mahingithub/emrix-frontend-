"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, ChevronsDown } from "lucide-react";
import { COLLECTION_ART } from "@emrix/shared/catalog-media";
import type { SceneKey } from "@emrix/shared/scenes";
import { cn } from "@emrix/shared/utils";
import { btn } from "@/components/ui/button";

type MoveKind = "sphere" | "hollow" | "punch" | "aura";

interface Fighter {
  anime: string;
  scene: SceneKey;
  label: string;
  move: string;
  moveJp: string;
  energy: string;
  energyJp: string;
  kind: MoveKind;
  /** Where the move forms, as % of the bundled 4:5 artwork (calibrated to that art). */
  anchor: [number, number];
  color: string;
  core: string;
  sfx: string;
}

const FIGHTERS: Fighter[] = [
  {
    anime: "naruto",
    scene: "shinobi",
    label: "Naruto",
    move: "Rasengan",
    moveJp: "螺旋丸",
    energy: "Chakra",
    energyJp: "チャクラ",
    kind: "sphere",
    anchor: [22, 34],
    color: "#38bdf8",
    core: "#e0f7ff",
    sfx: "ドォン!!",
  },
  {
    anime: "jujutsu-kaisen",
    scene: "sorcerer",
    label: "Gojo",
    move: "Hollow Purple",
    moveJp: "虚式・茈",
    energy: "Cursed energy",
    energyJp: "呪力",
    kind: "hollow",
    anchor: [27, 62],
    color: "#a855f7",
    core: "#f3e8ff",
    sfx: "ズオォ!!",
  },
  {
    anime: "one-piece",
    scene: "pirate",
    label: "Luffy",
    move: "Gum-Gum Pistol",
    moveJp: "ゴムゴムの銃",
    energy: "Haki",
    energyJp: "覇気",
    kind: "punch",
    anchor: [12, 64],
    color: "#ef4444",
    core: "#ffe08a",
    sfx: "ドンッ!!",
  },
  {
    anime: "dragon-ball",
    scene: "fighter",
    label: "Goku",
    move: "Super Saiyan",
    moveJp: "超サイヤ人",
    energy: "Ki",
    energyJp: "気",
    kind: "aura",
    anchor: [50, 58],
    color: "#facc15",
    core: "#fff7cc",
    sfx: "ゴゴゴ!!",
  },
];

const MAX_POWER = 9001;
/** Scroll progress (0–1 across the pinned run) where the move fires. */
const RELEASE_AT = 0.8;
const PARTICLES = Array.from({ length: 16 }, (_, i) => i * 22.5);

/**
 * A pinned scroll scene: scrolling charges the fighter's signature move, then it fires.
 * Scroll position drives CSS custom properties (--e entrance, --p progress); CSS derives the rest.
 */
export function PowerUp({ animes }: { animes: { slug: string; name: string }[] }) {
  const fighters = FIGHTERS.filter((f) => animes.some((a) => a.slug === f.anime));
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const powerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const r = track.getBoundingClientRect();
      const pinTop = parseFloat(getComputedStyle(stage).top) || 0;
      const run = r.height - stage.offsetHeight;
      const enter = Math.min(1, Math.max(0, (vh - r.top) / (vh - pinTop)));
      const p = reduced ? 0.7 : Math.min(1, Math.max(0, (pinTop - r.top) / run));
      stage.style.setProperty("--e", enter.toFixed(4));
      stage.style.setProperty("--p", p.toFixed(4));
      const phase = reduced || p >= RELEASE_AT ? "release" : p > 0.02 ? "charge" : "enter";
      if (stage.dataset.phase !== phase) stage.dataset.phase = phase;
      const charge = Math.min(1, Math.max(0, (p - 0.05) / 0.65));
      if (powerRef.current) {
        powerRef.current.textContent = Math.round(MAX_POWER * charge ** 1.6).toLocaleString("en-US");
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Only listen while the scene is near the viewport.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener("scroll", onScroll, { passive: true });
          window.addEventListener("resize", onScroll);
          update();
        } else {
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onScroll);
        }
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(track);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const f = fighters[active];
  if (!f) return null;
  const art = COLLECTION_ART[f.scene];

  return (
    <section ref={trackRef} className="pu-track relative h-[290vh] wide:h-[320vh]" aria-labelledby="power-up-title">
      <div
        ref={stageRef}
        data-phase="enter"
        data-kind={f.kind}
        className="pu-stage sticky top-16 isolate h-[calc(100svh-4rem)] overflow-hidden border-y-2 border-ink bg-sumi text-washi lg:top-[72px] lg:h-[calc(100svh-4.5rem)]"
        style={{ "--pu": f.color, "--pu-core": f.core } as CSSProperties}
      >
        {/* Backdrop: speed lines that wind up with the scroll, and the move's light */}
        <div aria-hidden className="pu-lines speedlines" />
        <div aria-hidden className="pu-glow" />
        <div aria-hidden className="pu-kanji writing-vertical font-jp font-black">
          <span className="text-outline [--stroke-c:var(--pu)] [--stroke-w:1.5px]">{f.moveJp}</span>
          <span className="pu-kanji-fill">{f.moveJp}</span>
        </div>

        <div className="pu-shake relative z-10 mx-auto flex h-full max-w-7xl flex-col px-4 py-4 wide:grid wide:grid-cols-12 wide:grid-rows-2 wide:gap-x-8 wide:py-5 lg:px-8 wide:roomy:py-10">
          {/* Title, fighter picker and power meter */}
          <div className="relative z-20 wide:col-span-5 wide:row-start-1 wide:self-end">
            <p className="flex items-center gap-2 font-jp text-xs font-bold tracking-[0.3em] text-shu short:hidden">
              <span className="font-display tracking-normal">★</span>
              <span className="h-px w-6 bg-washi/30" />
              必殺技 · Signature move
            </p>
            <h2 id="power-up-title" className="mt-2 hidden font-display text-5xl uppercase leading-[0.9] wide:roomy:block xl:text-6xl">
              Scroll to
              <br />
              <span className="text-(--pu) [text-shadow:0_0_30px_var(--pu)]">power up.</span>
            </h2>
            <h2 className="sr-only wide:roomy:hidden">Scroll to power up</h2>

            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 short:mt-0 wide:mx-0 wide:px-0 wide:roomy:mt-6 wide:roomy:flex-wrap" role="group" aria-label="Choose a fighter">
              {fighters.map((x, i) => (
                <button
                  key={x.anime}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border-2 py-1 pl-1 pr-3 text-xs font-extrabold uppercase tracking-wider transition-colors",
                    i === active ? "border-washi bg-washi text-sumi" : "border-washi/30 hover:border-washi/70",
                  )}
                >
                  <span className="relative size-7 overflow-hidden rounded-full">
                    <Image src={COLLECTION_ART[x.scene].src} alt="" fill sizes="28px" className="object-cover object-[center_25%]" />
                  </span>
                  {x.label}
                </button>
              ))}
            </div>

            <div className="mt-3 wide:roomy:mt-6">
              <div className="flex items-baseline justify-between gap-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-washi/70">
                <span>
                  {f.energy} <span className="font-jp text-(--pu)">{f.energyJp}</span>
                </span>
                <span className="relative font-display text-base tracking-normal text-washi tabular-nums wide:roomy:text-lg">
                  <span className="pu-max absolute right-full top-1/2 mr-2 -translate-y-1/2 rounded bg-(--pu) px-1.5 py-0.5 text-[10px] text-sumi">
                    MAX
                  </span>
                  <span ref={powerRef}>0</span>
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full border-2 border-washi/60 bg-washi/10">
                <div className="pu-meter h-full origin-left bg-[linear-gradient(90deg,var(--pu),var(--pu-core))]" />
              </div>
            </div>
          </div>

          {/* The fighter */}
          <div className="relative z-10 my-3 grid min-h-0 flex-1 place-items-center [container-type:size] wide:col-span-7 wide:col-start-6 wide:row-span-2 wide:row-start-1 wide:my-0">
            <div
              key={f.anime}
              className="pu-panel-wrap relative aspect-[4/5] w-[min(100cqw,80cqh)] wide:w-[min(100cqw,76cqh)]"
              style={{ "--ax": `${f.anchor[0]}%`, "--ay": `${f.anchor[1]}%` } as CSSProperties}
            >
              {f.kind === "aura" ? <Aura /> : null}
              <div className="pu-panel absolute inset-0 overflow-hidden rounded-2xl border-2 border-washi shadow-[6px_6px_0_0_var(--pu)]">
                <Image src={art.src} alt={art.alt} fill sizes="(min-width: 1024px) 42vw, 72vw" className="pu-art object-cover" />
                <span className="pu-panel-tint absolute inset-0" />
              </div>
              <div className="pu-fx">
                <Move kind={f.kind} />
                <div className="pu-parts">
                  {PARTICLES.map((a) => (
                    <span key={a} style={{ "--a": `${a}deg` } as CSSProperties} />
                  ))}
                </div>
                <span className="pu-blast" />
              </div>
              <span aria-hidden className="pu-sfx absolute left-1/2 top-[42%] select-none whitespace-nowrap font-display text-6xl text-kin [-webkit-text-stroke:3px_var(--color-sumi)] [paint-order:stroke_fill] [filter:drop-shadow(0_0_18px_var(--pu))] wide:roomy:text-8xl">
                {f.sfx}
              </span>
            </div>
          </div>

          {/* What's happening: charge prompt, then the payoff */}
          <div className="relative z-20 grid grid-cols-1 wide:col-span-5 wide:row-start-2 wide:mt-4 short:mt-2 wide:self-start wide:roomy:mt-8">
            <div className="pu-when-charge col-start-1 row-start-1">
              <p className="font-jp text-sm font-black tracking-[0.35em] text-(--pu)">{f.moveJp}</p>
              <p className="mt-1 font-display text-3xl uppercase leading-none min-[380px]:text-4xl short:text-3xl wide:roomy:text-5xl">{f.move}</p>
              <p className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-washi/70">
                <ChevronsDown className="size-4 animate-bounce" /> Keep scrolling to charge
              </p>
            </div>
            <div className="pu-when-release col-start-1 row-start-1">
              <p className="font-display text-3xl uppercase leading-[0.95] min-[380px]:text-4xl short:text-2xl wide:roomy:text-5xl">
                Unleash
                <br className="short:hidden" /> your <span className="text-(--pu)">style.</span>
              </p>
              <div className="mt-3 flex gap-2 min-[380px]:mt-4 short:mt-2">
                <Link href={`/anime/${f.anime}`} className={btn({ variant: "stage", className: "h-11 px-3 text-xs min-[380px]:px-4 min-[380px]:text-[13px] short:h-10" })}>
                  Shop {f.label} <ArrowRight className="hidden size-4 min-[380px]:block" />
                </Link>
                <Link href="/shop?tag=new" className={btn({ variant: "stageOutline", className: "h-11 px-3 text-xs min-[380px]:px-4 min-[380px]:text-[13px] short:h-10" })}>
                  New drops
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div aria-hidden className="pu-flash pointer-events-none absolute inset-0 z-30" />
      </div>
    </section>
  );
}

function Move({ kind }: { kind: MoveKind }) {
  if (kind === "sphere") {
    return (
      <span className="pu-orb">
        <span className="pu-orb-glow" />
        <span className="pu-orb-swirl" />
        <span className="pu-orb-swirl pu-orb-swirl--inner" />
        <span className="pu-orb-core" />
      </span>
    );
  }
  if (kind === "hollow") {
    // Red and blue converge, then fuse into purple.
    return (
      <>
        <span className="pu-orb pu-orb--red">
          <span className="pu-orb-glow" />
          <span className="pu-orb-core" />
        </span>
        <span className="pu-orb pu-orb--blue">
          <span className="pu-orb-glow" />
          <span className="pu-orb-core" />
        </span>
        <span className="pu-orb pu-orb--fused">
          <span className="pu-orb-glow" />
          <span className="pu-orb-swirl" />
          <span className="pu-orb-core" />
        </span>
      </>
    );
  }
  if (kind === "punch") {
    return (
      <span className="pu-orb pu-orb--punch">
        <span className="pu-orb-glow" />
        <svg viewBox="0 0 100 100" className="pu-burst" aria-hidden>
          <defs>
            <radialGradient id="pu-burst-fill">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.3" style={{ stopColor: "var(--pu-core)" }} />
              <stop offset="0.62" style={{ stopColor: "var(--pu)", stopOpacity: 0.85 }} />
              <stop offset="1" style={{ stopColor: "var(--pu)", stopOpacity: 0 }} />
            </radialGradient>
          </defs>
          <polygon points={burst(24, 48, 22)} fill="url(#pu-burst-fill)" />
          <polygon points={burst(36, 50, 34)} fill="url(#pu-burst-fill)" className="pu-burst-back" />
        </svg>
        <span className="pu-ring" />
        <span className="pu-ring [animation-delay:-0.4s]" />
        <span className="pu-ring [animation-delay:-0.8s]" />
      </span>
    );
  }
  return (
    <span className="pu-orb pu-orb--aura">
      <span className="pu-orb-glow" />
    </span>
  );
}

/** Flaming golden aura and crackling lightning around the whole panel. */
function Aura() {
  return (
    <>
      <span aria-hidden className="pu-aura" />
      <span aria-hidden className="pu-aura pu-aura--hot" />
      <svg aria-hidden viewBox="0 0 100 125" preserveAspectRatio="none" className="pu-bolts">
        <polyline points="4,20 12,28 7,34 16,44 10,50 18,58" />
        <polyline points="96,30 88,40 94,46 85,56 91,62 84,70" />
        <polyline points="30,122 36,112 31,106 40,98" />
        <polyline points="72,4 66,12 72,16 64,26" />
      </svg>
    </>
  );
}

/** Star polygon points for an impact burst: `n` points alternating between two radii. */
function burst(n: number, outer: number, inner: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i * Math.PI * 2) / n;
    const r = i % 2 ? inner : outer;
    return `${Math.round((50 + r * Math.cos(a)) * 10) / 10},${Math.round((50 + r * Math.sin(a)) * 10) / 10}`;
  }).join(" ");
}
