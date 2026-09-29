import type { CSSProperties } from "react";

/* Order placed: confetti (paper bits, sakura petals, stars) bursts out of the check mark and
   drifts down. Pure CSS; positions are fixed per piece so server and client render the same. */

const COLORS = ["var(--color-shu)", "var(--color-kin)", "#f5f3ee", "#f472b6", "#60a5fa", "#4ade80"];
const SHAPES = ["bit", "petal", "star"] as const;

const PIECES = Array.from({ length: 30 }, (_, i) => {
  const angle = (i / 30) * Math.PI * 2 + (i % 3) * 0.35;
  const dist = 90 + ((i * 37) % 70);
  return {
    shape: SHAPES[i % SHAPES.length],
    style: {
      "--tx": `${Math.round(Math.cos(angle) * dist * 1.6)}px`,
      "--ty": `${Math.round(Math.sin(angle) * dist - 40)}px`,
      "--rot": `${(i * 97) % 720 - 360}deg`,
      "--d": `${((i * 29) % 12) / 100}s`,
      background: COLORS[i % COLORS.length],
    } as CSSProperties,
  };
});

export function Celebration() {
  return (
    <span aria-hidden className="confetti">
      {PIECES.map((p, i) => (
        <i key={i} className={`confetti-${p.shape}`} style={p.style} />
      ))}
    </span>
  );
}

/** A red hanko seal that slams on after the check mark. */
export function DoneStamp({ className }: { className?: string }) {
  return (
    <span aria-hidden className={`done-stamp ${className ?? ""}`}>
      完了
    </span>
  );
}
