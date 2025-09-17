// In app/resources/who5-assessment/page.tsx
"use client";
import { useState,useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHO5Results } from '@/components/WHO5Results';
import { GADResults } from '@/components/GADResults';

// WHO-5 questions with categories and icons
const who5Questions = [
  { id: 1, text: "I have felt cheerful and in good spirits", category: "mood", categoryLabel: "Mood & Emotional State", emoji: ["😢", "😕", "😐", "🙂", "😄", "😊"] },
  { id: 2, text: "I have felt calm and relaxed", category: "anxiety", categoryLabel: "Anxiety & Stress Level", emoji: ["😰", "😟", "😑", "😌", "😊", "😇"] },
  { id: 3, text: "I have felt active and vigorous", category: "physical", categoryLabel: "Physical Wellness", emoji: ["🛌", "😴", "😑", "🚶", "🏃", "💪"] },
  { id: 4, text: "I woke up feeling fresh and rested", category: "sleep", categoryLabel: "Sleep Quality", emoji: ["😵", "🥱", "😑", "😌", "😊", "🌟"] },
  { id: 5, text: "My daily life has been filled with things that interest me", category: "engagement", categoryLabel: "Life Engagement", emoji: ["😑", "😕", "🙄", "🤔", "😊", "🤩"] }
];

// GAD-7 questions with categories and icons  
const gadQuestions = [
  {
    id: 1,
    text: "Feeling nervous, anxious, or on edge",
    category: "anxiety",
    categoryLabel: "Anxiety Symptoms",
    emoji: ["😇", "😌", "😐", "😟", "😰", "🫨"]
  },
  {
    id: 2,
    text: "Not being able to stop or control worrying",
    category: "worry",
    categoryLabel: "Worry Control",
    emoji: ["🧘", "😊", "🤔", "😣", "😫", "🌪️"]
  },
  {
    id: 3,
    text: "Worrying too much about different things",
    category: "worry", 
    categoryLabel: "Excessive Worry",
    emoji: ["😴", "🙂", "😑", "😟", "😫", "😱"]
  },
  {
    id: 4,
    text: "Trouble relaxing",
    category: "physical",
    categoryLabel: "Physical Tension", 
    emoji: ["🧘", "😌", "😐", "😤", "🫨", "⚡"]
  },
  {
    id: 5,
    text: "Being so restless that it's hard to sit still",
    category: "physical",
    categoryLabel: "Restlessness",
    emoji: ["💺", "🚶", "🏃", "🌪️", "⚡", "🔥"]
  },
  {
    id: 6,
    text: "Becoming easily annoyed or irritable",
    category: "mood",
    categoryLabel: "Irritability",
    emoji: ["😊", "🙂", "😐", "😠", "🤬", "👹"]
  },
  {
    id: 7,
    text: "Feeling afraid as if something awful might happen",
    category: "fear",
    categoryLabel: "Anticipatory Fear",
    emoji: ["😇", "🙂", "😑", "😨", "😱", "💀"]
  }
];

const who5ScaleLabels = ["Never", "Rarely", "Sometimes", "Often", "Most of the time", "All the time"];
const gadScaleLabels = ["Not at all", "Several days", "More than half", "Often", "Most days", "Nearly every day"];

export default function WHO5Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isGAD, setIsGAD] = useState(false);
  const [questions, setQuestions] = useState(who5Questions);
  const [scaleLabels, setScaleLabels] = useState(who5ScaleLabels);
  // REMOVED: isSaved state is no longer needed here.

  useEffect(() => {
  // TEMP override for testing
  // Date.prototype.getDay = () => 0; // Simulate Sunday

  const today = new Date();
  const isSunday = today.getDay() === 0;
  setIsGAD(isSunday);

  if (isSunday) {
    setQuestions(gadQuestions);
    setScaleLabels(gadScaleLabels);
  } else {
    setQuestions(who5Questions);
    setScaleLabels(who5ScaleLabels);
  }

}, []);


  const handleResponse = (questionId: number, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
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
  
  const handleRestart = () => {
    setCurrentQuestion(0);
    setResponses({});
    setShowResults(false);
    // REMOVED: No need to reset isSaved.
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const hasResponse = responses[question.id] !== undefined;

  if (showResults) {
    const onRestart = () => {
      setCurrentQuestion(0);
      setResponses({});
      setShowResults(false);
    };
    
    return isGAD ? 
      <GADResults responses={responses} onRestart={onRestart} /> : 
      <WHO5Results responses={responses} questions={questions} onRestart={onRestart} />;
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
            <h1 className="text-xl font-semibold">
              {isGAD ? 'GAD-7 Anxiety Assessment' : 'WHO-5 Well-Being Assessment'}
            </h1>
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
              {isGAD ? 'Over the last week, how often have you been bothered by:' : 'Today:'}
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
              <span>0 - {scaleLabels[0]}</span>
              <span>5 - {scaleLabels[5]}</span>
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
