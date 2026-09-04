import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE_URL } from "@/lib/seo/metadata";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Lets every route below use a relative path for canonical/OG URLs
  // instead of requiring absolute ones (Next.js: "using a relative path in a
  // URL-based metadata field without configuring metadataBase will cause a
  // build error"). SITE_URL is a placeholder until a real domain is chosen.
  metadataBase: new URL(SITE_URL),
  title: "Mian Tayyab Steel",
  description:
    "Mian Tayyab Steel (MTS) — structural and industrial steel supplier.",
};

// Minimal root shell — fonts/global CSS only. Marketing chrome lives in
// app/(site)/layout.tsx, admin chrome in app/admin/(protected)/layout.tsx.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-neutral-900">{children}</body>
    </html>
  );
}
