"use client"; // <-- Add this line

import { ResourceHub } from "@/components/resource-hub";
import { useAuth } from "@/hooks/useAuth";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResourcesPage() {
  const { user, loading } = useAuth();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* This header is now always visible */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Resource Hub</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Explore a curated collection of videos, articles, and tools to support your mental wellness journey.
          </p>
        </div>
        
        {/* Conditionally render content below the header */}
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : user ? (
          <ResourceHub />
        ) : (
          <LoginPrompt message="You need to be logged in to explore our curated wellness resources." />
        )}
      </div>
    </main>
  );
}