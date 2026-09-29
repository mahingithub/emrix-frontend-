import Link from "next/link";
import { btn } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <section className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-24">
      <div className="speedlines absolute inset-0" />
      <div className="relative text-center">
        <p className="font-jp text-sm font-black tracking-[0.5em] text-shu">迷子になった</p>
        <h1 className="mt-2 font-display text-[7rem] leading-none text-kin [-webkit-text-stroke:3px_var(--color-ink)] [paint-order:stroke_fill] sm:text-[11rem]">
          404
        </h1>
        <p className="mt-2 font-display text-2xl uppercase sm:text-3xl">This page got isekai&apos;d</p>
        <p className="mx-auto mt-3 max-w-sm text-ink/65">
          It was transported to another world. Let&apos;s get you back to the shop.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={btn()}>
            Back home
          </Link>
          <Link href="/shop" className={btn({ variant: "outline" })}>
            Shop all tees
          </Link>
        </div>
      </div>
    </section>
  );
}
