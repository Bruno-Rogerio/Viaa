// src/app/dashboard/page.tsx
// 🎯 DASHBOARD INTELIGENTE - detecta tipo de usuário e renderiza layout correto

"use client";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalLayout } from "@/components/dashboard/professional/layout";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import { LoadingSpinner } from "@/components/dashboard/common";
import Link from "next/link";

// Componente principal do dashboard para profissionais
function ProfessionalDashboard() {
  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo de volta! 👋
        </h1>
        <p className="text-gray-600">
          Aqui está um resumo da sua atividade profissional.
        </p>
      </div>

      {/* Cards de estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Consultas Hoje</p>
              <p className="text-3xl font-bold text-blue-600">3</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pacientes Ativos</p>
              <p className="text-3xl font-bold text-emerald-600">12</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Mensal</p>
              <p className="text-3xl font-bold text-purple-600">R$ 4.8k</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agenda do dia */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Agenda de Hoje
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-semibold text-sm">AM</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Ana Maria Santos</p>
              <p className="text-sm text-gray-600">
                14:00 - 15:00 • Consulta Online
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Iniciar
            </button>
          </div>

          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-semibold text-sm">JS</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">João Silva</p>
              <p className="text-sm text-gray-600">
                16:00 - 17:00 • Presencial
              </p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
              Pendente
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/agenda"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Ver agenda completa →
          </Link>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/agenda"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600">📅</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Ver Agenda</p>
              <p className="text-sm text-gray-600">Gerenciar horários</p>
            </div>
          </Link>

          <Link
            href="/dashboard/pacientes"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all"
          >
            <div className="p-2 bg-emerald-100 rounded-lg">
              <span className="text-emerald-600">👥</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Meus Pacientes</p>
              <p className="text-sm text-gray-600">Gerenciar atendimentos</p>
            </div>
          </Link>

          <Link
            href="/dashboard/configuracoes"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600">⚙️</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Configurações</p>
              <p className="text-sm text-gray-600">Ajustar horários</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente principal do dashboard para pacientes
function PatientDashboard() {
  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Olá! Como você está se sentindo hoje? 💚
        </h1>
        <p className="text-gray-600">
          Seu bem-estar é nossa prioridade. Vamos cuidar da sua saúde mental
          juntos.
        </p>
      </div>

      {/* Próxima consulta em destaque */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Sua Próxima Consulta
        </h2>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-700 font-bold text-lg">DR</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900">
                Dr. Rodrigo Silva
              </h3>
              <p className="text-emerald-700">Psicólogo Clínico • CRP 12345</p>
              <div className="flex items-center mt-2 text-sm text-emerald-600">
                <span className="mr-4">📅 Hoje, 14:00</span>
                <span className="mr-4">💻 Consulta Online</span>
                <span>⏱️ 50 minutos</span>
              </div>
            </div>
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Entrar na Consulta
            </button>
          </div>
        </div>
      </div>

      {/* Cards de ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/profissionais"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Buscar Profissional
            </h3>
            <p className="text-gray-600 text-sm">
              Encontre o terapeuta ideal para suas necessidades
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/consultas"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Minhas Consultas
            </h3>
            <p className="text-gray-600 text-sm">
              Veja suas consultas agendadas e histórico
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/bem-estar"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💜</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Recursos de Bem-estar
            </h3>
            <p className="text-gray-600 text-sm">
              Exercícios e conteúdos para seu crescimento
            </p>
          </div>
        </Link>
      </div>

      {/* Histórico recente */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Suas Consultas Recentes
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                Consulta com Dr. Rodrigo
              </p>
              <p className="text-sm text-gray-600">Há 3 dias • Concluída</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver detalhes
            </button>
          </div>

          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                Sessão de Acompanhamento
              </p>
              <p className="text-sm text-gray-600">Há 1 semana • Concluída</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver detalhes
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/consultas"
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Ver todas as consultas →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente principal que detecta o tipo de usuário
export default function DashboardPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 mb-4">
            Você precisa estar logado para acessar o dashboard.
          </p>
          <a
            href="/auth"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  // 🎯 RENDERIZAÇÃO INTELIGENTE BASEADA NO TIPO DE USUÁRIO
  switch (profile.tipo) {
    case "profissional":
      return (
        <ProfessionalLayout>
          <ProfessionalDashboard />
        </ProfessionalLayout>
      );

    case "paciente":
      return (
        <PatientLayout>
          <PatientDashboard />
        </PatientLayout>
      );

    case "clinica":
      // TODO: Implementar layout para clínicas
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Dashboard para Clínicas
            </h2>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </div>
        </div>
      );

    case "empresa":
      // TODO: Implementar layout para empresas
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Dashboard para Empresas
            </h2>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Tipo de usuário não reconhecido
            </h2>
            <p className="text-gray-600 mb-4">
              Entre em contato com o suporte.
            </p>
            <a
              href="/auth"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Login
            </a>
          </div>
        </div>
      );
  }
}
