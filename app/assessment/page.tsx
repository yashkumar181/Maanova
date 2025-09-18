// In app/resources/who5-assessment/page.tsx
"use client";
import { useState,useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, BarChart3, Brain, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHO5Results } from '@/components/WHO5Results';
import { GADResults } from '@/components/GADResults';
import { PHQ9Results } from '@/components/PHQ9Results';

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
    emoji: ["😇", "😟", "🫨"]
  },
  {
    id: 2,
    text: "Not being able to stop or control worrying",
    category: "worry",
    categoryLabel: "Worry Control",
    emoji: ["🧘", "😣", "🌪️"]
  },
  {
    id: 3,
    text: "Worrying too much about different things",
    category: "worry", 
    categoryLabel: "Excessive Worry",
    emoji: ["😴", "😟", "😱"]
  },
  {
    id: 4,
    text: "Trouble relaxing",
    category: "physical",
    categoryLabel: "Physical Tension", 
    emoji: ["🧘", "😤", "⚡"]
  },
  {
    id: 5,
    text: "Being so restless that it's hard to sit still",
    category: "physical",
    categoryLabel: "Restlessness",
    emoji: ["💺","🌪️", "🔥"]
  },
  {
    id: 6,
    text: "Becoming easily annoyed or irritable",
    category: "mood",
    categoryLabel: "Irritability",
    emoji: ["😊", "😠", "👹"]
  },
  {
    id: 7,
    text: "Feeling afraid as if something awful might happen",
    category: "fear",
    categoryLabel: "Anticipatory Fear",
    emoji: ["😇", "😨", "💀"]
  }
];

// PHQ-9 questions with categories and icons
const phq9Questions = [
  {
    id: 1,
    text: "Little interest or pleasure in doing things",
    category: "mood",
    categoryLabel: "Interest & Pleasure",
    emoji: ["😊", "😑", "😔"]
  },
  {
    id: 2,
    text: "Feeling down, depressed, or hopeless",
    category: "mood",
    categoryLabel: "Depressed Mood",
    emoji: ["😊", "😞", "😭"]
  },
  {
    id: 3,
    text: "Trouble falling or staying asleep, or sleeping too much",
    category: "energy",
    categoryLabel: "Sleep Problems",
    emoji: ["😴", "🥱", "😵"]
  },
  {
    id: 4,
    text: "Feeling tired or having little energy",
    category: "energy",
    categoryLabel: "Energy Level",
    emoji: ["⚡", "😑", "🔋"]
  },
  {
    id: 5,
    text: "Poor appetite or overeating", 
    category: "physical",
    categoryLabel: "Appetite Changes",
    emoji: ["🍽️", "😐", "🍕"]
  },
  {
    id: 6,
    text: "Feeling bad about yourself or that you are a failure",
    category: "cognitive",
    categoryLabel: "Self-Worth",
    emoji: ["🌟", "😔", "💔"]
  },
  {
    id: 7,
    text: "Trouble concentrating on things",
    category: "cognitive",
    categoryLabel: "Concentration",
    emoji: ["🎯", "😵‍💫", "🌪️"]
  },
  {
    id: 8,
    text: "Moving or speaking slowly, or being fidgety/restless",
    category: "physical",
    categoryLabel: "Psychomotor Changes",
    emoji: ["🚶", "🐌", "⚡"]
  },
  {
    id: 9,
    text: "Thoughts that you would be better off dead",
    category: "social",
    categoryLabel: "Suicidal Ideation",
    emoji: ["💭", "⚠️", "🆘"]
  }
];

const who5ScaleLabels = ["Never", "Rarely", "Sometimes", "Often", "Most of the time", "All the time"];
const gadScaleLabels = ["Not at all", "More than half", "Nearly every day"];
const phq9ScaleLabels = ["Not at all", "Several days", "Nearly every day"];

