// viaa\src\app\signup\page.tsx

import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-sky-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Criar sua conta</h2>
          <p className="mt-2 text-gray-600">
            Escolha seu perfil e comece sua jornada
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}
