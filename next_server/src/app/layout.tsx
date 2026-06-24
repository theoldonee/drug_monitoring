import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  title: "SafeGuard MU — AI-Powered Safety Analysis Platform",
  description:
    "SafeGuard MU is an AI-assisted video risk assessment platform for Mauritius, powered by Google Gemini 2.5 Pro. Helping identify substance-related risks and wellbeing concerns with human oversight.",
  keywords: [
    "SafeGuard MU",
    "AI safety",
    "drug monitoring",
    "Mauritius",
    "NDEA",
    "risk assessment",
    "Gemini AI",
  ],
  authors: [{ name: "SafeGuard MU Team" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  themeColor: "#0d9488",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
