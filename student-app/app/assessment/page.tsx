"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, BarChart3, Brain, Heart, Loader2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHO5Results } from '@/components/WHO5Results';
import { GADResults } from '@/components/GADResults';
import { PHQ9Results } from '@/components/PHQ9Results';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, limit, DocumentData } from 'firebase/firestore';

// WHO-5 questions
const who5Questions = [
  { id: 1, text: "I have felt cheerful and in good spirits", category: "mood", categoryLabel: "Mood & Emotional State", emoji: ["😢", "😕", "😐", "🙂", "😄", "😊"] },
  { id: 2, text: "I have felt calm and relaxed", category: "anxiety", categoryLabel: "Anxiety & Stress Level", emoji: ["😰", "😟", "😑", "😌", "😊", "😇"] },
  { id: 3, text: "I have felt active and vigorous", category: "physical", categoryLabel: "Physical Wellness", emoji: ["🛌", "😴", "😑", "🚶", "🏃", "💪"] },
  { id: 4, text: "I woke up feeling fresh and rested", category: "sleep", categoryLabel: "Sleep Quality", emoji: ["😵", "🥱", "😑", "😌", "😊", "🌟"] },
  { id: 5, text: "My daily life has been filled with things that interest me", category: "engagement", categoryLabel: "Life Engagement", emoji: ["😑", "😕", "🙄", "🤔", "😊", "🤩"] }
];
const gadQuestions = [
  { id: 1, text: "Feeling nervous, anxious, or on edge", category: "anxiety", categoryLabel: "Anxiety Symptoms", emoji: ["😌", "😟", "😰", "😱"] },
  { id: 2, text: "Not being able to stop or control worrying", category: "worry", categoryLabel: "Worry Control", emoji: ["😌", "🤔", "😟", "😫"] },
  { id: 3, text: "Worrying too much about different things", category: "worry", categoryLabel: "Excessive Worry", emoji: ["😌", "🤔", "😟", "😫"] },
  { id: 4, text: "Trouble relaxing", category: "physical", categoryLabel: "Physical Tension", emoji: ["😌", "😐", "😕", "😬"] },
  { id: 5, text: "Being so restless that it's hard to sit still", category: "physical", categoryLabel: "Restlessness", emoji: ["😌", "😟", "😣", "😫"] },
  { id: 6, text: "Becoming easily annoyed or irritable", category: "mood", categoryLabel: "Irritability", emoji: ["😊", "😐", "😠", "😡"] },
  { id: 7, text: "Feeling afraid as if something awful might happen", category: "fear", categoryLabel: "Anticipatory Fear", emoji: ["😊", "🤔", "😨", "😱"] }
];
const phq9Questions = [
  { id: 1, text: "Little interest or pleasure in doing things", category: "mood", categoryLabel: "Interest & Pleasure", emoji: ["😊", "😐", "😔", "😞"] },
  { id: 2, text: "Feeling down, depressed, or hopeless", category: "mood", categoryLabel: "Depressed Mood", emoji: ["😊", "😐", "😔", "😭"] },
  { id: 3, text: "Trouble falling or staying asleep, or sleeping too much", category: "energy", categoryLabel: "Sleep Problems", emoji: ["😴", "🥱", "😵", "😫"] },
  { id: 4, text: "Feeling tired or having little energy", category: "energy", categoryLabel: "Energy Level", emoji: ["⚡", "😐", "🥱", "🔋"] },
  { id: 5, text: "Poor appetite or overeating", category: "physical", categoryLabel: "Appetite Changes", emoji: ["🍽️", "😐", "🤢", "🍕"] },
  { id: 6, text: "Feeling bad about yourself or that you are a failure", category: "cognitive", categoryLabel: "Self-Worth", emoji: ["🌟", "😐", "😔", "💔"] },
  { id: 7, text: "Trouble concentrating on things", category: "cognitive", categoryLabel: "Concentration", emoji: ["🎯", "🤔", "😵‍💫", "🌪️"] },
  { id: 8, text: "Moving or speaking slowly, or being fidgety/restless", category: "physical", categoryLabel: "Psychomotor Changes", emoji: ["🚶", "😐", "🐌", "⚡"] },
  { id: 9, text: "Thoughts that you would be better off dead", category: "social", categoryLabel: "Suicidal Ideation", emoji: ["💭", "⚠️", "🆘", "‼️"] }
];

const who5ScaleLabels = ["Never", "Rarely", "Sometimes", "Often", "Most of the time", "All the time"];
const gadAndPhqScaleLabels = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

