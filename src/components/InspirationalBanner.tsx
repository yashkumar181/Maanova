import { useState, useEffect } from "react";
import { FloatingElement } from "./FloatingElement";
import { Button } from "./ui/button";
import { Sparkles, Heart, Menu, X, UserCheck, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const inspirationalPhrases = [
  "Every step forward is progress 💚",
  "You are stronger than you think ✨", 
  "Healing happens one breath at a time 🌱",
  "Your mental health matters 💙",
  "You're not alone in this journey 🤝"
];

export function InspirationalBanner() {
  const [currentPhrase, setCurrentPhrase] = useState(0);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % inspirationalPhrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/30 py-3 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold gradient-text">MindSpace</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('vision')}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Vision
              </button>
              <button 
                onClick={() => scrollToSection('resources')}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Resources
              </button>
              <button 
                onClick={() => scrollToSection('helplines')}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                Helplines
              </button>
            </div>

            {/* Login Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <a href="https://mental-health-platform-eosin.vercel.app/">
              <Button 
                size="sm"
                className="hover:bg-primary/90
                text-primary-foreground"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Student Login
              </Button>
              </a>
              <a href="https://admin-dashboard-ivory-alpha-36.vercel.app/">
              <Button 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ShieldCheck className="h-4 w-4 mr-1" />
                Admin Login
              </Button>
              </a>
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div>
              <ThemeToggle />
              <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 py-4 px-4 space-y-3 shadow-lg">
              <button 
                onClick={() => scrollToSection('vision')}
                className="block w-full text-left py-2 px-3 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors font-medium"
              >
                Vision
              </button>
              <button 
                onClick={() => scrollToSection('resources')}
                className="block w-full text-left py-2 px-3 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors font-medium"
              >
                Resources
              </button>
              <button 
                onClick={() => scrollToSection('helplines')}
                className="block w-full text-left py-2 px-3 text-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors font-medium"
              >
                Helplines
              </button>
              <div className="border-t border-border/30 pt-3 space-y-2">
                <a href="https://mental-health-platform-eosin.vercel.app/" className="block">
                <Button 
                  size="sm"
                  className="w-full justify-start hover:bg-primary/90
                  text-primary-foreground"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Student Login
                </Button>
                </a>
                <a href="https://admin-dashboard-ivory-alpha-36.vercel.app/" className="block">
                <Button 
                  size="sm"
                  className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Inspirational Quote Section */}
      <div className="relative overflow-hidden bg-gradient-hero border-b border-border/50 pt-20">
      <div className="py-6">
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
      </div>
      </div>
      
      {/* Decorative dots */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-4 left-1/4 w-2 h-2 bg-primary rounded-full animate-bounce-gentle"></div>
        <div className="absolute top-8 right-1/3 w-1 h-1 bg-ocean rounded-full animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-4 left-1/3 w-1.5 h-1.5 bg-sage rounded-full animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
      </div>
    </>
  );
}