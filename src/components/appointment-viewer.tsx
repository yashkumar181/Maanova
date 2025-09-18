"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, Timestamp, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "./ui/use-toast";
import { VideoCallModal } from './VideoCallModal';
import { Video, Users, Check, X } from "lucide-react";

interface Appointment {
  id: string;
  studentUsername?: string;
  counselorName?: string;
  requestedTime: Timestamp;
  status: 'pending' | 'accepted' | 'declined';
  appointmentType: 'online' | 'offline';
  hostMeetingLink?: string;
}

// 👇 The component now accepts the collegeId as a prop
export function AppointmentViewer({ collegeId }: { collegeId: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMeetingUrl, setActiveMeetingUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!collegeId) {
      setLoading(false);
      return; // Do nothing if there's no collegeId
    }
    setLoading(true);
    // 👇 The query is now filtered by collegeId
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("collegeId", "==", collegeId),
      orderBy("requestedTime", "desc")
    );
    const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
      const fetchedAppointments = snapshot.docs.map(doc => ({
        id: doc.id, ...doc.data(),
      } as Appointment));
      setAppointments(fetchedAppointments);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collegeId]);


  const handleUpdateStatus = async (id: string, status: 'accepted' | 'declined') => {
    const appointmentRef = doc(db, "appointments", id);

    if (status === 'declined') {
      try {
        await updateDoc(appointmentRef, { status });
        toast({ title: "Success", description: "Appointment has been declined." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
      }
      return;
    }

    if (status === 'accepted') {
      try {
        const response = await fetch('/api/create-meeting', { method: 'POST' });

        if (!response.ok) {
          throw new Error('Failed to create the meeting link.');
        }

        const meetingLinks = await response.json();
        const { participantUrl, hostUrl } = meetingLinks;

        await updateDoc(appointmentRef, {
          status: 'accepted',
          meetingLink: participantUrl,
          hostMeetingLink: hostUrl,
        });

        toast({ title: "Success", description: "Appointment accepted and video link created!" });

      } catch (error) {
        console.error("Error accepting appointment:", error);
        toast({ title: "Error", description: "Could not create video link. Please try again.", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
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
      <Card>
        <CardHeader><CardTitle>Appointment Requests</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Counselor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">No appointments found.</TableCell>
                </TableRow>
              ) : (
                appointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">{appt.studentUsername || "anonymous_user"}</TableCell>
                    <TableCell>{appt.counselorName || "N/A"}</TableCell>
                    <TableCell>{appt.requestedTime.toDate().toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={appt.appointmentType === 'online' ? 'default' : 'secondary'} className="flex items-center w-fit">
                        {appt.appointmentType === 'online' ? <Video className="mr-1 h-3 w-3" /> : <Users className="mr-1 h-3 w-3" />}
                        {appt.appointmentType === 'online' ? 'Online' : 'In-Person'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        appt.status === 'accepted' ? 'default' :
                          appt.status === 'pending' ? 'outline' : 'destructive'
                      }>{appt.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-y-2">
                      {appt.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(appt.id, 'accepted')}><Check className="h-4 w-4 mr-1" /> Accept</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(appt.id, 'declined')}><X className="h-4 w-4 mr-1" /> Decline</Button>
                        </div>
                      )}
                      {appt.status === 'accepted' && appt.appointmentType === 'online' && appt.hostMeetingLink && (
                          <Button size="sm" asChild>
                            <a href={appt.hostMeetingLink} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-1" /> Join as Host
                            </a>
                          </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}