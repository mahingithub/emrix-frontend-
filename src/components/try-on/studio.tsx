"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, ChevronDown, Download, Eye, ImagePlus, Lock, Play, RotateCcw, Share2, Sparkles, Sun, User, X } from "lucide-react";
import { SIZES, stockOf } from "@emrix/shared/catalog";
import type { Product, Size, TeeColor } from "@emrix/shared/types";
import { BUILDS, DEFAULT_PROFILE, HEIGHT_RANGE, bodyDims, feetInches, recommendSize, sizeFits, type BodyProfile } from "@/lib/try-on/body";
import { useCart } from "@/components/cart/cart-context";
import { ProductPhoto, productPhotos } from "@emrix/shared/ui/product-visual";
import { btn } from "@/components/ui/button";
import { cn, formatBDT } from "@emrix/shared/utils";
import { TurnVideo } from "./turn-video";

const PROFILE_KEY = "emrix-fit-profile";

function loadProfile(): BodyProfile | null {
  try {
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null") as BodyProfile | null;
    if (p && p.heightIn >= HEIGHT_RANGE.min && p.heightIn <= HEIGHT_RANGE.max && BUILDS.some((b) => b.value === p.build)) return p;
  } catch {}
  return null;
}

/** Shrink to 1280 px (the browser applies the photo's rotation) and drop its metadata. */
async function readPhoto(file: File) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return c.toDataURL("image/jpeg", 0.9);
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
  // An unreadable answer is a failure too, never an empty success (that showed a blank picture).
  const body = await res.json().catch(() => null);
  if (!res.ok || !body) throw new Error(body?.error ?? "Try-on is busy right now. Please try again in a minute.");
  return body as T;
}

type Status = { state: "working" } | { state: "done"; output: string } | { state: "failed"; error: string };

/** Poll a job until it's done (null if the studio closed first). */
async function poll(id: string, every: number, live: () => boolean) {
  for (;;) {
    await wait(every);
    if (!live()) return null;
    const s = await api<Status>(`/api/try-on/${encodeURIComponent(id)}`);
    if (s.state === "done") return s.output;
    if (s.state === "failed") throw new Error(s.error);
  }
}

type Phase = { name: "pick"; error?: string } | { name: "working" } | { name: "done" };
type Back = { state: "none" } | { state: "working" } | { state: "done"; image: string } | { state: "failed"; error: string };
type Video = { state: "idle" } | { state: "working"; started: number } | { state: "done"; url: string } | { state: "failed"; error: string };