export default function AssessmentPage() {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [assessmentType, setAssessmentType] = useState<'WHO5' | 'GAD7' | 'PHQ9'>('WHO5');
  const [showSelection, setShowSelection] = useState(false);
  const [questions, setQuestions] = useState(who5Questions);
  const [scaleLabels, setScaleLabels] = useState(who5ScaleLabels);
  const [isChecking, setIsChecking] = useState(true);
  
  const [todaysWHO5, setTodaysWHO5] = useState<DocumentData | null>(null);
  const [todaysGAD7, setTodaysGAD7] = useState<DocumentData | null>(null);
  const [todaysPHQ9, setTodaysPHQ9] = useState<DocumentData | null>(null);

  // 👇 FIX #1: Add a state to track if the current submission has been saved
  const [isSubmissionSaved, setIsSubmissionSaved] = useState(false);

  useEffect(() => {
    const checkExistingSubmissions = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const check = async (type: 'WHO5' | 'GAD7' | 'PHQ9') => {
        const q = query(collection(db, "progressResponses"), where("studentId", "==", user.uid), where("questionnaireType", "==", type), where("timestamp", ">=", todayTimestamp), limit(1));
        const snapshot = await getDocs(q);
        return snapshot.empty ? null : snapshot.docs[0].data();
      };
      
      const who5 = await check('WHO5');
      const gad7 = await check('GAD7');
      const phq9 = await check('PHQ9');
      
      setTodaysWHO5(who5);
      setTodaysGAD7(gad7);
      setTodaysPHQ9(phq9);

      const isSpecialDay = new Date().getDay() === 5; // Friday

      if (!isSpecialDay && who5) {
        setIsSubmissionSaved(true); // Mark as already saved
        handleViewResult(who5);
      } else if (isSpecialDay && gad7 && phq9) {
        // Let render logic handle the "View Results" screen
      } else if (isSpecialDay) {
        setShowSelection(true);
      } else {
        setAssessmentType('WHO5');
        setQuestions(who5Questions);
        setScaleLabels(who5ScaleLabels);
      }
      setIsChecking(false);
    };

    if (!showResults) {
        checkExistingSubmissions();
    }
  }, [user, showResults]);

  const handleViewResult = (submissionData: DocumentData) => {
      const type = submissionData.questionnaireType as 'WHO5' | 'GAD7' | 'PHQ9';
      setAssessmentType(type);
      setResponses(submissionData.individualResponses);
      if (type === 'WHO5') setQuestions(who5Questions);
      else if (type === 'GAD7') setQuestions(gadQuestions);
      else setQuestions(phq9Questions);
      setShowResults(true);
  };
  
  const handleAssessmentChoice = (type: 'GAD7' | 'PHQ9') => {
    setAssessmentType(type);
    if (type === 'GAD7') {
      setQuestions(gadQuestions);
      setScaleLabels(gadAndPhqScaleLabels);
    } else {
      setQuestions(phq9Questions);
      setScaleLabels(gadAndPhqScaleLabels);
    }
    setShowSelection(false);
  };

  const handleResponse = (questionId: number, index: number) => {
    setResponses(prev => ({ ...prev, [questionId]: index }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsSubmissionSaved(false); // It's a new submission, so it's not saved yet
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
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const hasResponse = responses[question.id] !== undefined;

  if (isChecking) {
    return (
      <main className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }
  
  if (new Date().getDay() === 5 && todaysGAD7 && todaysPHQ9 && !showResults) {
    return (
      <main className="min-h-screen bg-background p-4 flex items-center">
        <div className="max-w-2xl mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Daily Assessments Complete</h1>
            <p className="text-muted-foreground">You've completed all assessments for today. Great job! Choose which results you'd like to review.</p>
          </div>
          <div className="grid gap-6">
            <Card className="cursor-pointer hover:border-primary/50 transition-all" onClick={() => { setIsSubmissionSaved(true); handleViewResult(todaysGAD7!); }}>
              <CardHeader><div className="flex items-center"><Eye className="h-8 w-8 text-primary mr-3" /><div><CardTitle>View GAD-7 Anxiety Results</CardTitle></div></div></CardHeader>
            </Card>
            <Card className="cursor-pointer hover:border-primary/50 transition-all" onClick={() => { setIsSubmissionSaved(true); handleViewResult(todaysPHQ9!); }}>
              <CardHeader><div className="flex items-center"><Eye className="h-8 w-8 text-primary mr-3" /><div><CardTitle>View PHQ-9 Depression Results</CardTitle></div></div></CardHeader>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (showSelection) {
    return (
      <main className="min-h-screen bg-background p-4 flex items-center">
        <div className="max-w-2xl mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Assessment</h1>
            <p className="text-muted-foreground">Select the assessment you'd like to take today.</p>
          </div>
          <div className="grid gap-6">
            <Card className={cn("transition-all", todaysGAD7 ? "opacity-50" : "cursor-pointer hover:border-primary/50")} onClick={() => { if(todaysGAD7) { setIsSubmissionSaved(true); handleViewResult(todaysGAD7); } else { handleAssessmentChoice('GAD7'); } }}>
              <CardHeader><div className="flex items-center"><Brain className="h-8 w-8 text-primary mr-3" /><div><CardTitle>GAD-7 Anxiety Assessment</CardTitle><p className="text-sm text-muted-foreground">Measure anxiety symptoms.</p></div>{todaysGAD7 && <Badge className="ml-auto">Completed</Badge>}</div></CardHeader>
            </Card>
            <Card className={cn("transition-all", todaysPHQ9 ? "opacity-50" : "cursor-pointer hover:border-primary/50")} onClick={() => { if(todaysPHQ9) { setIsSubmissionSaved(true); handleViewResult(todaysPHQ9); } else { handleAssessmentChoice('PHQ9'); } }}>
              <CardHeader><div className="flex items-center"><Heart className="h-8 w-8 text-primary mr-3" /><div><CardTitle>PHQ-9 Depression Assessment</CardTitle><p className="text-sm text-muted-foreground">Evaluate depression symptoms.</p></div>{todaysPHQ9 && <Badge className="ml-auto">Completed</Badge>}</div></CardHeader>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (showResults) {
    if (assessmentType === 'GAD7') {
      return <GADResults responses={responses} onRestart={handleRestart} isSaved={isSubmissionSaved} setIsSaved={setIsSubmissionSaved} />;
    } else if (assessmentType === 'PHQ9') {
      return <PHQ9Results responses={responses} onRestart={handleRestart} isSaved={isSubmissionSaved} setIsSaved={setIsSubmissionSaved} />;
    } else {
      return <WHO5Results responses={responses} questions={who5Questions} onRestart={handleRestart} isSaved={isSubmissionSaved} setIsSaved={setIsSubmissionSaved} />;
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 flex items-center">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={handleRestart} className="p-2"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="text-center">
            <h1 className="text-xl font-semibold">
              {assessmentType === 'GAD7' ? 'GAD-7 Anxiety' : 
               assessmentType === 'PHQ9' ? 'PHQ-9 Depression' : 
               'WHO-5 Well-Being'} Assessment
            </h1>
            <p className="text-sm text-muted-foreground">{currentQuestion + 1} of {questions.length}</p>
          </div>
          <div className="w-10" />
        </div>

        <Progress value={progress} className="mb-8" />

        <Card className="mb-8">
          <CardHeader>
            <div className="text-sm text-primary font-medium mb-2">{question.categoryLabel}</div>
            <CardTitle className="text-lg leading-relaxed">
              {'Over the last two weeks, how often have you been bothered by:'}
            </CardTitle>
            <p className="text-base text-foreground font-medium">"{question.text}"</p>
          </CardHeader>
          
          <CardContent>
            <div className={cn(
              "grid gap-2 sm:gap-4 mb-6",
              question.emoji.length > 4 
                ? "grid-cols-3"
                : "grid-cols-2 md:grid-cols-4"
            )}>
              {question.emoji.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleResponse(question.id, index)}
                  className={cn( "flex flex-col items-center p-4 rounded-xl border-2 transition-all", "hover:border-primary/50 hover:bg-primary/5", responses[question.id] === index ? "border-primary bg-primary/10 shadow-lg" : "border-border bg-card" )}
                >
                  <span className="text-3xl mb-2">{emoji}</span>
                  <span className="text-xs text-center text-muted-foreground font-medium">{scaleLabels[index]}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-6">
              <span>{scaleLabels[0]}</span>
              <span>{scaleLabels[scaleLabels.length - 1]}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}><ChevronLeft className="h-4 w-4 mr-2" /> Previous</Button>
          <Button onClick={handleNext} disabled={!hasResponse} className="bg-primary hover:bg-primary/90">
            {currentQuestion === questions.length - 1 ? ( <><BarChart3 className="h-4 w-4 mr-2" /> View Results</> ) : ( <>Next <ChevronRight className="h-4 w-4 ml-2" /></> )}
          </Button>
        </div>
      </div>
    </main>
  );
}