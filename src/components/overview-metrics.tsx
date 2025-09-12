"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, MessageCircle, Calendar, BookOpen, AlertTriangle, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { collection, query, where, Timestamp, getAggregateFromServer, count, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase-config'; // <-- Updated import

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
    crisisInterventions: 0,
    satisfactionScore: 0,
    responseTime: 0
  });

  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Use onAuthStateChanged to get the current user and their college ID
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDocRef = collection(db, "admins");
          const q = query(adminDocRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const adminDoc = querySnapshot.docs[0];
            const fetchedCollegeId = adminDoc.id;
            setCollegeId(fetchedCollegeId);
          } else {
            console.error("No admin document found for this user.");
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
      } else {
        // If no user, set loading to false to prevent infinite loading state
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch metrics whenever the collegeId or dateRange changes
  useEffect(() => {
    if (!db || !collegeId) return;

    const now = new Date();
    let startDate = new Date();
    
    switch(dateRange) {
      case '24h': startDate.setHours(now.getHours() - 24); break;
      case '7d': startDate.setDate(now.getDate() - 7); break;
      case '30d': startDate.setDate(now.getDate() - 30); break;
      case '90d': startDate.setDate(now.getDate() - 90); break;
      case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
      default: startDate = new Date(0); break;
    }
    
    const startTimestamp = Timestamp.fromDate(startDate);
    
    const fetchMetrics = async () => {
      try {
        const userQuery = query(collection(db, "students"), where("collegeId", "==", collegeId), where("lastActive", ">=", startTimestamp));
        const userSnapshot = await getAggregateFromServer(userQuery, { count: count() });

        const chatQuery = query(collection(db, "chatSessions"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
        const chatSnapshot = await getAggregateFromServer(chatQuery, { count: count() });

        const bookingQuery = query(collection(db, "bookings"), where("collegeId", "==", collegeId), where("createdAt", ">=", startTimestamp));
        const bookingSnapshot = await getAggregateFromServer(bookingQuery, { count: count() });

        const forumQuery = query(collection(db, "forumPosts"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
        const forumSnapshot = await getAggregateFromServer(forumQuery, { count: count() });

        const crisisQuery = query(collection(db, "crisisEvents"), where("collegeId", "==", collegeId), where("createdAt", ">=", startTimestamp));
        const crisisSnapshot = await getAggregateFromServer(crisisQuery, { count: count() });

        const resourceQuery = query(collection(db, "resourceAccessLogs"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
        const resourceSnapshot = await getAggregateFromServer(resourceQuery, { count: count() });

        setMetrics({
          activeUsers: userSnapshot.data().count,
          chatSessions: chatSnapshot.data().count,
          counselorBookings: bookingSnapshot.data().count,
          forumPosts: forumSnapshot.data().count,
          crisisInterventions: crisisSnapshot.data().count,
          resourcesAccessed: resourceSnapshot.data().count,
          satisfactionScore: 0, // Placeholder
          responseTime: 0 // Placeholder
        });

      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
      }
    };
    
    fetchMetrics();
  }, [collegeId, dateRange]);


  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> {/* Skeleton placeholder */} </div>;
  }
  
  if (!collegeId) {
    // This part might not be visible due to the redirect in the parent, but it's good practice.
    return <div className="text-center p-8 text-red-600">Could not verify admin status.</div>;
  }


  const metricsDisplay = [
    {
      title: "Chat Sessions",
      value: metrics.chatSessions.toString(),
      change: "+8%", // Mock
      trend: "up",
      icon: MessageCircle,
      description: "AI chatbot interactions",
    },
    {
      title: "Counselor Bookings",
      value: metrics.counselorBookings.toString(),
      change: "+23%", // Mock
      trend: "up",
      icon: Calendar,
      description: "Appointments scheduled",
    },
    {
      title: "Forum Posts",
      value: metrics.forumPosts.toString(),
      change: "-5%", // Mock
      trend: "down",
      icon: MessageCircle,
      description: "New peer support discussions",
    },
    {
      title: "Crisis Interventions",
      value: metrics.crisisInterventions.toString(),
      change: "+2", // Mock
      trend: "up",
      icon: AlertTriangle,
      description: "Emergency support provided",
    },
    {
        title: "Active Users",
        value: metrics.activeUsers.toLocaleString(),
        change: "+12%", // Mock
        trend: "up",
        icon: Users,
        description: "Students using the platform",
      },
      {
        title: "Resources Accessed",
        value: metrics.resourcesAccessed.toLocaleString(),
        change: "+15%", // Mock
        trend: "up",
        icon: BookOpen,
        description: "Videos, articles, and guides viewed",
      },
      {
        title: "Satisfaction Score",
        value: "4.6/5",
        change: "+0.2",
        trend: "up",
        icon: Heart,
        description: "Average user rating",
      },
      {
        title: "Response Time",
        value: "2.3min",
        change: "-15%",
        trend: "down",
        icon: TrendingUp,
        description: "Average support response time",
      },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricsDisplay.map((metric) => (
        <Card key={metric.title} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <metric.icon className="h-5 w-5 text-primary" />
            <div className={`flex items-center text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {metric.trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {metric.change}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.title}</p>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
