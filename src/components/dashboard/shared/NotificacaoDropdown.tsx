// src/components/dashboard/shared/NotificacaoDropdown.tsx

import { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellSolid } from "@heroicons/react/24/solid";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NotificacaoInApp } from "@/types/notificacao-in-app";
import Link from "next/link";

export default function NotificacaoDropdown() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoInApp[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const { user } = useAuth();

  // Função para buscar notificações
  const buscarNotificacoes = async () => {
    if (!user?.id) return;

    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotificacoes(data || []);
      const naoLidasCount = data?.filter((n) => !n.lida).length || 0;
      setNaoLidas(naoLidasCount);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Função para marcar notificação como lida
  const marcarComoLida = async (id: string) => {
    try {
      await supabase.from("notificacoes").update({ lida: true }).eq("id", id);

      // Atualizar estado local
      setNotificacoes(
        notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
      setNaoLidas(Math.max(0, naoLidas - 1));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  // Função para marcar todas como lidas
  const marcarTodasComoLidas = async () => {
    if (notificacoes.length === 0) return;

    try {
      const idsNaoLidas = notificacoes.filter((n) => !n.lida).map((n) => n.id);

      if (idsNaoLidas.length === 0) return;

      await supabase
        .from("notificacoes")
        .update({ lida: true })
        .in("id", idsNaoLidas);

      // Atualizar estado local
      setNotificacoes(notificacoes.map((n) => ({ ...n, lida: true })));
      setNaoLidas(0);
    } catch (error) {
      console.error("Erro ao marcar todas notificações como lidas:", error);
    }
  };

  // Ouvir mudanças em tempo real nas notificações
  useEffect(() => {
    if (!user?.id) return;

    buscarNotificacoes();

    // Inscrever-se para atualizações em tempo real
    const subscription = supabase
      .channel("notificacoes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificacoes",
          filter: `usuario_id=eq.${user.id}`,
        },
        (payload) => {
          buscarNotificacoes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // Renderizar ícone de notificação baseado em estado
  const renderIcone = () => {
    if (carregando) {
      return (
        <div className="h-5 w-5 animate-pulse bg-gray-300 rounded-full"></div>
      );
    }

    if (naoLidas > 0) {
      return (
        <div className="relative">
          <BellSolid className="h-6 w-6 text-amber-500" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {naoLidas}
          </span>
        </div>
      );
    }

    return <BellIcon className="h-6 w-6 text-gray-500" />;
  };

  // Função para formatar data relativa
  const formatarDataRelativa = (data: string) => {
    const dataNotificacao = new Date(data);
    const agora = new Date();
    const diffMs = agora.getTime() - dataNotificacao.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMin < 1) return "Agora";
    if (diffMin < 60) return `${diffMin}m atrás`;
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias === 1) return "Ontem";
    if (diffDias < 7) return `${diffDias} dias atrás`;

    return dataNotificacao.toLocaleDateString("pt-BR");
  };

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={() => setAberto(!aberto)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notificações"
      >
        {renderIcone()}
      </button>

      {/* Dropdown */}
      {aberto && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200">
          {/* Cabeçalho */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-700">Notificações</h3>
            {naoLidas > 0 && (
              <button
                onClick={marcarTodasComoLidas}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {carregando ? (
              <div className="p-4 text-center text-gray-500">
                Carregando notificações...
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação recente
              </div>
            ) : (
              <ul>
                {notificacoes.map((notificacao) => (
                  <li
                    key={notificacao.id}
                    className={`border-b border-gray-100 last:border-b-0 ${
                      !notificacao.lida ? "bg-blue-50" : ""
                    }`}
                  >
                    <Link
                      href={notificacao.link || "#"}
                      className="block p-4 hover:bg-gray-50"
                      onClick={() => {
                        if (!notificacao.lida) {
                          marcarComoLida(notificacao.id);
                        }
                        setAberto(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Ícone baseado no tipo de notificação */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {notificacao.tipo === "consulta_agendada" && (
                            <span className="text-blue-500 text-sm">📅</span>
                          )}
                          {notificacao.tipo === "consulta_confirmada" && (
                            <span className="text-green-500 text-sm">✅</span>
                          )}
                          {notificacao.tipo === "consulta_rejeitada" && (
                            <span className="text-red-500 text-sm">❌</span>
                          )}
                          {notificacao.tipo === "lembrete_consulta" && (
                            <span className="text-amber-500 text-sm">⏰</span>
                          )}
                          {notificacao.tipo === "sistema" && (
                            <span className="text-purple-500 text-sm">📢</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 mb-1">
                            {notificacao.titulo}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notificacao.mensagem}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatarDataRelativa(notificacao.created_at)}
                          </p>
                        </div>

                        {!notificacao.lida && (
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Rodapé */}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <Link
              href="/dashboard/notificacoes"
              className="block text-center text-sm text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-md"
              onClick={() => setAberto(false)}
            >
              Ver todas as notificações
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
