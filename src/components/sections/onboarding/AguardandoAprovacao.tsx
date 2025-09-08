// viaa\src\components\sections\onboarding\AguardandoAprovacao.tsx

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";

export default function AguardandoAprovacao() {
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email || "");
        } else {
          router.push("/auth");
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    getUserInfo();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full text-center">
        {/* Ícone de relógio */}
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="text-4xl animate-pulse">⏳</div>
        </div>

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Cadastro em Análise
        </h1>

        {/* Subtítulo */}
        <p className="text-lg text-gray-600 mb-8">
          Recebemos seu cadastro e documentos! Nossa equipe está analisando suas
          informações.
        </p>

        {/* Cards informativos */}
        <div className="grid gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📄</div>
              <div className="text-left">
                <h3 className="font-semibold text-blue-800">
                  Documentos Recebidos
                </h3>
                <p className="text-sm text-blue-600">
                  Seus diplomas e certificados foram enviados com sucesso.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔍</div>
              <div className="text-left">
                <h3 className="font-semibold text-amber-800">
                  Análise em Andamento
                </h3>
                <p className="text-sm text-amber-600">
                  Nossa equipe está verificando suas credenciais profissionais.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📧</div>
              <div className="text-left">
                <h3 className="font-semibold text-green-800">
                  Notificação por Email
                </h3>
                <p className="text-sm text-green-600">
                  Você receberá um email em <strong>{userEmail}</strong> quando
                  a análise for concluída.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline de processo */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">
            Processo de Aprovação
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="text-white text-xs">✓</div>
              </div>
              <span className="text-sm text-gray-600">Cadastro enviado</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="text-white text-xs">•</div>
              </div>
              <span className="text-sm text-gray-600">
                Verificação de documentos
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <div className="text-white text-xs">•</div>
              </div>
              <span className="text-sm text-gray-400">Aprovação final</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <div className="text-white text-xs">•</div>
              </div>
              <span className="text-sm text-gray-400">Acesso liberado</span>
            </div>
          </div>
        </div>

        {/* Informações importantes */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-800 mb-3">
            📋 Informações Importantes
          </h3>
          <div className="text-sm text-blue-700 text-left space-y-2">
            <p>
              • Tempo médio de análise: <strong>2 a 5 dias úteis</strong>
            </p>
            <p>
              • Verificamos a autenticidade dos documentos e registros
              profissionais
            </p>
            <p>• Se houver pendências, entraremos em contato por email</p>
            <p>• Você pode acompanhar o status fazendo login novamente</p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Verificar Status
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Fazer Logout
          </button>
        </div>

        {/* Suporte */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Dúvidas sobre seu cadastro?
          </p>
          <a
            href="mailto:suporte@viaa.com.br"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            Entre em contato: suporte@viaa.com.br
          </a>
        </div>
      </div>
    </div>
  );
}
