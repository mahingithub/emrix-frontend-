import { useSyncExternalStore } from "react";
import { liveDrop, type StoreSettings } from "@emrix/shared/settings";

// Shop pages are cached, so their HTML can outlive a drop. The end time is checked against the
// browser's clock (to the minute); the server's HTML and hydration show the drop while it's set,
// so they always match. The shop layout leaves out a drop that ended before the page was built.
function subscribeMinutes(tick: () => void) {
  const id = setInterval(tick, 60_000);
  return () => clearInterval(id);
}
const thisMinute = () => Math.floor(Date.now() / 60_000) * 60_000;

/** `liveDrop` for client components: the running drop, hidden in the browser once it ends. */
export function useLiveDrop<P extends { slug: string }>(settings: Pick<StoreSettings, "drop">, products: P[]) {
  const now = useSyncExternalStore(subscribeMinutes, thisMinute, () => 0);
  return liveDrop(settings, products, now);
}
