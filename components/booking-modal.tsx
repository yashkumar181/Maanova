"use client"

import type React from "react"
import { useState } from "react"
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"
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

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"]

export function BookingModal({ counselor, isOpen, onClose }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const currentUser = auth.currentUser

    if (!counselor || !selectedDate || !selectedTime || !currentUser) {
      toast({ title: "Error", description: "Missing required information.", variant: "destructive" })
      return
    }
    
    setIsSubmitting(true)
    try {
      // Get the student's collegeId to tag the booking
      const studentDoc = await getDoc(doc(db, "students", currentUser.uid))
      if (!studentDoc.exists()) {
        throw new Error("Could not find student profile.");
      }
      const collegeId = studentDoc.data().collegeId

      // Save the new booking to Firestore
      await addDoc(collection(db, "bookings"), {
        counselorId: counselor.id,
        studentUid: currentUser.uid,
        collegeId: collegeId,
        date: Timestamp.fromDate(selectedDate),
        time: selectedTime,
        reason: reason,
        status: "pending", // Admins will need to confirm this
        createdAt: Timestamp.now(),
      })

      setIsBooked(true)
    } catch (error) {
      console.error("Error booking appointment:", error)
      toast({ title: "Booking Failed", description: "Could not book appointment. Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset state when closing the modal
    setIsBooked(false)
    setSelectedDate(new Date())
    setSelectedTime("")
    setReason("")
    onClose()
  }

  if (!counselor) return null

  // Show a success message after booking
  if (isBooked) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <div className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Appointment Requested!</h3>
            <p className="text-muted-foreground mb-4">
              Your request has been sent. You will be notified once the counselor confirms the appointment.
            </p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Book an Appointment with {counselor.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6} // Disable past dates, Sat, Sun
                className="rounded-md border"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="time">Available Times</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime} required>
                  <SelectTrigger><SelectValue placeholder="Select a time" /></SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center space-x-2"><Clock className="h-4 w-4" /><span>{time}</span></div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-sm font-medium">Specialties:</span>
                {counselor.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline">{specialty}</Badge>
                ))}
              </div>
                 <Alert variant="default" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        All appointments are confidential and secure.
                    </AlertDescription>
                </Alert>
            </div>
          </div>
          <div>
            <Label htmlFor="reason">Reason for Appointment (Optional)</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly describe what you'd like to discuss..." />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !selectedTime}>
              {isSubmitting ? "Requesting..." : "Request Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
