import { CounselorGrid } from "@/components/counselor-grid"
import { Navigation } from "@/components/navigation"
export const dynamic = 'force-dynamic';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Book a Counselor</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with qualified mental health professionals who understand the unique challenges of college life.
              All appointments are confidential and secure.
            </p>
          </div>
          <CounselorGrid />
        </div>
      </main>
    </div>
  )
}
