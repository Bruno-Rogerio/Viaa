// viaa\src\components\dashboard\layout\DashboardWidget.tsx

"use client";
import Link from "next/link";
import {
  CalendarDaysIcon,
  ClockIcon,
  UserPlusIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

export default function DashboardWidget() {
  return (
    <div className="space-y-6">
      {/* Próximas Consultas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Hoje</h3>
          <Link
            href="/dashboard/agenda"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Ver agenda
          </Link>
        </div>

        <div className="space-y-3">
          {/* Consulta exemplo */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              MS
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Maria Silva</p>
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="w-4 h-4 mr-1" />
                14:00 - 15:00
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              JS
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">João Santos</p>
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="w-4 h-4 mr-1" />
                16:00 - 17:00
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/dashboard/agenda"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas (5 consultas)
            </Link>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Esta Semana
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Consultas</span>
            </div>
            <span className="font-semibold text-gray-900">12</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserPlusIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-gray-600">Novos pacientes</span>
            </div>
            <span className="font-semibold text-gray-900">3</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Visualizações</span>
            </div>
            <span className="font-semibold text-gray-900">89</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/analytics"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver relatório completo →
          </Link>
        </div>
      </div>

      {/* Sugestões de Conexões */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Profissionais Sugeridos
        </h3>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              AC
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Ana Costa</p>
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

        <div className="mt-4">
          <Link
            href="/dashboard/rede"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver mais sugestões →
          </Link>
        </div>
      </div>
    </div>
  );
}
