"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Video, Calendar, Clock } from "lucide-react";

interface Appointment {
  id: string;
  counselorId: string;
  counselorName?: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  meetingUrl?: string;
}

export function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("studentUid", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(bookingsQuery, async (snapshot) => {
      const fetchedAppointments = await Promise.all(snapshot.docs.map(async (bookingDoc) => {
        const bookingData = bookingDoc.data();
        const counselorSnap = await getDoc(doc(db, "counselors", bookingData.counselorId));
        
        return {
          id: bookingDoc.id,
          ...bookingData,
          counselorName: counselorSnap.exists() ? counselorSnap.data().name : "Unknown Counselor",
          date: bookingData.date.toDate(),
        } as Appointment;
      }));
      setAppointments(fetchedAppointments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg">
        <p className="text-muted-foreground">You have no scheduled appointments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appt) => (
        <Card key={appt.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <p className="font-semibold">With {appt.counselorName}</p>
            <div className="flex items-center text-sm text-muted-foreground gap-4">
              <span className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> {appt.date.toLocaleDateString()}</span>
              <span className="flex items-center"><Clock className="mr-2 h-4 w-4" /> {appt.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none">{getStatusBadge(appt.status)}</div>
            {appt.status === 'confirmed' && appt.meetingUrl && (
              <Button asChild className="w-full sm:w-auto">
                <a href={appt.meetingUrl} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-4 w-4" />
                  Join Call
                </a>
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}