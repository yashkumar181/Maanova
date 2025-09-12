import { PeerSupportForum } from "@/components/peer-support-forum"
import { Navigation } from "@/components/navigation"
export const dynamic = 'force-dynamic';

export default function ForumPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Peer Support Community</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect with fellow students in a safe, moderated environment. Share experiences, offer support, and find
              community with others who understand your journey.
            </p>
          </div>
          <PeerSupportForum />
        </div>
      </main>
    </div>
  )
}
