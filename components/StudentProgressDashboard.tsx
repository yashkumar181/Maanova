// In components/StudentProgressDashboard.tsx

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

// Define the structure of our progress data
interface ProgressEntry {
  id: string;
  timestamp: Date;
  score: number;
  questionnaireType: string;
  individualResponses: Record<string, number>;
}

// Define the factors for the individual charts
const who5Factors = [
  { key: "Mood", name: "Mood", question: "Felt cheerful and in good spirits", color: "#8884d8" },
  { key: "Calmness", name: "Calmness", question: "Felt calm and relaxed", color: "#82ca9d" },
  { key: "Energy", name: "Energy", question: "Felt active and vigorous", color: "#ffc658" },
  { key: "Restfulness", name: "Restfulness", question: "Woke up feeling fresh and rested", color: "#ff8042" },
  { key: "Engagement", name: "Engagement", question: "Daily life has been filled with interesting things", color: "#0088FE" },
];

// Map question IDs to factor names for data processing
const who5QuestionMap: Record<string, string> = {
  "1": "Mood",
  "2": "Calmness",
  "3": "Energy",
  "4": "Restfulness",
  "5": "Engagement",
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

  // Format data for all charts
  const formattedChartData = progressData.map(entry => {
    // 👇 FIX IS HERE: Explicitly type the 'scores' object to allow dynamic keys
    const scores: { [key: string]: string | number } = { 
      date: entry.timestamp.toLocaleDateString() 
    };
    
    for (const qId in who5QuestionMap) {
      scores[who5QuestionMap[qId]] = entry.individualResponses[qId];
    }
    scores["WHO-5 Score"] = entry.score; // Also include the total score
    return scores;
  });


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