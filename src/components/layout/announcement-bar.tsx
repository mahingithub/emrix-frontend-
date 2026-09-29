import { walletsOn, type StoreSettings } from "@emrix/shared/settings";
import { formatBDT } from "@emrix/shared/utils";
import { Marquee } from "@/components/ui/marquee";

/** Store facts that follow Settings automatically, then the owner's own lines. */
function lines(settings: StoreSettings) {
  const wallets = walletsOn(settings);
  const payWith = [wallets.bkash && "bKash", wallets.nagad && "Nagad"].filter(Boolean).join(" & ");
  return [
    settings.delivery.freeOver > 0 && `Free delivery on orders over ${formatBDT(settings.delivery.freeOver)}`,
    payWith && `${payWith} accepted`,
    ...settings.announcements,
  ].filter((t): t is string => !!t);
}

export function AnnouncementBar({ settings }: { settings: StoreSettings }) {
  const items = lines(settings);
  if (!items.length) return null;
  return (
    <div className="bg-shu py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
      <Marquee
        items={items.map((text) => (
          <span key={text} className={/[ঀ-৿]/.test(text) ? "font-bn normal-case tracking-normal" : undefined}>
            {text}
          </span>
        ))}
        separator={<span className="text-kin">●</span>}
      />
    </div>
  );
}
