"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // 👈 ADDED
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export function StudentRegisterPage() {
  const [collegeId, setCollegeId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState(""); // 👈 ADDED
  const [department, setDepartment] = useState("");   // 👈 ADDED
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!collegeId || !username || !email || !password || !confirmPassword || !yearOfStudy || !department) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match. Please try again.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const adminDocRef = doc(db, "admins", collegeId);
      const adminDoc = await getDoc(adminDocRef);
      if (!adminDoc.exists()) {
        throw new Error("Invalid College ID. Please check and try again.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "students", user.uid), {
        uid: user.uid,
        username: username,
        email: email,
        collegeId: collegeId,
        yearOfStudy: yearOfStudy,   // 👈 ADDED
        department: department,     // 👈 ADDED
        createdAt: serverTimestamp(),
      });

      toast({ title: "Registration Successful!", description: "Welcome! Please log in to continue." });
      router.push('/login');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Registration Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-slate-900 dark:to-gray-900 p-4 font-sans">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg dark:bg-gray-800 border dark:border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Create Your Account</h2>
          <p className="text-muted-foreground">Join our community and start your wellness journey.</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="collegeId">College ID</Label>
            <Input id="collegeId" type="text" placeholder="Enter your college-provided ID" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          
          {/* 👇 NEW FIELDS ADDED HERE 👇 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="yearOfStudy">Year of Study</Label>
                <Select onValueChange={setYearOfStudy} value={yearOfStudy}>
                    <SelectTrigger id="yearOfStudy"><SelectValue placeholder="Select Year" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="First">First Year</SelectItem>
                        <SelectItem value="Second">Second Year</SelectItem>
                        <SelectItem value="Third">Third Year</SelectItem>
                        <SelectItem value="Final">Final Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="department">Department</Label>
                <Select onValueChange={setDepartment} value={department}>
                    <SelectTrigger id="department"><SelectValue placeholder="Select Department" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Arts & Sciences">Arts & Sciences</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          {/* 👆 END OF NEW FIELDS 👆 */}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="Must be at least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[2.1rem] text-muted-foreground">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[2.1rem] text-muted-foreground">
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Register"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}