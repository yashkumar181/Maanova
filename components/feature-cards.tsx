import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Users, CalendarCheck, LineChart } from "lucide-react";

export function FeatureCards() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 md:mt-20">
      
      {/* --- UPDATED STYLES FOR A MORE COMPACT LOOK --- */}
      
      <Card className="bg-card border text-center flex flex-col
                      transition-all duration-300 ease-in-out hover:scale-105 hover:border-primary/50 rounded-xl aspect-square">
        <CardContent className="flex flex-col items-center justify-center p-6 flex-grow">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-4">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-semibold text-card-foreground">
            100% Confidential
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-2">
            Your privacy is our priority. All conversations are secure and anonymous.
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-card border text-center flex flex-col
                      transition-all duration-300 ease-in-out hover:scale-105 hover:border-primary/50 rounded-xl aspect-square">
        <CardContent className="flex flex-col items-center justify-center p-6 flex-grow">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-4">
            <CalendarCheck className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-semibold text-card-foreground">
            Counselor Booking
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-2">
            Schedule a private session with a professional counselor at your convenience.
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-card border text-center flex flex-col
                      transition-all duration-300 ease-in-out hover:scale-105 hover:border-primary/50 rounded-xl aspect-square">
        <CardContent className="flex flex-col items-center justify-center p-6 flex-grow">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-4">
            <LineChart className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-semibold text-card-foreground">
            Track Your Progress
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-2">
            Use assessments like GAD-7 & PHQ-9 to monitor your well-being and visualize progress over time.
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-card border text-center flex flex-col
                      transition-all duration-300 ease-in-out hover:scale-105 hover:border-primary/50 rounded-xl aspect-square">
        <CardContent className="flex flex-col items-center justify-center p-6 flex-grow">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-4">
            <Users className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-semibold text-card-foreground">
            Peer Community
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-2">
            Connect with other students who understand your experiences.
          </CardDescription>
        </CardContent>
      </Card>
    </section>
  );
}