// src/app/dashboard/perfil/page.tsx
// 🔧 PÁGINA DE PERFIL - Com layout correto baseado no tipo de usuário

"use client";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalLayout } from "@/components/dashboard/professional/layout";
import { PatientLayout } from "@/components/dashboard/patient/layout";

export default function PerfilPage() {
  const { user, profile, loading } = useAuth();

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Não autenticado
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você precisa estar logado para ver seu perfil.
          </p>
        </div>
      </div>
    );
  }

  // Conteúdo do perfil
  const perfilContent = (
    <div className="space-y-6">
      {/* Header do Perfil */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile.dados && "nome" in profile.dados && profile.dados.nome
              ? profile.dados.nome.charAt(0).toUpperCase()
              : "U"}
          </div>

          {/* Informações Básicas */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profile.dados &&
              "nome" in profile.dados &&
              "sobrenome" in profile.dados &&
              profile.dados.nome &&
              profile.dados.sobrenome
                ? `${profile.dados.nome} ${profile.dados.sobrenome}`
                : "Usuário"}
            </h1>

            <p className="text-lg text-gray-600 mb-4">
              {profile.tipo === "profissional" &&
              profile.dados &&
              "especialidades" in profile.dados &&
              profile.dados.especialidades
                ? profile.dados.especialidades
                : profile.tipo === "paciente"
                ? "Paciente"
                : profile.tipo
                ? profile.tipo.charAt(0).toUpperCase() + profile.tipo.slice(1)
                : "Usuário"}
            </p>

            {/* Status */}
            <div className="flex items-center space-x-4">
              <span
                className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${
                  profile.verificado
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              `}
              >
                {profile.verificado ? "✓ Verificado" : "⏳ Pendente"}
              </span>

              {profile.tipo === "profissional" &&
                profile.dados &&
                "status_verificacao" in profile.dados && (
                  <span
                    className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${
                    profile.dados.status_verificacao === "aprovado"
                      ? "bg-emerald-100 text-emerald-800"
                      : profile.dados.status_verificacao === "pendente"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }
                `}
                  >
                    {profile.dados.status_verificacao === "aprovado" &&
                      "✓ Aprovado"}
                    {profile.dados.status_verificacao === "pendente" &&
                      "⏳ Em Análise"}
                    {profile.dados.status_verificacao === "rejeitado" &&
                      "✗ Rejeitado"}
                  </span>
                )}
            </div>
          </div>

          {/* Botão Editar */}
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Informações Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informações Pessoais
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Email
              </label>
              <p className="text-gray-900">{user.email}</p>
            </div>

            {profile.dados &&
              "telefone" in profile.dados &&
              profile.dados.telefone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Telefone
                  </label>
                  <p className="text-gray-900">{profile.dados.telefone}</p>
                </div>
              )}

            {profile.dados && "cpf" in profile.dados && profile.dados.cpf && (
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  CPF
                </label>
                <p className="text-gray-900">
                  {profile.dados.cpf.replace(
                    /(\d{3})(\d{3})(\d{3})(\d{2})/,
                    "$1.***.**$4"
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Informações Profissionais (só para profissionais) */}
        {profile.tipo === "profissional" && profile.dados && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações Profissionais
            </h2>

            <div className="space-y-3">
              {"tipo" in profile.dados && profile.dados.tipo && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Categoria
                  </label>
                  <p className="text-gray-900 capitalize">
                    {profile.dados.tipo}
                  </p>
                </div>
              )}

              {"crp" in profile.dados && profile.dados.crp && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    CRP
                  </label>
                  <p className="text-gray-900">{profile.dados.crp}</p>
                </div>
              )}

              {"valor_sessao" in profile.dados &&
                profile.dados.valor_sessao && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Valor da Sessão
                    </label>
                    <p className="text-gray-900">
                      R${" "}
                      {profile.dados.valor_sessao.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Biografia (se houver) */}
      {profile.dados &&
        "bio_profissional" in profile.dados &&
        profile.dados.bio_profissional && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sobre</h2>
            <p className="text-gray-700 leading-relaxed">
              {profile.dados.bio_profissional}
            </p>
          </div>
        )}
    </div>
  );

  // Renderizar com layout apropriado
  if (profile.tipo === "profissional") {
    return <ProfessionalLayout>{perfilContent}</ProfessionalLayout>;
  } else if (profile.tipo === "paciente") {
    return <PatientLayout>{perfilContent}</PatientLayout>;
  } else {
    // Fallback para outros tipos
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">{perfilContent}</div>
      </div>
    );
  }
}
