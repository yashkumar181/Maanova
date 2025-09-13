"use client"

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase-config';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { PlusCircle, Users2, Edit, Trash2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "./ui/skeleton";

interface Counselor {
    id: string;
    name: string;
    title: string;
    specialties: string[];
    bio: string;
    collegeId: string;
}

// Use a more specific type for the form state
type CounselorFormData = Omit<Counselor, 'id' | 'collegeId' | 'specialties'> & { specialties: string };

const initialFormState: CounselorFormData = {
    name: "",
    title: "",
    specialties: "",
    bio: "",
};

export function CounselorManagement() {
    const [counselors, setCounselors] = useState<Counselor[]>([]);
    const [collegeId, setCollegeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<CounselorFormData>(initialFormState);
    const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);
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
        }, (error) => {
            console.error("Error fetching counselors:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [collegeId]);

    const handleOpenModal = (counselor: Counselor | null = null) => {
        setEditingCounselor(counselor);
        if (counselor) {
            // If editing, pre-fill the form with existing data
            setFormData({ ...counselor, specialties: counselor.specialties.join(", ") });
        } else {
            // If adding, use a blank form
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSubmit = async () => {
        if (!collegeId || !formData.name || !formData.title) {
            toast({ title: "Error", description: "Name and Title are required.", variant: "destructive" });
            return;
        }

        // Prepare data by converting specialties string back to an array
        const dataToSave = {
            name: formData.name,
            title: formData.title,
            bio: formData.bio,
            specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
            collegeId
        };

        try {
            if (editingCounselor) {
                // Update existing counselor
                const counselorRef = doc(db, "counselors", editingCounselor.id);
                await updateDoc(counselorRef, dataToSave);
                toast({ title: "Success!", description: "Counselor details updated." });
            } else {
                // Add new counselor
                await addDoc(collection(db, "counselors"), dataToSave);
                toast({ title: "Success!", description: "New counselor has been added." });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving counselor:", error);
            toast({ title: "Error", description: "Could not save counselor details.", variant: "destructive" });
        }
    };
    
    const handleDelete = async (counselorId: string) => {
        if (window.confirm("Are you sure you want to delete this counselor? This action cannot be undone.")) {
            try {
                await deleteDoc(doc(db, "counselors", counselorId));
                toast({ title: "Success!", description: "Counselor has been deleted." });
            } catch (error) {
                 console.error("Error deleting counselor:", error);
                 toast({ title: "Error", description: "Could not delete counselor.", variant: "destructive" });
            }
        }
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Counsellors</CardTitle>
                <Button onClick={() => handleOpenModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Counsellor</Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                     </div>
                ) : (
                    <div className="space-y-4">
                        {counselors.length > 0 ? counselors.map(c => (
                            <div key={c.id} className="border p-4 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarFallback>{c.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{c.name}</p>
                                        <p className="text-sm text-muted-foreground">{c.title}</p>
                                    </div>
                                </div>
                                <div className="space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(c)}><Edit className="mr-2 h-3 w-3" />Edit</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="mr-2 h-3 w-3" />Delete</Button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users2 className="mx-auto h-12 w-12" />
                                <p className="mt-4">No counsellors found. Add one to get started.</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCounselor ? "Edit Counselor" : "Add New Counselor"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div><Label htmlFor="name">Name</Label><Input id="name" value={formData.name} onChange={handleFormChange} /></div>
                        <div><Label htmlFor="title">Title (e.g., Licensed Professional Counselor)</Label><Input id="title" value={formData.title} onChange={handleFormChange} /></div>
                        <div><Label htmlFor="specialties">Specialties (comma-separated)</Label><Input id="specialties" value={formData.specialties} onChange={handleFormChange} placeholder="e.g. Anxiety, Depression, Grief" /></div>
                        <div><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={formData.bio} onChange={handleFormChange} /></div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button onClick={handleSubmit}>{editingCounselor ? "Save Changes" : "Add Counselor"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

