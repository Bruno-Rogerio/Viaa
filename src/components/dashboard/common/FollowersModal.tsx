// src/components/dashboard/common/FollowersModal.tsx
// 📋 Modal com lista de seguidores ou usuários seguidos

"use client";

import { useState, useEffect, useCallback } from "react";
import { XMarkIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import FollowButton from "./FollowButton";
import { useConnections } from "@/hooks/useConnections";

interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  tipo: "profissional" | "paciente";
  foto_perfil_url?: string;
  especialidades?: string;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  mode: "followers" | "following"; // Modo: mostrar followers ou following
  authToken: string | null;
  title?: string;
}

export default function FollowersModal({
  isOpen,
  onClose,
  userId,
  mode,
  authToken,
  title,
}: FollowersModalProps) {
  const [page, setPage] = useState(0);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const {
    followersList,
    followingList,
    followersLoading,
    followersError,
    getFollowersList,
    getFollowingList,
  } = useConnections(userId, authToken);

  const limit = 20;

  // ========== CARREGAR DADOS ==========

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      if (mode === "followers") {
        await getFollowersList(limit, page * limit);
      } else {
        await getFollowingList(limit, page * limit);
      }
    };

    loadData();
  }, [isOpen, page, mode, userId]);

  // ========== ATUALIZAR LISTA AO MUDAR MODE ==========

  useEffect(() => {
    if (mode === "followers") {
      setAllUsers(followersList);
    } else {
      setAllUsers(followingList);
    }

    // Verificar se há mais usuários
    setHasMore((followersList?.length || followingList?.length || 0) >= limit);
  }, [followersList, followingList, mode]);

  // ========== CARREGAR MAIS ==========

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  // ========== VOLTAR PAGE ==========

  const previousPage = useCallback(() => {
    setPage((prev) => Math.max(0, prev - 1));
  }, []);

  // ========== RENDERIZAR USUÁRIO ==========

  const renderUser = (user: UserProfile) => (
    <div
      key={user.id}
      className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
    >
      {/* Avatar e Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.foto_perfil_url ? (
            <img
              src={user.foto_perfil_url}
              alt={`${user.nome} ${user.sobrenome}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
              {user.nome.charAt(0)}
              {user.sobrenome.charAt(0)}
            </div>
          )}
        </div>

        {/* Nome e especialidades */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {user.nome} {user.sobrenome}
          </p>
          {user.tipo === "profissional" && user.especialidades && (
            <p className="text-sm text-gray-600 truncate">
              {user.especialidades}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {user.tipo === "profissional" ? "Profissional" : "Paciente"}
          </p>
        </div>
      </div>

      {/* Botão Follow */}
      <div className="flex-shrink-0 ml-2">
        <FollowButton userId={user.user_id} size="sm" showLabel={false} />
      </div>
    </div>
  );

  // ========== RENDERIZAR MODAL ==========

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {title || (mode === "followers" ? "Seguidores" : "Seguindo")}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto">
            {followersLoading && allUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
                <p className="text-gray-600">Carregando...</p>
              </div>
            ) : followersError ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-red-600 text-center">{followersError}</p>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <UserGroupIcon className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-600">
                  {mode === "followers"
                    ? "Nenhum seguidor ainda"
                    : "Não está seguindo ninguém"}
                </p>
              </div>
            ) : (
              <div>{allUsers.map((user) => renderUser(user))}</div>
            )}
          </div>

          {/* Footer com paginação */}
          {allUsers.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={previousPage}
                disabled={page === 0 || followersLoading}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>

              <span className="text-sm text-gray-600">Página {page + 1}</span>

              <button
                onClick={loadMore}
                disabled={!hasMore || followersLoading}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