export function TryOnStudio({
  product,
  color,
  initialSize,
  onClose,
}: {
  product: Product;
  color: TeeColor;
  initialSize?: Size | null;
  onClose: () => void;
}) {
  const { add } = useCart();
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const alive = useRef(true);

  const [phase, setPhase] = useState<Phase>({ name: "pick" });
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; image: string; hasBack?: boolean } | null>(null);
  const [back, setBack] = useState<Back>({ state: "none" });
  const [side, setSide] = useState<"front" | "back">("front");
  const [video, setVideo] = useState<Video>({ state: "idle" });
  const [view, setView] = useState<"photo" | "video">("photo");
  const [before, setBefore] = useState(false);
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<BodyProfile | null>(loadProfile);
  const [sizeHelp, setSizeHelp] = useState(false);
  const [picked, setPicked] = useState<Size | null>(initialSize ?? null);

  const garment = productPhotos(product, color.name).find((p) => !p.back);
  const hasBackPrint = product.images.some((i) => i.back);
  const pictured = garment?.color ?? color.name;
  const inStock = useCallback((s: Size) => stockOf(product, color.name, s) > 0, [product, color.name]);
  const recommended = useMemo(
    () => (profile ? recommendSize(sizeFits(product.fit, bodyDims(profile)), inStock) : null),
    [profile, product.fit, inStock],
  );
  const size = picked ?? recommended;
  const canShare = useMemo(() => matchMedia("(pointer: coarse)").matches && "share" in navigator, []);

  useEffect(() => {
    alive.current = true;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      alive.current = false;
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (!profile) return;
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // A progress bar that eases towards (never reaches) the end while we wait.
  useEffect(() => {
    if (phase.name !== "working") return;
    const start = performance.now();
    const t = setInterval(() => setProgress(1 - Math.exp(-(performance.now() - start) / 9000)), 200);
    return () => clearInterval(t);
  }, [phase.name]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    let dataUri: string;
    try {
      dataUri = await readPhoto(file);
    } catch {
      setPhase({ name: "pick", error: "That file didn't open as a photo. Try a JPG or PNG." });
      return;
    }
    setPhoto(dataUri);
    setResult(null);
    setBack({ state: "none" });
    setSide("front");
    setVideo({ state: "idle" });
    setView("photo");
    setProgress(0);
    setPhase({ name: "working" });
    try {
      const done = await api<{ id: string; image: string; hasBack?: boolean }>("/api/try-on", {
        method: "POST",
        body: JSON.stringify({ product: product.slug, color: color.name, photo: dataUri }),
      });
      if (!alive.current) return;
      setResult(done);
      setPhase({ name: "done" });
      // Designs with a back print: show the shopper from behind too, while they look at the front.
      if (done.hasBack) makeBack(done.id);
    } catch (e) {
      if (alive.current) setPhase({ name: "pick", error: (e as Error).message });
    }
  };

  const makeBack = async (id: string) => {
    setBack({ state: "working" });
    try {
      const { image } = await api<{ image: string }>(`/api/try-on/${encodeURIComponent(id)}/back`, { method: "POST" });
      if (!alive.current) return;
      setBack({ state: "done", image });
      setSide("back");
    } catch (e) {
      if (alive.current) setBack({ state: "failed", error: (e as Error).message });
    }
  };

  const makeVideo = async () => {
    if (!result || back.state === "working") return;
    setVideo({ state: "working", started: Date.now() });
    try {
      const { id } = await api<{ id: string }>(`/api/try-on/${encodeURIComponent(result.id)}`, { method: "POST" });
      const url = await poll(id, 5000, () => alive.current);
      if (!url) return;
      setVideo({ state: "done", url });
      setView("video");
    } catch (e) {
      setVideo({ state: "failed", error: (e as Error).message });
    }
  };

  const shown = result && (side === "back" && back.state === "done" ? back.image : result.image);

  const save = async () => {
    if (!result || !shown) return;
    const img = new Image();
    img.src = shown;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const fs = Math.max(14, Math.round(c.width * 0.028));
    ctx.font = `800 ${fs}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = "bottom";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = fs * 0.4;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`EMRIX · ${product.name}`, fs * 0.8, c.height - fs * 0.7);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.92));
    if (!blob) return;
    const file = new File([blob], `emrix-${product.slug}-on-me${side === "back" ? "-back" : ""}.jpg`, { type: "image/jpeg" });
    if (canShare && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: product.name }).catch(() => {});
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const addToCart = () => {
    if (!size || !inStock(size)) return;
    add(product, size, color, 1);
    onClose();
  };

  const heightFt = feetInches((profile ?? DEFAULT_PROFILE).heightIn);
  const setHeight = (ft: number, inch: number) =>
    setProfile((p) => ({ ...(p ?? DEFAULT_PROFILE), heightIn: Math.min(HEIGHT_RANGE.max, Math.max(HEIGHT_RANGE.min, ft * 12 + inch)) }));

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-sumi text-washi wide:flex-row" role="dialog" aria-modal="true" aria-label={`See ${product.name} on you`}>
      {/* Stage */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#0b0b0f]">
        {phase.name === "pick" && (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            {garment && (
              <div className="relative aspect-square w-40 overflow-hidden rounded-3xl border border-washi/15 bg-washi/5 sm:w-48">
                <ProductPhoto photo={garment} sizes="192px" eager />
              </div>
            )}
            <div>
              <p className="font-jp text-xs font-bold tracking-[0.3em] text-kin">試着</p>
              <h2 className="mt-1 font-display text-3xl uppercase leading-none sm:text-4xl">See it on you</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-washi/70">
                Add a photo of yourself. In about 15 seconds you&apos;ll see yourself wearing this tee
                {hasBackPrint ? ", then from behind with the back print." : "."}
              </p>
            </div>
            <ul className="flex flex-wrap justify-center gap-2 text-[11px] font-bold text-washi/80">
              <li className="flex items-center gap-1 rounded-full bg-washi/10 px-2.5 py-1">
                <User className="size-3.5" /> Face the camera
              </li>
              <li className="flex items-center gap-1 rounded-full bg-washi/10 px-2.5 py-1">
                <Eye className="size-3.5" /> Upper body in view
              </li>
              <li className="flex items-center gap-1 rounded-full bg-washi/10 px-2.5 py-1">
                <Sun className="size-3.5" /> Good light
              </li>
            </ul>
            {phase.error && (
              <p className="max-w-sm rounded-xl bg-shu/20 px-3 py-2 text-xs font-bold" role="alert">
                {phase.error}
              </p>
            )}
          </div>
        )}

        {phase.name === "working" && photo && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- the shopper's own photo, local only */}
            <img src={photo} alt="" className="absolute inset-0 size-full object-contain opacity-70" />
            <div className="tryon-scan pointer-events-none absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sumi via-sumi/80 to-transparent px-6 pb-8 pt-16 text-center">
              <p className="flex items-center justify-center gap-2 text-base font-extrabold" role="status">
                <Sparkles className="size-5 text-kin" /> Putting it on you…
              </p>
              <div className="mx-auto mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-washi/15">
                <div className="h-full rounded-full bg-kin transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            </div>
          </div>
        )}

        {phase.name === "done" && result && (
          // The picture gets its own space; every control sits below it, never on the person.
          <div className="absolute inset-0 flex flex-col">
            <div className="relative min-h-0 flex-1">
              {view === "video" && video.state === "done" ? (
                <TurnVideo src={video.url} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- generated data URL
                <img
                  src={before && photo ? photo : (shown ?? result.image)}
                  alt={before ? "Your photo" : `You wearing ${product.name}${side === "back" ? ", from behind" : ""}`}
                  className="absolute inset-0 size-full object-contain"
                />
              )}
            </div>
            <div className="flex shrink-0 flex-col items-center gap-2 px-3 pb-3 pt-2">
              {back.state === "working" && (
                <p className="flex items-center gap-2 rounded-full bg-washi/10 px-3 py-1.5 text-xs font-bold" role="status">
                  <span className="size-2 animate-pulse rounded-full bg-kin" /> Making your back view · about 30 seconds
                </p>
              )}
              {back.state === "failed" && result && (
                <p className="flex items-center gap-2 rounded-full bg-shu/80 px-3 py-1.5 text-xs font-bold" role="alert">
                  {back.error}
                  <button onClick={() => makeBack(result.id)} className="underline underline-offset-2">
                    Retry
                  </button>
                </p>
              )}
              {video.state === "working" && (
                <p className="flex items-center gap-2 rounded-full bg-washi/10 px-3 py-1.5 text-xs font-bold" role="status">
                  <span className="size-2 animate-pulse rounded-full bg-kin" /> Making your video · about a minute
                </p>
              )}
              {video.state === "failed" && (
                <p className="rounded-full bg-shu/80 px-3 py-1.5 text-xs font-bold" role="alert">
                  {video.error}
                </p>
              )}
              <div className="flex gap-1 rounded-full border border-washi/20 bg-washi/5 p-1">
                {video.state === "done" &&
                  (["photo", "video"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide",
                        view === v ? "bg-washi text-sumi" : "text-washi/85 hover:text-washi",
                      )}
                      aria-pressed={view === v}
                    >
                      {v === "photo" ? "Photo" : "Video"}
                    </button>
                  ))}
                {view === "photo" &&
                  back.state === "done" &&
                  (["front", "back"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setSide(v)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide",
                        side === v ? "bg-kin text-sumi" : "text-washi/85 hover:text-washi",
                      )}
                      aria-pressed={side === v}
                    >
                      {v === "front" ? "Front" : "Back"}
                    </button>
                  ))}
                {view === "photo" && side === "front" && (
                  <button
                    onPointerDown={() => setBefore(true)}
                    onPointerUp={() => setBefore(false)}
                    onPointerLeave={() => setBefore(false)}
                    onPointerCancel={() => setBefore(false)}
                    onKeyDown={(e) => e.key === " " && setBefore(true)}
                    onKeyUp={() => setBefore(false)}
                    className="touch-none select-none rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-washi/85 hover:text-washi"
                  >
                    Hold for before
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full border border-washi/25 bg-sumi/70 backdrop-blur hover:bg-washi hover:text-sumi"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Panel */}
      <div className="max-h-[46svh] shrink-0 overflow-y-auto border-t-2 border-washi/15 bg-[#111117] px-4 pt-3 wide:max-h-none wide:w-[340px] wide:border-l-2 wide:border-t-0 wide:px-5 lg:w-[400px] lg:px-6 lg:pt-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-sm font-extrabold">{product.name}</p>
          <p className="shrink-0 text-sm font-extrabold text-kin">{formatBDT(product.price)}</p>
        </div>
        {pictured !== color.name && <p className="mt-0.5 text-[11px] text-washi/55">Shown in {pictured}. You&apos;re buying {color.name}.</p>}

        {phase.name === "done" ? (
          <div className="mt-3 grid grid-cols-[1.5fr_1fr_1fr] gap-1.5">
            <button
              onClick={makeVideo}
              disabled={video.state === "working" || video.state === "done" || back.state === "working"}
              title={back.state === "working" ? "Wait for your back view, so the video can turn around" : undefined}
              className={btn({ variant: "stageOutline", size: "sm", className: "gap-1.5 px-1.5 tracking-normal" })}
            >
              <Play className="size-4 shrink-0" /> See it move
            </button>
            <button onClick={save} className={btn({ variant: "stageOutline", size: "sm", className: "gap-1.5 px-1.5 tracking-normal" })}>
              {canShare ? <Share2 className="size-4 shrink-0" /> : <Download className="size-4 shrink-0" />} Save
            </button>
            <button onClick={() => uploadRef.current?.click()} className={btn({ variant: "stageOutline", size: "sm", className: "gap-1.5 px-1.5 tracking-normal" })}>
              <RotateCcw className="size-4 shrink-0" /> Retake
            </button>
          </div>
        ) : (
          phase.name === "pick" && (
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => cameraRef.current?.click()} className={btn({ variant: "stage", size: "sm" })}>
                  <Camera className="size-4" /> Take a photo
                </button>
                <button onClick={() => uploadRef.current?.click()} className={btn({ variant: "stageOutline", size: "sm" })}>
                  <ImagePlus className="size-4" /> From gallery
                </button>
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-washi/60">
                <Lock className="mt-px size-3 shrink-0" />
                Your photo is only used to make your picture. We don&apos;t keep it.
              </p>
            </div>
          )
        )}

        {/* Size */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Size {size && <span className="text-washi/60">· {size}</span>}
            </p>
            <button onClick={() => setSizeHelp((o) => !o)} className="flex items-center gap-1 text-[11px] font-bold text-washi/70 hover:text-washi">
              {recommended ? (
                <>
                  Best for you: <b className="text-kin">{recommended}</b>
                </>
              ) : (
                "Help me pick"
              )}
              <ChevronDown className={cn("size-3.5 transition-transform", sizeHelp && "rotate-180")} />
            </button>
          </div>
          {sizeHelp && (
            <div className="mt-2 space-y-2 rounded-xl border border-washi/15 p-3">
              <label className="flex items-center justify-between gap-3 text-xs font-bold">
                Your height
                <span className="flex items-center gap-1.5">
                  <select
                    value={heightFt.ft}
                    onChange={(e) => setHeight(Number(e.target.value), heightFt.inch)}
                    className="rounded-lg border border-washi/25 bg-sumi px-2 py-1 text-base sm:text-sm"
                    aria-label="Feet"
                  >
                    {[4, 5, 6].map((ft) => (
                      <option key={ft} value={ft}>
                        {ft} ft
                      </option>
                    ))}
                  </select>
                  <select
                    value={heightFt.inch}
                    onChange={(e) => setHeight(heightFt.ft, Number(e.target.value))}
                    className="rounded-lg border border-washi/25 bg-sumi px-2 py-1 text-base sm:text-sm"
                    aria-label="Inches"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {i} in
                      </option>
                    ))}
                  </select>
                </span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {BUILDS.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setProfile((p) => ({ ...(p ?? DEFAULT_PROFILE), build: b.value }))}
                    className={cn(
                      "rounded-lg border px-1 py-1.5 text-[11px] font-bold",
                      profile?.build === b.value ? "border-washi bg-washi text-sumi" : "border-washi/20 hover:border-washi/60",
                    )}
                    aria-pressed={profile?.build === b.value}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {SIZES.map((s) => {
              const out = !inStock(s);
              return (
                <button
                  key={s}
                  onClick={() => setPicked(s)}
                  disabled={out}
                  className={cn(
                    "flex h-11 flex-col items-center justify-center rounded-xl border-2 text-sm font-extrabold transition-colors",
                    s === size ? "border-washi bg-washi text-sumi" : "border-washi/20 hover:border-washi/60",
                    out && "cursor-not-allowed opacity-40 line-through",
                  )}
                  aria-pressed={s === size}
                  aria-label={`${s}${out ? ", sold out" : s === recommended ? ", best for you" : ""}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* The buy button stays in reach while the panel scrolls. */}
        <div className="sticky bottom-0 -mx-4 mt-3 bg-[#111117] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 wide:-mx-5 wide:px-5 lg:-mx-6 lg:px-6">
          <button onClick={addToCart} disabled={!size || !inStock(size)} className={btn({ variant: "stage", className: "w-full" })}>
            {size ? `Add ${size} to cart · ${formatBDT(product.price)}` : "Pick your size"}
          </button>
        </div>
      </div>

      <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0]).finally(() => (e.target.value = ""))} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0]).finally(() => (e.target.value = ""))}
      />
    </div>
  );
}
