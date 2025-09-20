import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { Navigation } from "@/components/navigation";
import { Providers } from "@/components/Providers";



export const metadata: Metadata = {
  title: "MindCare | Your Mental Health Platform",
  description: "A safe space for student mental health support.",
};

// The 'params' prop is no longer needed here
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable}`}>
        {/* The Providers component no longer needs the locale prop */}
        <Providers>
          <Navigation />
          <main>{children}</main>
          <Toaster />
        </Providers>
        
        <Analytics />
        
        <Script src="https://cdn.botpress.cloud/webchat/v3.2/inject.js" strategy="afterInteractive" />
        <Script src="https://files.bpcontent.cloud/2025/09/09/10/20250909105231-ITKTK13R.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
