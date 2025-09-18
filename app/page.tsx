"use client";

import { HeroSection } from '@/components/hero-section';
import { ChatInterface } from '@/components/chat-interface';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useRef } from 'react';
import { FeatureCards } from '@/components/feature-cards';

export const dynamic = 'force-dynamic';

const ChatLoginPrompt = () => (
  // Using theme-aware classes here as well
  <div className="text-center p-8 border rounded-lg max-w-4xl mx-auto bg-card">
    <h2 className="text-2xl font-semibold mb-2">Unlock Your Personal Chat Support</h2>
    <p className="text-muted-foreground mb-6">
      Please log in or register to access the confidential AI chat assistant.
    </p>
    <div className="flex justify-center gap-4">
      <Button asChild><Link href="/login">Login</Link></Button>
      <Button variant="outline" asChild><Link href="/register">Register</Link></Button>
    </div>
  </div>
);

export default function HomePage() {
  const { user, loading } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleStartChatClick = () => {
    chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    // --- UPDATED: Using theme-aware classes instead of hardcoded colors ---
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4">
        <HeroSection onStartChatClick={handleStartChatClick} />
        <FeatureCards />
        <div ref={chatContainerRef} className="py-20 md:py-24">
          {loading ? (
            <Skeleton className="h-96 w-full max-w-4xl mx-auto" />
          ) : user ? (
            <ChatInterface />
          ) : (
            <ChatLoginPrompt />
          )}
        </div>
      </main>
    </div>
  );
}