// In src/components/ProgressAnalytics.tsx

"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2, Users, FileText, TrendingUp } from 'lucide-react';

interface ResponseEntry {
  studentId: string;
  questionnaireType: string;
  score: number;
  studentYear: string;
  studentDept: string;
}

export const ProgressAnalytics = ({ collegeId }: { collegeId: string }) => {
  const [allResponses, setAllResponses] = useState<ResponseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');

  useEffect(() => {
    if (!collegeId) {
        console.error("College ID is missing. Cannot fetch data.");
        setLoading(false);
        return;
    };

    const responsesRef = collection(db, "progressResponses");
    const q = query(responsesRef, where("collegeId", "==", collegeId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: ResponseEntry[] = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data() as ResponseEntry);
      });
      setAllResponses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collegeId]);

  const { stats, chartData, uniqueYears, uniqueDepts } = useMemo(() => {
    const filtered = allResponses.filter(r => 
      (selectedYear === 'all' || r.studentYear === selectedYear) &&
      (selectedDept === 'all' || r.studentDept === selectedDept)
    );

    const stats = {
      totalResponses: filtered.length,
      uniqueStudents: new Set(filtered.map(r => r.studentId)).size,
      avgWHO5: 0,
    };
    
    const who5Responses = filtered.filter(r => r.questionnaireType === 'WHO5');
    if (who5Responses.length > 0) {
      const sum = who5Responses.reduce((acc, curr) => acc + curr.score, 0);
      stats.avgWHO5 = parseFloat((sum / who5Responses.length).toFixed(2));
    }
    
    const uniqueYears = ['all', ...Array.from(new Set(allResponses.map(r => r.studentYear)))];
    const uniqueDepts = ['all', ...Array.from(new Set(allResponses.map(r => r.studentDept)))];

    const deptScores: Record<string, { sum: number, count: number }> = {};
    allResponses.forEach(r => {
      if(r.questionnaireType !== 'WHO5') return;
      if (!deptScores[r.studentDept]) {
        deptScores[r.studentDept] = { sum: 0, count: 0 };
      }
      deptScores[r.studentDept].sum += r.score;
      deptScores[r.studentDept].count++;
    });

    const chartData = Object.keys(deptScores).map(dept => ({
      name: dept,
      "Average WHO-5 Score": parseFloat((deptScores[dept].sum / deptScores[dept].count).toFixed(2)),
    }));

    return { stats, chartData, uniqueYears, uniqueDepts };
  }, [allResponses, selectedYear, selectedDept]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  // 👇 FIX IS HERE: Correctly closed the <CardHeader> tag
  if (allResponses.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No Data Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No students have completed an assessment yet. Data will appear here in real-time once they do.</p>
          </CardContent>
        </Card>
      );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter the analytics by year of study or department to see more specific data.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
            <SelectContent>{uniqueYears.map(y => <SelectItem key={y} value={y}>{y === 'all' ? 'All Years' : y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
            <SelectContent>{uniqueDepts.map(d => <SelectItem key={d} value={d}>{d === 'all' ? 'All Departments' : d}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalResponses}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.uniqueStudents}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. WHO-5 Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.avgWHO5} / 25</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Average Well-being Score by Department</CardTitle>
          <CardDescription>This helps identify departments that may need more wellness support.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 25]} />
              <Tooltip cursor={{fill: 'hsl(var(--muted))'}} />
              <Legend />
              <Bar dataKey="Average WHO-5 Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};