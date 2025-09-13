"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, getDocs, Timestamp } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { db, auth } from '../lib/firebase-config'
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Users } from "lucide-react"

interface TrendAnalysisProps {
  dateRange: string
}

// Define types for our processed data
interface TopicTrendData {
  date: string;
  anxiety: number;
  depression: number;
  academic_stress: number;
  wellness: number;
}

interface TrendStat {
    value: number;
    change: number;
}

export function TrendAnalysis({ dateRange }: TrendAnalysisProps) {
  const [trendData, setTrendData] = useState<TopicTrendData[]>([]);
  const [stats, setStats] = useState({
      anxiety: { value: 0, change: 0 },
      depression: { value: 0, change: 0 },
      academic_stress: { value: 0, change: 0 },
      wellness: { value: 0, change: 0 }
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

    const trendsQuery = query(
      collection(db, "chatSessions"),
      where("collegeId", "==", collegeId),
      where("timestamp", ">=", startTimestamp)
    );

    const unsubscribe = onSnapshot(trendsQuery, (snapshot) => {
      const sessions = snapshot.docs.map(doc => doc.data());
      
      // Process data for charts and stats
      const dailyCounts: { [date: string]: any } = {};
      const totalCounts = { anxiety: 0, depression: 0, academic_stress: 0, wellness: 0 };

      sessions.forEach(session => {
        if (!session.timestamp || !session.topic) return;

        const date = session.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const topic = session.topic as keyof typeof totalCounts;

        if (!dailyCounts[date]) {
          dailyCounts[date] = { date, anxiety: 0, depression: 0, academic_stress: 0, wellness: 0 };
        }
        if (topic in totalCounts) {
          dailyCounts[date][topic]++;
          totalCounts[topic]++;
        }
      });
      
      const chartData = Object.values(dailyCounts).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setTrendData(chartData);
      setStats({
          anxiety: { value: totalCounts.anxiety, change: 0 }, // Change calculation would be more complex
          depression: { value: totalCounts.depression, change: 0 },
          academic_stress: { value: totalCounts.academic_stress, change: 0 },
          wellness: { value: totalCounts.wellness, change: 0 },
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collegeId, dateRange]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2"><TrendingUp className="h-5 w-5 text-red-600" /><span>Anxiety Trend</span></div>
          <p className="text-2xl font-bold">{stats.anxiety.value}</p><p className="text-xs text-muted-foreground">sessions this period</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2"><TrendingDown className="h-5 w-5 text-green-600" /><span>Depression</span></div>
          <p className="text-2xl font-bold">{stats.depression.value}</p><p className="text-xs text-muted-foreground">sessions this period</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2"><AlertTriangle className="h-5 w-5 text-orange-600" /><span>Academic Stress</span></div>
          <p className="text-2xl font-bold">{stats.academic_stress.value}</p><p className="text-xs text-muted-foreground">sessions this period</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2"><Users className="h-5 w-5 text-blue-600" /><span>Wellness Engagement</span></div>
          <p className="text-2xl font-bold">{stats.wellness.value}</p><p className="text-xs text-muted-foreground">sessions this period</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Mental Health Topic Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="anxiety" stroke="#ef4444" strokeWidth={2} name="Anxiety" />
            <Line type="monotone" dataKey="depression" stroke="#3b82f6" strokeWidth={2} name="Depression" />
            <Line type="monotone" dataKey="academic_stress" stroke="#f59e0b" strokeWidth={2} name="Academic Stress" />
            <Line type="monotone" dataKey="wellness" stroke="#10b981" strokeWidth={2} name="Wellness" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      
      {/* The rest of the static components can remain as they are for now */}
    </div>
  )
}