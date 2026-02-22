import type { Metadata } from "next";
import {
  EB_Garamond,
  Inter,
  Barlow_Condensed,
  Roboto_Mono,
} from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/providers";
import ServiceWorkerRegister from "@/components/pwa/sw-register";
import OfflineBanner from "@/components/offline/offline-banner";

/**
 * Bible reading text — user-selectable (eb_garamond is default).
 * Loaded as a CSS variable so tokens.css can reference it.
 */
const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

/**
 * UI chrome — Inter variable font (all weights 100–900).
 * Navigation, buttons, labels, settings — anything that isn't Bible text.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Display / chapter numbers — Criterion-poster DNA.
 * Book titles on Journey Phase posters, big chapter numerals, stat heroes.
 */
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

/**
 * Monospace — TSK cross-references, Strong's numbers, code snippets.
 */
const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bible Study App",
    template: "%s — Bible Study App",
  },
  description:
    "A deeply personal Bible reading and study companion — OIA methodology, living portrait personalization, cross-references, and the Vault.",
  manifest: "/manifest.json",
  themeColor: "#C4A040",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bible Study",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="default"
      className={[
        ebGaramond.variable,
        inter.variable,
        barlowCondensed.variable,
        robotoMono.variable,
      ].join(" ")}
    >
      <body className="antialiased">
        <ServiceWorkerRegister />
        <OfflineBanner />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

