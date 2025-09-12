// src/app/dashboard/perfil/page.tsx
// Página completa de perfil profissional - Visualizar e Editar

"use client";

import { useState } from "react";
import {
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useProfile } from "@/hooks/dashboard/useProfile";
import ProfilePreview from "@/components/dashboard/professional/profile/ProfilePreview";
import ProfileEditForm from "@/components/dashboard/professional/profile/ProfileEditForm";

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const {
    profileData,
    formData,
    isEditing,
    loading,
    saving,
    uploadingPhoto,
    errors,
    toggleEditing,
    updateField,
    saveProfile,
    uploadPhoto,
    resetForm,
  } = useProfile();

  const handleSave = async () => {
    const success = await saveProfile();
    if (success) {
      setShowSaveConfirm(false);
      setActiveTab("preview"); // Voltar para preview após salvar
    }
  };

  const handleCancelEdit = () => {
    if (isEditing) {
      resetForm();
      toggleEditing();
    }
    setActiveTab("preview");
  };

  const handleStartEdit = () => {
    if (!isEditing) {
      toggleEditing();
    }
    setActiveTab("edit");
  };

  // Loading state
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

  // Se não tem dados do perfil
  if (!profileData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Perfil não encontrado
          </h2>
          <p className="text-gray-600">
            Não foi possível carregar os dados do seu perfil.
          </p>
        </div>
      </div>
    );
  }

  // Verificar se há mudanças não salvas
  const hasUnsavedChanges = isEditing && Object.keys(errors).length === 0;

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Meu Perfil Profissional
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? "Edite suas informações profissionais"
                : "Visualize como seu perfil aparece para os pacientes"}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Abas de navegação */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "preview"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <EyeIcon className="w-4 h-4" />
                <span>Visualizar</span>
              </button>
              <button
                onClick={() => setActiveTab("edit")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "edit"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <PencilIcon className="w-4 h-4" />
                <span>Editar</span>
              </button>
            </div>

            {/* Botões de ação */}
            {activeTab === "edit" && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving || Object.keys(errors).length > 0}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckIcon className="w-4 h-4" />
                  )}
                  <span>{saving ? "Salvando..." : "Salvar"}</span>
                </button>
              </div>
            )}

            {activeTab === "preview" && !isEditing && (
              <button
                onClick={handleStartEdit}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Editar Perfil</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de status */}
        {isEditing && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-700">
                Você tem alterações não salvas. Lembre-se de salvar antes de
                sair.
              </p>
            </div>
          </div>
        )}

        {/* Mostrar erros se houver */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 font-medium mb-1">
                  Corrija os seguintes erros:
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal - Preview ou Formulário */}
        <div className="lg:col-span-2">
          {activeTab === "preview" && <ProfilePreview profileData={formData} />}

          {activeTab === "edit" && (
            <ProfileEditForm
              formData={formData}
              errors={errors}
              uploadingPhoto={uploadingPhoto}
              onUpdateField={updateField}
              onUploadPhoto={uploadPhoto}
            />
          )}
        </div>

        {/* Sidebar direita - Informações e dicas */}
        <div className="space-y-6">
          {/* Card de status do perfil */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status do Perfil
            </h3>

            <div className="space-y-4">
              {/* Completude do perfil */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Perfil Completo
                  </span>
                  <span className="text-sm text-gray-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>

              {/* Status de verificação */}
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Perfil verificado</span>
              </div>

              {/* Última atualização */}
              <div className="text-sm text-gray-500">
                Última atualização:{" "}
                {new Date(profileData.updated_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
          </div>

          {/* Dicas para melhorar o perfil */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Dicas para Melhorar seu Perfil
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <strong>Foto profissional:</strong> Use uma foto clara e
                  profissional para gerar mais confiança
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <strong>Biografia completa:</strong> Conte sua história e
                  abordagem terapêutica
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <strong>Links sociais:</strong> Adicione seus perfis
                  profissionais para mais credibilidade
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <strong>Valor da sessão:</strong> Defina seus preços para
                  facilitar o agendamento
                </p>
              </div>
            </div>
          </div>

          {/* Estatísticas do perfil */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Estatísticas
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Visualizações do perfil
                </span>
                <span className="text-sm font-semibold text-gray-900">152</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Agendamentos este mês
                </span>
                <span className="text-sm font-semibold text-gray-900">8</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avaliação média</span>
                <span className="text-sm font-semibold text-gray-900">
                  4.9 ⭐
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taxa de resposta</span>
                <span className="text-sm font-semibold text-gray-900">98%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver relatório completo →
              </button>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⚡ Ações Rápidas
            </h3>

            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">
                  Configurar Agenda
                </div>
                <div className="text-xs text-gray-600">
                  Defina seus horários disponíveis
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">
                  Ver meu Perfil Público
                </div>
                <div className="text-xs text-gray-600">
                  Como os pacientes veem você
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">
                  Configurar Notificações
                </div>
                <div className="text-xs text-gray-600">Lembretes e alertas</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast de sucesso */}
      {showSaveConfirm && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <CheckIcon className="w-5 h-5" />
            <span className="font-medium">Perfil salvo com sucesso!</span>
          </div>
        </div>
      )}
    </div>
  );
}
