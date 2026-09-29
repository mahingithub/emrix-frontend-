import type { Metadata, Viewport } from "next";
import { Dela_Gothic_One, Hind_Siliguri, Inter, Noto_Sans_JP } from "next/font/google";
import { SITE } from "@emrix/shared/site";
import { SetupScreen } from "@/components/setup-screen";
import { setupProblem } from "@/lib/backend";
import "./globals.css";

const dela = Dela_Gothic_One({
  variable: "--font-dela",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Japanese + Bangla glyphs are loaded on demand via unicode-range.
const notoJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  weight: ["500", "700", "900"],
  preload: false,
  display: "swap",
});

const hind = Hind_Siliguri({
  variable: "--font-hind",
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
};

export const viewport: Viewport = {
  themeColor: "#111116",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Dev only: a clear setup screen instead of a crash before the backend and database are linked.
  const problem = process.env.NODE_ENV === "development" ? await setupProblem() : null;
  return (
    <html
      lang="en"
      className={`${dela.variable} ${inter.variable} ${notoJp.variable} ${hind.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {problem ? <SetupScreen problem={problem} /> : children}
      </body>
    </html>
  );
}
