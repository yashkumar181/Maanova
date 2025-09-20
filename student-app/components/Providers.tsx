"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n"; // Import our new config

// This is a client component that wraps all our providers
export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The I18nextProvider does not need a 'locale' prop
    <I18nextProvider i18n={i18n}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}