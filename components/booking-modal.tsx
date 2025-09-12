"use client"

import type React from "react"
import { useState } from "react"
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarDays, Clock, CheckCircle, AlertCircle } from "lucide-react"

// You will need to ensure these are correctly imported from your lib/firebase.ts file
import { db, auth } from "@/lib/firebase"
import { useToast } from "./ui/use-toast"

interface Counselor {
  id: string
  name: string
  title: string
  specialties: string[]
  image?: string
}

interface BookingModalProps {
  counselor: Counselor | null
  isOpen: boolean
  onClose: () => void
}

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

export function BookingModal({ counselor, isOpen, onClose }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [appointmentType, setAppointmentType] = useState<string>("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!counselor || !selectedDate || !selectedTime || !auth.currentUser) {
      toast({
        title: "Error",
        description: "Missing required information for booking.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const studentDoc = await getDoc(doc(db, "students", auth.currentUser.uid))
      const collegeId = studentDoc.exists() ? studentDoc.data()?.collegeId : null

      if (!collegeId) {
        toast({
          title: "Error",
          description: "Could not find your college ID. Please contact support.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      await addDoc(collection(db, "bookings"), {
        counselorId: counselor.id,
        studentUid: auth.currentUser.uid,
        collegeId: collegeId,
        date: selectedDate,
        time: selectedTime,
        appointmentType: appointmentType,
        reason: reason,
        status: "pending",
        createdAt: Timestamp.now(),
      })

      setIsBooked(true)
      toast({
        title: "Success!",
        description: "Your appointment has been booked.",
      })

      setTimeout(() => {
        setIsBooked(false)
        resetForm()
        onClose()
      }, 3000)

    } catch (error) {
      console.error("Error booking appointment:", error)
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedDate(new Date())
    setSelectedTime("")
    setAppointmentType("")
    setReason("")
  }

  if (!counselor) return null

  if (isBooked) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Appointment Booked!</h3>
            <p className="text-muted-foreground mb-4">
              Your appointment with {counselor.name} has been confirmed. You'll receive a confirmation email shortly.
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p>
                <strong>Date:</strong> {selectedDate?.toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {selectedTime}
              </p>
              <p>
                <strong>Type:</strong> {appointmentType}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={counselor.image || "/placeholder.svg"} alt={counselor.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {counselor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">Book with {counselor.name}</h3>
              <p className="text-sm text-muted-foreground">{counselor.title}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            All appointments are confidential. Your information is protected under HIPAA and student privacy laws.
          </AlertDescription>
        </Alert>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="time" className="text-sm font-medium">
                  Available Times
                </Label>
                <Select value={selectedTime} onValueChange={setSelectedTime} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{time}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type" className="text-sm font-medium">
                  Appointment Type
                </Label>
                <Select value={appointmentType} onValueChange={setAppointmentType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial Consultation (50 min)</SelectItem>
                    <SelectItem value="followup">Follow-up Session (50 min)</SelectItem>
                    <SelectItem value="crisis">Crisis Support (30 min)</SelectItem>
                    <SelectItem value="group">Group Therapy (90 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-sm font-medium">Specialties:</span>
                {counselor.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason for Appointment (Optional)
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe what you'd like to discuss (this helps the counselor prepare)"
                rows={3}
              />
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting || !selectedDate || !selectedTime || !appointmentType}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                <>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Book Appointment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
