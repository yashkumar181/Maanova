import { useState, useEffect } from "react";
import { FloatingElement } from "./FloatingElement";
import { Sparkles, Heart } from "lucide-react";

const inspirationalPhrases = [
  "Every step forward is progress 💚",
  "You are stronger than you think ✨", 
  "Healing happens one breath at a time 🌱",
  "Your mental health matters 💙",
  "You're not alone in this journey 🤝"
];

export function InspirationalBanner() {
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % inspirationalPhrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-hero py-6 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="relative text-center">
          <FloatingElement className="absolute -left-8 top-0" delay={0}>
            <Sparkles className="h-6 w-6 text-primary animate-pulse-soft" />
          </FloatingElement>
          
          <div className="animate-fade-in">
            <p className="text-lg font-medium gradient-text transition-all duration-1000">
              {inspirationalPhrases[currentPhrase]}
            </p>
          </div>
          
          <FloatingElement className="absolute -right-8 top-0" delay={2}>
            <Heart className="h-6 w-6 text-primary animate-pulse-soft" />
          </FloatingElement>
        </div>
      </div>
      
      {/* Decorative dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-1/4 w-2 h-2 bg-primary rounded-full animate-bounce-gentle"></div>
        <div className="absolute top-8 right-1/3 w-1 h-1 bg-ocean rounded-full animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-4 left-1/3 w-1.5 h-1.5 bg-sage rounded-full animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}