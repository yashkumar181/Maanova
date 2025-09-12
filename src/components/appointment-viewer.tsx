"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../lib/firebase-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from "@/components/ui/badge"

interface Appointment {
  id: string;
  studentName: string;
  counselorName: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export function AppointmentViewer() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminQuery = query(collection(db, "admins"), where("uid", "==", user.uid));
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          setCollegeId(adminSnapshot.docs[0].id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!collegeId) return;

    const bookingsQuery = query(collection(db, "bookings"), where("collegeId", "==", collegeId));
    
    const unsubscribe = onSnapshot(bookingsQuery, async (snapshot) => {
      const fetchedAppointments = await Promise.all(snapshot.docs.map(async (bookingDoc) => {
        const bookingData = bookingDoc.data();
        
        // Fetch student and counselor names
        const studentSnap = await getDoc(doc(db, "students", bookingData.studentUid));
        const counselorSnap = await getDoc(doc(db, "counselors", bookingData.counselorId));

        return {
          id: bookingDoc.id,
          studentName: studentSnap.exists() ? studentSnap.data().username : "Unknown Student",
          counselorName: counselorSnap.exists() ? counselorSnap.data().name : "Unknown Counselor",
          date: bookingData.date.toDate(),
          time: bookingData.time,
          status: bookingData.status,
        } as Appointment;
      }));
      
      setAppointments(fetchedAppointments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collegeId]);
  
  return (
    <Card>
      <CardHeader><CardTitle>Upcoming Appointments</CardTitle></CardHeader>
      <CardContent>
        {loading ? <p>Loading appointments...</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Counsellor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length > 0 ? appointments.map(appt => (
                <TableRow key={appt.id}>
                  <TableCell>{appt.studentName}</TableCell>
                  <TableCell>{appt.counselorName}</TableCell>
                  <TableCell>{appt.date.toLocaleDateString()}</TableCell>
                  <TableCell>{appt.time}</TableCell>
                  <TableCell><Badge>{appt.status.toUpperCase()}</Badge></TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="text-center">No appointments found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
