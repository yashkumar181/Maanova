"use client"

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase-config';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface Resource {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'audio' | 'article' | 'guide' | 'tool';
    category: string;
    url: string;
    collegeId: string;
    createdAt: Timestamp;
}

type NewResourceType = {
    title: string;
    description: string;
    url: string;
    type: string;
    category: string;
}

export function ResourceManagement() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [collegeId, setCollegeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newResource, setNewResource] = useState<NewResourceType>({
        title: "",
        description: "",
        url: "",
        type: "",
        category: "",
    });
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const adminQuery = query(collection(db, "admins"), where("uid", "==", user.uid));
                const adminSnapshot = await getDocs(adminQuery);
                if (!adminSnapshot.empty) {
                    setCollegeId(adminSnapshot.docs[0].id);
                }
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!collegeId) return;
        const resourcesQuery = query(collection(db, "resources"), where("collegeId", "==", collegeId));
        const unsubscribe = onSnapshot(resourcesQuery, (snapshot) => {
            const fetchedResources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
            setResources(fetchedResources);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [collegeId]);

    const handleAddResource = async () => {
        if (!collegeId || !newResource.title || !newResource.url || !newResource.type || !newResource.category) {
            toast({ title: "Error", description: "Please fill out all required fields.", variant: "destructive" });
            return;
        }
        try {
            await addDoc(collection(db, "resources"), {
                ...newResource,
                collegeId,
                createdAt: Timestamp.now(),
            });
            toast({ title: "Success!", description: "New resource has been added." });
            setNewResource({ title: "", description: "", url: "", type: "", category: "" });
            setIsModalOpen(false);
        } catch (error: unknown) {
            console.error("Error adding resource:", error);
            toast({ title: "Error", description: "Could not add resource.", variant: "destructive" });
        }
    };

    const handleDeleteResource = async (resourceId: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this resource?");
        if (confirmed) {
            try {
                await deleteDoc(doc(db, "resources", resourceId));
                toast({ title: "Success!", description: "Resource has been deleted." });
            } catch (error: unknown) {
                console.error("Error deleting resource:", error);
                toast({ title: "Error", description: "Could not delete resource.", variant: "destructive" });
            }
        }
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Resources</CardTitle>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Resource</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add a New Resource</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div><Label htmlFor="title">Title</Label><Input id="title" value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} /></div>
                            <div><Label htmlFor="url">URL</Label><Input id="url" value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} /></div>
                            <div><Label htmlFor="type">Type</Label>
                                <Select onValueChange={(value: string) => setNewResource({ ...newResource, type: value })}>
                                    <SelectTrigger><SelectValue placeholder="Select resource type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="audio">Audio</SelectItem>
                                        <SelectItem value="article">Article</SelectItem>
                                        <SelectItem value="guide">Guide</SelectItem>
                                        <SelectItem value="tool">Tool</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label htmlFor="category">Category</Label><Input id="category" value={newResource.category} onChange={(e) => setNewResource({ ...newResource, category: e.target.value })} /></div>
                            <div><Label htmlFor="description">Description</Label><Textarea id="description" value={newResource.description} onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} /></div>
                        </div>
                        <Button onClick={handleAddResource}>Add Resource</Button>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? <p>Loading resources...</p> : (
                    <Table>
                        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Category</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {resources.length > 0 ? resources.map(res => (
                                <TableRow key={res.id}>
                                    <TableCell className="font-medium">{res.title}</TableCell>
                                    <TableCell className="capitalize">{res.type}</TableCell>
                                    <TableCell>{res.category}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="ghost" size="icon" asChild><a href={res.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteResource(res.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={4} className="text-center">No resources found. Add one to get started.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

