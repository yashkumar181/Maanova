import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Clock } from "lucide-react";

interface HelplineCardProps {
  name: string;
  number: string;
  hours: string;
  description: string;
  delay?: number;
}

export function HelplineCard({ name, number, hours, description, delay = 0 }: HelplineCardProps) {
  return (
    <Card 
      className="hover-lift"
      style={{ animationDelay: `${delay * 0.2}s` }}
    >
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
            onClick={() => window.open(`tel:${number}`, '_self')}
          >
            Call Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}