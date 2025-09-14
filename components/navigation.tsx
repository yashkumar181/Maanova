"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Calendar, BookOpen, Users, LogOut, User as UserIcon, Menu, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ThemeToggle from "@/components/ThemeToggle"

interface StudentData {
  username: string;
  email: string;
}

export function Navigation() {
  const { user, loading } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (user) {
        const studentDocRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentDocRef);
        if (studentSnap.exists()) {
          setStudentData(studentSnap.data() as StudentData);
          await updateDoc(studentDocRef, { lastActive: serverTimestamp() });
        }
      } else {
        setStudentData(null);
      }
    };
    if (!loading) {
      fetchStudentData();
    }
  }, [user, loading]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinks = (
    <>
      <Link href="/"><Button variant="ghost" className="w-full justify-start md:w-auto"><MessageCircle className="mr-2 h-4 w-4" />Chat Support</Button></Link>
      <Link href="/booking"><Button variant="ghost" className="w-full justify-start md:w-auto"><Calendar className="mr-2 h-4 w-4" />Book Counselor</Button></Link>
      <Link href="/resources"><Button variant="ghost" className="w-full justify-start md:w-auto"><BookOpen className="mr-2 h-4 w-4" />Resources</Button></Link>
      <Link href="/forum"><Button variant="ghost" className="w-full justify-start md:w-auto"><Users className="mr-2 h-4 w-4" />Peer Support</Button></Link>
    </>
  );

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">MindCare</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">{navLinks}</div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {loading ? (
              <Skeleton className="h-10 w-24 rounded-md" />
            ) : user && studentData ? (
              <DropdownMenu>
                {/* --- THIS IS THE CHANGE --- */}
                {/* We are now using a simple Button instead of an Avatar */}
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <UserIcon className="mr-2 h-4 w-4" />
                    {studentData.username}
                  </Button>
                </DropdownMenuTrigger>
                {/* --------------------------- */}
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{studentData.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{studentData.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile"><DropdownMenuItem><UserIcon className="mr-2 h-4 w-4" />My Profile</DropdownMenuItem></Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login"><Button variant="ghost">Login</Button></Link>
                <Link href="/register"><Button>Register</Button></Link>
              </div>
            )}
            
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border p-4 space-y-2">
          {navLinks}
           {!user && !loading && (
             <div className="border-t pt-4 space-y-2">
                <Link href="/login"><Button variant="outline" className="w-full">Login</Button></Link>
                <Link href="/register"><Button className="w-full">Register</Button></Link>
             </div>
           )}
        </div>
      )}
    </header>
  )
}