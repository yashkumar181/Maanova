"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Loader2, Users, FileText, TrendingUp, Activity, Shield } from "lucide-react"

// --- Data Structures & Interfaces ---
interface ResponseEntry {
  studentId: string;
  questionnaireType: "WHO5" | "PHQ9" | "GAD7";
  score: number;
  studentYear: string;
  studentDept: string;
  timestamp: { toDate: () => Date };
}

// 👇 FIX IS HERE: Defined a specific type for the tooltip payload to replace 'any'
interface TooltipPayload {
  name: string;
  value: number | string;
  stroke: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: TooltipPayload[], label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-background/95 border border-border shadow-lg rounded-lg">
        <p className="font-bold mb-1">{label}</p>
        <p style={{ color: payload[0].stroke }}>{`${payload[0].name}: ${payload[0].value}`}</p>
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
  const { stats, uniqueYears, uniqueDepts, dailyAvgWHO5, dailyAvgPHQ9, dailyAvgGAD7 } = useMemo(() => {
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

    return { stats, uniqueYears, uniqueDepts, dailyAvgWHO5, dailyAvgPHQ9, dailyAvgGAD7 };
  }, [allResponses, selectedYear, selectedDept]);

  if (loading) { return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>; }
  
  if (allResponses.length === 0) { return <Card><CardHeader><CardTitle>No Data Yet</CardTitle><CardContent><p>No students have completed an assessment yet. Data will appear here in real-time once they do.</p></CardContent></CardHeader></Card>; }

  const renderTrendChart = (data: DailyAverageData[], dataKey: string, strokeColor: string, domain: [number, number]) => (
      <CardContent className="pt-6">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={domain} />
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Filters</CardTitle><CardDescription>Filter the analytics by year of study or department.</CardDescription></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}><SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger><SelectContent>{uniqueYears.map(y => <SelectItem key={y} value={y}>{y === 'all' ? 'All Years' : y}</SelectItem>)}</SelectContent></Select>
          <Select value={selectedDept} onValueChange={setSelectedDept}><SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger><SelectContent>{uniqueDepts.map(d => <SelectItem key={d} value={d}>{d === 'all' ? 'All Departments' : d}</SelectItem>)}</SelectContent></Select>
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
                    {renderTrendChart(dailyAvgWHO5, "Average Score", "hsl(var(--chart-2))", [0, 25])}
                </TabsContent>
                <TabsContent value="phq9">
                    {renderTrendChart(dailyAvgPHQ9, "Average Score", "hsl(var(--chart-4))", [0, 27])}
                </TabsContent>
                <TabsContent value="gad7">
                    {renderTrendChart(dailyAvgGAD7, "Average Score", "hsl(var(--chart-5))", [0, 21])}
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};