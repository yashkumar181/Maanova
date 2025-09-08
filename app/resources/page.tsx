import { ResourceHub } from "@/components/resource-hub"
import { Navigation } from "@/components/navigation"

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Mental Health Resources</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Access a comprehensive library of mental health resources including videos, audio guides, articles, and
              tools designed specifically for college students. All content is evidence-based and culturally inclusive.
            </p>
          </div>
          <ResourceHub />
        </div>
      </main>
    </div>
  )
}
