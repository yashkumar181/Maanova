import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InspirationalBanner } from "@/components/InspirationalBanner";
import { ResourceCard } from "@/components/ResourceCard";
import { HelplineCard } from "@/components/HelplineCard";
import { FloatingElement } from "@/components/FloatingElement";
import {  
  Heart, 
  Users, 
  BookOpen, 
  UserCheck,
  Bot,
  BarChart3,
  TrendingUp,
  Smile,
  MessageCircle,
  ShieldCheck,
  TreePine,
  Star
} from "lucide-react";
import groupSupportImage from "@/assets/landing_image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      
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
      <section className="relative py-32 px-4" style={{ paddingTop: '155px',paddingBottom: '150px'}}>
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

            {/* Mobile Login Buttons */}
            <div className="md:hidden flex flex-col gap-3 mb-12 animate-slide-up">
              <a href="https://maanova-939a.vercel.app/" className="block">
              <Button 
                size="sm"
                className="w-full max-w-xs mx-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Student Access
              </Button>
              </a>
              <a href="https://maanova-admindashboard.vercel.app/" className="block">
              <Button 
                size="sm"
                className="w-full max-w-xs mx-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Admin Access
              </Button>
              </a>
            </div>

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
              title="Peer Forum"
              description="Connect with fellow students in discussion forums, share experiences, and get peer support."
              detailedContent="Join our vibrant community platform:

• Topic-based discussion threads
• Anonymous posting options
• Peer-to-peer support groups
• Study groups and academic help
• Mental health check-ins
• Success story sharing
• Event coordination
• Moderated safe spaces

Our peer forum creates connections between students facing similar challenges, fostering a supportive community where you can both give and receive help."
              icon={Users}
              color="primary"
              delay={1}
            />
            <ResourceCard
              title="Counsellor Mapping"
              description="Find and connect with qualified mental health professionals matched to your specific needs."
              detailedContent="Smart counselor matching system:

• Personalized counselor recommendations
• Filter by specialization and approach
• Location-based and online options
• Language preference matching
• Insurance compatibility check
• Student-friendly pricing
• Availability calendar integration
• Secure booking system

Our intelligent matching system connects you with the right mental health professional based on your unique needs, preferences, and circumstances."
              icon={UserCheck}
              color="mint"
              delay={2}
            />
            <ResourceCard
              title="AI Chatbot"
              description="24/7 AI-powered mental health support for immediate guidance and coping strategies."
              detailedContent="Intelligent mental health assistance:

 24/7 availability for immediate support
• Crisis intervention and safety planning
• Coping strategy recommendations
• Mood tracking and insights
• Personalized wellness tips
• Resource recommendations
• Emergency contact integration
• Privacy-protected conversations

Our AI chatbot provides immediate support when you need it most, offering evidence-based coping strategies and knowing when to connect you with human professionals."
              icon={Bot}
              color="ocean"
              delay={3}
            />
            <ResourceCard
              title="Resources"
              description="Comprehensive library of mental health resources, guides, and self-help materials."
              detailedContent="Extensive resource collection:

• Self-help guides and workbooks
• Video tutorials and webinars
• Meditation and mindfulness content
• Academic stress management
• Crisis intervention resources
• Family support materials
• Campus-specific information
• Downloadable worksheets

Access a curated library of evidence-based mental health resources designed specifically for college students and their unique challenges."
              icon={BookOpen}
              color="sage"
              delay={4}
            />
            <ResourceCard
              title="Admin Live Data"
              description="Real-time dashboard for administrators to monitor platform usage and student wellbeing trends."
              detailedContent="Administrative analytics dashboard:

• Real-time platform usage statistics
• Student engagement metrics
• Crisis alert monitoring
• Resource utilization tracking
• Geographic usage patterns
• Peak usage time analysis
• Intervention success rates
• Privacy-compliant reporting

Provides administrators with insights to improve services while maintaining strict privacy and anonymity standards."
              icon={BarChart3}
              color="primary"
              delay={5}
            />
            <ResourceCard
              title="Personal Analytics"
              description="Track your mental health journey with personalized insights and progress monitoring."
              detailedContent="Personal wellness tracking:

• Mood tracking and patterns
• Progress visualization charts
• Goal setting and achievement
• Session attendance tracking
• Wellness milestone celebrations
• Personalized insights and trends
• Export data for healthcare providers
• Privacy-first data handling

Monitor your mental health journey with meaningful analytics that help you understand patterns and celebrate progress toward your wellness goals."
              icon={TrendingUp}
              color="mint"
              delay={6}
            />
          </div>
        </div>
      </section>

      {/* College Registration Section */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-in">
            <p className="text-lg text-muted-foreground mb-6">
              Haven't registered yet? Register your college
            </p>
            <a href="https://maanova-939a.vercel.app/">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full hover-lift min-w-[200px]"
            >
              Register College
            </Button>
            </a>
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
