import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster"; // Import the Toaster
import Script from "next/script";

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
        {/* This ThemeProvider is essential for the dropdown to work */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster /> {/* This is needed for notifications */}
        </ThemeProvider>
        
        <Analytics />
        
        {/* Use the Next.js Script component for external scripts */}
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

