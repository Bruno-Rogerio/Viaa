// viaa\src\app\dashboard\layout.tsx
import { ProfessionalLayout } from "@/components/dashboard/professional/layout/ProfessionalLayout";
import { AuthProvider } from "@/contexts/AuthContext";

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProfessionalLayout>{children}</ProfessionalLayout>
    </AuthProvider>
  );
}
