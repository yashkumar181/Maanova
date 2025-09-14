import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ResourceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: "mint" | "ocean" | "sage" | "primary";
  delay?: number;
}

export function ResourceCard({
  title,
  description,
  icon: Icon,
  color,
  delay = 0,
}: ResourceCardProps) {
  const colorClasses = {
    mint: "bg-mint border-mint-foreground/20 hover:bg-mint/80 hover:shadow-mint-foreground/20",
    ocean: "bg-ocean border-ocean-foreground/20 hover:bg-ocean/80 hover:shadow-ocean-foreground/20",
    sage: "bg-sage border-sage-foreground/20 hover:bg-sage/80 hover:shadow-sage-foreground/20",
    primary: "bg-primary/10 border-primary/30 hover:bg-primary/20 hover:shadow-primary/20",
  };

  const iconColorClasses = {
    mint: "text-mint-foreground",
    ocean: "text-ocean-foreground",
    sage: "text-sage-foreground",
    primary: "text-primary",
  };

  return (
    <Card
      className={cn(
        "group h-full cursor-pointer transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-lg animate-slide-up",
        colorClasses[color]
      )}
      style={{ animationDelay: `${delay * 0.1}s` }}
      aria-label={`Resource card: ${title}`}
    >
      <CardContent className="p-6 text-center">
        <div
          className={cn(
            "inline-flex p-3 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1",
            iconColorClasses[color]
          )}
        >
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
