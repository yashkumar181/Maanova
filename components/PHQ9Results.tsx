"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { saveProgressResponse } from '@/lib/progressService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, RotateCcw, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PHQ9ResultsProps {
  responses: { [key: number]: number };
  onRestart: () => void;
}

const chartConfig = {
  score: { label: "Score", color: "hsl(var(--primary))" },
};

const categories = {
  mood: { label: 'Mood & Interest' },
  energy: { label: 'Energy & Sleep' },
  cognitive: { label: 'Cognitive Symptoms' },
  physical: { label: 'Physical Symptoms' },
  social: { label: 'Social Functioning' }
};

const phq9Questions = [
  { id: 1, category: 'mood' }, { id: 2, category: 'mood' }, { id: 3, category: 'energy' },
  { id: 4, category: 'energy' }, { id: 5, category: 'cognitive' }, { id: 6, category: 'cognitive' },
  { id: 7, category: 'cognitive' }, { id: 8, category: 'physical' }, { id: 9, category: 'social' }
];

export function PHQ9Results({ responses, onRestart }: PHQ9ResultsProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const totalScore = Object.values(responses).reduce((sum, value) => sum + value, 0);
  
  useEffect(() => {
    if (user && !isSaved) {
      saveProgressResponse(user.uid, "PHQ9", totalScore, responses);
      setIsSaved(true);
    }
  }, [user, totalScore, responses, isSaved]);

  const getSeverityLevel = (score: number) => {
    if (score <= 4) return { level: 'Minimal', color: 'success', description: 'Minimal depression symptoms', icon: CheckCircle };
    if (score <= 9) return { level: 'Mild', color: 'warning', description: 'Mild depression symptoms', icon: TrendingUp };
    if (score <= 14) return { level: 'Moderate', color: 'warning', description: 'Moderate depression symptoms', icon: AlertTriangle };
    if (score <= 19) return { level: 'Moderately Severe', color: 'destructive', description: 'Moderately severe depression', icon: AlertTriangle };
    return { level: 'Severe', color: 'destructive', description: 'Severe depression symptoms', icon: AlertTriangle };
  };

  const severity = getSeverityLevel(totalScore);
  const SeverityIcon = severity.icon;

  const categoryScores = Object.keys(categories).map(categoryKey => {
    const categoryQuestions = phq9Questions.filter(q => q.category === categoryKey);
    const categoryTotal = categoryQuestions.reduce((sum, q) => sum + (responses[q.id] || 0), 0);
    const maxPossible = categoryQuestions.length * 3;
    const percentage = maxPossible > 0 ? Math.round((categoryTotal / maxPossible) * 100) : 0;
    return {
      category: categories[categoryKey as keyof typeof categories].label,
      score: percentage, rawScore: categoryTotal, maxScore: maxPossible
    };
  });

  const getRecommendations = () => {
    if (totalScore <= 4) return ["Continue your current self-care practices", "Maintain regular exercise and social connections", "Practice gratitude and mindfulness techniques"];
    if (totalScore <= 9) return ["Consider lifestyle changes like regular exercise", "Maintain social connections and activities you enjoy", "Practice stress management techniques", "Monitor your mood over time"];
    if (totalScore <= 14) return ["Consider speaking with a healthcare provider", "Explore therapy options like CBT", "Maintain regular exercise and healthy sleep habits", "Stay connected with supportive friends and family"];
    if (totalScore <= 19) return ["Strongly consider professional help from a mental health provider", "Contact your healthcare provider soon", "Consider therapy and/or medication evaluation", "Maintain daily structure and routine"];
    return ["Seek immediate professional help from a mental health provider", "Contact your healthcare provider or crisis helpline", "Consider intensive treatment options", "Reach out to support networks and emergency resources"];
  };

  const percentageScore = (totalScore / 27) * 100;

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your PHQ-9 Results</h1>
          <p className="text-muted-foreground">Based on your responses from the past week</p>
        </div>

        {/* Overall Score Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <SeverityIcon className={cn("h-12 w-12 mr-3", 
                severity.color === "destructive" && "text-destructive", 
                severity.color === "warning" && "text-yellow-500", 
                severity.color === "success" && "text-green-500"
              )} />
              <div>
                <CardTitle className="text-2xl">Depression Level</CardTitle>
                <Badge variant={severity.color === "success" ? "default" : "secondary"} className="mt-2">
                  {severity.level}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">{totalScore}/27</div>
            <div className="text-lg text-muted-foreground mb-4">{severity.description}</div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-700" 
                style={{ width: `${percentageScore}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Symptom Category Breakdown</CardTitle>
            <p className="text-muted-foreground">Your depression symptoms across different categories</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryScores} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} labelFormatter={(value) => value} />
                  <Bar dataKey="score" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Detailed Scores */}
        <div className="grid md:grid-cols-2 gap-4">
          {categoryScores.map((item) => (
            <Card key={item.category}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{item.category}</h3>
                    <p className="text-sm text-muted-foreground">Score: {item.rawScore}/{item.maxScore}</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">{item.score}%</div>
                </div>
                <div className="mt-3 w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${item.score}%` }} 
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
            <p className="text-muted-foreground">Based on your responses, here are some suggestions to manage depression</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {getRecommendations().map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onRestart} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Assessment
          </Button>
          <Button>Book Counseling Session</Button>
          <Button variant="outline">View Resources</Button>
        </div>

        {/* Disclaimer */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Disclaimer:</strong> This assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. If you're experiencing severe depression symptoms, please contact a healthcare professional or crisis helpline immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}