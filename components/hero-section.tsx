import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Shield, Clock, Users } from "lucide-react"

export function HeroSection() {
  return (
    <section className="text-center py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">Your Mental Health Matters</h1>
        <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
          A safe, confidential space for college students to access mental health support, connect with counselors, and
          find resources tailored to your needs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <MessageCircle className="mr-2 h-5 w-5" />
            Start Chat Support
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 bg-transparent"
          >
            Browse Resources
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">100% Confidential</h3>
            <p className="text-muted-foreground text-sm">
              Your privacy is our priority. All conversations are secure and anonymous.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">24/7 Available</h3>
            <p className="text-muted-foreground text-sm">Get support whenever you need it, day or night.</p>
          </Card>

          <Card className="p-6 text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Peer Community</h3>
            <p className="text-muted-foreground text-sm">
              Connect with other students who understand your experiences.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
