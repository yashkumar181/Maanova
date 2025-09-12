"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  Calendar,
  BookOpen,
  Users,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // <-- CORRECTED IMPORT PATH
import ThemeToggle from "@/components/ThemeToggle";

export function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [studentData, setStudentData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch student data from Firestore
        const studentDocRef = doc(db, "students", currentUser.uid);
        const docSnap = await getDoc(studentDocRef);
        if (docSnap.exists()) {
          setStudentData(docSnap.data());
        }
      } else {
        setUser(null);
        setStudentData(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name: string = "") => {
    return name.charAt(0).toUpperCase() || "?";
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">MindCare</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link href="/"><Button variant="ghost" className="flex items-center space-x-2"><MessageCircle className="h-4 w-4" /><span>Chat Support</span></Button></Link>
            <Link href="/booking"><Button variant="ghost" className="flex items-center space-x-2"><Calendar className="h-4 w-4" /><span>Book Counselor</span></Button></Link>
            <Link href="/resources"><Button variant="ghost" className="flex items-center space-x-2"><BookOpen className="h-4 w-4" /><span>Resources</span></Button></Link>
            <Link href="/forum"><Button variant="ghost" className="flex items-center space-x-2"><Users className="h-4 w-4" /><span>Peer Support</span></Button></Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {loading ? (
                <Skeleton className="h-8 w-24 rounded-md" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      {/* Add AvatarImage if you store profile pictures */}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(studentData?.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{studentData?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                     <LayoutDashboard className="mr-2 h-4 w-4" />
                     <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="outline" asChild><Link href="/login">Login</Link></Button>
                <Button asChild><Link href="/register">Register</Link></Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

