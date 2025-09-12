"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase-config';
import { useToast } from './ui/use-toast';

// Define a type for the form data to avoid TypeScript errors
type AdminFormData = {
  username: string;
  password: string;
  confirmPassword: string;
  collegeName: string;
  phone: string;
  gmail: string;
  counsellorName: string;
  contactDetails: string;
  country: string;
  state: string;
  city: string;
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
      const collegeId = `CLG-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

      await setDoc(doc(db, "admins", collegeId), {
        uid: user.uid,
        username: formData.username,
        collegeName: formData.collegeName,
        phone: formData.phone,
        gmail: formData.gmail,
        counsellorName: formData.counsellorName,
        contactDetails: formData.contactDetails,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        description: formData.description,
      });

      toast({
        title: "Registration Successful!",
        description: `Your College ID is: ${collegeId}. Please save it.`,
      });
      router.push('/login');

    } catch (error) { // <-- THE FIX IS HERE
      console.error(error);
      // This is a type-safe way to handle errors
      if (error instanceof Error) {
        toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Registration Failed", description: "An unknown error occurred.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Admin Registration</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Form fields are generated from an array for cleaner code */}
          {Object.keys(formData).map((key) => {
            if (key === 'description') return null; // Handle textarea separately
            const isPassword = key.toLowerCase().includes('password');
            return (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')} {/* Add space before capital letters */}
                </label>
                <input
                  type={isPassword ? 'password' : 'text'}
                  id={key}
                  value={formData[key as keyof typeof formData]}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  required
                />
              </div>
            );
          })}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

