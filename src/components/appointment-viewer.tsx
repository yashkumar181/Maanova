// src/components/appointment-viewer.tsx (Updated & Corrected)

"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // ✨ NEW: Import
import { db, auth } from "@/lib/firebase-config"; // ✨ NEW: Import auth
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "./ui/use-toast";
import { VideoCallModal } from './VideoCallModal';
import { Video, Users, Check, X } from "lucide-react";

interface Appointment {
  id: string;
  studentName?: string;
  requestedTime: Timestamp;
  status: 'pending' | 'accepted' | 'declined';
  appointmentType: 'online' | 'offline';
  meetingLink?: string;
  reason?: string;
}

export function AppointmentViewer() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkInputs, setLinkInputs] = useState<{ [key: string]: string }>({});
  const [activeMeetingUrl, setActiveMeetingUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);

    const appointmentsQuery = query(
      collection(db, "appointments"),
      orderBy("requestedTime", "desc")
    );

    const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
      const fetchedAppointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Appointment));
      
      console.log("Fetched all appointments:", fetchedAppointments); // For debugging
      setAppointments(fetchedAppointments);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
    
  }, []); // Effect runs once on component mount

  const handleUpdateStatus = async (id: string, status: 'accepted' | 'declined') => {
    const appointmentRef = doc(db, "appointments", id);
    try {
      await updateDoc(appointmentRef, { status });
      toast({ title: "Success", description: `Appointment has been ${status}.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

// src/components/appointment-viewer.tsx

  const handleSaveLink = async (id: string) => {
    const link = linkInputs[id];
    // 🔧 MODIFIED: This line is now less strict to allow for your custom URL
    if (!link || !link.includes(".whereby.com/")) { 
        toast({ title: "Invalid Link", description: "Please provide a valid Whereby meeting link.", variant: "destructive"});
        return;
    }
    const appointmentRef = doc(db, "appointments", id);
    try {
      await updateDoc(appointmentRef, { meetingLink: link });
      toast({ title: "Success", description: "Meeting link has been saved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save the link.", variant: "destructive" });
    }
  };

  const handleInputChange = (id: string, value: string) => {
      setLinkInputs(prev => ({ ...prev, [id]: value }));
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
        <CardHeader>
          <CardTitle>Appointment Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No appointments found.</TableCell>
                </TableRow>
              ) : (
                appointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">{appt.studentName}</TableCell>
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
                                <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(appt.id, 'declined')}><X className="h-4 w-4 mr-1"/> Decline</Button>
                            </div>
                        )}
                        
                        {appt.status === 'accepted' && appt.appointmentType === 'online' && !appt.meetingLink && (
                            <div className="flex gap-2 justify-end">
                                <Input 
                                    placeholder="Paste Whereby link..." 
                                    className="max-w-xs" 
                                    value={linkInputs[appt.id] || ''}
                                    onChange={(e) => handleInputChange(appt.id, e.target.value)}
                                />
                                <Button size="sm" onClick={() => handleSaveLink(appt.id)}>Save</Button>
                            </div>
                        )}

                        {appt.status === 'accepted' && appt.appointmentType === 'online' && appt.meetingLink && (
                            <Button size="sm" onClick={() => setActiveMeetingUrl(appt.meetingLink!)}>
                                <Video className="h-4 w-4 mr-1" /> Join Call
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