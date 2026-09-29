// Size advice for the try-on screen from height and build. Pure maths, no DOM.
// Everything is in inches, matching SIZE_CHART.
import { SIZE_CHART } from "@emrix/shared/catalog";
import type { Fit, Size } from "@emrix/shared/types";

export type Build = "slim" | "regular" | "athletic" | "heavy";

export const BUILDS: { value: Build; label: string }[] = [
  { value: "slim", label: "Slim" },
  { value: "regular", label: "Regular" },
  { value: "athletic", label: "Athletic" },
  { value: "heavy", label: "Heavy" },
];

export interface BodyProfile {
  heightIn: number;
  build: Build;
}

export const DEFAULT_PROFILE: BodyProfile = { heightIn: 67, build: "regular" };
export const HEIGHT_RANGE = { min: 54, max: 78 };

/** Typical BMI per build, which sets chest size for a height. */
const BMI: Record<Build, number> = { slim: 18.8, regular: 22.5, athletic: 24.5, heavy: 29 };

export interface BodyDims {
  heightIn: number;
  /** Chest circumference. */
  chestIn: number;
}

export function bodyDims({ heightIn, build }: BodyProfile): BodyDims {
  return { heightIn, chestIn: 0.54 * heightIn * Math.sqrt(BMI[build] / 22.5) * (build === "athletic" ? 1.04 : 1) };
}

/* --- Size fitting ----------------------------------------------------- */

export interface SizeFit {
  size: Size;
  chest: number;
  length: number;
  sleeve: number;
  /** Tee chest minus body chest, inches. */
  ease: number;
  score: number;
}

const TARGET_EASE: Record<Fit, number> = { regular: 4, oversized: 9 };

export function sizeFits(fit: Fit, body: BodyDims): SizeFit[] {
  const idealLength = (fit === "oversized" ? 0.425 : 0.41) * body.heightIn;
  return SIZE_CHART[fit].map((row) => {
    const ease = row.chest - body.chestIn;
    const lengthMiss = Math.max(0, Math.abs(row.length - idealLength) - 1);
    const score = Math.abs(ease - TARGET_EASE[fit]) + lengthMiss * 0.6 + (ease < 0.5 ? 8 : 0);
    return { ...row, ease, score };
  });
}

/** Best-scoring size, preferring ones that are in stock. */
export function recommendSize(fits: SizeFit[], inStock: (s: Size) => boolean = () => true): Size {
  const pool = fits.some((f) => inStock(f.size)) ? fits.filter((f) => inStock(f.size)) : fits;
  return pool.reduce((best, f) => (f.score < best.score ? f : best)).size;
}

export function feetInches(heightIn: number) {
  const ft = Math.floor(heightIn / 12);
  return { ft, inch: Math.round(heightIn - ft * 12) };
}
