// In components/WHO5Results.tsx
"use client";
import { useEffect } from 'react';
import Link from 'next/link'; // 👈 ADDED
import { useAuth } from '@/hooks/useAuth';
import { saveProgressResponse } from '@/lib/progressService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WHO5ResultsProps {
  responses: Record<number, number>;
  questions: Array<{ id: number; text: string; category: string; categoryLabel: string; }>;
  onRestart: () => void;
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
};

export function WHO5Results({ responses, questions, onRestart }: WHO5ResultsProps) {
  const { user } = useAuth();

  const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
  const percentageScore = (totalScore / 25) * 100;
  
  useEffect(() => {
    if (user && totalScore >= 0) { // Allow saving score of 0
      saveProgressResponse(user.uid, "WHO5", totalScore, responses);
    }
  }, [user, totalScore, responses]);
  
  const chartData = questions.map(question => ({ category: question.category, categoryLabel: question.categoryLabel, score: responses[question.id] || 0, maxScore: 5 }));
  const getWellBeingLevel = (score: number) => { if (score <= 8) return { level: "Low", color: "destructive", icon: AlertTriangle }; if (score <= 16) return { level: "Moderate", color: "warning", icon: TrendingUp }; return { level: "Good", color: "success", icon: CheckCircle }; };
  const wellBeing = getWellBeingLevel(totalScore);
  const WellBeingIcon = wellBeing.icon;
  const getRecommendations = (): string[] => { const recommendations: string[] = []; chartData.forEach(item => { if (item.score <= 2) { switch (item.category) { case 'mood': recommendations.push("Consider mindfulness exercises or speaking with a counselor about your mood"); break; case 'anxiety': recommendations.push("Try relaxation techniques like deep breathing or progressive muscle relaxation"); break; case 'physical': recommendations.push("Start with light physical activity like walking or stretching"); break; case 'sleep': recommendations.push("Establish a consistent sleep routine and create a calming bedtime environment"); break; case 'engagement': recommendations.push("Explore new hobbies or reconnect with activities you used to enjoy"); break; } } }); return recommendations; };
  const recommendations = getRecommendations();
  return (
    <main className="min-h-screen bg-background p-4 flex items-center">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8"><h1 className="text-3xl font-bold mb-2">Your WHO-5 Results</h1><p className="text-muted-foreground">Based on your responses for today</p></div>
        <Card><CardHeader className="text-center"><div className="flex items-center justify-center mb-4"><WellBeingIcon className={cn("h-12 w-12 mr-3", wellBeing.color === "destructive" && "text-destructive", wellBeing.color === "warning" && "text-yellow-500", wellBeing.color === "success" && "text-green-500" )} /><div><CardTitle className="text-2xl">Overall Well-being</CardTitle><Badge variant={wellBeing.color === "success" ? "default" : "secondary"} className="mt-2">{wellBeing.level}</Badge></div></div></CardHeader><CardContent className="text-center"><div className="text-4xl font-bold text-primary mb-2">{totalScore}/25</div><div className="text-lg text-muted-foreground mb-4">{percentageScore.toFixed(0)}% Well-being Score</div><div className="w-full bg-secondary rounded-full h-3"><div className="bg-primary h-3 rounded-full transition-all duration-700" style={{ width: `${percentageScore}%` }} /></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Category Breakdown</CardTitle><p className="text-muted-foreground">Your scores across different well-being dimensions</p></CardHeader><CardContent><ChartContainer config={chartConfig}><ResponsiveContainer width="100%" height={300}><BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}><XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} /><YAxis domain={[0, 5]} /><ChartTooltip content={<ChartTooltipContent />} labelFormatter={(value) => {const item = chartData.find(d => d.category === value); return item ? item.categoryLabel : value; }} /><Bar dataKey="score" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></ChartContainer></CardContent></Card>
        <div className="grid md:grid-cols-2 gap-4">{chartData.map((item) => (<Card key={item.category}><CardContent className="pt-6"><div className="flex items-center justify-between"><div><h3 className="font-semibold">{item.categoryLabel}</h3><p className="text-sm text-muted-foreground">Score: {item.score}/5</p></div><div className="text-2xl font-bold text-primary">{item.score}</div></div><div className="mt-3 w-full bg-secondary rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(item.score / 5) * 100}%` }} /></div></CardContent></Card>))}</div>
        {recommendations.length > 0 && (<Card><CardHeader><CardTitle>Personalized Recommendations</CardTitle><p className="text-muted-foreground">Based on your responses, here are some suggestions to improve your well-being</p></CardHeader><CardContent><ul className="space-y-3">{recommendations.map((rec, index) => (<li key={index} className="flex items-start"><div className="bg-primary/10 p-1 rounded-full mr-3 mt-1"><div className="w-2 h-2 bg-primary rounded-full" /></div><span className="text-sm">{rec}</span></li>))}</ul></CardContent></Card>)}
        
        {/* 👇 UPDATED: Action Buttons Section 👇 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button className="w-full sm:w-auto">Book Counseling Session</Button>
            </Link>
            <Link href="/resources">
              <Button variant="outline" className="w-full sm:w-auto">View Resources</Button>
            </Link>
        </div>

        <Card className="bg-muted/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground text-center"><strong>Disclaimer:</strong> This assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.</p></CardContent></Card>
      </div>
    </main>
  );
}