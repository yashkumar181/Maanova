"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Calendar, BookOpen, Users, LogOut, User as UserIcon, Menu, X, Check, LineChart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ThemeToggle from "@/components/ThemeToggle"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle"
import { usePathname } from "next/navigation"; // --- 1. IMPORT the usePathname hook ---

interface StudentData {
  username: string;
  email: string;
}

// --- 2. DEFINE your nav links as an array of objects ---
const navLinkItems = [
  { href: "/", label: "navigation.chat", icon: MessageCircle },
  { href: "/booking", label: "navigation.booking", icon: Calendar },
  { href: "/resources", label: "navigation.resources", icon: BookOpen },
  { href: "/forum", label: "navigation.forum", icon: Users },
  { href: "/assessment", label: "Assessment", icon: Check },
];

export function Navigation() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // --- 3. GET the current URL path ---
  const pathname = usePathname();

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
    // Skeleton loading state remains the same...
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

  // --- 4. MAP over the array to generate links with conditional styling ---
  const navLinks = (
    <>
      {navLinkItems.map((link) => {
        const isActive = pathname === link.href;
        const LinkIcon = link.icon;
        return (
          <Link key={link.href} href={link.href} onClick={closeMobileMenu}>
            <Button 
              variant="ghost" 
              className={`w-full justify-start md:w-auto ${isActive ? "text-primary bg-primary/10" : "text-foreground"}`}
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              {t(link.label)}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* The rest of your header JSX remains largely the same... */}
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
                {/* Dropdown menu JSX remains the same */}
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
                   <Link href="/profile/progress">
                     <DropdownMenuItem className="cursor-pointer">
                       <LineChart className="mr-2 h-4 w-4" />
                       <span>View Progress</span>
                     </DropdownMenuItem>
                   </Link>
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
      {/* Mobile menu panel now uses the same navLinks variable */}
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
