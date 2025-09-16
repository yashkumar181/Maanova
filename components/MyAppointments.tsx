"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { VideoCallModal } from "./VideoCallModal";
import { Video, Calendar, Clock, Users } from "lucide-react";

interface Appointment {
  id: string;
  counselorName?: string;
  requestedTime: Timestamp;
  status: 'pending' | 'accepted' | 'declined';
  appointmentType: 'online' | 'offline';
  meetingLink?: string;
}

export function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMeetingUrl, setActiveMeetingUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("studentId", "==", user.uid),
      orderBy("requestedTime", "desc")
    );

    const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
      const fetchedAppointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Appointment));
      
      setAppointments(fetchedAppointments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'declined': return <Badge variant="destructive">Declined</Badge>;
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
    <>
      {activeMeetingUrl && (
        <VideoCallModal
          isOpen={!!activeMeetingUrl}
          roomUrl={activeMeetingUrl}
          onClose={() => setActiveMeetingUrl(null)}
        />
      )}

      <div className="space-y-4">
        {appointments.map((appt) => {
          const appointmentDate = appt.requestedTime.toDate();
          const isJoinable = appt.status === 'accepted' && appt.appointmentType === 'online' && appt.meetingLink;
          
          return (
            <Card key={appt.id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <p className="font-semibold">With {appt.counselorName || "Unknown Counselor"}</p>
                <div className="flex items-center text-sm text-muted-foreground gap-4 flex-wrap">
                  <span className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> {appointmentDate.toLocaleDateString()}</span>
                  <span className="flex items-center"><Clock className="mr-2 h-4 w-4" /> {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="flex items-center font-medium">
                    {appt.appointmentType === 'online' ? <Video className="mr-2 h-4 w-4 text-blue-500" /> : <Users className="mr-2 h-4 w-4 text-slate-600" />}
                    {appt.appointmentType === 'online' ? 'Online Session' : 'In-Person'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 w-full sm:w-auto">
                <div className="w-24 text-center">
                  {getStatusBadge(appt.status)}
                </div>
                {isJoinable ? (
                  <Button onClick={() => setActiveMeetingUrl(appt.meetingLink!)} className="w-32">
                    <Video className="mr-2 h-4 w-4" />
                    Join Call
                  </Button>
                ) : (
                  <div className="w-32" />
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  );
}