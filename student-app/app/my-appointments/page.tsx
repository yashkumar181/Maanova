import { AuthGuard } from "@/components/AuthGuard";
import { MyAppointments } from '@/components/MyAppointments'; // We will create this component next

export default function MyAppointmentsPage() {
  return (
    <AuthGuard
      title="My Appointments"
      message="You need to be logged in to view your appointments."
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
        <MyAppointments />
      </div>
    </AuthGuard>
  );
}