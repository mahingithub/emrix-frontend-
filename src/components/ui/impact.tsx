"use client";

import { useEffect } from "react";

/* Storefront "anime hits": a manga impact burst wherever a button is pressed, and a tee that
   flies into the cart. Styles live in the "Impact" section of globals.css. */

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Mounted once in the shop layout: pressing any `btn()` button pops a burst under the finger. */
export function ImpactLayer() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || reducedMotion()) return;
      const target = (e.target as Element | null)?.closest(".btn-fx, [data-impact]");
      if (!target || (target as HTMLButtonElement).disabled) return;
      const burst = document.createElement("span");
      burst.className = "impact-burst";
      burst.style.left = `${e.clientX}px`;
      burst.style.top = `${e.clientY}px`;
      document.body.appendChild(burst);
      burst.addEventListener("animationend", () => burst.remove(), { once: true });
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}

/** Throws a spinning product sticker from `from` into the header cart, then bumps the cart.
 *  Resolves when it lands (straight away if there's nothing to animate). */
export function flyToCart(from: Element | null, imageUrl?: string): Promise<void> {
  const cart = document.querySelector<HTMLElement>("[data-cart-target]");
  if (!from || !cart || reducedMotion()) return Promise.resolve();

  const a = from.getBoundingClientRect();
  const b = cart.getBoundingClientRect();
  const size = 56;
  const x0 = a.left + a.width / 2 - size / 2;
  const y0 = a.top + a.height / 2 - size / 2;
  const dx = b.left + b.width / 2 - size / 2 - x0;
  const dy = b.top + b.height / 2 - size / 2 - y0;

  // The outer box moves sideways at a steady pace while the inner one rises then drops,
  // which traces a throw arc.
  const outer = document.createElement("span");
  outer.className = "fly-track";
  outer.style.left = `${x0}px`;
  outer.style.top = `${y0}px`;
  const token = document.createElement("span");
  token.className = "fly-token";
  if (imageUrl) token.style.backgroundImage = `url("${imageUrl}")`;
  outer.appendChild(token);
  document.body.appendChild(outer);

  const duration = 620;
  const lift = Math.min(160, 60 + Math.abs(dy) * 0.25);
  outer.animate([{ transform: "translateX(0)" }, { transform: `translateX(${dx}px)` }], {
    duration,
    easing: "cubic-bezier(0.4, 0, 0.6, 1)",
  });
  const flight = token.animate(
    [
      { transform: "translateY(0) scale(0.6) rotate(0deg)", easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" },
      { transform: `translateY(${Math.min(0, dy) - lift}px) scale(1.1) rotate(200deg)`, offset: 0.4, easing: "cubic-bezier(0.6, 0, 0.8, 0.4)" },
      { transform: `translateY(${dy}px) scale(0.35) rotate(400deg)` },
    ],
    { duration, fill: "forwards" },
  );

  return flight.finished
    .catch(() => undefined)
    .then(() => {
      outer.remove();
      cart.classList.remove("cart-bump");
      void cart.offsetWidth;
      cart.classList.add("cart-bump");
    });
}
