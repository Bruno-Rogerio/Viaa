// src/components/auth/LoginForm.tsx - VERSÃO CORRIGIDA

"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoginFormProps {
  onSuccess?: () => void;
}

interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
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
        throw authError;
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
        let perfilCheckError: DatabaseError | null = null;

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
            default:
              console.log("Tipo usuário desconhecido:", tipoUsuario);
          }

          console.log("Tem perfil:", temPerfil);
          console.log("Erro ao verificar perfil:", perfilCheckError);

          if (temPerfil) {
            console.log("Perfil encontrado - redirecionando para dashboard");
            onSuccess?.();
            router.push(`/dashboard`);
          } else {
            console.log(
              "Perfil não encontrado - redirecionando para onboarding"
            );
            onSuccess?.();
            router.push("/onboarding");
          }
        } catch (profileError) {
          console.error("Erro ao verificar perfil:", profileError);
          const errorMessage =
            profileError instanceof Error
              ? profileError.message
              : "Erro ao verificar perfil do usuário.";
          setError(errorMessage);
        }
      }
    } catch (authError) {
      console.error("Erro de autenticação:", authError);
      const errorMessage =
        authError instanceof Error ? authError.message : "Erro ao fazer login.";

      if (errorMessage.includes("Invalid login credentials")) {
        setError("Email ou senha incorretos.");
      } else if (errorMessage.includes("Email not confirmed")) {
        setError(
          "Por favor, verifique seu email e clique no link de confirmação antes de fazer login."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              placeholder="seu@email.com"
            />
          </div>

          {/* Senha */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              placeholder="Sua senha"
            />
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Entrando...
              </div>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Link para cadastro */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link
              href="/cadastro"
              className="font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
