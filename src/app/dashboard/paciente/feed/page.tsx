// src/app/dashboard/paciente/feed/page.tsx
// ✅ PÁGINA DE FEED PARA PACIENTES - Simplificada

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
