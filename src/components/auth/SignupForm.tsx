// src/components/auth/SignupForm.tsx
// 🔧 VERSÃO CORRIGIDA - URL dinâmica e melhor tratamento de erros

"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
      borderColor: "border-rose-500",
      bgColor: "bg-rose-50",
    },
    {
      value: "profissional" as const,
      label: "Sou Profissional",
      description: "Conecte-se com pacientes",
      icon: "🩺",
      borderColor: "border-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      value: "clinica" as const,
      label: "Sou Clínica",
      description: "Gerencie sua equipe",
      icon: "🏥",
      borderColor: "border-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      value: "empresa" as const,
      label: "Sou Empresa",
      description: "Cuide dos seus colaboradores",
      icon: "🏢",
      borderColor: "border-sky-500",
      bgColor: "bg-sky-50",
    },
  ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validações básicas
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
      // 🔧 DETECTAR URL ATUAL DINAMICAMENTE
      const currentOrigin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      const redirectUrl = `${currentOrigin}/auth/callback`;

      console.log("🔗 URL de redirecionamento:", redirectUrl);

      // 🔧 SALVAR TIPO TEMPORARIAMENTE NO LOCALSTORAGE
      if (typeof window !== "undefined") {
        localStorage.setItem("signup_user_type", tipoUsuario);
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            tipo_usuario: tipoUsuario,
          },
          // 🎯 URL DINÂMICA
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) {
        console.error("❌ Erro no signup:", authError);

        if (authError.message?.includes("User already registered")) {
          setError("Este email já está cadastrado. Tente fazer login.");
        } else if (authError.message?.includes("Signup is disabled")) {
          setError(
            "Cadastro temporariamente desabilitado. Tente novamente mais tarde."
          );
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      console.log("✅ Usuário criado:", authData.user?.id);
      console.log("📧 Email de confirmação enviado para:", email);

      setSuccess(
        "🎉 Conta criada com sucesso! Verifique seu email e clique no link de confirmação para continuar."
      );

      // Limpar formulário
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setTipoUsuario(null);

      onSuccess?.();
    } catch (error: any) {
      console.error("❌ Erro inesperado no signup:", error);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Criar Conta</h2>
          <p className="text-gray-600">Junte-se à comunidade VIAA</p>
        </div>

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
                      ? `${type.borderColor} ${type.bgColor} ring-2 ring-offset-2 ring-current`
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {/* Confirmar Senha */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Repita sua senha"
            />
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Sucesso */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              {success}
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
                Criando conta...
              </div>
            ) : (
              "Criar Conta"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{" "}
            <button
              onClick={() => router.push("/auth")}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
