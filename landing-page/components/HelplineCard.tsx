import { Card, CardContent } from "@/components/ui/card";
import { Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HelplineCardProps {
  name: string;
  number: string;
  hours: string;
  description: string;
  delay?: number;
}

export function HelplineCard({
  name,
  number,
  hours,
  description,
  delay = 0,
}: HelplineCardProps) {
  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${delay * 0.2}s` }}
    >
      <Card className="hover-lift transition-transform duration-300 ease-in-out">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{number}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{hours}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(`tel:${number}`, "_self")}
            >
              Call Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
