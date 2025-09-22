// viaa\src\app\dashboard\page.tsx
import ProfessionalFeedContainer from "@/components/dashboard/professional/feed/ProfessionalFeedContainer";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bom dia! 👋</h1>
        <p className="text-gray-600">
          Acompanhe as novidades da sua rede profissional e compartilhe
          conhecimento.
        </p>
      </div>

      <ProfessionalFeedContainer />
    </div>
  );
}
