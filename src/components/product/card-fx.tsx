"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { SceneKey } from "@emrix/shared/scenes";

/* Each series gets its own "hit" when a product card is hovered: Naruto's smoke-and-Rasengan,
   Solo Leveling's ARISE system window, and so on. The pieces are plain CSS (see "Card FX" in
   globals.css) and only animate while the card has `.fx-on`:
   - mouse/pen: while the pointer is over the card (and on keyboard focus);
   - touch: once, as the card passes through the middle of the screen. */

type Vars = Partial<Record<"x" | "y" | "s" | "d" | "r" | "c", string>>;
const v = (o: Vars) => Object.fromEntries(Object.entries(o).map(([k, val]) => [`--${k}`, val])) as CSSProperties;

/** Manga sound effect lettering: x/y position, r tilt, c fill colour. */
const Sfx = ({ text, at, vertical }: { text: string; at: Vars; vertical?: boolean }) => (
  <b className={vertical ? "fx-sfx fx-sfx--v" : "fx-sfx"} style={v(at)}>
    {text}
  </b>
);

const LAYERS: Record<SceneKey, ReactNode> = {
  // Naruto: "doron" smoke puffs and a spinning Rasengan
  shinobi: (
    <>
      <i className="fx-edge" style={v({ c: "rgb(242 106 27 / 0.55)" })} />
      <i className="fx-puff" style={v({ x: "14%", y: "84%", s: "58%" })} />
      <i className="fx-puff" style={v({ x: "86%", y: "88%", s: "52%", d: "0.06s" })} />
      <i className="fx-puff" style={v({ x: "50%", y: "102%", s: "64%", d: "0.12s" })} />
      <i className="fx-rasengan" />
      <Sfx text="ドロン" at={{ x: "8%", y: "58%", r: "-8deg", c: "#ff8a3d" }} />
    </>
  ),
  // One Piece: rubber stretch (on the photo), impact lines and a "DON!"
  pirate: (
    <>
      <i className="fx-lines" style={v({ c: "rgb(255 255 255 / 0.85)" })} />
      <i className="fx-ring" style={v({ c: "#d7263d" })} />
      <i className="fx-ring" style={v({ c: "#ffcf33", d: "0.12s" })} />
      <Sfx text="ドン!" at={{ x: "10%", y: "62%", r: "-7deg", c: "#fff" }} />
    </>
  ),
  // Jujutsu Kaisen: Domain Expansion — the void closes in while red and blue fuse into purple
  sorcerer: (
    <>
      <i className="fx-edge fx-edge--deep" style={v({ c: "rgb(24 10 70 / 0.9)" })} />
      <i className="fx-ring" style={v({ c: "#818cf8" })} />
      <i className="fx-ring" style={v({ c: "#c084fc", d: "0.15s" })} />
      <i className="fx-orb fx-orb--blue" />
      <i className="fx-orb fx-orb--red" />
      <i className="fx-orb fx-orb--purple" />
      <Sfx text="領域展開" vertical at={{ x: "84%", y: "10%", c: "#c4b5fd" }} />
    </>
  ),
  // Demon Slayer: a water-breathing slash
  swordsman: (
    <>
      <i className="fx-edge" style={v({ c: "rgb(56 189 248 / 0.45)" })} />
      <i className="fx-arc" />
      <i className="fx-slash" style={v({ r: "-32deg", c: "#38bdf8" })} />
      <i className="fx-slash" style={v({ r: "24deg", c: "#2dd4bf", d: "0.14s" })} />
      <Sfx text="斬" at={{ x: "8%", y: "54%", r: "-10deg", c: "#e0f2fe" }} />
    </>
  ),
  // Attack on Titan: ODM gear wires and a whoosh
  scout: (
    <>
      <i className="fx-streak" />
      <i className="fx-wire" style={v({ x: "6%", r: "22deg" })} />
      <i className="fx-wire" style={v({ x: "94%", r: "-22deg", d: "0.08s" })} />
      <Sfx text="ヒュン" at={{ x: "8%", y: "60%", r: "-6deg", c: "#f5f5f4" }} />
    </>
  ),
  // Dragon Ball: golden aura flames and crackling lightning
  fighter: (
    <>
      <i className="fx-edge" style={v({ c: "rgb(253 224 71 / 0.6)" })} />
      <i className="fx-flame" style={v({ x: "8%", s: "30%" })} />
      <i className="fx-flame" style={v({ x: "30%", s: "24%", d: "-0.3s" })} />
      <i className="fx-flame" style={v({ x: "70%", s: "26%", d: "-0.15s" })} />
      <i className="fx-flame" style={v({ x: "92%", s: "30%", d: "-0.45s" })} />
      <i className="fx-bolt" style={v({ x: "12%", y: "22%", r: "18deg" })} />
      <i className="fx-bolt" style={v({ x: "84%", y: "36%", r: "-24deg", d: "0.22s" })} />
      <Sfx text="ゴゴゴ" vertical at={{ x: "86%", y: "8%", c: "#fde047" }} />
    </>
  ),
  // Chainsaw Man: saw teeth rip along the edges
  devil: (
    <>
      <i className="fx-edge" style={v({ c: "rgb(200 29 37 / 0.6)" })} />
      <i className="fx-saw" />
      <i className="fx-saw fx-saw--bottom" />
      <Sfx text="ブォン" at={{ x: "8%", y: "56%", r: "-9deg", c: "#fca5a5" }} />
    </>
  ),
  // Solo Leveling: shadows rise and the System calls ARISE
  shadow: (
    <>
      <i className="fx-edge fx-edge--deep" style={v({ c: "rgb(46 16 101 / 0.85)" })} />
      <i className="fx-shade" style={v({ x: "18%", s: "70%" })} />
      <i className="fx-shade" style={v({ x: "56%", s: "80%", d: "0.08s" })} />
      <i className="fx-shade" style={v({ x: "92%", s: "64%", d: "0.16s" })} />
      <i className="fx-spark" style={v({ x: "14%", d: "0.2s" })} />
      <i className="fx-spark" style={v({ x: "38%", d: "0.9s" })} />
      <i className="fx-spark" style={v({ x: "66%", d: "0.5s" })} />
      <i className="fx-spark" style={v({ x: "86%", d: "1.2s" })} />
      <span className="fx-system">
        <small>System</small>ARISE
      </span>
    </>
  ),
  // Bleach: a Getsuga Tensho crescent and spiritual pressure
  reaper: (
    <>
      <i className="fx-edge" style={v({ c: "rgb(186 230 253 / 0.5)" })} />
      <i className="fx-moon" />
      <Sfx text="卍解" at={{ x: "8%", y: "58%", r: "-8deg", c: "#f5f5f4" }} />
    </>
  ),
  // Hunter x Hunter: a breathing Nen aura and a Jajanken impact
  brawler: (
    <>
      <i className="fx-edge fx-edge--pulse" style={v({ c: "rgb(74 222 128 / 0.6)" })} />
      <i className="fx-ring" style={v({ c: "#4ade80" })} />
      <i className="fx-ring" style={v({ c: "#86efac", d: "0.1s" })} />
      <i className="fx-ring" style={v({ c: "#22c55e", d: "0.2s" })} />
      <Sfx text="ドドド" at={{ x: "8%", y: "58%", r: "-8deg", c: "#bbf7d0" }} />
    </>
  ),
  // Death Note: black feathers and a Kira grin
  oracle: (
    <>
      <i className="fx-edge fx-edge--deep" style={v({ c: "rgb(10 0 0 / 0.85)" })} />
      <i className="fx-tint" />
      <i className="fx-feather" style={v({ x: "14%", d: "0s", r: "30deg" })} />
      <i className="fx-feather" style={v({ x: "40%", d: "0.7s", r: "-20deg" })} />
      <i className="fx-feather" style={v({ x: "64%", d: "0.3s", r: "40deg" })} />
      <i className="fx-feather" style={v({ x: "88%", d: "1s", r: "-35deg" })} />
      <Sfx text="計画通り" at={{ x: "8%", y: "62%", r: "-5deg", c: "#fecaca" }} />
    </>
  ),
  // My Hero Academia: PLUS ULTRA speed lines and a SMASH
  hero: (
    <>
      <i className="fx-lines" style={v({ c: "rgb(253 224 71 / 0.9)" })} />
      <i className="fx-ring" style={v({ c: "#1f4fd8" })} />
      <Sfx text="SMASH!" at={{ x: "8%", y: "60%", r: "-8deg", c: "#fde047" }} />
    </>
  ),
};

