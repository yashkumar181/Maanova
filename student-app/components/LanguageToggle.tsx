"use client";

import { useTranslation } from 'react-i18next';
import { Button } from "./ui/button";
import { useState, useEffect } from 'react'; // <-- 1. Import hooks

export function LanguageToggle() {
  const { i18n } = useTranslation();
  
  // 2. Add state to check if the component has mounted on the client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // 3. Don't render anything on the server to prevent the mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
      }}
    >
      {i18n.language.startsWith('hi') ? 'English' : 'हिन्दी'}
    </Button>
  );
}