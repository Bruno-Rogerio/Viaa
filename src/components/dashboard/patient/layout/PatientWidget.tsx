// src/components/dashboard/patient/layout/PatientWidget.tsx
// 🔄 REUTILIZANDO estrutura do ProfessionalWidget - conteúdo específico do paciente

"use client";
import Link from "next/link";
import {
  CalendarDaysIcon,
  UserGroupIcon,
  HeartIcon,
  ClockIcon,
  VideoCameraIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CalendarDaysIcon as CalendarSolid } from "@heroicons/react/24/solid";

export default function PatientWidget() {
  // 🔄 REUTILIZADO: Estrutura de cards igual ao ProfessionalWidget
  return (
    <div className="space-y-6">
      {/* Próxima Consulta */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Próxima Consulta
          </h3>
          <CalendarSolid className="w-5 h-5 text-emerald-600" />
        </div>

        {/* Mock de próxima consulta */}
        <div className="space-y-4">
          <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-700 font-semibold text-sm">
                  DR
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-emerald-900">
                  Dr. Rodrigo Silva
                </p>
                <p className="text-sm text-emerald-700">Psicólogo Clínico</p>
                <div className="flex items-center mt-2 text-sm text-emerald-600">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  <span>Hoje, 14:00</span>
                  <VideoCameraIcon className="w-4 h-4 ml-3 mr-1" />
                  <span>Online</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <Link
                href="/dashboard/consultas/123"
                className="flex-1 bg-emerald-600 text-white text-center py-2 px-3 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Entrar na Consulta
              </Link>
              <button className="px-3 py-2 border border-emerald-300 text-emerald-700 rounded-lg text-sm hover:bg-emerald-100 transition-colors">
                Detalhes
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/dashboard/consultas"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Ver todas as consultas
            </Link>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h3>

        <div className="space-y-3">
          <Link
            href="/dashboard/profissionais"
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
          >
            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <UserGroupIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Buscar Profissional</p>
              <p className="text-sm text-gray-600">
                Encontre o terapeuta ideal
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/consultas/nova"
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <PlusIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Agendar Consulta</p>
              <p className="text-sm text-gray-600">Marcar novo horário</p>
            </div>
          </Link>

          <Link
            href="/dashboard/bem-estar"
            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <HeartIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Recursos de Bem-estar</p>
              <p className="text-sm text-gray-600">Conteúdos e exercícios</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Meu Progresso */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Meu Progresso
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-gray-600">
                Consultas realizadas
              </span>
            </div>
            <span className="font-semibold text-gray-900">8</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Horas de terapia</span>
            </div>
            <span className="font-semibold text-gray-900">12h</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HeartIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Dias consecutivos</span>
            </div>
            <span className="font-semibold text-gray-900">15</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/progresso"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Ver estatísticas completas
          </Link>
        </div>
      </div>

      {/* Dica do Dia */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center space-x-2 mb-3">
          <SparklesIcon className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900">
            Dica de Bem-estar
          </h3>
        </div>

        <p className="text-purple-800 text-sm leading-relaxed mb-4">
          "Pratique 5 minutos de respiração profunda hoje. Inspire por 4
          segundos, segure por 4, e expire por 6 segundos. Isso ajuda a reduzir
          a ansiedade e promove o relaxamento."
        </p>

        <Link
          href="/dashboard/bem-estar/exercicios/respiracao"
          className="inline-flex items-center text-sm font-medium text-purple-700 hover:text-purple-800"
        >
          Praticar agora
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
