"use client"; // This line is required for the external chatbot script to load

import { HeroSection } from '@/components/hero-section';
import { Navigation } from '@/components/navigation';
import { ChatInterface } from '@/components/chat-interface'; // Import the chat component

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-12">
        <HeroSection />
        <ChatInterface /> {/* Add the chat component back to the page */}
      </div>
    </main>
  );
}

