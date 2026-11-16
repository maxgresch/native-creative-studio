import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Native Creative Studio",
  description: "Vom Briefing und Quellenmaterial zu Native-Ansätzen und einer gestalteten Leseprobe.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