export default function WHO5Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [assessmentType, setAssessmentType] = useState<'WHO5' | 'GAD7' | 'PHQ9'>('WHO5');
  const [showSelection, setShowSelection] = useState(false);
  const [questions, setQuestions] = useState(who5Questions);
  const [scaleLabels, setScaleLabels] = useState(who5ScaleLabels);
  // REMOVED: isSaved state is no longer needed here.

  useEffect(() => {
  // TEMP override for testing
  //Date.prototype.getDay = () => 0; // Simulate Sunday

  const today = new Date();
  const isSunday = today.getDay() === 4;
  //setIsGAD(isSunday);

  if (isSunday) {
      setShowSelection(true);
    } else {
      setAssessmentType('WHO5');
      setQuestions(who5Questions);
      setScaleLabels(who5ScaleLabels);
    }

}, []);

const handleAssessmentChoice = (type: 'GAD7' | 'PHQ9') => {
    setAssessmentType(type);
    setShowSelection(false);
    
    if (type === 'GAD7') {
      setQuestions(gadQuestions);
      setScaleLabels(gadScaleLabels);
    } else {
      setQuestions(phq9Questions);
      setScaleLabels(phq9ScaleLabels);
    }
  };


  const handleResponse = (questionId: number, index: number) => {
    const value = assessmentType === 'WHO5' ? index : index + 1; 
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

    const today = new Date();
    const isSunday = today.getDay() === 4;
    
    if (isSunday) {
      setShowSelection(true);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const hasResponse = responses[question.id] !== undefined;

  if (showSelection) {
    return (
      <main className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Assessment</h1>
            <p className="text-muted-foreground">Select the assessment you'd like to take today</p>
          </div>
          
          <div className="grid gap-6">
            <Card className="cursor-pointer hover:border-primary/50 transition-all" onClick={() => handleAssessmentChoice('GAD7')}>
              <CardHeader>
                <div className="flex items-center">
                  <Brain className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <CardTitle>GAD-7 Anxiety Assessment</CardTitle>
                    <p className="text-sm text-muted-foreground">Measure anxiety symptoms over the past week</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">7 questions focusing on anxiety, worry, and nervous feelings</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary/50 transition-all" onClick={() => handleAssessmentChoice('PHQ9')}>
              <CardHeader>
                <div className="flex items-center">
                  <Heart className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <CardTitle>PHQ-9 Depression Assessment</CardTitle>
                    <p className="text-sm text-muted-foreground">Evaluate depression symptoms over the past week</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">9 questions covering mood, energy, sleep, and cognitive symptoms</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (showResults) {
    const onRestart = () => {
      setCurrentQuestion(0);
      setResponses({});
      setShowResults(false);
      
      const today = new Date();
      const isSunday = today.getDay() === 0;
      
      if (isSunday) {
        setShowSelection(true);
      }
    };
    
    if (assessmentType === 'GAD7') {
      return <GADResults responses={responses} onRestart={onRestart} />;
    } else if (assessmentType === 'PHQ9') {
      return <PHQ9Results responses={responses} onRestart={onRestart} />;
    } else {
      return <WHO5Results responses={responses} questions={questions} onRestart={onRestart} />;
    }
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
              {assessmentType === 'GAD7' ? 'GAD-7 Anxiety Assessment' : 
               assessmentType === 'PHQ9' ? 'PHQ-9 Depression Assessment' : 
               'WHO-5 Well-Being Assessment'}
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
              {assessmentType === 'WHO5' ? 'Today:' : 
               assessmentType === 'GAD7' ? 'Over the last week, how often have you been bothered by:' :
               'Over the last week, how often have you been bothered by:'}
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
                    responses[question.id] === (assessmentType === 'WHO5' ? index : index + 1)
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
              <span>{assessmentType === 'WHO5' ? 0 : 1} - {scaleLabels[0]}</span>
              <span>
                {assessmentType === 'WHO5' ? scaleLabels.length - 1 : scaleLabels.length} - {scaleLabels[scaleLabels.length - 1]}
              </span>
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
