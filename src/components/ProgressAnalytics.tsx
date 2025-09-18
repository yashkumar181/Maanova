"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Loader2, Users, FileText, TrendingUp, Activity, Shield } from "lucide-react"

// --- Data Structures & Interfaces ---
interface ResponseEntry {
  studentId: string;
  questionnaireType: "WHO5" | "PHQ9" | "GAD7";
  score: number;
  studentYear: string;
  studentDept: string;
  timestamp: { toDate: () => Date };
  individualResponses: Record<string, number>;
}

const who5QuestionMap: Record<string, string> = {
  "1": "Mood", "2": "Calmness", "3": "Energy", "4": "Restfulness", "5": "Engagement",
};

// 👇 FIX #1: Defined a specific type for the tooltip payload to resolve the 'any' error
interface TooltipPayload {
  name: string;
  value: number | string;
  stroke?: string;
  fill?: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: TooltipPayload[], label?: string }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="p-2 text-sm bg-background border border-border shadow-lg rounded-lg">
        <p className="font-bold mb-1 text-foreground">{label}</p>
        <p style={{ color: data.fill || data.stroke }}>{`${data.name}: ${data.value}`}</p>
      </div>
    );
  }
  return null;
};

interface DailyAverageData {
    date: string;
    "Average Score": number;
}

