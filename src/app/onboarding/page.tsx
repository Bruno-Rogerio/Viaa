// src/app/onboarding/page.tsx - VERSÃO CORRIGIDA COM SUSPENSE

import { Suspense } from "react";
import OnboardingContainer from "@/components/sections/onboarding/OnboardingContainer";

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando onboarding...</p>
          </div>
        </div>
      }
    >
      <OnboardingContainer />
    </Suspense>
  );
}
