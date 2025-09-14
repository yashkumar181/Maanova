import { useState } from "react";
import { ResourceCard } from "@/components/ResourceCard";
import { Meditation, Users, BookOpen, LifeBuoy, Video, Heart } from "lucide-react";

export default function FeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    {
      title: "Mindfulness & Meditation",
      description: "Guided meditation sessions and mindfulness exercises to help you find inner peace and reduce stress.",
      icon: Meditation,
      color: "mint",
    },
    {
      title: "Peer Support Groups",
      description: "Connect with fellow students who understand your struggles in a safe, non-judgmental environment.",
      icon: Users,
      color: "ocean",
    },
    {
      title: "Study-Life Balance",
      description: "Learn practical strategies to manage academic pressure while maintaining your mental health.",
      icon: BookOpen,
      color: "sage",
    },
    {
      title: "Crisis Support",
      description: "24/7 emotional support and crisis intervention when you need immediate help and guidance.",
      icon: LifeBuoy,
      color: "primary",
    },
    {
      title: "Online Counseling",
      description: "Professional therapy sessions with licensed counselors, available through secure video calls.",
      icon: Video,
      color: "mint",
    },
    {
      title: "Wellness Workshops",
      description: "Interactive workshops on stress management, anxiety coping skills, and building resilience.",
      icon: Heart,
      color: "ocean",
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <ResourceCard
          key={feature.title}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
          color={feature.color}
          delay={index}
          onClick={() => {
            console.log("Clicked:", feature.title);
            setSelectedFeature(feature);
          }}
        />
      ))}


      {/* Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative">
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-primary"
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="flex flex-col items-center text-center">
              <selectedFeature.icon className="h-10 w-10 mb-4 text-primary" />
              <h2 className="text-xl font-bold mb-2">{selectedFeature.title}</h2>
              <p className="text-muted-foreground">{selectedFeature.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
