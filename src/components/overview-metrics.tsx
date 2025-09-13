"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Users, MessageCircle, Calendar, BookOpen, Star } from "lucide-react" // Removed AlertTriangle, added Star
import { useState, useEffect } from "react"
import { collection, query, where, Timestamp, getDocs, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../lib/firebase-config'
import { Skeleton } from "@/components/ui/skeleton"

interface OverviewMetricsProps {
  dateRange: string
}

export function OverviewMetrics({ dateRange }: OverviewMetricsProps) {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    chatSessions: 0,
    counselorBookings: 0,
    resourcesAccessed: 0,
    forumPosts: 0,
    avgSessionRating: 0, // <-- NEW METRIC
  });
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

    setLoading(true);
    const getStartDate = (): Date => {
      const date = new Date();
      switch (dateRange) {
        case '24h': date.setHours(date.getHours() - 24); break;
        case '7d': date.setDate(date.getDate() - 7); break;
        case '30d': date.setDate(date.getDate() - 30); break;
        default: date.setDate(date.getDate() - 7); break;
      }
      return date;
    };
    
    const startDate = getStartDate();
    const startTimestamp = Timestamp.fromDate(startDate);

    const queries = {
      activeUsers: query(collection(db, "students"), where("collegeId", "==", collegeId), where("lastActive", ">=", startTimestamp)),
      chatSessions: query(collection(db, "chatSessions"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp)),
      bookings: query(collection(db, "bookings"), where("collegeId", "==", collegeId), where("createdAt", ">=", startTimestamp)),
      resources: query(collection(db, "resourceAccessLogs"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp)),
      forum: query(collection(db, "forumPosts"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp)),
    };

    // This listener will now also calculate the average rating from chat sessions
    const unsubChat = onSnapshot(queries.chatSessions, (snapshot) => {
        let totalRating = 0;
        let ratedSessions = 0;
        snapshot.docs.forEach(doc => {
            if(doc.data().rating){
                totalRating += doc.data().rating;
                ratedSessions++;
            }
        });
        const avgRating = ratedSessions > 0 ? totalRating / ratedSessions : 0;
        setMetrics(prev => ({ ...prev, chatSessions: snapshot.size, avgSessionRating: avgRating }))
    });

    const unsubUsers = onSnapshot(queries.activeUsers, (snapshot) => setMetrics(prev => ({ ...prev, activeUsers: snapshot.size })));
    const unsubBookings = onSnapshot(queries.bookings, (snapshot) => setMetrics(prev => ({ ...prev, counselorBookings: snapshot.size })));
    const unsubResources = onSnapshot(queries.resources, (snapshot) => setMetrics(prev => ({ ...prev, resourcesAccessed: snapshot.size })));
    const unsubForum = onSnapshot(queries.forum, (snapshot) => setMetrics(prev => ({ ...prev, forumPosts: snapshot.size })));

    setLoading(false);
    return () => {
        unsubChat();
        unsubUsers();
        unsubBookings();
        unsubResources();
        unsubForum();
    };
  }, [collegeId, dateRange]);

  const metricDisplayData = [
    { title: "Active Users", value: metrics.activeUsers, icon: Users, description: "Students using the platform", change: "+12%" },
    { title: "Chat Sessions", value: metrics.chatSessions, icon: MessageCircle, description: "AI chatbot interactions", change: "+8%" },
    { title: "Counselor Bookings", value: metrics.counselorBookings, icon: Calendar, description: "Appointments scheduled", change: "+23%" },
    { title: "Resources Accessed", value: metrics.resourcesAccessed, icon: BookOpen, description: "Guides and articles viewed", change: "+15%" },
    { title: "Forum Posts", value: metrics.forumPosts, icon: MessageCircle, description: "New peer support discussions", change: "+5%" },
    // --- CHANGE 2: REPLACED "CRISIS" WITH "AVG. RATING" ---
    { title: "Avg. Session Rating", value: metrics.avgSessionRating.toFixed(1), icon: Star, description: "Average user feedback", change: "+0.1" },
  ];

  if (loading) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="p-6 space-y-2"><Skeleton className="h-6 w-6 rounded-full" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-3/4" /></Card>
            ))}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {metricDisplayData.map((metric) => (
        <Card key={metric.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
                <metric.icon className="h-6 w-6 text-muted-foreground" />
                <div className="flex items-center text-sm font-medium text-green-600"><TrendingUp className="h-4 w-4 mr-1" />{metric.change}</div>
            </div>
            <div className="space-y-1">
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="text-sm font-medium text-foreground">{metric.title}</p>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
        </Card>
      ))}
    </div>
  )
}

