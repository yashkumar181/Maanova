"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookingModal } from "@/components/booking-modal"
import { Star, Clock, MapPin, Calendar } from "lucide-react"
import { db, auth } from "@/lib/firebase"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged, User } from "firebase/auth"
import { Skeleton } from "@/components/ui/skeleton"

interface Counselor {
  id: string
  name: string
  title: string
  specialties: string[]
  bio: string
  image?: string
  // Add other fields you might have, like rating, location etc.
}

export function CounselorGrid() {
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // If user logs out, we could clear counselors, etc.
      if (!currentUser) {
        setLoading(false);
        setCounselors([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch counselors once we have a logged-in user
  useEffect(() => {
    const fetchCounselors = async () => {
      if (!user) return; // Don't fetch if no user is logged in
      
      setLoading(true);
      try {
        // 1. Find the student's collegeId
        const studentDocRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentDocRef);

        if (!studentSnap.exists()) {
          throw new Error("Student profile not found.");
        }
        const collegeId = studentSnap.data().collegeId;

        // 2. Fetch counsellors for that collegeId
        const q = query(collection(db, "counselors"), where("collegeId", "==", collegeId));
        const querySnapshot = await getDocs(q);
        const fetchedCounselors: Counselor[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Counselor));
        
        setCounselors(fetchedCounselors);
      } catch (error) {
        console.error("Error fetching counselors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounselors();
  }, [user]); // Re-run this effect when the user state changes

  const handleBookAppointment = (counselor: Counselor) => {
    setSelectedCounselor(counselor)
    setIsBookingOpen(true)
  }
  
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-24" /></div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full mt-4" />
          </Card>
        ))}
      </div>
    )
  }

  if (!user) {
    return (
        <Card className="text-center p-8">
            <h3 className="text-lg font-semibold">Please Log In</h3>
            <p className="text-muted-foreground mb-4">You need to be logged in to book an appointment.</p>
            <Button asChild><a href="/login">Go to Login</a></Button>
        </Card>
    );
  }

  if (counselors.length === 0) {
    return <Card className="text-center p-8 text-muted-foreground">No counselors are available for your college at this time.</Card>;
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counselors.map((counselor) => (
          <Card key={counselor.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col">
            <div className="flex items-start space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={counselor.image || `https://avatar.vercel.sh/${counselor.name}.png`} alt={counselor.name} />
                <AvatarFallback>{counselor.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{counselor.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{counselor.title}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4 flex-grow">
              <div className="flex flex-wrap gap-1">
                {counselor.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">{specialty}</Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{counselor.bio}</p>
            </div>

            <Button onClick={() => handleBookAppointment(counselor)} className="w-full mt-auto">
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </Card>
        ))}
      </div>

      <BookingModal
        counselor={selectedCounselor}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  )
}
