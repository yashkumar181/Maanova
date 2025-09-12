import { AdminDashboard } from '@/components/admin-dashboard';

export default function HomePage() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
      <AdminDashboard />
    </main>
  );
}