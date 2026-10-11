import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwriting",
});

export const metadata: Metadata = {
  title: "HeatCredit | Heat Resilience Decision Engine",
  description: "Assess heat vulnerability and optimize resilience investments.",
};

import { Shell } from "@/components/shell";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body>
        <Suspense fallback={<div>Loading shell...</div>}>
          <Shell>
            {children}
          </Shell>
        </Suspense>
      </body>
    </html>
  );
}
