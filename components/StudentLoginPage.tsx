"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import ThemeToggle from "./ThemeToggle"; // CORRECTED: Changed to a default import
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export function StudentLoginPage() {
  const [collegeId, setCollegeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!collegeId || !email || !password) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const studentDocRef = doc(db, "students", email);
      const studentDoc = await getDoc(studentDocRef);

      if (!studentDoc.exists() || studentDoc.data().collegeId !== collegeId) {
        throw new Error("Invalid credentials or college ID.");
      }

      await signInWithEmailAndPassword(auth, email, password);
      
      toast({ title: "Login Successful!", description: "Welcome back!" });
      router.push('/');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-slate-900 dark:to-gray-900 p-4 font-sans">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg dark:bg-gray-800 border dark:border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Student Login</h2>
          <p className="text-muted-foreground">Access your mental wellness resources.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="collegeId">College ID</Label>
            <Input id="collegeId" type="text" placeholder="e.g., CLG-ABC123XYZ" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="......" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[2.1rem] text-muted-foreground">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging In..." : "Login"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}