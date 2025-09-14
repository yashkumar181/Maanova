"use client"; // <-- Add this line

import { PeerSupportForum } from "@/components/peer-support-forum";
import { useAuth } from "@/hooks/useAuth";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Skeleton } from "@/components/ui/skeleton";

export default function ForumPage() {
  const { user, loading } = useAuth();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* This header is now always visible */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Peer Support Community</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Connect with fellow students in a safe, moderated environment.
          </p>
        </div>
        
        {/* Conditionally render content below the header */}
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : user ? (
          <PeerSupportForum />
        ) : (
          <LoginPrompt message="You need to be logged in to view the forum and connect with peers." />
        )}
      </div>
    </main>
  );
}