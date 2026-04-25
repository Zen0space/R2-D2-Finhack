import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kutu Digitizer",
  description: "Communal savings, on rails the unbanked already use.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
