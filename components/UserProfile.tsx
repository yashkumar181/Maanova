"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // 👈 ADDED: For navigation
import { onAuthStateChanged, signOut, updateProfile, User } from "firebase/auth";
import { doc, getDoc, setDoc, DocumentData } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { LineChart } from "lucide-react"; // 👈 ADDED: For the button icon

export function UserProfile() {
    const { toast } = useToast();
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [studentData, setStudentData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [yearOfStudy, setYearOfStudy] = useState("");
    const [department, setDepartment] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const studentDocRef = doc(db, "students", currentUser.uid);
                    const docSnap = await getDoc(studentDocRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setStudentData(data);
                        setDisplayName(currentUser.displayName || data.displayName || "");
                        setYearOfStudy(data.yearOfStudy || "");
                        setDepartment(data.department || "");
                    } else {
                        console.error("No student document found for this user.");
                    }
                } catch (error) {
                    console.error("Error fetching student data:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            if (user.displayName !== displayName) {
                await updateProfile(user, { displayName });
            }

            const userDocRef = doc(db, "students", user.uid);
            await setDoc(userDocRef, {
                displayName: displayName,
                yearOfStudy: yearOfStudy,
                department: department
            }, { merge: true });

            setStudentData(prev => ({ ...prev, displayName, yearOfStudy, department }));
            toast({ title: "Success!", description: "Your profile has been updated." });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ title: "Error", description: "Could not update your profile.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };
    
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-8 w-1/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <Skeleton className="h-10 w-full mt-4" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!studentData) {
        return <div className="text-center p-8">Could not load profile information.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">My Profile</CardTitle>
                    <CardDescription>
                        {isEditing ? "Make changes to your profile below." : "View your personal information here."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isEditing ? (
                        // --- VIEW MODE ---
                        <div className="space-y-4">
                            <InfoRow label="Full Name" value={displayName || "Not set"} />
                            <InfoRow label="Username" value={studentData.username} />
                            <InfoRow label="Email" value={user?.email} />
                            <InfoRow label="Year of Study" value={yearOfStudy || "Not set"} />
                            <InfoRow label="Department" value={department || "Not set"} />
                            
                            {/* 👇 NEW CODE BLOCK STARTS HERE 👇 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <Button onClick={() => setIsEditing(true)} variant="outline">Edit Profile</Button>
                                <Link href="/profile/progress">
                                    <Button className="w-full">
                                        <LineChart className="h-4 w-4 mr-2" />
                                        View Progress
                                    </Button>
                                </Link>
                            </div>
                            {/* 👆 NEW CODE BLOCK ENDS HERE 👆 */}
                        </div>
                    ) : (
                        // --- EDIT MODE ---
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Full Name</Label>
                                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year-of-study">Year of Study</Label>
                                <Select value={yearOfStudy} onValueChange={setYearOfStudy}>
                                    <SelectTrigger id="year-of-study"><SelectValue placeholder="Select your year" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Fresher">Fresher</SelectItem>
                                        <SelectItem value="Second">Second</SelectItem>
                                        <SelectItem value="Third">Third</SelectItem>
                                        <SelectItem value="Final">Final</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Select value={department} onValueChange={setDepartment}>
                                    <SelectTrigger id="department"><SelectValue placeholder="Select your department" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Engineering">Engineering</SelectItem>
                                        <SelectItem value="Arts & Sciences">Arts & Sciences</SelectItem>
                                        <SelectItem value="Business">Business</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
                            </div>
                        </div>
                    )}
                    
                    <Separator className="my-6" />
                    <Button variant="destructive" onClick={handleSignOut} className="w-full">Sign Out</Button>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper component for displaying info in view mode
const InfoRow = ({ label, value }: { label: string, value: string | null | undefined }) => (
    <div className="flex justify-between items-center border-b pb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
    </div>
);