let centreObserver: IntersectionObserver | null = null;

function playOnce(card: HTMLElement) {
  card.classList.remove("fx-on");
  void card.offsetWidth; // restart the animations
  card.classList.add("fx-on");
  window.setTimeout(() => card.classList.remove("fx-on"), 1900);
}

export function CardFx({ scene }: { scene: SceneKey }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const card = ref.current?.closest<HTMLElement>("[data-cardfx]");
    if (!card || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (matchMedia("(hover: none)").matches) {
      // Touch screens have no hover: play the hit once as the card crosses the middle of the screen.
      centreObserver ??= new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            centreObserver?.unobserve(e.target);
            playOnce(e.target as HTMLElement);
          }
        },
        { rootMargin: "-38% 0px -38% 0px" },
      );
      const observer = centreObserver;
      observer.observe(card);
      return () => observer.unobserve(card);
    }

    const on = (e: Event) => {
      if (e instanceof PointerEvent && e.pointerType === "touch") return;
      card.classList.add("fx-on");
    };
    const off = () => card.classList.remove("fx-on");
    card.addEventListener("pointerenter", on);
    card.addEventListener("pointerleave", off);
    card.addEventListener("focusin", on);
    card.addEventListener("focusout", off);
    return () => {
      card.removeEventListener("pointerenter", on);
      card.removeEventListener("pointerleave", off);
      card.removeEventListener("focusin", on);
      card.removeEventListener("focusout", off);
    };
  }, []);

  return (
    <span ref={ref} aria-hidden className="fx">
      {LAYERS[scene]}
    </span>
  );
}
