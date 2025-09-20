"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Data Structures ---
interface ProgressEntry {
  id: string;
  timestamp: Date;
  score: number;
  questionnaireType: "WHO5" | "GAD7" | "PHQ9";
  individualResponses: Record<string, number>;
}

// --- Factor Maps with Colors for Charts ---
const who5Factors = [
  { key: "Mood", name: "Mood", question: "Felt cheerful and in good spirits", color: "#a78bfa" },
  { key: "Calmness", name: "Calmness", question: "Felt calm and relaxed", color: "#34d399" },
  { key: "Energy", name: "Energy", question: "Felt active and vigorous", color: "#fbbf24" },
  { key: "Restfulness", name: "Restfulness", question: "Woke up feeling fresh and rested", color: "#f87171" },
  { key: "Engagement", name: "Engagement", question: "Daily life has been filled with interesting things", color: "#60a5fa" },
];
const gad7Factors = [
  { key: "Anxiety", name: "Anxiety", question: "Feeling nervous or on edge", color: "#a78bfa" },
  { key: "Worry", name: "Worry", question: "Not being able to control worrying", color: "#34d399" },
  { key: "Tension", name: "Tension", question: "Trouble relaxing", color: "#fbbf24" },
  { key: "Irritability", name: "Irritability", question: "Becoming easily annoyed", color: "#f87171" },
  { key: "Fear", name: "Fear", question: "Feeling afraid something awful might happen", color: "#60a5fa" },
];
const phq9Factors = [
  { key: "Mood", name: "Mood", question: "Little interest or pleasure in things", color: "#a78bfa" },
  { key: "Energy/Sleep", name: "Energy/Sleep", question: "Feeling tired or sleeping problems", color: "#34d399" },
  { key: "Cognitive", name: "Cognitive", question: "Trouble concentrating", color: "#fbbf24" },
  { key: "Physical", name: "Physical", question: "Appetite or psychomotor changes", color: "#f87171" },
  { key: "Functioning", name: "Functioning", question: "Impact on daily life", color: "#60a5fa" },
];

const getQuestionMap = (type: 'WHO5' | 'GAD7' | 'PHQ9'): Record<string, string> => {
    if (type === 'GAD7') return { "1":"Anxiety", "2":"Worry", "3":"Worry", "4":"Tension", "5":"Tension", "6":"Irritability", "7":"Fear" };
    if (type === 'PHQ9') return { "1":"Mood", "2":"Mood", "3":"Energy/Sleep", "4":"Energy/Sleep", "5":"Physical", "6":"Cognitive", "7":"Cognitive", "8":"Physical", "9":"Functioning" };
    return { "1":"Mood", "2":"Calmness", "3":"Energy", "4":"Restfulness", "5":"Engagement" };
}

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

