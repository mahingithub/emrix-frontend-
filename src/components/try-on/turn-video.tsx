"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Pause, Play } from "lucide-react";

/**
 * The try-on clip under the shopper's control: drag across it to turn (it scrubs through the
 * clip), tap to pause, or use the slider to stop on any angle. The controls sit below the
 * video, never on top of the person.
 */
export function TurnVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [touched, setTouched] = useState(false);
  const drag = useRef<{ id: number; x: number; from: number; moved: boolean } | null>(null);

  // Smooth progress while playing; timeupdate only fires a few times a second.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const v = ref.current;
      if (v?.duration) setProgress(v.currentTime / v.duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const seek = (fraction: number) => {
    const v = ref.current;
    if (!v?.duration) return;
    v.pause();
    const f = Math.min(0.999, Math.max(0, fraction));
    v.currentTime = f * v.duration;
    setProgress(f);
    setTouched(true);
  };

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    setTouched(true);
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, from: progress, moved: false };
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    d.moved = true;
    // One full swipe across the video runs through the whole clip.
    seek(d.from + dx / (e.currentTarget.clientWidth || 1));
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) toggle();
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      <div
        className="relative min-h-0 flex-1 touch-pan-y touch-pinch-zoom select-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
      >
        <video
          ref={ref}
          src={src}
          className="absolute inset-0 size-full object-contain"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1 px-3 pt-2">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-full border border-washi/20 bg-washi/5 py-1 pl-1 pr-3">
          <button
            onClick={toggle}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-washi text-sumi"
            aria-label={playing ? "Pause video" : "Play video"}
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
          </button>
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(progress * 1000)}
            onChange={(e) => seek(Number(e.target.value) / 1000)}
            className="h-8 w-full cursor-pointer accent-kin"
            aria-label="Turn: choose a moment in the video"
          />
        </div>
        {!touched && <p className="text-[11px] font-bold text-washi/60">Drag the video to turn · tap it to pause</p>}
      </div>
    </div>
  );
}
