import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://code-pocket.vercel.app"),
  title: "CodePocket",
  description: "Save, organize, and access your favorite code snippets from anywhere. Built with Next.js, TypeScript, and Supabase.",
  keywords: ["code snippets", "snippet manager", "developer tools", "code organization", "vscode extension"],
  authors: [{ name: "Reiniel" }],
  openGraph: {
    title: "CodePocket",
    description: "Save, organize, and access your favorite code snippets from anywhere.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://reiniel.vercel.app",
    siteName: "CodePocket",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CodePocket",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodePocket",
    description: "Save, organize, and access your favorite code snippets from anywhere.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
