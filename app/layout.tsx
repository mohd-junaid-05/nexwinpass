import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EVENT } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(EVENT.siteUrl),
  title: `Builder Pass Studio — ${EVENT.name}`,
  description: `Get your personal builder pass for ${EVENT.name}. Customise, preview, and download your official badge.`,
  openGraph: {
    title: `Builder Pass Studio — ${EVENT.name}`,
    description: `Customise, preview and export your official digital builder pass for ${EVENT.name}.`,
    url: EVENT.siteUrl,
    siteName: EVENT.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Builder Pass Studio — ${EVENT.name}`,
    description: `Customise, preview and export your official digital builder pass for ${EVENT.name}.`,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
