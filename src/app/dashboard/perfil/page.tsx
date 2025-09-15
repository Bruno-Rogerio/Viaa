// src/app/dashboard/perfil/page.tsx
// 🔧 VERSÃO ATUALIZADA - Usando ProfileHeader mobile-friendly

"use client";

import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useProfile } from "@/hooks/dashboard/useProfile";
import ProfilePreview from "@/components/dashboard/professional/profile/ProfilePreview";
import ProfileEditForm from "@/components/dashboard/professional/profile/ProfileEditForm";
import ProfileHeader from "@/components/dashboard/professional/profile/ProfileHeader";

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

  const handleChangeTab = (tab: "preview" | "edit") => {
    if (tab === "edit" && !isEditing) {
      toggleEditing();
    }
    setActiveTab(tab);
  };

  // Verificar se há mudanças não salvas
  const hasUnsavedChanges = isEditing && Object.keys(errors).length === 0;

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
      <div className="card-mobile">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="title-mobile-lg text-gray-900 mb-2">
            Perfil não encontrado
          </h2>
          <p className="text-mobile-base text-gray-600">
            Não foi possível carregar os dados do seu perfil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-safe-container space-y-6">
      {/* 🔧 USAR O NOVO PROFILEHEADER */}
      <ProfileHeader
        isEditing={isEditing}
        activeTab={activeTab}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
        onToggleEdit={toggleEditing}
        onSave={handleSave}
        onCancel={handleCancelEdit}
        onChangeTab={handleChangeTab}
      />

      {/* 🔧 CONTEÚDO RESPONSIVO */}
      <div className="space-y-6">
        {activeTab === "preview" && (
          <div className="card-mobile">
            <ProfilePreview profileData={profileData} />
          </div>
        )}

        {activeTab === "edit" && isEditing && (
          <div className="card-mobile">
            <ProfileEditForm
              formData={formData}
              errors={errors}
              uploadingPhoto={uploadingPhoto}
              onUpdateField={updateField}
              onUploadPhoto={uploadPhoto}
            />
          </div>
        )}
      </div>

      {/* 🔧 MODAL DE CONFIRMAÇÃO DE SALVAMENTO */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Salvar alterações
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Deseja salvar as alterações feitas no seu perfil?
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔧 TOAST DE SUCESSO/ERRO */}
      {saving && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-900">
              Salvando alterações...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
