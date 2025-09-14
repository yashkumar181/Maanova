"use client";

import { HeroSection } from '@/components/hero-section';
import { ChatInterface } from '@/components/chat-interface';
import { useAuth } from '@/hooks/useAuth'; // <-- 1. Import the useAuth hook
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

// A new component to show when the user is logged out
const ChatLoginPrompt = () => (
  <div className="text-center p-8 border rounded-lg max-w-4xl mx-auto bg-card">
    <h2 className="text-2xl font-semibold mb-2">Unlock Your Personal Chat Support</h2>
    <p className="text-muted-foreground mb-6">
      Please log in or register to access the confidential AI chat assistant.
    </p>
    <div className="flex justify-center gap-4">
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/register">Register</Link>
      </Button>
    </div>
  </div>
);

export default function HomePage() {
  const { user, loading } = useAuth(); // <-- 2. Get the user's login status

  return (
    // Note: The <Navigation /> component is removed from here as it's now in layout.tsx
    <main className="container mx-auto px-4 py-8 space-y-12">
      <HeroSection />
      
      {/* 3. Conditionally show content based on login status */}
      {loading ? (
        // Show a loading skeleton while we check for a user
        <Skeleton className="h-96 w-full max-w-4xl mx-auto" />
      ) : user ? (
        // If the user is logged in, show the chat interface
        <ChatInterface />
      ) : (
        // If the user is NOT logged in, show the login prompt
        <ChatLoginPrompt />
      )}
    </main>
  );
}