"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHO5Results } from '@/components/WHO5Results';

// WHO-5 questions with categories and icons
const questions = [
  {
    id: 1,
    text: "I have felt cheerful and in good spirits",
    category: "mood",
    categoryLabel: "Mood & Emotional State",
    emoji: ["😢", "😕", "😐", "🙂", "😄", "😊"]
  },
  {
    id: 2,
    text: "I have felt calm and relaxed", 
    category: "anxiety",
    categoryLabel: "Anxiety & Stress Level",
    emoji: ["😰", "😟", "😑", "😌", "😊", "😇"]
  },
  {
    id: 3,
    text: "I have felt active and vigorous",
    category: "physical",
    categoryLabel: "Physical Wellness",
    emoji: ["🛌", "😴", "😑", "🚶", "🏃", "💪"]
  },
  {
    id: 4,
    text: "I woke up feeling fresh and rested",
    category: "sleep", 
    categoryLabel: "Sleep Quality",
    emoji: ["😵", "🥱", "😑", "😌", "😊", "🌟"]
  },
  {
    id: 5,
    text: "My daily life has been filled with things that interest me",
    category: "engagement",
    categoryLabel: "Life Engagement",
    emoji: ["😑", "😕", "🙄", "🤔", "😊", "🤩"]
  }
];

const scaleLabels = ["Never", "Rarely", "Sometimes", "Often", "Most of the time", "All the time"];

export default function WHO5Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleResponse = (questionId: number, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const hasResponse = responses[question.id] !== undefined;

  if (showResults) {
    return <WHO5Results responses={responses} questions={questions} onRestart={() => {
      setCurrentQuestion(0);
      setResponses({});
      setShowResults(false);
    }} />;
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="p-2"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-semibold">WHO-5 Assessment</h1>
            <p className="text-sm text-muted-foreground">
              {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-8" />

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="text-sm text-primary font-medium mb-2">
              {question.categoryLabel}
            </div>
            <CardTitle className="text-lg leading-relaxed">
              Over the last two weeks:
            </CardTitle>
            <p className="text-base text-foreground font-medium">
              "{question.text}"
            </p>
          </CardHeader>
          
          <CardContent>
            {/* Emoji Selection Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {question.emoji.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleResponse(question.id, index)}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    responses[question.id] === index
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border bg-card"
                  )}
                >
                  <span className="text-3xl mb-2">{emoji}</span>
                  <span className="text-xs text-center text-muted-foreground font-medium">
                    {scaleLabels[index]}
                  </span>
                </button>
              ))}
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between text-xs text-muted-foreground mb-6">
              <span>0 - Never</span>
              <span>5 - All the time</span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!hasResponse}
            className="bg-primary hover:bg-primary/90"
          >
            {currentQuestion === questions.length - 1 ? (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Results
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}