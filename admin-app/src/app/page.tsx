// src/app/page.tsx - CORRECTED

import { AdminDashboard } from '@/components/admin-dashboard';

export default function HomePage() {
  return (
    // REMOVED: bg-gray-50 and dark:bg-gray-900
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <AdminDashboard />
    </main>
  );
}