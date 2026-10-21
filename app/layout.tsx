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
  metadataBase: new URL(EVENT.siteUrl || "http://localhost:3000"),
  title: `Builder Pass Studio — ${EVENT.name} | ${EVENT.organizer}`,
  description: `Get your personal builder pass for ${EVENT.name} by ${EVENT.organizer}. ${EVENT.tagline}`,
  openGraph: {
    title: `Builder Pass Studio — ${EVENT.name} | ${EVENT.organizer}`,
    description: `Customise, preview and export your official digital builder pass for ${EVENT.name} by ${EVENT.organizer}.`,
    ...(EVENT.siteUrl ? { url: EVENT.siteUrl } : {}),
    siteName: `${EVENT.name} — ${EVENT.organizer}`,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Builder Pass Studio — ${EVENT.name} | ${EVENT.organizer}`,
    description: `Customise, preview and export your official digital builder pass for ${EVENT.name} by ${EVENT.organizer}.`,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#080C09] text-[#EDF7EE]">{children}</body>
    </html>
  );
}
