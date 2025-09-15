// src/components/auth/SignupForm.tsx
// 🚀 VERSÃO PRODUÇÃO - ZERO LOCALHOST

"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SignupFormProps {
  onSuccess?: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<
    "paciente" | "profissional" | "clinica" | "empresa" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const userTypes = [
    {
      value: "paciente" as const,
      label: "Sou Paciente",
      description: "Encontre seu terapeuta ideal",
      icon: "💚",
      gradient: "from-rose-500 to-pink-500",
      borderColor: "border-rose-500",
      bgColor: "bg-rose-50",
    },
    {
      value: "profissional" as const,
      label: "Sou Profissional",
      description: "Conecte-se com pacientes",
      icon: "🩺",
      gradient: "from-emerald-500 to-green-500",
      borderColor: "border-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      value: "clinica" as const,
      label: "Sou Clínica",
      description: "Gerencie sua equipe",
      icon: "🏥",
      gradient: "from-purple-500 to-indigo-500",
      borderColor: "border-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      value: "empresa" as const,
      label: "Sou Empresa",
      description: "Cuide dos seus colaboradores",
      icon: "🏢",
      gradient: "from-sky-500 to-blue-500",
      borderColor: "border-sky-500",
      bgColor: "bg-sky-50",
    },
  ];

  // 🎯 FUNÇÃO QUE **NUNCA** USA LOCALHOST
  const getProductionUrl = (): string => {
    // ❌ REMOVIDO: window.location.origin (pode ser localhost)
    // ❌ REMOVIDO: Qualquer referência a localhost

    // ✅ APENAS: URL de produção obrigatória
    const productionUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!productionUrl) {
      console.error("❌ NEXT_PUBLIC_SITE_URL não configurada!");
      // 🔴 Fallback hardcoded para sua URL do Vercel (SUBSTITUA AQUI)
      return "https://viaa-git-main-brunos-projects-6a73c557.vercel.app"; // 👈 SUBSTITUA pela sua URL
    }

    // Garantir que não seja localhost
    if (
      productionUrl.includes("localhost") ||
      productionUrl.includes("127.0.0.1")
    ) {
      console.error("❌ URL de produção não pode ser localhost!");
      return "https://viaa-git-main-brunos-projects-6a73c557.vercel.app"; // 👈 SUBSTITUA pela sua URL
    }

    return productionUrl;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validações
    if (!tipoUsuario) {
      setError("Por favor, selecione o tipo de usuário.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      // 🚀 URL DE PRODUÇÃO GARANTIDA (ZERO LOCALHOST)
      const baseUrl = getProductionUrl();
      const redirectUrl = `${baseUrl}/auth/confirm?type=${tipoUsuario}`;

      console.log("=== PRODUÇÃO APENAS ===");
      console.log("🚀 Base URL:", baseUrl);
      console.log("🚀 Redirect URL:", redirectUrl);
      console.log("🚀 Tipo usuário:", tipoUsuario);
      console.log("======================");

      // 1. Cadastrar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            tipo_usuario: tipoUsuario,
          },
          // 🎯 GARANTIDO: Sempre URL de produção
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) throw authError;

      console.log("=== SIGNUP REALIZADO ===");
      console.log("✅ User criado:", authData.user?.id);
      console.log("✅ Email redirect:", redirectUrl);
      console.log(
        "✅ Tipo no metadata:",
        authData.user?.user_metadata?.tipo_usuario
      );
      console.log("========================");

      setSuccess(
        "🎉 Conta criada com sucesso! Verifique seu email e clique no link de confirmação para ativar sua conta."
      );
      onSuccess?.();

      // Armazenar informações para debug
      localStorage.setItem("signup_user_type", tipoUsuario);
      localStorage.setItem("signup_email", email);
      localStorage.setItem("production_url_used", redirectUrl);
    } catch (error: any) {
      console.error("❌ Erro no signup:", error);
      setError(error.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <form onSubmit={handleSignup} className="space-y-6">
          {/* Seleção do tipo de usuário */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              Como você quer se cadastrar?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {userTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setTipoUsuario(type.value)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    tipoUsuario === type.value
                      ? `${type.borderColor} ${type.bgColor} shadow-lg`
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <h3 className="font-semibold text-sm text-gray-800">
                      {type.label}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {type.description}
                    </p>
                  </div>
                  {tipoUsuario === type.value && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="seu@email.com"
            />
          </div>

          {/* Senha */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {/* Confirmar Senha */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Repita sua senha"
            />
          </div>

          {/* Debug Info (temporário) */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs">
            <p className="font-medium text-blue-800">🚀 Modo Produção Ativo</p>
            <p className="text-blue-600">URL base: {getProductionUrl()}</p>
          </div>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

          {/* Botão de cadastro */}
          <button
            type="submit"
            disabled={loading || !tipoUsuario}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Criando conta...
              </div>
            ) : (
              "Criar Conta"
            )}
          </button>
        </form>

        {/* Link para login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link
              href="/auth"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
