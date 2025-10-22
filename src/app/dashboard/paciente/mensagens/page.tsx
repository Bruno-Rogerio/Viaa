// src/app/dashboard/paciente/mensagens/page.tsx
// 💬 Mensagens - Chat com Profissionais

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PatientLayout } from "@/components/dashboard/patient/layout";
import {
  PaperAirplaneIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// 📋 TIPOS
// ============================================================

interface Conversa {
  id: string;
  outro_usuario_id: string;
  outro_usuario_nome: string;
  outro_usuario_foto?: string;
  ultima_mensagem: string;
  ultima_mensagem_timestamp: string;
  nao_lido: boolean;
  nao_lido_count: number;
}

interface Mensagem {
  id: string;
  remetente_id: string;
  destinatario_id: string;
  conteudo: string;
  criado_em: string;
  lido: boolean;
}

// ============================================================
// 🎯 COMPONENTE PRINCIPAL
// ============================================================

export default function MensagensPage() {
  const { user, profile } = useAuth();

  // Estados
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [selectedConversa, setSelectedConversa] = useState<Conversa | null>(
    null
  );
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMsg, setNovaMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  // ========== CARREGAR CONVERSAS ==========
  useEffect(() => {
    loadConversas();
  }, [user]);

  const loadConversas = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/mensagens/conversas", {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar conversas");
      }

      const data = await response.json();
      setConversas(data.conversas || []);
    } catch (err: any) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========== CARREGAR MENSAGENS DA CONVERSA ==========
  const handleSelectConversa = async (conversa: Conversa) => {
    try {
      setSelectedConversa(conversa);
      setMensagens([]);

      const response = await fetch(`/api/mensagens/conversas/${conversa.id}`, {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar mensagens");
      }

      const data = await response.json();
      setMensagens(data.mensagens || []);
    } catch (err: any) {
      console.error("Erro:", err);
    }
  };

  // ========== ENVIAR MENSAGEM ==========
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!novaMsg.trim() || !selectedConversa) return;

    try {
      const response = await fetch(
        `/api/mensagens/conversas/${selectedConversa.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.id}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conteudo: novaMsg,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem");
      }

      const data = await response.json();
      setMensagens([...mensagens, data.mensagem]);
      setNovaMsg("");
    } catch (err: any) {
      console.error("Erro:", err);
    }
  };

  // ========== RENDER ==========

  return (
    <PatientLayout>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-sm text-gray-600">
            Chat com seus profissionais de saúde
          </p>
        </div>

        {/* Container Principal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Lista de Conversas */}
          <div
            className={`${
              selectedConversa
                ? "hidden md:flex md:w-96"
                : "w-full md:w-96 flex"
            } flex-col bg-white border-r border-gray-200`}
          >
            {/* Search */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar conversa..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => setShowNewChat(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Nova Mensagem
              </button>
            </div>

            {/* Conversas */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-100 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : conversas.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600 mb-2">Nenhuma mensagem ainda</p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Iniciar conversa
                  </button>
                </div>
              ) : (
                conversas
                  .filter((c) =>
                    c.outro_usuario_nome
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  )
                  .map((conversa) => (
                    <button
                      key={conversa.id}
                      onClick={() => handleSelectConversa(conversa)}
                      className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${
                        selectedConversa?.id === conversa.id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {conversa.outro_usuario_foto ? (
                          <img
                            src={conversa.outro_usuario_foto}
                            alt={conversa.outro_usuario_nome}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {conversa.outro_usuario_nome.charAt(0)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {conversa.outro_usuario_nome}
                            </p>
                            {conversa.nao_lido && (
                              <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold flex-shrink-0">
                                {conversa.nao_lido_count}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversa.ultima_mensagem}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatarDataRelativa(
                              conversa.ultima_mensagem_timestamp
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* Chat */}
          {selectedConversa ? (
            <div className="flex-1 flex flex-col bg-white">
              {/* Header da Conversa */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedConversa.outro_usuario_foto ? (
                    <img
                      src={selectedConversa.outro_usuario_foto}
                      alt={selectedConversa.outro_usuario_nome}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {selectedConversa.outro_usuario_nome.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedConversa.outro_usuario_nome}
                    </p>
                    <p className="text-xs text-gray-600">Online</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedConversa(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mensagens.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-600">
                      Comece a conversa dizendo olá
                    </p>
                  </div>
                ) : (
                  mensagens.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.remetente_id === user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.remetente_id === user?.id
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        <p className="break-words">{msg.conteudo}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.remetente_id === user?.id
                              ? "text-blue-100"
                              : "text-gray-600"
                          }`}
                        >
                          {new Date(msg.criado_em).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={novaMsg}
                    onChange={(e) => setNovaMsg(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!novaMsg.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
              <div className="text-center">
                <PaperAirplaneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  Selecione uma conversa para começar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}

// ============================================================
// 🔧 FUNÇÕES AUXILIARES
// ============================================================

function formatarDataRelativa(data: string): string {
  const agora = new Date();
  const msgData = new Date(data);
  const diferenca = Math.floor((agora.getTime() - msgData.getTime()) / 1000);

  if (diferenca < 60) return "agora";
  if (diferenca < 3600) return `${Math.floor(diferenca / 60)}m atrás`;
  if (diferenca < 86400) return `${Math.floor(diferenca / 3600)}h atrás`;

  return msgData.toLocaleDateString("pt-BR");
}
