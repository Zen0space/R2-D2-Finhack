import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const appName = "Pusat Tabung";
const appDescription =
  "A TNG-style web wallet PWA for tabung circles, member trust, and monthly rotations.";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: appName,
  title: {
    default: "Pusat Tabung",
    template: "%s | Pusat Tabung",
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
    icon: "/icons/pusat-tabung.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: appName,
    title: "Pusat Tabung",
    description: appDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#1976d2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={nunito.variable}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
