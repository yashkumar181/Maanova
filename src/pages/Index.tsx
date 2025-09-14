import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InspirationalBanner } from "@/components/InspirationalBanner";
import { ResourceCard } from "@/components/ResourceCard";
import { HelplineCard } from "@/components/HelplineCard";
import { FloatingElement } from "@/components/FloatingElement";
import { 
  Brain, 
  Heart, 
  Users, 
  BookOpen, 
  Headphones, 
  Calendar,
  UserCheck,
  ShieldCheck,
  Smile,
  MessageCircle,
  TreePine,
  Star
} from "lucide-react";
import groupSupportImage from "@/assets/group-support.jpg";
import peacefulNatureImage from "@/assets/peaceful-nature.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ThemeToggle />
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <FloatingElement className="absolute top-20 left-10" delay={0}>
          <TreePine className="h-12 w-12 text-sage" />
        </FloatingElement>
        <FloatingElement className="absolute top-40 right-20" delay={2}>
          <Star className="h-8 w-8 text-primary" />
        </FloatingElement>
        <FloatingElement className="absolute bottom-40 left-20" delay={4}>
          <Smile className="h-10 w-10 text-ocean" />
        </FloatingElement>
      </div>

      {/* Inspirational Banner */}
      <InspirationalBanner />

      {/* Hero Section */}
      <section className="relative py-32 px-4" style={{ paddingTop: '165px' paddingBottom: '20px'}}>
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-12 text-foreground">
              Your Path to <span className="text-primary">Mental</span><br />
              <span className="text-primary">Wellness</span> Begins Here
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              A safe space for college students to find support, resources, and healing. 
              Your mental health journey matters, and you're not alone.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 px-4 bg-gradient-card">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Our Vision</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Creating a supportive ecosystem where every student can thrive mentally and emotionally
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <img 
                src={groupSupportImage} 
                alt="Diverse students in supportive group therapy session"
                className="rounded-2xl shadow-card w-full"
              />
            </div>
            
            <div className="space-y-6 animate-slide-up">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Support shaped around you</h3>
                  <p className="text-muted-foreground">
                    We understand your unique challenges as a student and provide personalized support that fits your lifestyle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-ocean/20 rounded-full">
                  <Heart className="h-6 w-6 text-ocean-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Supporting those who support you</h3>
                  <p className="text-muted-foreground">
                    We bring your loved ones into the healing process through resources and guidance for a stronger support network.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-sage/30 rounded-full">
                  <MessageCircle className="h-6 w-6 text-sage-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Care in your language</h3>
                  <p className="text-muted-foreground">
                    With support across multiple Indian languages, our experts understand your cultural context completely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Cards Section */}
      <section id="resources" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Mental Health Resources</h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive tools and support for your wellbeing journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResourceCard
              title="Mindfulness & Meditation"
              description="Guided meditation sessions and mindfulness exercises to help you find inner peace and reduce stress."
              icon={Brain}
              color="primary"
              delay={1}
            />
            <ResourceCard
              title="Peer Support Groups"
              description="Connect with fellow students who understand your struggles in a safe, non-judgmental environment."
              icon={Users}
              color="mint"
              delay={2}
            />
            <ResourceCard
              title="Study-Life Balance"
              description="Learn practical strategies to manage academic pressure while maintaining your mental health."
              icon={BookOpen}
              color="ocean"
              delay={3}
            />
            <ResourceCard
              title="Crisis Support"
              description="24/7 emotional support and crisis intervention when you need immediate help and guidance."
              icon={Heart}
              color="sage"
              delay={4}
            />
            <ResourceCard
              title="Online Counseling"
              description="Professional therapy sessions with licensed counselors, available through secure video calls."
              icon={Headphones}
              color="primary"
              delay={5}
            />
            <ResourceCard
              title="Wellness Workshops"
              description="Interactive workshops on stress management, anxiety coping skills, and building resilience."
              icon={Calendar}
              color="mint"
              delay={6}
            />
          </div>
        </div>
      </section>

      {/* Indian Helplines Section */}
      <section id="helplines" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Emergency Helplines</h2>
            <p className="text-xl text-muted-foreground">
              Immediate support when you need it most - available 24/7
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HelplineCard
              name="Vandrevala Foundation"
              number="9999 666 555"
              hours="24x7"
              description="Free mental health helpline providing crisis support and counseling"
              delay={1}
            />
            <HelplineCard
              name="AASRA"
              number="91-9820466726"
              hours="24x7"
              description="Suicide prevention and emotional support helpline"
              delay={2}
            />
            <HelplineCard
              name="iCall"
              number="9152987821"
              hours="Mon-Sat, 8AM-10PM"
              description="Counseling helpline by TISS for emotional support"
              delay={3}
            />
            <HelplineCard
              name="Sneha Foundation"
              number="044-24640050"
              hours="24x7"
              description="Crisis intervention and suicide prevention helpline"
              delay={4}
            />
            <HelplineCard
              name="MPower 1on1"
              number="1800-120-820050"
              hours="Mon-Fri, 10AM-7PM"
              description="Mental health support and counseling services"
              delay={5}
            />
            <HelplineCard
              name="Sumaitri"
              number="011-23389090"
              hours="2PM-10PM"
              description="Delhi-based emotional support and befriending helpline"
              delay={6}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="animate-fade-in">
            <h3 className="text-2xl font-semibold mb-4 gradient-text">Remember</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Seeking help is a sign of strength, not weakness. Your mental health is just as important as your physical health.
            </p>
            <div className="flex justify-center gap-2">
              <FloatingElement delay={0}>
                <Heart className="h-6 w-6 text-primary" />
              </FloatingElement>
              <FloatingElement delay={1}>
                <Star className="h-6 w-6 text-ocean" />
              </FloatingElement>
              <FloatingElement delay={2}>
                <Smile className="h-6 w-6 text-sage" />
              </FloatingElement>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;