// In app/profile/progress/page.tsx

import { StudentProgressDashboard } from "@/components/StudentProgressDashboard";

export default function StudentProgressPage() {
  return (
    <main className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Progress Dashboard</h1>
        <p className="text-muted-foreground">
          Track your well-being journey over time.
        </p>
      </div>
      <StudentProgressDashboard />
    </main>
  );
}