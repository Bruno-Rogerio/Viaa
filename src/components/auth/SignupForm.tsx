// viaa\src\components\auth\SignupForm.tsx

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
      // 1. Cadastrar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            tipo_usuario: tipoUsuario, // Armazena o tipo de usuário nos metadados do Auth
          },
          // ESSENCIAL: URL para onde o usuário será redirecionado após clicar no link de confirmação do email.
          // A página /auth/confirm usará o 'type' para saber qual perfil criar.
          emailRedirectTo: `${window.location.origin}/auth/confirm?type=${tipoUsuario}`,
        },
      });

      if (authError) throw authError;

      console.log("=== DEBUG CADASTRO ===");
      console.log("Tipo selecionado:", tipoUsuario);
      console.log("Data retornada:", authData);
      console.log("User metadata:", authData.user?.user_metadata);
      console.log("====================");

      // Após o cadastro, o usuário SEMPRE precisa verificar o e-mail.
      // Não há redirecionamento imediato para onboarding a partir deste formulário.
      setSuccess(
        "🎉 Conta criada com sucesso! Verifique seu email e clique no link de confirmação para ativar sua conta."
      );
      onSuccess?.(); // Chama o callback se fornecido, útil para fechar modais, etc.

      // Armazenar o tipo de usuário e email em localStorage pode ser útil para a página /auth/confirm
      // caso ela precise dessas informações logo de cara (embora a URL já passe o tipo).
      localStorage.setItem("signup_user_type", tipoUsuario || "");
      localStorage.setItem("signup_email", email);
    } catch (error: any) {
      console.error("Erro no signup:", error);
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
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2 group-hover:animate-bounce">
                      {type.icon}
                    </div>
                    <div className="font-semibold text-sm text-gray-800 mb-1">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-600">
                      {type.description}
                    </div>
                  </div>
                  {tipoUsuario === type.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Campos de Email e Senha */}
          <div className="space-y-4">
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
                placeholder="Mínimo 6 caracteres"
              />
            </div>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="Digite a senha novamente"
              />
            </div>
          </div>

          {/* Mensagens de erro e sucesso */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              {success}
            </div>
          )}

          {/* Botão de submit */}
          <button
            type="submit"
            disabled={loading || !tipoUsuario}
            className="w-full bg-gradient-to-r from-rose-500 via-sky-500 to-emerald-500 hover:from-rose-600 hover:via-sky-600 hover:to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
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
              className="font-semibold text-transparent bg-gradient-to-r from-rose-500 to-sky-500 bg-clip-text hover:from-rose-600 hover:to-sky-600 transition-all duration-300"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
