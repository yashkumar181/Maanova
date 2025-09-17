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

// CORRECTED: Explicitly type the questions object
const who5Questions: Record<string, string> = {
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
          // Ensure timestamp exists before converting
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

  const formattedTotalScoreData = progressData.map(entry => ({
    date: entry.timestamp.toLocaleDateString(),
    "WHO-5 Score": entry.score,
  }));

  const formattedIndividualData = progressData.map(entry => {
    // CORRECTED: Define a type for this object to allow dynamic keys
    const individualScores: { [key: string]: string | number } = {
        date: entry.timestamp.toLocaleDateString(),
    };
    for (const qId in who5Questions) {
        // Now TypeScript understands that we can add new keys
        individualScores[who5Questions[qId]] = entry.individualResponses[qId];
    }
    return individualScores;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading your progress...</p>
      </div>
    );
  }
  
  if (progressData.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <p>You haven't completed any assessments yet. Complete one to start tracking your progress!</p>
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
              <LineChart data={formattedTotalScoreData}>
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
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>Tracking your answers (out of 5) for each area of well-being.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[350px] w-full">
            <ResponsiveContainer>
              <LineChart data={formattedIndividualData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="Mood" stroke="#8884d8" />
                <Line type="monotone" dataKey="Calmness" stroke="#82ca9d" />
                <Line type="monotone" dataKey="Energy" stroke="#ffc658" />
                <Line type="monotone" dataKey="Restfulness" stroke="#ff8042" />
                <Line type="monotone" dataKey="Engagement" stroke="#0088FE" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};