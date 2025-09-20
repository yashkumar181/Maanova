"use client";

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

// 1. Add title and message to the props
interface AuthGuardProps {
  children: React.ReactNode;
  title: string;
  message: string;
}

export const AuthGuard = ({ children, title, message }: AuthGuardProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  // 2. Use the props to display the correct text
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="max-w-md w-full border bg-card text-card-foreground p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};