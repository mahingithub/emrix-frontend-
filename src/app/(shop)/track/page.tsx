import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { TrackOrder } from "@/components/order/track-order";
import { getSettings } from "@/lib/backend";

export const metadata: Metadata = { title: "Track your order" };

export default async function TrackPage({ searchParams }: PageProps<"/track">) {
  const { id } = await searchParams;
  const settings = await getSettings();
  return (
    <>
      <PageHeader jp="注文追跡" title="Track your order" kanji="追" crumbs={[{ href: "/", label: "Home" }, { label: "Track order" }]}>
        <p className="mt-4 max-w-xl text-ink/65">
          Enter the order ID from your confirmation along with the phone number you ordered with.
        </p>
      </PageHeader>
      <TrackOrder initialId={typeof id === "string" ? id : ""} supportPhone={settings.phone} />
    </>
  );
}
