import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";

import { defaultLocale, isLocale } from "@/lib/i18n";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Labbely",
  description: "Print-ready barcode labels for Odoo or manual workflows.",
  icons: {
    icon: [
      { url: "/brand/labbely-icon.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/labbely-icon.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/labbely-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/labbely-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const localeHeader = headerList.get("x-next-intl-locale");
  const locale = localeHeader && isLocale(localeHeader) ? localeHeader : defaultLocale;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
