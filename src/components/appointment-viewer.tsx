"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, getDocs, doc, getDoc, updateDoc, orderBy } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../lib/firebase-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "./ui/use-toast"
import { Check, X, Video } from "lucide-react"

interface Appointment {
  id: string; studentName: string; counselorName: string; date: Date; time: string; status: 'pending' | 'confirmed' | 'cancelled'; meetingUrl?: string; hostUrl?: string;
}

export function AppointmentViewer() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => { if (user) { const adminQuery = query(collection(db, "admins"), where("uid", "==", user.uid)); const adminSnapshot = await getDocs(adminQuery); if (!adminSnapshot.empty) { setCollegeId(adminSnapshot.docs[0].id); } else { setLoading(false); } } else { setLoading(false); } }); return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!collegeId) return;
    const bookingsQuery = query(collection(db, "bookings"), where("collegeId", "==", collegeId), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(bookingsQuery, async (snapshot) => {
      const fetchedAppointments = await Promise.all(snapshot.docs.map(async (bookingDoc) => {
        const bookingData = bookingDoc.data();
        const studentSnap = await getDoc(doc(db, "students", bookingData.studentUid));
        const counselorSnap = await getDoc(doc(db, "counselors", bookingData.counselorId));
        return { id: bookingDoc.id, studentName: studentSnap.exists() ? studentSnap.data().username : "Unknown", counselorName: counselorSnap.exists() ? counselorSnap.data().name : "Unknown", date: bookingData.date.toDate(), time: bookingData.time, status: bookingData.status, meetingUrl: bookingData.meetingUrl, hostUrl: bookingData.hostUrl, } as Appointment;
      }));
      setAppointments(fetchedAppointments);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collegeId]);

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      // THIS IS THE FIX: Use the full URL of your DEPLOYED student platform's API
      const studentPlatformUrl = 'https://mental-health-platform-fm71ny3y5-yashkumar181s-projects.vercel.app';

      const response = await fetch(`${studentPlatformUrl}/api/create-meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create video meeting room.');
      }

      const { meetingUrl, hostUrl } = await response.json();
      const appointmentRef = doc(db, "bookings", appointmentId);
      await updateDoc(appointmentRef, { status: "confirmed", meetingUrl: meetingUrl, hostUrl: hostUrl });
      toast({ title: "Success", description: "Appointment confirmed and video link created." });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Error", description: `Could not confirm appointment: ${errorMessage}`, variant: "destructive" });
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const appointmentRef = doc(db, "bookings", appointmentId);
      await updateDoc(appointmentRef, { status: "cancelled" });
      toast({ title: "Appointment Cancelled" });
    } catch (error) {
      toast({ title: "Error", description: "Could not cancel appointment.", variant: "destructive" });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Manage Appointments</CardTitle></CardHeader>
      <CardContent>
        {loading ? <p>Loading...</p> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Counsellor</TableHead><TableHead>Date & Time</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {appointments.length > 0 ? appointments.map(appt => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">{appt.studentName}</TableCell>
                    <TableCell>{appt.counselorName}</TableCell>
                    <TableCell>{appt.date.toLocaleDateString()} at {appt.time}</TableCell>
                    <TableCell>{getStatusBadge(appt.status)}</TableCell>
                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                      {appt.status === 'pending' && (
                        <>
                          <Button size="icon" className="bg-green-600 hover:bg-green-700 h-8 w-8" onClick={() => handleConfirmAppointment(appt.id)}><Check className="h-4 w-4" /></Button>
                          <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleCancelAppointment(appt.id)}><X className="h-4 w-4" /></Button>
                        </>
                      )}
                      {appt.status === 'confirmed' && (
                        <Button asChild size="sm" variant="outline">
                          <a href={appt.hostUrl} target="_blank" rel="noopener noreferrer"><Video className="mr-2 h-4 w-4"/> Join Call</a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (<TableRow><TableCell colSpan={5} className="text-center h-24">No appointments found.</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}