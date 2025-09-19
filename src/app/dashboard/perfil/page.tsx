// src/app/dashboard/perfil/page.tsx
// 🔧 PÁGINA DE PERFIL CORRIGIDA - Integração com hook atualizado

"use client";

import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useProfile } from "@/hooks/dashboard/useProfile";
import ProfileEditForm from "@/components/dashboard/professional/profile/ProfileEditForm";
import ProfileHeader from "@/components/dashboard/professional/profile/ProfileHeader";

export default function PerfilPage() {
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
  if (!profileData || !readOnlyData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Perfil não encontrado
          </h2>
          <p className="text-gray-600">
            Não foi possível carregar os dados do seu perfil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
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
        <div className="mb-6">
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
        </div>

        {/* Conteúdo baseado na aba ativa */}
        <div className="space-y-6">
          {activeTab === "preview" && profileData && readOnlyData && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="text-center mb-8">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {formData.foto_perfil_url ? (
                    <img
                      src={formData.foto_perfil_url}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-gray-400">👤</span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {readOnlyData.nome} {readOnlyData.sobrenome}
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                  {readOnlyData.tipo === "psicologo"
                    ? "Psicólogo(a)"
                    : readOnlyData.tipo === "psicanalista"
                    ? "Psicanalista"
                    : readOnlyData.tipo === "heike"
                    ? "Terapeuta Reiki"
                    : readOnlyData.tipo === "holistico"
                    ? "Terapeuta Holístico"
                    : "Coach/Mentor"}
                </p>
                {readOnlyData.verificado && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <span>✓</span> Perfil Verificado
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Especialidades
                  </h3>
                  <p className="text-gray-600">
                    {formData.especialidades || "Não informado"}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Localização
                  </h3>
                  <p className="text-gray-600">
                    {formData.endereco_cidade && formData.endereco_estado
                      ? `${formData.endereco_cidade}, ${formData.endereco_estado}`
                      : "Não informado"}
                  </p>
                </div>

                {formData.bio_profissional && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Biografia
                    </h3>
                    <p className="text-gray-600">{formData.bio_profissional}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={handleStartEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Editar Perfil
                </button>
              </div>
            </div>
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
        </div>

        {/* Modal de confirmação para salvar */}
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
                      {missingFields.length > 0 && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <strong>Campos pendentes:</strong>{" "}
                            {missingFields.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !canSave}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSaveConfirm(false)}
                    disabled={saving}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
