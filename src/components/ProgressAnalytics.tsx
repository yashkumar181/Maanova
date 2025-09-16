"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, Query } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BarChart3, Smile, Frown, BrainCircuit } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

// Helper function to categorize scores
const getSeverity = (score: number) => {
  if (score >= 15) return 'Severe';
  if (score >= 10) return 'Moderate';
  if (score >= 5) return 'Mild';
  return 'Minimal';
};

interface ProgressAnalyticsProps {
  collegeId: string;
}

type ChartData = { name: string; value: number; };
type TrendData = {
  date: string;
  avgAnxiety?: number;
  avgWellBeing?: number;
  avgDepression?: number;
};

export function ProgressAnalytics({ collegeId }: ProgressAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [avgWellBeing, setAvgWellBeing] = useState(0);
  const [avgAnxiety, setAvgAnxiety] = useState(0);
  const [avgDepression, setAvgDepression] = useState(0);
  const [anxietyDistribution, setAnxietyDistribution] = useState<ChartData[]>([]);
  const [depressionDistribution, setDepressionDistribution] = useState<ChartData[]>([]);
  const [gad7Count, setGad7Count] = useState(0);
  const [phq9Count, setPhq9Count] = useState(0);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    if (!collegeId) { setLoading(false); return; }
    setLoading(true);

    let entriesQuery: Query = collection(db, "progressEntries");
    entriesQuery = query(entriesQuery, where("collegeId", "==", collegeId));

    if (selectedYear !== 'All') {
      entriesQuery = query(entriesQuery, where("yearOfStudy", "==", selectedYear));
    }
    if (selectedDepartment !== 'All') {
      entriesQuery = query(entriesQuery, where("department", "==", selectedDepartment));
    }

    const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
      const entries = snapshot.docs.map(doc => doc.data());

      setTotalCheckIns(0); setAvgWellBeing(0); setAvgAnxiety(0); setAvgDepression(0);
      setAnxietyDistribution([]); setDepressionDistribution([]);
      setGad7Count(0); setPhq9Count(0); setTrendData([]);

      if (entries.length > 0) {
        setTotalCheckIns(entries.length);

        let who5Total = 0, who5Count = 0, gad7Total = 0, localGad7Count = 0, phq9Total = 0, localPhq9Count = 0;
        const gad7Counts = { Minimal: 0, Mild: 0, Moderate: 0, Severe: 0 };
        const phq9Counts = { Minimal: 0, Mild: 0, Moderate: 0, Severe: 0 };

        entries.forEach(entry => {
          if (entry.who5_score != null) { who5Total += entry.who5_score; who5Count++; }
          if (entry.gad7_score != null) { gad7Total += entry.gad7_score; localGad7Count++; gad7Counts[getSeverity(entry.gad7_score)]++; }
          if (entry.phq9_score != null) { phq9Total += entry.phq9_score; localPhq9Count++; phq9Counts[getSeverity(entry.phq9_score)]++; }
        });

        setAvgWellBeing(who5Count > 0 ? Math.round(who5Total / who5Count) : 0);
        setAvgAnxiety(localGad7Count > 0 ? parseFloat((gad7Total / localGad7Count).toFixed(1)) : 0);
        setAvgDepression(localPhq9Count > 0 ? parseFloat((phq9Total / localPhq9Count).toFixed(1)) : 0);
        setGad7Count(localGad7Count);
        setPhq9Count(localPhq9Count);

        setAnxietyDistribution(Object.entries(gad7Counts).map(([name, value]) => ({ name, value })));
        setDepressionDistribution(Object.entries(phq9Counts).map(([name, value]) => ({ name, value })));

        const entriesByDay: { [key: string]: { who5Scores: number[], gad7Scores: number[], phq9Scores: number[] } } = {};
        entries.forEach(entry => {
          if (entry.timestamp) {
            const day = entry.timestamp.toDate().toISOString().split('T')[0];
            if (!entriesByDay[day]) { entriesByDay[day] = { who5Scores: [], gad7Scores: [], phq9Scores: [] }; }
            if (entry.who5_score != null) entriesByDay[day].who5Scores.push(entry.who5_score);
            if (entry.gad7_score != null) entriesByDay[day].gad7Scores.push(entry.gad7_score);
            if (entry.phq9_score != null) entriesByDay[day].phq9Scores.push(entry.phq9_score);
          }
        });

        const calculatedTrendData = Object.entries(entriesByDay).map(([date, data]) => {
          const avgWellBeing = data.who5Scores.length > 0 ? data.who5Scores.reduce((a, b) => a + b, 0) / data.who5Scores.length : undefined;
          const avgAnxiety = data.gad7Scores.length > 0 ? data.gad7Scores.reduce((a, b) => a + b, 0) / data.gad7Scores.length : undefined;
          const avgDepression = data.phq9Scores.length > 0 ? data.phq9Scores.reduce((a, b) => a + b, 0) / data.phq9Scores.length : undefined;
          return {
            date,
            avgWellBeing: avgWellBeing ? Math.round(avgWellBeing) : undefined,
            avgAnxiety: avgAnxiety ? parseFloat(avgAnxiety.toFixed(1)) : undefined,
            avgDepression: avgDepression ? parseFloat(avgDepression.toFixed(1)) : undefined,
          };
        });

        calculatedTrendData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setTrendData(calculatedTrendData);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching progress entries:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [collegeId, selectedYear, selectedDepartment]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) { return <Skeleton className="h-96 w-full" />; }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-semibold">Well-being Overview</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-48">
            <Label htmlFor="year-filter" className="text-sm">Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year-filter"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Years</SelectItem>
                <SelectItem value="Freshman">Freshman</SelectItem>
                <SelectItem value="Sophomore">Sophomore</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-48">
            <Label htmlFor="dept-filter" className="text-sm">Dept.</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger id="dept-filter"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Depts</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Arts & Sciences">Arts & Sciences</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Check-ins</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalCheckIns}</div><p className="text-xs text-muted-foreground">Entries from all students</p></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg. Well-being</CardTitle><Smile className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{avgWellBeing} / 100</div><p className="text-xs text-muted-foreground">From daily WHO-5 scores</p></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg. Anxiety Score</CardTitle><BrainCircuit className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{avgAnxiety} / 21</div><p className="text-xs text-muted-foreground">From weekly GAD-7 scores</p></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg. Depression Score</CardTitle><Frown className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{avgDepression} / 27</div><p className="text-xs text-muted-foreground">From weekly PHQ-9 scores</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Anxiety Distribution (GAD-7)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                {/* 🔧 FINAL FIX: Added a comment to disable the strict 'any' rule for this line */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Pie data={anxietyDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={(entry: any) => gad7Count > 0 ? `${entry.name}: ${((entry.value / gad7Count) * 100).toFixed(0)}%` : entry.name}>
                  {anxietyDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} students`, gad7Count > 0 ? `${((value / gad7Count) * 100).toFixed(1)}%` : '0%']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Depression Distribution (PHQ-9)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                {/* 🔧 FINAL FIX: Added a comment to disable the strict 'any' rule for this line */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Pie data={depressionDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={(entry: any) => phq9Count > 0 ? `${entry.name}: ${((entry.value / phq9Count) * 100).toFixed(0)}%` : entry.name}>
                  {depressionDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} students`, phq9Count > 0 ? `${((value / phq9Count) * 100).toFixed(1)}%` : '0%']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader><CardTitle>Daily Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" name="Avg. Anxiety (GAD-7)" dataKey="avgAnxiety" stroke="#FF8042" />
                <Line type="monotone" name="Avg. Depression (PHQ-9)" dataKey="avgDepression" stroke="#FF0000" />
                <Line type="monotone" name="Avg. Well-being (WHO-5)" dataKey="avgWellBeing" stroke="#0088FE" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}