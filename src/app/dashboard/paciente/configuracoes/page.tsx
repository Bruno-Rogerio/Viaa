// src/app/dashboard/paciente/configuracoes/page.tsx
// ⚙️ Configurações - Notificações, Privacidade e Segurança

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import {
  BellIcon,
  LockClosedIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// 📋 TIPOS
// ============================================================

interface ConfiguracoesNotificacoes {
  email_novos_posts: boolean;
  email_mensagens: boolean;
  email_agendamentos: boolean;
  email_lembretes: boolean;
  push_novos_posts: boolean;
  push_mensagens: boolean;
  push_agendamentos: boolean;
  sms_lembretes: boolean;
}

interface ConfiguracoesPrivacidade {
  perfil_privado: boolean;
  mostrar_no_feed: boolean;
  permitir_busca: boolean;
  mostrar_especialista_seguindo: boolean;
}

// ============================================================
// 🎯 COMPONENTE PRINCIPAL
// ============================================================

export default function ConfiguracoesPage() {
  const { user } = useAuth();

  // Estados
  const [tabAtiva, setTabAtiva] = useState<
    "notificacoes" | "privacidade" | "seguranca" | "dados"
  >("notificacoes");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Notificações
  const [notificacoes, setNotificacoes] = useState<ConfiguracoesNotificacoes>({
    email_novos_posts: true,
    email_mensagens: true,
    email_agendamentos: true,
    email_lembretes: true,
    push_novos_posts: false,
    push_mensagens: true,
    push_agendamentos: true,
    sms_lembretes: false,
  });

  // Privacidade
  const [privacidade, setPrivacidade] = useState<ConfiguracoesPrivacidade>({
    perfil_privado: false,
    mostrar_no_feed: true,
    permitir_busca: true,
    mostrar_especialista_seguindo: true,
  });

  // ========== SALVAR NOTIFICAÇÕES ==========
  const handleSaveNotificacoes = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/configuracoes/notificacoes", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.id}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificacoes),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar configurações");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Erro:", err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== SALVAR PRIVACIDADE ==========
  const handleSavePrivacidade = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/configuracoes/privacidade", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.id}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(privacidade),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar configurações");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Erro:", err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER ==========

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-indigo-100 mt-2">
            Personalize sua experiência na VIAA
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <p className="text-green-800 font-medium">
              Configurações salvas com sucesso!
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {(
              [
                { id: "notificacoes", label: "Notificações", icon: BellIcon },
                { id: "privacidade", label: "Privacidade", icon: EyeIcon },
                { id: "seguranca", label: "Segurança", icon: LockClosedIcon },
                { id: "dados", label: "Dados", icon: TrashIcon },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTabAtiva(id)}
                className={`flex-1 px-4 py-4 font-medium border-b-2 transition-all flex items-center justify-center gap-2 ${
                  tabAtiva === id
                    ? "border-b-indigo-500 text-indigo-600"
                    : "border-b-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {/* TAB: NOTIFICAÇÕES */}
            {tabAtiva === "notificacoes" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Configurações de Notificações
                </h2>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      📧 Notificações por Email
                    </h3>

                    <div className="space-y-3">
                      {[
                        {
                          key: "email_novos_posts",
                          label: "Novos posts dos especialistas que sigo",
                        },
                        {
                          key: "email_mensagens",
                          label: "Novas mensagens de profissionais",
                        },
                        {
                          key: "email_agendamentos",
                          label: "Confirmação de agendamentos",
                        },
                        {
                          key: "email_lembretes",
                          label: "Lembretes de consultas (24h e 1h antes)",
                        },
                      ].map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={
                              notificacoes[
                                key as keyof ConfiguracoesNotificacoes
                              ]
                            }
                            onChange={(e) =>
                              setNotificacoes({
                                ...notificacoes,
                                [key]: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Push */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      🔔 Notificações Push
                    </h3>

                    <div className="space-y-3">
                      {[
                        {
                          key: "push_novos_posts",
                          label: "Novos posts dos especialistas",
                        },
                        {
                          key: "push_mensagens",
                          label: "Novas mensagens",
                        },
                        {
                          key: "push_agendamentos",
                          label: "Confirmação de agendamentos",
                        },
                      ].map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={
                              notificacoes[
                                key as keyof ConfiguracoesNotificacoes
                              ]
                            }
                            onChange={(e) =>
                              setNotificacoes({
                                ...notificacoes,
                                [key]: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* SMS */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      📱 SMS
                    </h3>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={notificacoes.sms_lembretes}
                        onChange={(e) =>
                          setNotificacoes({
                            ...notificacoes,
                            sms_lembretes: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-gray-700">
                        Lembretes de consultas via SMS
                      </span>
                    </label>
                  </div>
                </div>

                {/* Botão Salvar */}
                <div className="border-t border-gray-200 pt-6 flex gap-3">
                  <button
                    onClick={handleSaveNotificacoes}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                  >
                    {loading ? "Salvando..." : "Salvar Preferências"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB: PRIVACIDADE */}
            {tabAtiva === "privacidade" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Configurações de Privacidade
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      key: "perfil_privado",
                      label: "Perfil Privado",
                      desc: "Apenas usuários que você segue podem ver seu perfil",
                    },
                    {
                      key: "mostrar_no_feed",
                      label: "Mostrar no Feed",
                      desc: "Permita que suas ações apareçam no feed (seguidores, atividades)",
                    },
                    {
                      key: "permitir_busca",
                      label: "Permitir Busca",
                      desc: "Deixe seu perfil visível em buscas de outros usuários",
                    },
                    {
                      key: "mostrar_especialista_seguindo",
                      label: "Mostrar Especialistas que Sigo",
                      desc: "Deixe pública a lista de profissionais que você segue",
                    },
                  ].map(({ key, label, desc }) => (
                    <label
                      key={key}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={
                          privacidade[key as keyof ConfiguracoesPrivacidade]
                        }
                        onChange={(e) =>
                          setPrivacidade({
                            ...privacidade,
                            [key]: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500 mt-1"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{label}</p>
                        <p className="text-sm text-gray-600 mt-1">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Botão Salvar */}
                <div className="border-t border-gray-200 pt-6 flex gap-3">
                  <button
                    onClick={handleSavePrivacidade}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                  >
                    {loading ? "Salvando..." : "Salvar Preferências"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB: SEGURANÇA */}
            {tabAtiva === "seguranca" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Segurança da Conta
                </h2>

                <div className="space-y-4">
                  {/* Mudar Senha */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Alterar Senha
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Recomendamos alterar sua senha a cada 90 dias
                    </p>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors">
                      Mudar Senha
                    </button>
                  </div>

                  {/* Autenticação 2FA */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Autenticação de Dois Fatores
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors">
                      Configurar 2FA
                    </button>
                  </div>

                  {/* Sessões Ativas */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Sessões Ativas
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Gerencie os dispositivos conectados à sua conta
                    </p>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors">
                      Ver Sessões
                    </button>
                  </div>

                  {/* Logs de Acesso */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Histórico de Acessos
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Veja quem acessou sua conta e quando
                    </p>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors">
                      Ver Logs
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DADOS */}
            {tabAtiva === "dados" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Gerenciamento de Dados
                </h2>

                <div className="space-y-4">
                  {/* Exportar Dados */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Exportar Meus Dados
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Baixe uma cópia de todos os seus dados em formato JSON
                      (LGPD - Direito de Portabilidade)
                    </p>
                    <button className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium rounded-lg transition-colors">
                      Exportar Dados
                    </button>
                  </div>

                  {/* Deletar Conta */}
                  <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-2">
                      Deletar Minha Conta
                    </h3>
                    <p className="text-sm text-red-700 mb-4">
                      Esta ação é irreversível. Todos os seus dados serão
                      permanentemente deletados.
                    </p>
                    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors">
                      Deletar Conta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
