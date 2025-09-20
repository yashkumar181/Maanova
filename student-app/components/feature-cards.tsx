import { ShieldCheck, Clock, Users } from "lucide-react";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    // 👇 FIX: Removed 'aspect-square' and 'justify-center' to make the card more compact 👇
    <div className="flex flex-col items-center p-6 border rounded-xl bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-card-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export function FeatureCards() {
  const features = [
    {
      icon: <ShieldCheck className="h-7 w-7 text-primary" />,
      title: "100% Confidential",
      description: "Your privacy is our priority. All conversations are secure and anonymous.",
    },
    {
      icon: <Clock className="h-7 w-7 text-primary" />,
      title: "24/7 Available",
      description: "Get support whenever you need it, day or night, through our AI chat and resources.",
    },
    {
      icon: <Users className="h-7 w-7 text-primary" />,
      title: "Peer Community",
      description: "Connect with other students who understand your experiences in a safe, moderated forum.",
    },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}