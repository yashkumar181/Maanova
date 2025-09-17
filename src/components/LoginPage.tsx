"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../lib/firebase-config"; // We don't need 'db' here anymore for login
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';

export function LoginPage() {
  // REMOVED: collegeId and username are no longer needed for login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      // Login is now simpler and more secure, only using email and password
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({ title: "Login Successful!", description: "Redirecting to your dashboard..." });
      router.push('/'); 

    } catch (error) {
      console.error(error);
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-500">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md border-t-4 border-primary">
        <CardHeader className="text-center">
          <CardTitle>Admin Portal Login</CardTitle>
          <CardDescription>Welcome back. Please sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing In...' : 'Sign In'}</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
           <p className="text-muted-foreground">
                New to the platform?{' '}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Register here
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}