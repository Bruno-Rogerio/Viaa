// viaa\src\components\auth\LoginForm.tsx

"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) {
        throw authError; // Lançar erros de autenticação
      }

      if (data.user) {
        const tipoUsuario = data.user.user_metadata?.tipo_usuario;
        console.log("=== LOGIN - VERIFICAÇÃO ONBOARDING ===");
        console.log("Tipo usuário:", tipoUsuario);

        if (!tipoUsuario) {
          console.log("Redirecionando para onboarding - sem tipo");
          onSuccess?.();
          router.push("/onboarding");
          return;
        }

        let temPerfil = false;
        let perfilCheckError: any = null; // Para armazenar erros da verificação de perfil

        try {
          switch (tipoUsuario) {
            case "paciente":
              const { data: perfilPaciente, error: pacienteError } =
                await supabase
                  .from("perfis_pacientes")
                  .select("id")
                  .eq("id", data.user.id)
                  .single();
              perfilCheckError = pacienteError;
              temPerfil = !!perfilPaciente;
              break;
            case "profissional":
              const { data: perfilProfissional, error: profissionalError } =
                await supabase
                  .from("perfis_profissionais")
                  .select("id")
                  .eq("id", data.user.id)
                  .single();
              perfilCheckError = profissionalError;
              temPerfil = !!perfilProfissional;
              break;
            case "clinica":
              const { data: perfilClinica, error: clinicaError } =
                await supabase
                  .from("perfis_clinicas")
                  .select("id")
                  .eq("id", data.user.id)
                  .single();
              perfilCheckError = clinicaError;
              temPerfil = !!perfilClinica;
              break;
            case "empresa":
              const { data: perfilEmpresa, error: empresaError } =
                await supabase
                  .from("perfis_empresas")
                  .select("id")
                  .eq("id", data.user.id)
                  .single();
              perfilCheckError = empresaError;
              temPerfil = !!perfilEmpresa;
              break;
          }
        } catch (e: any) {
          // Este catch pegará erros lançados por .single() (como o 406)
          perfilCheckError = e;
          console.error("Erro inesperado durante a verificação do perfil:", e);
          temPerfil = false; // Se houve um erro, consideramos que o perfil não está completo
        }

        // Se houver um erro na verificação do perfil (ex: 406 ou PGRST116), registre-o
        if (perfilCheckError) {
          console.error(
            "Detalhes do erro na verificação de perfil:",
            perfilCheckError
          );
          // Se o erro for 'PGRST116' (no rows found), temPerfil já será false, o que é o esperado.
          // Se for um 406, também significa que o perfil não foi encontrado ou acessível.
        }

        console.log("Tem perfil completo:", temPerfil);
        if (!temPerfil) {
          console.log("Redirecionando para onboarding - sem perfil");
          onSuccess?.();
          router.push("/onboarding");
          return;
        }

        console.log("Redirecionando para dashboard - tudo completo");
        onSuccess?.();
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Erro no login ou verificação de perfil:", error);
      setError(error.message || "Erro ao fazer login ou verificar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
