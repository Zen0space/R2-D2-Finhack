import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist_Mono, Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { defaultDesignLanguage } from "@/lib/design-language/config";
import "./globals.css";

const appName = "DuitLater";
const appDescription =
  "BM-first shared PayLater app untuk pool komuniti, cadangan barang, dan aliran beli bersama.";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const landingMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: appName,
  title: {
    default: "DuitLater",
    template: "%s | DuitLater",
  },
  description: appDescription,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: appName,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-512.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: appName,
    title: "DuitLater",
    description: appDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#C8941F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-design-language={defaultDesignLanguage} lang="ms">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} ${landingMono.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
