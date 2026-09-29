import { cn } from "@emrix/shared/utils";

const base =
  "btn-fx inline-flex items-center justify-center gap-2 rounded-xl border-2 font-bold uppercase tracking-wide whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-150 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "border-ink bg-shu text-white shadow-panel-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-panel",
  dark: "border-ink bg-ink text-paper shadow-[3px_3px_0_0_var(--color-shu)] hover:-translate-x-px hover:-translate-y-px hover:shadow-panel-shu",
  outline:
    "border-ink bg-card text-ink shadow-panel-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-panel",
  kin: "border-ink bg-kin text-ink shadow-panel-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-panel",
  ghost: "border-transparent bg-transparent text-ink hover:bg-ink/5",
  /** For dark, full-bleed stages where an ink border and shadow would vanish. */
  stage:
    "border-washi bg-shu text-white shadow-[3px_3px_0_0_var(--color-washi)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_0_var(--color-washi)]",
  stageOutline: "border-washi/70 bg-sumi/40 text-washi backdrop-blur-sm hover:bg-washi hover:text-sumi",
} as const;

const sizes = {
  sm: "h-9 px-4 text-xs",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-sm sm:text-base",
} as const;

export function btn({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}
