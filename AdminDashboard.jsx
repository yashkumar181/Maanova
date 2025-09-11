"use client"

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, orderBy, limit, query, Timestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Users, MessageCircle, Calendar, AlertTriangle } from "lucide-react";

// IMPORTANT: Replace with your actual environment variables from your new admin project's .env.local file.
// The values for these should be identical to the ones in your main project's .env.local.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const metricsData = [
  { id: 'chatSessions', title: 'Chat Sessions', color: 'bg-blue-500', icon: MessageCircle },
  { id: 'counselorBookings', title: 'Counselor Bookings', color: 'bg-green-500', icon: Calendar },
  { id: 'forumPosts', title: 'Forum Posts', color: 'bg-purple-500', icon: Users },
  { id: 'crisisEvents', title: 'Crisis Alerts', color: 'bg-red-500', icon: AlertTriangle },
];

export function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    chatSessions: 0,
    counselorBookings: 0,
    forumPosts: 0,
    crisisEvents: 0,
  });
  const [recentCrisisEvents, setRecentCrisisEvents] = useState([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_INITIAL_AUTH_TOKEN;
        if (token) {
          await signInWithCustomToken(auth, token);
        } else {
          await signInAnonymously(auth);
        }
        setIsAuthReady(true);
      } catch (error) {
        console.error("Firebase authentication error:", error);
      }
    };
    authenticateUser();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const unsubscribes = [];
    
    // Listen for real-time updates on metrics
    unsubscribes.push(onSnapshot(collection(db, 'chatSessions'), (snapshot) => {
      setMetrics(prev => ({ ...prev, chatSessions: snapshot.docs.length }));
    }));
    unsubscribes.push(onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setMetrics(prev => ({ ...prev, counselorBookings: snapshot.docs.length }));
    }));
    unsubscribes.push(onSnapshot(collection(db, 'forumPosts'), (snapshot) => {
      setMetrics(prev => ({ ...prev, forumPosts: snapshot.docs.length }));
    }));
    
    // Listen for crisis events and sort by timestamp
    const crisisQuery = query(collection(db, 'crisisEvents'), orderBy('timestamp', 'desc'), limit(5));
    unsubscribes.push(onSnapshot(crisisQuery, (snapshot) => {
      setMetrics(prev => ({ ...prev, crisisEvents: snapshot.docs.length }));
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentCrisisEvents(events);
    }));

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [isAuthReady]);

  return (
    <div className="p-8 space-y-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map(metric => (
          <Card key={metric.id} className="text-center p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`h-6 w-6 ${metric.color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">{metric.title}</h3>
            <p className={`text-4xl font-bold ${metric.color.replace('bg-', 'text-')}`}>{metrics[metric.id]}</p>
          </Card>
        ))}
      </div>

      {/* Recent Crisis Events */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Recent Crisis Events</h2>
        {recentCrisisEvents.length > 0 ? (
          recentCrisisEvents.map(event => (
            <Alert key={event.id} className="bg-red-50 border-red-200 text-red-800">
              <div className="flex items-center justify-between">
                <AlertDescription>
                  <p className="font-medium text-red-800">New Crisis Alert: {event.message}</p>
                  <p className="text-xs">Timestamp: {event.timestamp?.toDate().toLocaleString()}</p>
                </AlertDescription>
                <Badge className="bg-red-600 text-white">Review</Badge>
              </div>
            </Alert>
          ))
        ) : (
          <Alert className="bg-gray-100 text-gray-600">No crisis events to display.</Alert>
        )}
      </div>

      {/* Other sections can be added here, e.g., Forum Moderation, User Analytics */}
    </div>
  );
}