export const ProgressAnalytics = ({ collegeId }: { collegeId: string }) => {
  const [allResponses, setAllResponses] = useState<ResponseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');

  // --- Data Fetching ---
  useEffect(() => {
    if (!collegeId) { setLoading(false); return; };
    const q = query(collection(db, "progressResponses"), where("collegeId", "==", collegeId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as ResponseEntry);
      setAllResponses(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collegeId]);

  // --- Data Aggregation Logic ---
  const { stats, uniqueYears, uniqueDepts, dailyAvgWHO5, dailyAvgPHQ9, dailyAvgGAD7, biggestChallenges, weeklyPulse } = useMemo(() => {
    const filtered = allResponses.filter(r => 
      (selectedYear === 'all' || r.studentYear === selectedYear) &&
      (selectedDept === 'all' || r.studentDept === selectedDept)
    );
    
    const calculateAverage = (type: "WHO5" | "PHQ9" | "GAD7") => {
      const responses = filtered.filter(r => r.questionnaireType === type);
      if (responses.length === 0) return 0;
      const sum = responses.reduce((acc, curr) => acc + curr.score, 0);
      return parseFloat((sum / responses.length).toFixed(2));
    };

    const stats = {
      totalResponses: filtered.length,
      uniqueStudents: new Set(filtered.map(r => r.studentId)).size,
      avgWHO5: calculateAverage("WHO5"),
      avgPHQ9: calculateAverage("PHQ9"),
      avgGAD7: calculateAverage("GAD7"),
    };
    
    const uniqueYears = ['all', ...Array.from(new Set(allResponses.map(r => r.studentYear).filter(y => y)))];
    const uniqueDepts = ['all', ...Array.from(new Set(allResponses.map(r => r.studentDept).filter(d => d)))];

    const calculateDailyAverages = (type: "WHO5" | "PHQ9" | "GAD7"): DailyAverageData[] => {
      const dailyScores: Record<string, { sum: number, count: number }> = {};
      allResponses.forEach(r => {
        if (r.questionnaireType === type && r.timestamp) {
          const date = r.timestamp.toDate().toISOString().split('T')[0];
          if (!dailyScores[date]) { dailyScores[date] = { sum: 0, count: 0 }; }
          dailyScores[date].sum += r.score;
          dailyScores[date].count++;
        }
      });
      return Object.keys(dailyScores).map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        "Average Score": parseFloat((dailyScores[date].sum / dailyScores[date].count).toFixed(2)),
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };
    
    const dailyAvgWHO5 = calculateDailyAverages("WHO5");
    const dailyAvgPHQ9 = calculateDailyAverages("PHQ9");
    const dailyAvgGAD7 = calculateDailyAverages("GAD7");

    const questionScores: Record<string, { sum: number, count: number }> = { "1":{sum:0, count:0}, "2":{sum:0, count:0}, "3":{sum:0, count:0}, "4":{sum:0, count:0}, "5":{sum:0, count:0} };
    filtered.forEach(r => {
        if (r.questionnaireType === 'WHO5' && r.individualResponses) {
            Object.entries(r.individualResponses).forEach(([qId, score]) => {
                if (questionScores[qId]) {
                    questionScores[qId].sum += score;
                    questionScores[qId].count++;
                }
            });
        }
    });
    const biggestChallenges = Object.keys(questionScores).map(qId => ({
        name: who5QuestionMap[qId],
        "Avg Score": questionScores[qId].count > 0 ? parseFloat((questionScores[qId].sum / questionScores[qId].count).toFixed(2)) : 0,
    })).sort((a, b) => a["Avg Score"] - b["Avg Score"]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyScores: Record<string, { sum: number, count: number }> = {};
    dayNames.forEach(day => weeklyScores[day] = { sum: 0, count: 0 });

    filtered.forEach(r => {
        if (r.questionnaireType === 'WHO5' && r.timestamp) {
            const dayIndex = r.timestamp.toDate().getDay();
            const dayName = dayNames[dayIndex];
            weeklyScores[dayName].sum += r.score;
            weeklyScores[dayName].count++;
        }
    });
    const weeklyPulse = dayNames.map(day => ({
        name: day,
        "Avg WHO-5 Score": weeklyScores[day].count > 0 ? parseFloat((weeklyScores[day].sum / weeklyScores[day].count).toFixed(2)) : 0,
    }));

    return { stats, uniqueYears, uniqueDepts, dailyAvgWHO5, dailyAvgPHQ9, dailyAvgGAD7, biggestChallenges, weeklyPulse };
  }, [allResponses, selectedYear, selectedDept]);

  if (loading) { return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>; }
  
  if (allResponses.length === 0) { 
    return (
      <Card>
        {/* 👇 FIX #2: Corrected the card structure */}
        <CardHeader>
          <CardTitle>No Data Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No students have completed an assessment yet. Data will appear here in real-time once they do.</p>
        </CardContent>
      </Card>
    ); 
  }

  const renderTrendChart = (data: DailyAverageData[], dataKey: string, strokeColor: string, domain: [number, number]) => (
      <CardContent className="pt-6">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} domain={domain} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Line type="monotone" dataKey={dataKey} stroke={strokeColor} strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 3 }}/>
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>Not enough data to display a trend. At least two days of data are required.</p>
          </div>
        )}
      </CardContent>
  );

  const barColors = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Filters</CardTitle><CardDescription>Filter the analytics by year of study or department.</CardDescription></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
            <SelectContent>
              {uniqueYears.map(y => <SelectItem key={y} value={y}>{y === 'all' ? 'All Years' : y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
            <SelectContent>
              {uniqueDepts.map(d => <SelectItem key={d} value={d}>{d === 'all' ? 'All Departments' : d}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Responses</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalResponses}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Unique Participants</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.uniqueStudents}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg. WHO-5</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.avgWHO5} / 25</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg. PHQ-9</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.avgPHQ9} / 27</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg. GAD-7</CardTitle><Shield className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.avgGAD7} / 21</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Daily Average Score Trends</CardTitle>
            <CardDescription>This chart shows the average score of all students who took an assessment each day.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="who5">
                <TabsList className="grid w-full h-auto grid-cols-1 sm:grid-cols-3">
                    <TabsTrigger value="who5">Well-being (WHO-5)</TabsTrigger>
                    <TabsTrigger value="phq9">Depression (PHQ-9)</TabsTrigger>
                    <TabsTrigger value="gad7">Anxiety (GAD-7)</TabsTrigger>
                </TabsList>
                <TabsContent value="who5">
                    {renderTrendChart(dailyAvgWHO5, "Average Score", "#34d399", [0, 25])}
                </TabsContent>
                <TabsContent value="phq9">
                    {renderTrendChart(dailyAvgPHQ9, "Average Score", "#f87171", [0, 27])}
                </TabsContent>
                <TabsContent value="gad7">
                    {renderTrendChart(dailyAvgGAD7, "Average Score", "#60a5fa", [0, 21])}
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Biggest Challenges (WHO-5)</CardTitle>
                <CardDescription>Average scores for each well-being factor. Lower scores indicate areas of concern.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={biggestChallenges} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, 5]} stroke="hsl(var(--foreground))" tick={{ fill: "currentColor" }} fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke="hsl(var(--foreground))" tick={{ fill: "currentColor" }} fontSize={12} width={80} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted))'}} />
                        <Bar dataKey="Avg Score">
                          {biggestChallenges.map((_, index) => (
                            <Cell key={index} fill={barColors[index % barColors.length]} />
                          ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Weekly Stress Pulse (WHO-5)</CardTitle>
                <CardDescription>Average well-being score based on the day of the week.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyPulse}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--foreground))" tick={{ fill: "currentColor" }}  fontSize={12} />
                        <YAxis domain={[0, 25]} stroke="hsl(var(--foreground))" tick={{ fill: "currentColor" }}  fontSize={12} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted))'}} />
                        <Bar dataKey="Avg WHO-5 Score">
                          {weeklyPulse.map((_, index) => (
                            <Cell key={index} fill={barColors[index % barColors.length]} />
                          ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};