import type { Metadata, Viewport } from "next";
import { Anton, Geist_Mono, Inter, JetBrains_Mono, Permanent_Marker } from "next/font/google";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const appName = "DuitLater";
const appDescription =
  "Shared PayLater app for community pools, AI item suggestions, and group buying.";

const display = Anton({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400"],
});

const brushFallback = Permanent_Marker({
  subsets: ["latin"],
  variable: "--font-brush-fallback",
  display: "swap",
  weight: ["400"],
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
  themeColor: "#2A4F4A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/brand/fonts/Splatink.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} ${landingMono.variable} ${brushFallback.variable} flex min-h-screen flex-col`}
      >
        <AppProviders>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
