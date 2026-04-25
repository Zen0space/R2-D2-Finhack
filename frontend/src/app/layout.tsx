import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DuitLater",
  description: "Pool PayLater for B40 households. Sendiri tak mampu, ramai-ramai boleh.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
