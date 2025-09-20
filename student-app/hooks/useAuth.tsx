"use client";

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore"; // <-- Import getDoc
import { auth, db } from '@/lib/firebase';

// 1. Add 'role' to our context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: 'student' | 'admin' | null; // <-- NEW
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'student' | 'admin' | null>(null); // <-- NEW

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // 2. Check if the user is an admin
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          setRole('admin');
        } else {
          setRole('student');
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Pass the role through the provider's value
  return (
    <AuthContext.Provider value={{ user, loading, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};