"use client"

import type React from "react"
import { useState } from "react"
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock, CheckCircle, AlertCircle, Video, Users } from "lucide-react"
import { db } from "@/lib/firebase"
import { useToast } from "./ui/use-toast"
import { useAuth } from "@/hooks/useAuth"

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

const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]

export function BookingModal({ counselor, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [reason, setReason] = useState("")
  const [appointmentType, setAppointmentType] = useState<'online' | 'offline'>('online')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!counselor || !selectedDate || !selectedTime || !user) {
      toast({ title: "Error", description: "Missing required information.", variant: "destructive" })
      return
    }
    
    setIsSubmitting(true)
    try {
      // Fetch the student's profile document from Firestore
      const studentDocRef = doc(db, "students", user.uid);
      const studentDocSnap = await getDoc(studentDocRef);

      // Extract username and collegeId from the document
      const studentUsername = studentDocSnap.exists() ? studentDocSnap.data().username : "anonymous_user";
      const studentCollegeId = studentDocSnap.exists() ? studentDocSnap.data().collegeId : null;

      // Optional: Prevent booking if collegeId is missing from the student's profile
      if (!studentCollegeId) {
        toast({ title: "Profile Incomplete", description: "Could not find your College ID. Please update your profile before booking.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const [hours, minutes] = selectedTime.split(':').map(Number);
      const requestedDateTime = new Date(selectedDate);
      requestedDateTime.setHours(hours, minutes, 0, 0);

      // Add all necessary fields, including collegeId, to the appointment data
      await addDoc(collection(db, "appointments"), {
        counselorId: counselor.id,
        counselorName: counselor.name,
        studentId: user.uid,
        studentName: user.displayName || "Anonymous Student",
        studentUsername: studentUsername,
        collegeId: studentCollegeId, // This is the new, important field
        requestedTime: Timestamp.fromDate(requestedDateTime),
        reason: reason,
        status: "pending",
        appointmentType: appointmentType,
        meetingLink: "",
        createdAt: Timestamp.now(),
      });

      setIsBooked(true);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({ title: "Booking Failed", description: "Could not book appointment. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClose = () => {
    setIsBooked(false)
    setAppointmentType('online')
    onClose()
  }

  if (!counselor) return null

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
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <Label>1. Select Date</Label>
               <Calendar
                 mode="single"
                 selected={selectedDate}
                 onSelect={setSelectedDate}
                 disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) || date.getDay() === 0 || date.getDay() === 6}
                 className="rounded-md border mx-auto"
               />
             </div>
             <div className="space-y-4">
               <div>
                 <Label>2. Select Time</Label>
                 <Select value={selectedTime} onValueChange={setSelectedTime} required>
                   <SelectTrigger><SelectValue placeholder="Select a time" /></SelectTrigger>
                   <SelectContent>
                     {timeSlots.map((time) => (
                       <SelectItem key={time} value={time}>
                         <div className="flex items-center space-x-2"><Clock className="h-4 w-4" />
                            <span>{`${parseInt(time.split(':')[0]) % 12 || 12}:${time.split(':')[1]} ${parseInt(time.split(':')[0]) >= 12 ? 'PM' : 'AM'}`}</span>
                        </div>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label>3. Choose Session Type</Label>
                 <RadioGroup defaultValue="online" value={appointmentType} onValueChange={(value: 'online' | 'offline') => setAppointmentType(value)} className="mt-2 grid grid-cols-2 gap-2">
                   <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                      <RadioGroupItem value="online" id="online" className="sr-only" />
                      <Video className="mb-2 h-6 w-6" />
                      Online
                   </Label>
                    <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                      <RadioGroupItem value="offline" id="offline" className="sr-only" />
                      <Users className="mb-2 h-6 w-6" />
                      In-Person
                   </Label>
                 </RadioGroup>
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