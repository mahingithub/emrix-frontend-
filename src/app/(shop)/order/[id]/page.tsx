import type { Metadata } from "next";
import { cookies } from "next/headers";
import { OrderConfirmation, OrderNotFound } from "@/components/order/order-confirmation";
import { getOrder, ORDERS_COOKIE } from "@/lib/backend";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function OrderPage({ params }: PageProps<"/order/[id]">) {
  const id = decodeURIComponent((await params).id).toUpperCase();
  // Only the browser that placed the order sees its details here.
  const mine = ((await cookies()).get(ORDERS_COOKIE)?.value ?? "").split(",");
  const order = mine.includes(id) ? await getOrder(id) : null;
  return order ? <OrderConfirmation order={order} /> : <OrderNotFound id={id} />;
}
