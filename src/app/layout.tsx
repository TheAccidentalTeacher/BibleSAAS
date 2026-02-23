import type { Metadata, Viewport } from "next";
import {
  EB_Garamond,
  Lora,
  Merriweather,
  Literata,
  Inter,
  Barlow_Condensed,
  Roboto_Mono,
} from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/providers";
import ServiceWorkerRegister from "@/components/pwa/sw-register";
import OfflineBanner from "@/components/offline/offline-banner";
import { createClient } from "@/lib/supabase/server";

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

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const literata = Literata({
  variable: "--font-literata",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bible Study",
  },
};

export const viewport: Viewport = {
  themeColor: "#C4A040",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ── Read user display preferences for SSR theme application ──
  let dataTheme = "default";
  let dataMode: string | undefined = "sepia"; // soft default for new/logged-out users
  let fontReading = 'var(--font-garamond), "Georgia", serif';
  let textBodySize = "18px";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: ds } = await supabase
        .from("user_display_settings")
        .select("visual_theme, theme, font_size, bible_reading_font")
        .eq("user_id", user.id)
        .maybeSingle();
      if (ds) {
        const row = ds as {
          visual_theme?: string;
          theme?: string;
          font_size?: string;
          bible_reading_font?: string;
        };
        if (row.visual_theme) dataTheme = row.visual_theme;
        if (row.theme === "dark") dataMode = undefined;
        else if (row.theme === "light" || row.theme === "sepia") dataMode = row.theme;
        const fontMap: Record<string, string> = {
          eb_garamond: 'var(--font-garamond), "Georgia", serif',
          lora: 'var(--font-lora), "Georgia", serif',
          merriweather: 'var(--font-merriweather), "Georgia", serif',
          literata: 'var(--font-literata), "Georgia", serif',
          system_serif: '"Georgia", "Times New Roman", serif',
        };
        if (row.bible_reading_font && fontMap[row.bible_reading_font]) {
          fontReading = fontMap[row.bible_reading_font];
        }
        const sizeMap: Record<string, string> = {
          small: "16px",
          medium: "18px",
          large: "20px",
          xlarge: "22px",
        };
        if (row.font_size && sizeMap[row.font_size]) {
          textBodySize = sizeMap[row.font_size];
        }
      }
    }
  } catch {
    // Non-fatal — fall back to defaults
  }

  const htmlStyle = {
    "--font-reading": fontReading,
    "--text-body-size": textBodySize,
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      data-theme={dataTheme}
      {...(dataMode ? { "data-mode": dataMode } : {})}
      className={[
        ebGaramond.variable,
        lora.variable,
        merriweather.variable,
        literata.variable,
        inter.variable,
        barlowCondensed.variable,
        robotoMono.variable,
      ].join(" ")}
      style={htmlStyle}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ServiceWorkerRegister />
        <OfflineBanner />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

