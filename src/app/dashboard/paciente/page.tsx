// src/app/dashboard/paciente/page.tsx
// 🎯 DASHBOARD PRINCIPAL DO PACIENTE - Estrutura correta

"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import {
  CalendarDaysIcon,
  UserGroupIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  VideoCameraIcon,
  MapPinIcon,
  StarIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function PatientDashboard() {
  const { profile } = useAuth();

  // Mock data - depois será substituído por dados reais
  const [proximaConsulta] = useState({
    id: "1",
    profissional: {
      nome: "Dr. Rodrigo Silva",
      especialidade: "Psicólogo Clínico",
      foto: null,
      rating: 4.9,
    },
    data: "Hoje",
    horario: "14:00 - 15:00",
    tipo: "online",
    status: "agendada",
  });

  const [feedPosts] = useState([
    {
      id: "1",
      autor: {
        nome: "Dra. Ana Santos",
        especialidade: "Terapia Cognitivo-Comportamental",
        foto: null,
        verificado: true,
      },
      conteudo:
        "A ansiedade é uma resposta natural do corpo, mas quando se torna excessiva, pode impactar nossa qualidade de vida. Técnicas de respiração e mindfulness podem ser grandes aliadas no manejo desses sentimentos. 🧘‍♀️✨",
      data: "2h",
      curtidas: 24,
      comentarios: 8,
      visualizacoes: 156,
    },
    {
      id: "2",
      autor: {
        nome: "Dr. Carlos Lima",
        especialidade: "Psicanálise",
        foto: null,
        verificado: true,
      },
      conteudo:
        "Reflexão do dia: 'O primeiro passo para mudar é reconhecer que precisamos de mudança.' Às vezes, aceitar nossas vulnerabilidades é o que nos torna mais fortes. 💪",
      data: "4h",
      curtidas: 18,
      comentarios: 5,
      visualizacoes: 89,
    },
  ]);

  const nomeUsuario =
    profile?.dados && "nome" in profile.dados ? profile.dados.nome : "Paciente";

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header de Boas-vindas */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Olá, {nomeUsuario}! 👋</h1>
            <p className="text-emerald-100 text-lg">
              Como você está se sentindo hoje? Seu bem-estar é nossa prioridade.
            </p>
          </div>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CalendarDaysIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Próxima Consulta
                </h3>
                <p className="text-2xl font-semibold text-gray-900">Hoje</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Seguindo</h3>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <HeartIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Bem-estar</h3>
                <p className="text-2xl font-semibold text-gray-900">85%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Mensagens</h3>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próxima Consulta Destacada */}
        {proximaConsulta && (
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Próxima Consulta
              </h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                {proximaConsulta.data}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-semibold text-lg">
                  {proximaConsulta.profissional.nome
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {proximaConsulta.profissional.nome}
                </h3>
                <p className="text-gray-600">
                  {proximaConsulta.profissional.especialidade}
                </p>
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {proximaConsulta.horario}
                  </div>
                  <div className="flex items-center">
                    {proximaConsulta.tipo === "online" ? (
                      <VideoCameraIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <MapPinIcon className="w-4 h-4 mr-1" />
                    )}
                    {proximaConsulta.tipo === "online"
                      ? "Online"
                      : "Presencial"}
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                    {proximaConsulta.profissional.rating}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Link
                  href={`/dashboard/consultas/${proximaConsulta.id}`}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-center font-medium hover:bg-emerald-700 transition-colors"
                >
                  Entrar na Consulta
                </Link>
                <button className="px-6 py-2 border border-emerald-300 text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors">
                  Reagendar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feed de Profissionais - MODO PACIENTE (apenas visualização) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Feed dos Profissionais
            </h2>
            <Link
              href="/dashboard/feed"
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              Ver todos →
            </Link>
          </div>

          <div className="space-y-6">
            {feedPosts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 rounded-xl p-6 hover:border-emerald-200 transition-colors"
              >
                {/* Header do Post */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 font-semibold">
                      {post.autor.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {post.autor.nome}
                      </h3>
                      {post.autor.verificado && (
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {post.autor.especialidade} • {post.data}
                    </p>
                  </div>
                </div>

                {/* Conteúdo do Post */}
                <div className="mb-4">
                  <p className="text-gray-900 leading-relaxed">
                    {post.conteudo}
                  </p>
                </div>

                {/* Estatísticas do Post - MODO PACIENTE (apenas visualização) */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <HeartSolid className="w-4 h-4 text-red-500" />
                      <span>{post.curtidas}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>{post.comentarios}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{post.visualizacoes}</span>
                    </div>
                  </div>

                  {/* Pacientes não podem interagir - apenas visualizar */}
                  <div className="text-xs text-gray-400 italic">
                    Visualizando como paciente
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Como está seu humor hoje?
            </h3>
            <div className="flex space-x-3">
              {["😢", "😕", "😐", "😊", "😄"].map((emoji, index) => (
                <button
                  key={index}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 flex items-center justify-center text-2xl transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ações Rápidas
            </h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/profissionais"
                className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors group"
              >
                <UserGroupIcon className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-700">
                  Buscar Profissional
                </span>
              </Link>
              <Link
                href="/dashboard/bem-estar"
                className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
              >
                <HeartSolid className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-700">
                  Exercícios de Bem-estar
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
