"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase-config';
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ThemeToggle } from './ThemeToggle';
import Link from 'next/link';

type AdminFormData = {
  username: string; password: string; confirmPassword: string;
  collegeName: string; phone: string; gmail: string;
  counsellorName: string; contactDetails: string;
  country: string; state: string; city: string;
  description: string;
};

export function RegistrationPage() {
  const [formData, setFormData] = useState<AdminFormData>({
    username: '', password: '', confirmPassword: '', collegeName: '',
    phone: '', gmail: '', counsellorName: '', contactDetails: '',
    country: '', state: '', city: '', description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prevState => ({ ...prevState, [id]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match!", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.gmail, formData.password);
      const user = userCredential.user;
      const collegeId = `CLG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const { password, confirmPassword, ...dataToSave } = formData;
      await setDoc(doc(db, "admins", collegeId), {
        uid: user.uid,
        ...dataToSave,
      });

      toast({
        title: "Registration Successful!",
        description: `Your College ID is: ${collegeId}. Please save it for login.`,
        duration: 8000,
      });
      router.push('/login');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Registration Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (id: keyof AdminFormData, label: string, type: string = "text") => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={formData[id]} onChange={handleChange} required />
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-500">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-3xl my-8 border-t-4 border-primary">
        <CardHeader className="text-center">
          <CardTitle>Create an Admin Account</CardTitle>
          <CardDescription>Join to support your students' mental wellness journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-8">
            <fieldset>
              <legend className="text-lg font-semibold border-b border-border pb-2 mb-4 w-full">Account Credentials</legend>
              <div className="grid md:grid-cols-2 gap-4">
                {renderInput('username', 'Username')}
                {renderInput('gmail', 'Email', 'email')}
                {renderInput('password', 'Password', 'password')}
                {renderInput('confirmPassword', 'Confirm Password', 'password')}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold border-b border-border pb-2 mb-4 w-full">College & Counsellor</legend>
              <div className="grid md:grid-cols-2 gap-4">
                {renderInput('collegeName', 'College Name')}
                {renderInput('phone', 'Phone', 'tel')}
                {renderInput('counsellorName', 'Head Counsellor Name')}
                {renderInput('contactDetails', 'Counsellor Contact Info')}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold border-b border-border pb-2 mb-4 w-full">Location</legend>
              <div className="grid md:grid-cols-3 gap-4">
                {renderInput('country', 'Country')}
                {renderInput('state', 'State')}
                {renderInput('city', 'City')}
              </div>
            </fieldset>
            
            <div className="space-y-2">
              <Label htmlFor="description">Brief Description</Label>
              <Textarea id="description" value={formData.description} onChange={handleChange} placeholder="Tell us about your institution..." required />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Create Account'}</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}