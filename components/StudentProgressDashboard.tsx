// In components/StudentProgressDashboard.tsx

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'; // 👈 ADDED ICONS
import { cn } from '@/lib/utils';

// --- Data Structures (Unchanged) ---
interface ProgressEntry {
  id: string;
  timestamp: Date;
  score: number;
  questionnaireType: string;
  individualResponses: Record<string, number>;
}
const who5Factors = [
  { key: "Mood", name: "Mood", question: "Felt cheerful and in good spirits", color: "#8884d8" },
  { key: "Calmness", name: "Calmness", question: "Felt calm and relaxed", color: "#82ca9d" },
  { key: "Energy", name: "Energy", question: "Felt active and vigorous", color: "#ffc658" },
  { key: "Restfulness", name: "Restfulness", question: "Woke up feeling fresh and rested", color: "#ff8042" },
  { key: "Engagement", name: "Engagement", question: "Daily life has been filled with interesting things", color: "#0088FE" },
];
const who5QuestionMap: Record<string, string> = {
  "1": "Mood", "2": "Calmness", "3": "Energy", "4": "Restfulness", "5": "Engagement",
};

// --- Custom Tooltip (Unchanged) ---
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 text-sm bg-background/95 border border-border shadow-lg rounded-lg backdrop-blur-sm">
        <p className="font-bold text-foreground mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between space-x-4">
             <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: p.color || p.stroke }} />
                <p className="text-muted-foreground">{p.name}:</p>
             </div>
             <p className="font-semibold text-foreground">{p.value}</p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const StudentProgressDashboard = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const responsesRef = collection(db, "progressResponses");
      const q = query(
        responsesRef,
        where("studentId", "==", user.uid),
        orderBy("timestamp", "asc")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data: ProgressEntry[] = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          if (docData.timestamp) {
            data.push({
              id: doc.id,
              timestamp: docData.timestamp.toDate(),
              score: docData.score,
              questionnaireType: docData.questionnaireType,
              individualResponses: docData.individualResponses,
            });
          }
        });
        setProgressData(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const formattedChartData = progressData.map(entry => {
    const scores: { [key: string]: string | number } = { date: entry.timestamp.toLocaleDateString() };
    for (const qId in who5QuestionMap) {
      scores[who5QuestionMap[qId]] = entry.individualResponses[qId];
    }
    scores["WHO-5 Score"] = entry.score;
    return scores;
  });

  // 👇 ADDED: Logic to calculate stats for the new cards
  const latestScore = progressData.length > 0 ? progressData[progressData.length - 1].score : 0;
  const firstScore = progressData.length > 0 ? progressData[0].score : 0;
  const overallChange = latestScore - firstScore;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading your progress...</p>
      </div>
    );
  }
  
  if (progressData.length < 2) { 
    return (
      <Card>
        <CardContent className="pt-6">
          <p>You need to complete at least two assessments to see your progress trends. Keep up the great work!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 👇 ADDED: At-a-Glance Stat Cards Section 👇 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{latestScore}<span className="text-2xl text-muted-foreground">/25</span></div>
            <p className="text-xs text-muted-foreground">Your most recent WHO-5 well-being score.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Trend</CardTitle>
            {overallChange >= 0 ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={cn("text-4xl font-bold", overallChange >= 0 ? "text-green-500" : "text-red-500")}>
              {overallChange >= 0 ? `+${overallChange}` : overallChange}
            </div>
            <p className="text-xs text-muted-foreground">Change since your first assessment.</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1 md:col-span-2">
           <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Summary</CardTitle></CardHeader>
           <CardContent><p className="text-sm text-muted-foreground">Consistently tracking your well-being is a key step in self-care. This dashboard helps you visualize your journey.</p></CardContent>
        </Card>
      </div>
      {/* 👆 End of Stat Cards Section 👆 */}

      {/* --- Existing Graph Layout (Unchanged) --- */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Well-being Trend</CardTitle>
          <CardDescription>Your WHO-5 total score (out of 25) over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[250px] w-full">
            <ResponsiveContainer>
              <LineChart data={formattedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 25]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="WHO-5 Score" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown Comparison</CardTitle>
          <CardDescription>Comparing all five areas of your well-being (scores out of 5).</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[350px] w-full">
            <ResponsiveContainer>
              <LineChart data={formattedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {who5Factors.map(factor => (
                  <Line key={factor.key} type="monotone" dataKey={factor.key} stroke={factor.color} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-1">Individual Trends</h2>
        <p className="text-muted-foreground mb-4">A closer look at each area of your well-being.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {who5Factors.map((factor) => (
            <Card key={factor.key}>
              <CardHeader>
                <CardTitle>{factor.name} Trend</CardTitle>
                <CardDescription className="truncate">"{factor.question}"</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[200px] w-full">
                  <ResponsiveContainer>
                    <LineChart data={formattedChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis domain={[0, 5]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey={factor.key} 
                        stroke={factor.color} 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};