// Reusable component for the entire chart layout for one assessment type
const ProgressChartLayout = ({ data, dataKey, factors, domain, individualDomain }: { data: any[], dataKey: string, factors: {key: string, name: string, question: string, color: string}[], domain: [number, number], individualDomain: [number, number] }) => (
    <div className="space-y-6 mt-6">
        <Card>
            <CardHeader><CardTitle>Overall Trend</CardTitle><CardDescription>Your {dataKey} total score over time.</CardDescription></CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[250px] w-full">
                    <ResponsiveContainer>
                        {/* 👇 FIX: Simplified the 'dot' prop to just 'true' to show default dots */}
                        <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={domain} /><ChartTooltip content={<ChartTooltipContent />} /><Legend /><Line type="monotone" dataKey={dataKey} stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} dot={true} /></LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Detailed Breakdown Comparison</CardTitle><CardDescription>Comparing all the different factors of the assessment.</CardDescription></CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[350px] w-full">
                    <ResponsiveContainer>
                        <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={individualDomain} /><ChartTooltip content={<ChartTooltipContent />} /><Legend />
                            {factors.map((factor) => <Line key={factor.key} type="monotone" dataKey={factor.key} name={factor.name} stroke={factor.color} dot={true} activeDot={{ r: 6 }} />)}
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        <div>
            <h2 className="text-2xl font-bold mb-1">Individual Trends</h2>
            <p className="text-muted-foreground mb-4">A closer look at each factor.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {factors.map((factor) => (
                <Card key={factor.key}>
                <CardHeader>
                    <CardTitle>{factor.name} Trend</CardTitle>
                    <CardDescription className="truncate">"{factor.question}"</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-[200px] w-full">
                    <ResponsiveContainer>
                        <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis domain={individualDomain} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey={factor.key} name={factor.name} stroke={factor.color} strokeWidth={2} dot={true} activeDot={{r: 6}} />
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

export const StudentProgressDashboard = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "progressResponses"), where("studentId", "==", user.uid), orderBy("timestamp", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: ProgressEntry[] = [];
        snapshot.forEach((doc) => {
            const d = doc.data();
            if (d.timestamp) {
                data.push({ id: doc.id, timestamp: d.timestamp.toDate(), score: d.score, questionnaireType: d.questionnaireType, individualResponses: d.individualResponses });
            }
        });
        setProgressData(data);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, [user]);

  const who5Data = useMemo(() => progressData.filter(d => d.questionnaireType === 'WHO5'), [progressData]);
  const gad7Data = useMemo(() => progressData.filter(d => d.questionnaireType === 'GAD7'), [progressData]);
  const phq9Data = useMemo(() => progressData.filter(d => d.questionnaireType === 'PHQ9'), [progressData]);
  
  const formatDataForChart = (data: ProgressEntry[], type: 'WHO5' | 'GAD7' | 'PHQ9') => {
    const questionMap = getQuestionMap(type);
    const dataKey = type === 'WHO5' ? 'WHO-5 Score' : type === 'GAD7' ? 'GAD-7 Score' : 'PHQ-9 Score';
    
    return data.map(entry => {
        const scores: { [key: string]: string | number } = { date: entry.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
        scores[dataKey] = entry.score;
        
        const factorSums: Record<string, number> = {};
        const factorCounts: Record<string, number> = {};

        Object.entries(entry.individualResponses).forEach(([qId, score]) => {
            const factorName = questionMap[qId];
            if (factorName) {
                factorSums[factorName] = (factorSums[factorName] || 0) + score;
                factorCounts[factorName] = (factorCounts[factorName] || 0) + 1;
            }
        });

        Object.keys(factorSums).forEach(factorName => {
            scores[factorName] = parseFloat((factorSums[factorName] / factorCounts[factorName]).toFixed(2));
        });

        return scores;
    });
  };

  const StatCard = ({ title, data }: { title: string, data: ProgressEntry[] }) => {
    if (data.length === 0) return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title} Score</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">N/A</div>
                <p className="text-xs text-muted-foreground">No assessments taken yet.</p>
            </CardContent>
        </Card>
    );

    const latestScore = data[data.length - 1].score;
    const firstScore = data[0].score;
    const change = latestScore - firstScore;

    return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title} Latest Score</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestScore}</div>
            {data.length > 1 && <p className={cn("text-xs text-muted-foreground", change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "")}>{change > 0 ? `+${change}` : change} since first test</p>}
          </CardContent>
        </Card>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading your progress...</p>
      </div>
    );
  }
  
  if (progressData.length === 0) {
    return <Card><CardContent className="pt-6"><p>You haven't completed any assessments yet. Take one to start tracking your progress!</p></CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Well-being (WHO-5)" data={who5Data} />
        <StatCard title="Anxiety (GAD-7)" data={gad7Data} />
        <StatCard title="Depression (PHQ-9)" data={phq9Data} />
      </div>
      
      <Tabs defaultValue="who5" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="who5">Well-being (WHO-5)</TabsTrigger>
          <TabsTrigger value="gad7">Anxiety (GAD-7)</TabsTrigger>
          <TabsTrigger value="phq9">Depression (PHQ-9)</TabsTrigger>
        </TabsList>

        <TabsContent value="who5">
            {who5Data.length > 1 ? <ProgressChartLayout data={formatDataForChart(who5Data, 'WHO5')} dataKey="WHO-5 Score" factors={who5Factors} domain={[0,25]} individualDomain={[0,5]} /> : <div className="text-center p-8 text-muted-foreground min-h-[300px] flex items-center justify-center"><p>Take the WHO-5 assessment again to see your trend.</p></div>}
        </TabsContent>
        <TabsContent value="gad7">
            {gad7Data.length > 1 ? <ProgressChartLayout data={formatDataForChart(gad7Data, 'GAD7')} dataKey="GAD-7 Score" factors={gad7Factors} domain={[0,21]} individualDomain={[0,3]} /> : <div className="text-center p-8 text-muted-foreground min-h-[300px] flex items-center justify-center"><p>Take the GAD-7 assessment to see your trend.</p></div>}
        </TabsContent>
        <TabsContent value="phq9">
            {phq9Data.length > 1 ? <ProgressChartLayout data={formatDataForChart(phq9Data, 'PHQ9')} dataKey="PHQ-9 Score" factors={phq9Factors} domain={[0,27]} individualDomain={[0,3]} /> : <div className="text-center p-8 text-muted-foreground min-h-[300px] flex items-center justify-center"><p>Take the PHQ-9 assessment to see your trend.</p></div>}
        </TabsContent>
      </Tabs>
    </div>
  );
};