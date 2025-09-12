import { AdminDashboard } from "@/components/admin-dashboard"
import { Navigation } from "@/components/navigation"
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Monitor platform usage, track mental health trends, and gain insights to improve student support services.
              All data is anonymized and aggregated to protect student privacy.
            </p>
          </div>
          <AdminDashboard />
        </div>
      </main>
    </div>
  )
}
