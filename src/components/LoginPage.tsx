"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from "../lib/firebase-config";

export function LoginPage() {
  const [collegeId, setCollegeId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!collegeId || !username || !password) {
      setMessage('❌ Please fill all fields!');
      setIsLoading(false);
      return;
    }

    try {
      const adminDocRef = doc(db, "admins", collegeId);
      const docSnap = await getDoc(adminDocRef);

      if (docSnap.exists() && docSnap.data().username === username) {
        const adminData = docSnap.data();
        const adminEmail = adminData.gmail;

        await signInWithEmailAndPassword(auth, adminEmail, password);
        
        setMessage('✅ Login Successful! Redirecting...');
        // On success, navigate to the dashboard within the same app
        router.push('/'); 

      } else {
        setMessage('❌ Invalid College ID or Username!');
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
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="collegeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">College Unique ID</label>
            <input
              type="text"
              id="collegeId"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          {message && (
            <p className={`mt-4 text-sm text-center ${message.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </form>
        <div className="text-center mt-4">
  <p className="text-sm text-gray-600 dark:text-gray-400">
    New college?{' '}
    <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
      Register here
    </a>
  </p>
</div>
      </div>
    </div>
  );
}