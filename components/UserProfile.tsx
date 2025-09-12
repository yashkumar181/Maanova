"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export function UserProfile() {
    const [studentData, setStudentData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(''); // <-- This is the new line
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            if (user) {
                // User is signed in, fetch their data
                try {
                    const studentDocRef = doc(db, "students", user.uid);
                    const docSnap = await getDoc(studentDocRef);
                    if (docSnap.exists()) {
                        setStudentData(docSnap.data());
                    } else {
                        // This case is unlikely if registration is correct, but good to handle
                        console.error("No student document found for this user.");
                        setMessage("Could not find your profile data.");
                    }
                } catch (error) {
                    console.error("Error fetching student data:", error);
                    setMessage("An error occurred while fetching your data.");
                } finally {
                    setLoading(false);
                }
            } else {
                // No user is signed in, redirect to login page.
                router.push('/login');
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [router]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/login'); // Redirect to login after sign out
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };
    
    // While checking auth and fetching data, show a loading screen
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading Profile...</p>
            </div>
        );
    }
    
    // If student data could not be loaded
    if (!studentData) {
         return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-lg text-red-500 mb-4">{message || "Could not load profile information."}</p>
                <button onClick={handleSignOut} className="button-style">Go to Login</button>
            </div>
         );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
                    Welcome, {studentData.username}!
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{studentData.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">College ID:</span>
                        <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{studentData.collegeId}</span>
                    </div>
                    {/* You can add more profile information here as needed */}
                </div>
                <button onClick={handleSignOut} className="button-style mt-8">
                    Sign Out
                </button>
            </div>
            <style jsx>{`
                .button-style {
                    width: 100%; display: flex; justify-content: center; padding: 0.75rem; border: 1px solid transparent; border-radius: 0.5rem; font-medium text-white bg-red-600 hover:bg-red-700;
                }
            `}</style>
        </div>
    );
}

