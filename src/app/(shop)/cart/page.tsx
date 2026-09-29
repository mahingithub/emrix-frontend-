import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/cart-page";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return <CartPageView />;
}
