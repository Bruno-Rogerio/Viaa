// src/app/dashboard/paciente/feed/page.tsx
// 🎯 Página de Feed Personalizado do Paciente - "Biblioteca Viva"

"use client";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import PatientFeedContainer from "@/components/dashboard/patient/feed/PatientFeedContainer";

export default function FeedPage() {
  return (
    <PatientLayout>
      <PatientFeedContainer />
    </PatientLayout>
  );
}
