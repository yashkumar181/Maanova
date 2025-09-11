import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Mental-Health-Platform",
  description: "Created by commitMints",
  generator: "commitMints",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    
     
    {children}
    <Analytics />
    <script src="https://cdn.botpress.cloud/webchat/v3.2/inject.js" defer></script>
    <script src="https://files.bpcontent.cloud/2025/09/09/10/20250909105231-ITKTK13R.js" defer></script>
  </ThemeProvider>
</body>
    </html>
  );
}
