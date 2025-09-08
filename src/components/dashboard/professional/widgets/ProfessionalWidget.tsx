// viaa/src/components/dashboard/professional/widgets/ProfessionalWidget.tsx

"use client";
import Link from "next/link";
import {
  ClockIcon,
  UserGroupIcon,
  BanknotesIcon,
  ChartBarIcon, // Mudança aqui - TrendingUpIcon não existe
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import ProximasConsultasWidget from "../../common/ProximasConsultasWidget";

export default function ProfessionalWidget() {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Widget de Próximas Consultas */}
      <ProximasConsultasWidget
        tipoUsuario="profissional"
        usuarioId={user.id}
        limite={4}
      />

      {/* Estatísticas Rápidas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estatísticas de Hoje
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Consultas Hoje</p>
                <p className="text-sm text-gray-600">3 agendadas</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">3</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Esta Semana</p>
                <p className="text-sm text-gray-600">12 consultas</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-emerald-600">12</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BanknotesIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Receita Mensal</p>
                <p className="text-sm text-gray-600">R$ 2.840,00</p>
              </div>
            </div>
            <span className="text-lg font-bold text-purple-600">+18%</span>
          </div>
        </div>

        <div className="mt-4">
          <Link
            href="/dashboard/analytics"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver relatório completo →
          </Link>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h3>

        <div className="space-y-3">
          <Link
            href="/dashboard/agenda?action=new"
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Nova Consulta</p>
              <p className="text-sm text-gray-600">Agendar um novo horário</p>
            </div>
          </Link>

          <Link
            href="/dashboard/pacientes"
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
          >
            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <UserGroupIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Gerenciar Pacientes</p>
              <p className="text-sm text-gray-600">Ver lista de pacientes</p>
            </div>
          </Link>

          <Link
            href="/dashboard/configuracoes"
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <ChartBarIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Configurar Horários</p>
              <p className="text-sm text-gray-600">Definir disponibilidade</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Sugestões de Conexões */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Sugestões de Conexões
          </h3>
          <Link
            href="/dashboard/rede"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver mais
          </Link>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              AM
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Ana Maria Santos</p>
              <p className="text-sm text-gray-600">Psicóloga Clínica</p>
            </div>
            <button className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50">
              Conectar
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              RF
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Roberto Freitas</p>
              <p className="text-sm text-gray-600">Terapeuta Holístico</p>
            </div>
            <button className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50">
              Conectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
