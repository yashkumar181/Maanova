"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Calendar, BookOpen, Users, LogOut, User as UserIcon, Menu, X, Check, LineChart } from "lucide-react" // 👈 ADDED LineChart
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ThemeToggle from "@/components/ThemeToggle"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle"

interface StudentData {
  username: string;
  email: string;
}

export function Navigation() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (!isMounted) {
    return (
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  const navLinks = (
    <>
      <Link href="/" onClick={closeMobileMenu}><Button variant="ghost" className="w-full justify-start md:w-auto"><MessageCircle className="mr-2 h-4 w-4" />{t('navigation.chat')}</Button></Link>
      <Link href="/booking" onClick={closeMobileMenu}><Button variant="ghost" className="w-full justify-start md:w-auto"><Calendar className="mr-2 h-4 w-4" />{t('navigation.booking')}</Button></Link>
      <Link href="/resources" onClick={closeMobileMenu}><Button variant="ghost" className="w-full justify-start md:w-auto"><BookOpen className="mr-2 h-4 w-4" />{t('navigation.resources')}</Button></Link>
      <Link href="/forum" onClick={closeMobileMenu}><Button variant="ghost" className="w-full justify-start md:w-auto"><Users className="mr-2 h-4 w-4" />{t('navigation.forum')}</Button></Link>
      <Link href="/assessment" onClick={closeMobileMenu}><Button variant="ghost" className="w-full justify-start md:w-auto"><Check className="mr-2 h-4 w-4" />{t('Assessment')}</Button></Link>
    </>
  );

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">{t('navigation.title')}</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">{navLinks}</div>

          <div className="flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            {loading ? (
              <Skeleton className="h-10 w-24 rounded-md" />
            ) : user && studentData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10"><AvatarFallback>{studentData.username?.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1"><p className="text-sm font-medium leading-none">{studentData.username}</p><p className="text-xs leading-none text-muted-foreground">{studentData.email}</p></div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile"><DropdownMenuItem className="cursor-pointer"><UserIcon className="mr-2 h-4 w-4" /><span>{t('navigation.profile')}</span></DropdownMenuItem></Link>
                  <Link href="/my-appointments"><DropdownMenuItem className="cursor-pointer"><Calendar className="mr-2 h-4 w-4" />My Appointments</DropdownMenuItem></Link>
                  
                  {/* 👇 NEW CODE BLOCK STARTS HERE 👇 */}
                  <Link href="/profile/progress">
                    <DropdownMenuItem className="cursor-pointer">
                      <LineChart className="mr-2 h-4 w-4" />
                      <span>View Progress</span>
                    </DropdownMenuItem>
                  </Link>
                  {/* 👆 NEW CODE BLOCK ENDS HERE 👆 */}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" /><span>{t('navigation.sign_out')}</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login"><Button variant="ghost">{t('navigation.login')}</Button></Link>
                <Link href="/register"><Button>{t('navigation.register')}</Button></Link>
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
                <Link href="/login" onClick={closeMobileMenu}><Button variant="outline" className="w-full">{t('navigation.login')}</Button></Link>
                <Link href="/register" onClick={closeMobileMenu}><Button className="w-full">{t('navigation.register')}</Button></Link>
             </div>
            )}
        </div>
      )}
    </header>
  );
}