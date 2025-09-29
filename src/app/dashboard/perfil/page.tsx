// src/app/dashboard/perfil/page.tsx
// 🔧 VERSÃO CORRIGIDA - Com ProfessionalLayout para manter sidebar

"use client";

import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/dashboard/useProfile";
import { ProfessionalLayout } from "@/components/dashboard/professional/layout";
import ProfileEditForm from "@/components/dashboard/professional/profile/ProfileEditForm";
import ProfileHeader from "@/components/dashboard/professional/profile/ProfileHeader";
import ProfilePreview from "@/components/dashboard/professional/profile/ProfilePreview";

export default function PerfilPage() {
  const { user, profile: authProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const {
    profileData,
    readOnlyData,
    formData,
    isEditing,
    loading,
    saving,
    uploadingPhoto,
    errors,
    profileCompleteness,
    missingFields,
    canSave,
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
      setActiveTab("preview");
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

  const handleChangeTab = (tab: "preview" | "edit") => {
    if (tab === "edit" && !isEditing) {
      toggleEditing();
    }
    setActiveTab(tab);
  };

  // Verificar se há mudanças não salvas
  const hasUnsavedChanges = isEditing && canSave;

  // 🔧 VALIDAÇÕES DE ACESSO
  if (!user || !authProfile) {
    return (
      <ProfessionalLayout>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-600">
            Você precisa estar logado para acessar seu perfil.
          </p>
        </div>
      </ProfessionalLayout>
    );
  }

  if (authProfile.tipo !== "profissional") {
    return (
      <ProfessionalLayout>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Acesso Restrito
            </h2>
            <p className="text-gray-600">
              Esta página é exclusiva para profissionais aprovados.
            </p>
          </div>
        </div>
      </ProfessionalLayout>
    );
  }

  // 🔧 LOADING COM LAYOUT
  if (loading) {
    return (
      <ProfessionalLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando perfil...</p>
            </div>
          </div>
        </div>
      </ProfessionalLayout>
    );
  }

  // 🔧 ERRO COM LAYOUT
  if (!profileData || !readOnlyData) {
    return (
      <ProfessionalLayout>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Perfil não encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os dados do seu perfil.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </ProfessionalLayout>
    );
  }

  // 🔧 CONTEÚDO PRINCIPAL COM LAYOUT
  return (
    <ProfessionalLayout>
      <div className="space-y-6">
        {/* Header com controles */}
        <ProfileHeader
          isEditing={isEditing}
          activeTab={activeTab}
          saving={saving}
          hasUnsavedChanges={hasUnsavedChanges}
          onToggleEdit={toggleEditing}
          onSave={() => setShowSaveConfirm(true)}
          onCancel={handleCancelEdit}
          onChangeTab={handleChangeTab}
        />

        {/* Indicadores de progresso */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Completude do Perfil
            </span>
            <span className="text-sm font-bold text-blue-600">
              {profileCompleteness}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${profileCompleteness}%` }}
            ></div>
          </div>
          {missingFields.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Campos pendentes: {missingFields.join(", ")}
            </p>
          )}
        </div>

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === "preview" && (
          <ProfilePreview
            formData={formData}
            readOnlyData={readOnlyData}
            onStartEdit={handleStartEdit}
            profileCompleteness={profileCompleteness}
          />
        )}

        {activeTab === "edit" && (
          <ProfileEditForm
            formData={formData}
            readOnlyData={readOnlyData}
            errors={errors}
            uploadingPhoto={uploadingPhoto}
            onUpdateField={updateField}
            onUploadPhoto={uploadPhoto}
          />
        )}

        {/* Modal de confirmação para salvar */}
        {showSaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirmar Alterações
              </h3>
              <p className="text-gray-600 mb-6">
                Deseja salvar as alterações no seu perfil?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProfessionalLayout>
  );
}
