"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookingModal } from "@/components/booking-modal"
import { Star, Clock, MapPin, Calendar } from "lucide-react"
import { db, auth } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { Skeleton } from "@/components/ui/skeleton"

interface Counselor {
  id: string
  name: string
  title: string
  specialties: string[]
  rating: number
  experience: string
  location: string
  availability: string
  bio: string
  image?: string
  collegeId: string
}

export function CounselorGrid() {
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [collegeId, setCollegeId] = useState<string | null>(null)
  const [userUid, setUserUid] = useState<string | null>(null)

  // Get current user's UID and college ID
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid)
        const studentQuery = query(collection(db, "students"), where("uid", "==", user.uid))
        const studentSnapshot = await getDocs(studentQuery)
        if (!studentSnapshot.empty) {
          const fetchedCollegeId = studentSnapshot.docs[0].data().collegeId
          setCollegeId(fetchedCollegeId)
        }
      }
    })
    return () => unsubscribeAuth()
  }, [])


  useEffect(() => {
    const fetchCounselors = async () => {
        if (!collegeId) {
            setLoading(false);
            return;
        }

        try {
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
}, [collegeId]);

  const handleBookAppointment = (counselor: Counselor) => {
    setSelectedCounselor(counselor)
    setIsBookingOpen(true)
  }
  
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <Skeleton className="h-16 w-16 rounded-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-16 w-16 rounded-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </Card>
      </div>
    )
  }

  if (counselors.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">No counselors available for your college at this time.</div>;
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counselors.map((counselor) => (
          <Card key={counselor.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={counselor.image || "/placeholder.svg"} alt={counselor.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {counselor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{counselor.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{counselor.title}</p>
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{counselor.rating}</span>
                  <span className="text-sm text-muted-foreground">({counselor.experience})</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex flex-wrap gap-1">
                {counselor.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{counselor.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{counselor.availability}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{counselor.bio}</p>
            </div>

            <Button
              onClick={() => handleBookAppointment(counselor)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </Card>
        ))}
      </div>

      <BookingModal
        counselor={selectedCounselor}
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false)
          setSelectedCounselor(null)
        }}
        collegeId={collegeId}
        userUid={userUid}
      />
    </>
  )
}
