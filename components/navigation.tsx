"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore" // <-- NEW: Import serverTimestamp and updateDoc
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Calendar, BookOpen, Users, LogOut, User as UserIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ThemeToggle from "@/components/ThemeToggle"

interface StudentData {
  username: string;
  email: string;
  collegeId: string;
}

export function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        const studentDocRef = doc(db, "students", currentUser.uid)
        const studentSnap = await getDoc(studentDocRef)
        if (studentSnap.exists()) {
          setStudentData(studentSnap.data() as StudentData)
          
          // --- THIS IS THE FIX ---
          // Update the lastActive timestamp every time the user's session is active.
          try {
            await updateDoc(studentDocRef, {
              lastActive: serverTimestamp(),
            });
          } catch (error) {
            console.error("Error updating lastActive timestamp:", error);
          }
          // --------------------------
        }
      } else {
        setUser(null)
        setStudentData(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav className="bg-card border-b border-border">
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
              <Skeleton className="h-10 w-24 rounded-md" />
            ) : user && studentData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt={studentData.username} />
                      <AvatarFallback>{studentData.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{studentData.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{studentData.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile"><DropdownMenuItem><UserIcon className="mr-2 h-4 w-4" /><span>My Profile</span></DropdownMenuItem></Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /><span>Sign Out</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-2">
                <Link href="/login"><Button variant="ghost">Login</Button></Link>
                <Link href="/register"><Button>Register</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

