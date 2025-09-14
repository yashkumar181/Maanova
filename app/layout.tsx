import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { AuthProvider } from "@/hooks/useAuth";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "MindCare | Your Mental Health Platform",
  description: "A safe space for student mental health support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable}`}>
        {/* 1. ThemeProvider is essential for UI components to work */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 2. AuthProvider makes the login state available everywhere */}
          <AuthProvider>
            {/* 3. Navigation is now part of the layout for all pages */}
            <Navigation />
            <main>{children}</main>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        
        <Analytics />
        
        <Script
          src="https://cdn.botpress.cloud/webchat/v3.2/inject.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://files.bpcontent.cloud/2025/09/09/10/20250909105231-ITKTK13R.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}