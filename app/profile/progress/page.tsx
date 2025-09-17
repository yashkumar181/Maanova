// In app/profile/progress/page.tsx

import { StudentProgressDashboard } from "@/components/StudentProgressDashboard";

export default function StudentProgressPage() {
  return (
    // We wrap everything in a container div to control the width and padding
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Progress Dashboard</h1>
        <p className="text-muted-foreground">
          Track your well-being journey over time.
        </p>
      </div>
      <StudentProgressDashboard />
    </div>
  );
}