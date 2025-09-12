"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, query, where, onSnapshot, getDocs } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../lib/firebase-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PlusCircle, Users2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface Counselor {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  image?: string;
}

export function CounselorManagement() {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCounselor, setNewCounselor] = useState({ name: "", title: "", specialties: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

    const counselorsQuery = query(collection(db, "counselors"), where("collegeId", "==", collegeId));
    const unsubscribe = onSnapshot(counselorsQuery, (snapshot) => {
      const fetchedCounselors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Counselor));
      setCounselors(fetchedCounselors);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collegeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCounselor(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCounselor = async () => {
    if (!collegeId || !newCounselor.name || !newCounselor.title) {
      toast({ title: "Error", description: "Name and title are required.", variant: "destructive" });
      return;
    }

    try {
      await addDoc(collection(db, "counselors"), {
        ...newCounselor,
        collegeId,
        specialties: newCounselor.specialties.split(',').map(s => s.trim()), // Convert comma-separated string to array
      });
      toast({ title: "Success", description: "New counsellor has been added." });
      setNewCounselor({ name: "", title: "", specialties: "", bio: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding counsellor:", error);
      toast({ title: "Error", description: "Could not add counsellor.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Counsellors</CardTitle>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Counsellor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Counsellor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={newCounselor.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title (e.g., Licensed Psychologist)</Label>
                <Input id="title" name="title" value={newCounselor.title} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                <Input id="specialties" name="specialties" value={newCounselor.specialties} onChange={handleInputChange} placeholder="Anxiety, Depression, etc." />
              </div>
               <div className="space-y-2">
                <Label htmlFor="bio">Short Bio</Label>
                <Textarea id="bio" name="bio" value={newCounselor.bio} onChange={handleInputChange} />
              </div>
            </div>
            <Button onClick={handleAddCounselor}>Add Counsellor</Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading counsellors...</p> : (
          <div className="space-y-4">
            {counselors.length > 0 ? counselors.map(counselor => (
              <div key={counselor.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                   <Avatar>
                      <AvatarImage src={counselor.image || `https://avatar.vercel.sh/${counselor.name}.png`} />
                      <AvatarFallback>{counselor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  <div>
                    <p className="font-semibold">{counselor.name}</p>
                    <p className="text-sm text-muted-foreground">{counselor.title}</p>
                  </div>
                </div>
                {/* Add Edit/Delete buttons here if needed */}
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users2 className="mx-auto h-12 w-12" />
                <p>No counsellors have been added yet.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
