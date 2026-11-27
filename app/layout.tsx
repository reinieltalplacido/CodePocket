import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";

const bricolageDisplay = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

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
  description: "Save, organize, and access your favorite code snippets from anywhere. Built with Next.js, TypeScript, Prisma, and Neon.",
  icons: {
    icon: "/Glossy Green Code Pocket Icon.png",
    apple: "/Glossy Green Code Pocket Icon.png",
  },
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
        className={`${bricolageDisplay.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
