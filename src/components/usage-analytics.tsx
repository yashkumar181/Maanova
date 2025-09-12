"use client"

import { Card } from "./ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { useState, useEffect } from "react"
import { collection, query, where, Timestamp, getDocs, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase-config'; // <-- Updated import

interface UsageAnalyticsProps {
  dateRange: string
}
// ... Your other interface definitions

export function UsageAnalytics({ dateRange }: UsageAnalyticsProps) {
  const [dailyUsage, setDailyUsage] = useState<any[]>([]); // Using any for brevity
  const [hourlyPattern, setHourlyPattern] = useState<any[]>([]);
  const [featureUsage, setFeatureUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDocRef = collection(db, "admins");
          const q = query(adminDocRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const adminDoc = querySnapshot.docs[0];
            setCollegeId(adminDoc.id);
          } else {
            console.error("No admin document found for this user.");
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!collegeId) return;
    setLoading(true);

    let startDate = new Date();
    switch (dateRange) {
      case '24h': startDate.setHours(startDate.getHours() - 24); break;
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
      default: startDate = new Date(0); break;
    }
    const startTimestamp = Timestamp.fromDate(startDate);
    
    const chatQuery = query(collection(db, "chatSessions"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
    const bookingQuery = query(collection(db, "bookings"), where("collegeId", "==", collegeId), where("createdAt", ">=", startTimestamp));
    const resourceQuery = query(collection(db, "resourceAccessLogs"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
    const forumQuery = query(collection(db, "forumPosts"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));

    const fetchData = async () => {
        // ... Your complex data fetching and processing logic remains the same
        setLoading(false);
    };
    
    fetchData(); // Initial fetch
    
    // Set up listeners
    const unsubscribeChat = onSnapshot(chatQuery, fetchData);
    const unsubscribeBooking = onSnapshot(bookingQuery, fetchData);
    const unsubscribeResource = onSnapshot(resourceQuery, fetchData);
    const unsubscribeForum = onSnapshot(forumQuery, fetchData);

    return () => {
        unsubscribeChat();
        unsubscribeBooking();
        unsubscribeResource();
        unsubscribeForum();
    };

  }, [collegeId, dateRange]);

  if (loading) {
    return <div className="text-center p-8">Loading usage analytics...</div>;
  }
  
  if (!collegeId) {
    return <div className="text-center p-8 text-red-600">Please log in to view this section.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Feature Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="chatSessions" fill="#0891b2" name="Chat Sessions" />
              <Bar dataKey="bookings" fill="#f97316" name="Bookings" />
              <Bar dataKey="resources" fill="#22c55e" name="Resources" />
              <Bar dataKey="forum" fill="#a855f7" name="Forum Posts" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Hourly Usage Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="usage" stroke="#0891b2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Feature Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
  data={featureUsage}
  cx="50%"
  cy="50%"
  outerRadius={80}
  fill="#8884d8"
  dataKey="value"
  label={({ name }) => name}
>
  {featureUsage.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.color} />
  ))}
</Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Resources</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Breathing Techniques Video</span>
              <span className="text-sm font-medium">234 views</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Study Stress Guide</span>
              <span className="text-sm font-medium">189 downloads</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Mindfulness Audio</span>
              <span className="text-sm font-medium">156 plays</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sleep Hygiene Article</span>
              <span className="text-sm font-medium">142 reads</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Anxiety Management</span>
              <span className="text-sm font-medium">128 views</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
