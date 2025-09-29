// src/app/dashboard/paciente/profissionais/page.tsx
"use client";

import { Suspense } from "react";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import BuscarProfissionaisContent from "@/components/dashboard/patient/profissionais/BuscarProfissionaisContent";

export default function BuscarProfissionaisPage() {
  return (
    <PatientLayout>
      <Suspense fallback={<LoadingBusca />}>
        <BuscarProfissionaisContent />
      </Suspense>
    </PatientLayout>
  );
}

// Loading placeholder
function LoadingBusca() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="h-8 w-64 bg-white/20 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-96 bg-white/20 rounded animate-pulse"></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
