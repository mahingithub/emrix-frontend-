"use server";

// Checkout, coupon checks and order tracking. The rules live in the backend; these pass the
// shopper's details along and look after this browser's cookies.
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { CheckoutResult, CouponCheck } from "@emrix/shared/api";
import type { Order } from "@emrix/shared/orders";
import type { CheckoutInput } from "@emrix/shared/schemas";
import { backend, BackendError, ORDERS_COOKIE, visitorHeaders } from "@/lib/backend";

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  let result: CheckoutResult;
  try {
    result = await backend<CheckoutResult>("/storefront/orders", {
      method: "POST",
      body: JSON.stringify(input),
      headers: await visitorHeaders(),
      cache: "no-store",
    });
  } catch (e) {
    console.error("[checkout]", e);
    return { ok: false, message: "We couldn't place your order just now. Please try again in a minute." };
  }
  if (!result.ok) return result;

  // Stock changed: refresh sold-out states and counts on shop pages.
  revalidatePath("/", "layout");

  // Remember orders placed from this browser so the confirmation page can show details.
  const jar = await cookies();
  const mine = (jar.get(ORDERS_COOKIE)?.value ?? "").split(",").filter(Boolean);
  jar.set(ORDERS_COOKIE, [result.code, ...mine].slice(0, 10).join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return result;
}

export async function checkCoupon(code: string, subtotal: number): Promise<CouponCheck> {
  if (typeof code !== "string" || !code.trim()) return { ok: false, error: "Enter a code." };
  if (typeof subtotal !== "number" || !Number.isFinite(subtotal)) return { ok: false, error: "Enter a code." };
  try {
    return await backend<CouponCheck>("/storefront/coupons/check", {
      method: "POST",
      body: JSON.stringify({ code: code.slice(0, 200), subtotal }),
      headers: await visitorHeaders(),
      cache: "no-store",
    });
  } catch (e) {
    if (e instanceof BackendError && e.status === 400) return { ok: false, error: e.message };
    console.error("[coupon]", e);
    return { ok: false, error: "Couldn't check that code right now. Please try again." };
  }
}

/** Tracking requires the order code AND the phone number used to order. */
export async function trackOrder(code: string, phone: string): Promise<Order | null> {
  if (typeof code !== "string" || typeof phone !== "string" || code.length > 20) return null;
  try {
    const { order } = await backend<{ order: Order | null }>("/storefront/orders/track", {
      method: "POST",
      body: JSON.stringify({ code, phone: phone.slice(0, 40) }),
      headers: await visitorHeaders(),
      cache: "no-store",
    });
    return order;
  } catch (e) {
    console.error("[track]", e);
    return null;
  }
}
