"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookingModal } from "@/components/booking-modal"
import { Star, Clock, MapPin, Calendar } from "lucide-react"

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
}

const counselors: Counselor[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    title: "Licensed Clinical Psychologist",
    specialties: ["Anxiety", "Depression", "Academic Stress"],
    rating: 4.9,
    experience: "8 years",
    location: "Campus Health Center",
    availability: "Mon-Fri, 9AM-5PM",
    bio: "Specializes in cognitive behavioral therapy and mindfulness-based interventions for college students.",
    image: "/professional-female-psychologist.png",
  },
  {
    id: "2",
    name: "Dr. Michael Rodriguez",
    title: "Licensed Professional Counselor",
    specialties: ["Relationship Issues", "Social Anxiety", "Identity"],
    rating: 4.8,
    experience: "6 years",
    location: "Student Wellness Center",
    availability: "Tue-Sat, 10AM-6PM",
    bio: "Focuses on helping students navigate relationships, identity development, and social challenges.",
    image: "/professional-male-counselor.jpg",
  },
  {
    id: "3",
    name: "Dr. Priya Patel",
    title: "Clinical Social Worker",
    specialties: ["Trauma", "PTSD", "Cultural Adjustment"],
    rating: 4.9,
    experience: "10 years",
    location: "Campus Health Center",
    availability: "Mon-Thu, 8AM-4PM",
    bio: "Experienced in trauma-informed care and supporting international and diverse student populations.",
    image: "/professional-female-social-worker.jpg",
  },
  {
    id: "4",
    name: "Dr. James Thompson",
    title: "Psychiatrist",
    specialties: ["Medication Management", "Bipolar", "ADHD"],
    rating: 4.7,
    experience: "12 years",
    location: "Medical Center",
    availability: "Wed-Fri, 1PM-7PM",
    bio: "Specializes in psychiatric medication management and treatment of mood and attention disorders.",
    image: "/professional-male-psychiatrist.png",
  },
  {
    id: "5",
    name: "Dr. Lisa Wang",
    title: "Licensed Marriage & Family Therapist",
    specialties: ["Family Issues", "Eating Disorders", "Self-Esteem"],
    rating: 4.8,
    experience: "7 years",
    location: "Student Wellness Center",
    availability: "Mon-Wed, 11AM-7PM",
    bio: "Helps students work through family dynamics, body image issues, and building healthy self-worth.",
    image: "/professional-female-therapist.png",
  },
  {
    id: "6",
    name: "Dr. Ahmed Hassan",
    title: "Licensed Clinical Psychologist",
    specialties: ["Grief & Loss", "Substance Use", "Crisis Intervention"],
    rating: 4.9,
    experience: "9 years",
    location: "Campus Health Center",
    availability: "Thu-Mon, 9AM-5PM",
    bio: "Experienced in crisis intervention and supporting students through major life transitions and losses.",
    image: "/professional-male-psychologist.jpg",
  },
]

export function CounselorGrid() {
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const handleBookAppointment = (counselor: Counselor) => {
    setSelectedCounselor(counselor)
    setIsBookingOpen(true)
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
      />
    </>
  )
}
