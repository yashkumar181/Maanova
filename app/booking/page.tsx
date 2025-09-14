"use client"; // <-- Add this line

import { CounselorGrid } from "@/components/counselor-grid";
import { useAuth } from "@/hooks/useAuth";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingPage() {
  const { user, loading } = useAuth();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* This header is now always visible */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Book a Counselor</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with qualified mental health professionals who understand the unique challenges of college life.
          </p>
        </div>

        {/* Conditionally render content below the header */}
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : user ? (
          <CounselorGrid />
        ) : (
          <LoginPrompt message="You need to be logged in to book an appointment." />
        )}
      </div>
    </main>
  );
}