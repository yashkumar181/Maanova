"use client"

import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Make sure this path is correct for your project
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, MessageCircle, Calendar, BookOpen, Heart } from "lucide-react"

interface OverviewMetricsProps {
  dateRange: string
}

export function OverviewMetrics({ dateRange }: OverviewMetricsProps) {
  // State to hold the live data from Firestore
  const [bookingCount, setBookingCount] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [forumPostsCount, setForumPostsCount] = useState(0);
  const [resourcesCount, setResourcesCount] = useState(0);

  // useEffect hook to fetch live data when the component mounts
  useEffect(() => {
    // Listener for total appointments
    const appointmentsQuery = query(collection(db, "appointments"));
    const unsubscribeBookings = onSnapshot(appointmentsQuery, (snapshot) => {
      setBookingCount(snapshot.size); // .size gives the total number of documents
    });

    // Listener for total students (for "Active Users" metric)
    const studentsQuery = query(collection(db, "students"));
    const unsubscribeUsers = onSnapshot(studentsQuery, (snapshot) => {
      setActiveUsersCount(snapshot.size);
    });

    // Listener for total forum posts
    const forumPostsQuery = query(collection(db, "forumPosts"));
    const unsubscribeForumPosts = onSnapshot(forumPostsQuery, (snapshot) => {
      setForumPostsCount(snapshot.size);
    });
    
    // Listener for total resources
    const resourcesQuery = query(collection(db, "resources"));
    const unsubscribeResources = onSnapshot(resourcesQuery, (snapshot) => {
      setResourcesCount(snapshot.size);
    });


    // Cleanup listeners when the component unmounts to prevent memory leaks
    return () => {
      unsubscribeBookings();
      unsubscribeUsers();
      unsubscribeForumPosts();
      unsubscribeResources();
    };
  }, []); // The empty array [] means this effect runs only once

  // The metrics array now uses the live data from our state variables
  const metrics = [
    {
      title: "Active Users",
      value: activeUsersCount.toString(),
      change: "+12%", // Note: "change" is still static, can be calculated later
      trend: "up",
      icon: Users,
      description: "Students using the platform",
    },
    {
      title: "Chat Sessions",
      value: "63", // This is still mock data
      change: "+8%",
      trend: "up",
      icon: MessageCircle,
      description: "AI chatbot interactions",
    },
    {
      title: "Counselor Bookings",
      value: bookingCount.toString(),
      change: "+23%",
      trend: "up",
      icon: Calendar,
      description: "Appointments scheduled",
    },
    {
      title: "Resources Accessed",
      value: resourcesCount.toString(),
      change: "+15%",
      trend: "up",
      icon: BookOpen,
      description: "Guides and articles viewed",
    },
    {
        title: "Forum Posts",
        value: forumPostsCount.toString(),
        change: "+5%",
        trend: "up",
        icon: MessageCircle,
        description: "New peer support discussions",
    },
    {
        title: "Avg. Session Rating",
        value: "3.7", // This is still mock data
        change: "+0.1",
        trend: "up",
        icon: Heart,
        description: "Average user feedback",
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <metric.icon className="h-5 w-5 text-muted-foreground" />
              <div className={`flex items-center text-xs font-semibold ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {metric.change}
              </div>
            </div>
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
        </Card>
      ))}
    </div>
  )
}