// src/components/auth/LoginForm.tsx
// 🔧 VERSÃO CORRIGIDA - Melhor validação e redirecionamento

"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
      console.log("🔑 Tentando fazer login...");

      // 1. Fazer login
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        console.error("❌ Erro de autenticação:", authError);

        if (authError.message?.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos.");
        } else if (authError.message?.includes("Email not confirmed")) {
          setError(
            "Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada."
          );
        } else if (authError.message?.includes("Too many requests")) {
          setError(
            "Muitas tentativas de login. Aguarde alguns minutos e tente novamente."
          );
        } else {
          setError(authError.message || "Erro ao fazer login.");
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Dados de login inválidos.");
        setLoading(false);
        return;
      }

      console.log("✅ Login bem-sucedido para:", authData.user.email);

      // 2. Verificar se email foi confirmado
      if (!authData.user.email_confirmed_at) {
        console.warn("⚠️ Email não confirmado");
        setError(
          "Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada."
        );

        // Fazer logout para limpar sessão
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // 3. Detectar tipo de usuário
      const tipoUsuario = authData.user.user_metadata?.tipo_usuario;
      console.log("👤 Tipo de usuário:", tipoUsuario);

      if (!tipoUsuario) {
        console.warn("⚠️ Tipo de usuário não encontrado");
        setError("Perfil incompleto. Entre em contato com o suporte.");
        setLoading(false);
        return;
      }

      // 4. Verificar perfil baseado no tipo
      let tabelaPerfil: string;
      let rotaDestino = "/dashboard";

      switch (tipoUsuario) {
        case "paciente":
          tabelaPerfil = "perfis_pacientes";
          break;
        case "profissional":
          tabelaPerfil = "perfis_profissionais";
          break;
        case "clinica":
          tabelaPerfil = "perfis_clinicas";
          break;
        case "empresa":
          tabelaPerfil = "perfis_empresas";
          break;
        default:
          setError(`Tipo de usuário inválido: ${tipoUsuario}`);
          setLoading(false);
          return;
      }

      console.log("🔍 Verificando perfil na tabela:", tabelaPerfil);

      const { data: perfilData, error: perfilError } = await supabase
        .from(tabelaPerfil)
        .select("id, status_verificacao")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (perfilError && perfilError.code !== "PGRST116") {
        console.error("❌ Erro ao verificar perfil:", perfilError);
        setError("Erro ao verificar perfil. Tente novamente.");
        setLoading(false);
        return;
      }

      // 5. Redirecionamento baseado no perfil
      if (!perfilData) {
        console.log("📝 Perfil não encontrado, redirecionando para onboarding");
        rotaDestino = "/onboarding";
      } else if (tipoUsuario === "profissional") {
        // Verificações específicas para profissionais
        if (perfilData.status_verificacao === "pendente") {
          console.log("⏳ Profissional aguardando aprovação");
          rotaDestino = "/dashboard/professional/waiting";
        } else if (perfilData.status_verificacao === "rejeitado") {
          console.log("❌ Profissional rejeitado");
          setError(
            "Seu perfil foi rejeitado. Entre em contato com o suporte para mais informações."
          );
          setLoading(false);
          return;
        } else if (perfilData.status_verificacao === "aprovado") {
          console.log("✅ Profissional aprovado");
          rotaDestino = "/dashboard";
        } else {
          console.log("❓ Status desconhecido, indo para dashboard padrão");
          rotaDestino = "/dashboard";
        }
      }

      console.log("🎯 Redirecionando para:", rotaDestino);

      // 6. Callback de sucesso e redirecionamento
      onSuccess?.();
      router.push(rotaDestino);
    } catch (error: any) {
      console.error("❌ Erro inesperado no login:", error);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Entrar</h2>
          <p className="text-gray-600">Acesse sua conta VIAA</p>
        </div>

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

          {/* Esqueci a senha */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => {
                // TODO: Implementar reset de senha
                alert(
                  "Funcionalidade de reset de senha será implementada em breve."
                );
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Esqueci minha senha
            </button>
          </div>

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

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Não tem uma conta?{" "}
            <button
              onClick={() => router.push("/auth/signup")}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
