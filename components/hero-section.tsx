"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface HeroSectionProps {
  onStartChatClick: () => void;
}

export function HeroSection({ onStartChatClick }: HeroSectionProps) {
  return (
    // --- UPDATED: Increased bottom padding for more space ---
    <section className="text-center pt-12 pb-16 md:pt-20 md:pb-20">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
        Your Mental Health Matters
      </h1>
      
      <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
        A safe, confidential space for college students to access mental health
        support, connect with counselors, and find resources tailored to
        your needs.
      </p>

      <div className="mt-10 flex flex-col items-center sm:flex-row sm:justify-center gap-4">
        <Button 
          size="lg" 
          onClick={onStartChatClick} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 h-auto text-base w-full sm:w-auto"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Start Chat Support
        </Button>

        <Button 
          size="lg" 
          variant="outline" 
          asChild 
          className="rounded-full px-8 py-3 h-auto text-base w-full sm:w-auto"
        >
          <Link href="/resources">
            Browse Resources
          </Link>
        </Button>
      </div>
    </section>
  );
}