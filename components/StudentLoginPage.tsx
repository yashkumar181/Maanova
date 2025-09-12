"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // Using the alias Next.js sets up

export function StudentLoginPage() {
    const [collegeId, setCollegeId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        if (!collegeId || !email || !password) {
            setMessage('❌ Please fill all fields!');
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const studentDocRef = doc(db, "students", user.uid);
            const docSnap = await getDoc(studentDocRef);

            if (docSnap.exists() && docSnap.data().collegeId === collegeId) {
                setMessage('✅ Login Successful! Redirecting...');
                // Redirect to the user's personal profile page
                router.push('/');
            } else {
                setMessage('❌ Invalid College ID or credentials!');
                await auth.signOut(); // Log out user if college ID is wrong
            }
        } catch (error) {
            console.error(error);
            setMessage('❌ Invalid credentials or network error.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Student Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="collegeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">College ID</label>
                        <input type="text" id="collegeId" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} required className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-style" />
                    </div>
                    <button type="submit" disabled={isLoading} className="button-style">
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    {message && <p className={`mt-4 text-sm text-center ${message.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                </form>
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">Register here</a>
                    </p>
                </div>
            </div>
            <style jsx>{`
                .input-style {
                    margin-top: 0.25rem; display: block; width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; background-color: #F9FAFB; color: #111827;
                }
                .dark .input-style {
                    border-color: #4B5563; background-color: #374151; color: #F9FAFB;
                }
                .button-style {
                    width: 100%; display: flex; justify-content: center; padding: 0.75rem; border: 1px solid transparent; border-radius: 0.5rem; font-medium text-white bg-blue-600 hover:bg-blue-700;
                }
                .button-style:disabled {
                    background-color: #9CA3AF;
                }
            `}</style>
        </div>
    );
}
