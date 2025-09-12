"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export function StudentRegisterPage() {
    const [formData, setFormData] = useState({ collegeId: '', username: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        if (!formData.collegeId || !formData.username || !formData.email || !formData.password) {
            setMessage('❌ Please fill all fields!');
            setIsLoading(false);
            return;
        }

        try {
            // Step 1: Verify College ID exists
            const adminDocRef = doc(db, "admins", formData.collegeId);
            const adminDoc = await getDoc(adminDocRef);
            if (!adminDoc.exists()) {
                throw new Error("College ID not found!");
            }

            // Step 2: Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Step 3: Store student data in Firestore
            await setDoc(doc(db, "students", user.uid), {
                username: formData.username,
                email: formData.email,
                collegeId: formData.collegeId,
                createdAt: serverTimestamp()
            });

            setMessage('✅ Registration Successful! Please log in.');
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error: any) {
            console.error(error);
            setMessage(`❌ Registration Failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Student Registration</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label htmlFor="collegeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">College ID</label>
                        <input type="text" id="collegeId" value={formData.collegeId} onChange={handleChange} required className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                        <input type="text" id="username" value={formData.username} onChange={handleChange} required className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" id="email" value={formData.email} onChange={handleChange} required className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input type="password" id="password" value={formData.password} onChange={handleChange} required className="input-style" />
                    </div>
                    <button type="submit" disabled={isLoading} className="button-style">
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                    {message && <p className={`mt-4 text-sm text-center ${message.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                </form>
                 <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Login here</a>
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
