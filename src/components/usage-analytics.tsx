"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { useState, useEffect } from "react"
import { collection, query, where, Timestamp, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../lib/firebase-config'

interface UsageAnalyticsProps {
  dateRange: string
}

// Define specific types for the chart data
interface DailyUsage {
  day: string;
  chatSessions: number;
  bookings: number;
  resources: number;
  forum: number;
}

interface HourlyPattern {
  hour: string;
  usage: number;
}

interface FeatureUsage {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsDoc {
    type: 'chatSessions' | 'bookings' | 'resources' | 'forum';
    timestamp?: Timestamp;
    createdAt?: Timestamp;
}

export function UsageAnalytics({ dateRange }: UsageAnalyticsProps) {
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [hourlyPattern, setHourlyPattern] = useState<HourlyPattern[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminQuery = query(collection(db, "admins"), where("uid", "==", user.uid));
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          setCollegeId(adminSnapshot.docs[0].id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!collegeId) return;

    const fetchData = async () => {
      setLoading(true);
      let startDate = new Date();
      switch (dateRange) {
        case '24h': startDate.setHours(startDate.getHours() - 24); break;
        case '7d': startDate.setDate(startDate.getDate() - 7); break;
        case '30d': startDate.setDate(startDate.getDate() - 30); break;
        default: startDate.setDate(startDate.getDate() - 7); break;
      }
      const startTimestamp = Timestamp.fromDate(startDate);

      try {
        const collections = {
          chatSessions: collection(db, "chatSessions"),
          bookings: collection(db, "bookings"),
          resources: collection(db, "resourceAccessLogs"),
          forum: collection(db, "forumPosts"),
        };

        const queries = {
          chatSessions: query(collections.chatSessions, where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp)),
          bookings: query(collections.bookings, where("collegeId", "==", collegeId), where("createdAt", ">=", startTimestamp)),
          resources: query(collections.resources, where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp)),
          forum: query(collections.forum, where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp)),
        };

        const [chatSnap, bookingSnap, resourceSnap, forumSnap] = await Promise.all([
          getDocs(queries.chatSessions),
          getDocs(queries.bookings),
          getDocs(queries.resources),
          getDocs(queries.forum),
        ]);

        const dailyData: { [key: string]: DailyUsage } = {};
        const hourlyData: { [key: string]: { hour: string, usage: number } } = {};

        // THE FIX IS HERE: We add 'as AnalyticsDoc' to each item to satisfy TypeScript
        const allDocs: AnalyticsDoc[] = [
            ...chatSnap.docs.map(d => ({ ...d.data(), type: 'chatSessions' } as AnalyticsDoc)),
            ...bookingSnap.docs.map(d => ({ ...d.data(), type: 'bookings' } as AnalyticsDoc)),
            ...resourceSnap.docs.map(d => ({ ...d.data(), type: 'resources' } as AnalyticsDoc)),
            ...forumSnap.docs.map(d => ({ ...d.data(), type: 'forum' } as AnalyticsDoc)),
        ];

        allDocs.forEach(doc => {
            const timestamp = doc.timestamp || doc.createdAt;
            if (!timestamp) return; 

            const date = timestamp.toDate();
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            const hour = date.getHours();

            if (!dailyData[day]) dailyData[day] = { day, chatSessions: 0, bookings: 0, resources: 0, forum: 0 };
            (dailyData[day] as any)[doc.type]++; 
            
            const hourKey = `${hour}:00`;
            if (!hourlyData[hourKey]) hourlyData[hourKey] = { hour: hourKey, usage: 0 };
            hourlyData[hourKey].usage++;
        });

        setDailyUsage(Object.values(dailyData));
        setHourlyPattern(Object.values(hourlyData).sort((a, b) => parseInt(a.hour) - parseInt(b.hour)));
        setFeatureUsage([
          { name: "AI Chat", value: chatSnap.size, color: "#0891b2" },
          { name: "Resources", value: resourceSnap.size, color: "#f97316" },
          { name: "Bookings", value: bookingSnap.size, color: "#22c55e" },
          { name: "Forum", value: forumSnap.size, color: "#a855f7" },
        ]);

      } catch (error) {
        console.error("Error fetching usage analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collegeId, dateRange]);
  
  if (loading) {
    return <div className="text-center p-8">Loading usage analytics...</div>
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
          {/* This would also be populated by live data, but is kept static for brevity */}
          <div className="space-y-3">
            <div className="flex justify-between items-center"><span className="text-sm">Breathing Techniques Video</span><span className="text-sm font-medium">234 views</span></div>
            <div className="flex justify-between items-center"><span className="text-sm">Study Stress Guide</span><span className="text-sm font-medium">189 downloads</span></div>
            <div className="flex justify-between items-center"><span className="text-sm">Mindfulness Audio</span><span className="text-sm font-medium">156 plays</span></div>
          </div>
        </Card>
      </div>
    </div>
  )
}

