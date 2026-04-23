import type { Metadata } from "next";
import { Outfit, Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import BetterAuthUIProvider from "@/providers/better-auth-ui-provider";
import { ThemeProvider } from "@/components/theme-provider";

const fontDisplay = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});


export const metadata: Metadata = {
  title: "Evan's Couture",
  description: "Luxury Fashion Point of Sale — Crafted for Excellence",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✦</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontDisplay.variable} ${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased selection:bg-primary/30`}>
        <ThemeProvider>
          <BetterAuthUIProvider>{children}</BetterAuthUIProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

