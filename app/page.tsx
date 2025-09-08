import { ChatInterface } from "@/components/chat-interface"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <HeroSection />
        <div className="mt-12">
          <ChatInterface />
        </div>
      </main>
    </div>
  )
}
