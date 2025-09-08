// viaa\src\components\forms\ProfissionalForm.tsx

"use client";
import React, { useState, useEffect } from "react";
import MaskedInput from "../ui/form/MaskedInput";
import FormProgressIndicator from "../ui/form/FormProgressIndicator";
import {
  InputField,
  SelectField,
  TextAreaField,
  useFormValidation,
} from "../ui/form/FormField";
import FormNavigationControls from "../ui/form/FormNavigationControls";
import DocumentUpload from "../ui/form/DocumentUpload";
import { useCep } from "../../hooks/useCep";
import type { TipoProfissional, TipoDocumento } from "../../types/database";

interface DocumentoUpload {
  id: string;
  arquivo: File;
  tipo: TipoDocumento;
  descricao?: string;
  preview?: string;
}

interface ProfissionalFormData {
  // Step 1: Dados Pessoais
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  email: string;
  // Step 2: Endereço
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  // Step 3: Profissional
  tipoProfissional: TipoProfissional | "";
  numeroRegistro: string;
  especialidades: string;
  anosExperiencia: string;
  linkLattes: string;
  // Step 4: Perfil
  miniBiografia: string;
  fotoPerfilUrl: string;
  linkLinkedin: string;
  linkInstagram: string;
  precoConsulta: string;
  disponibilidade: string;
}

interface ProfissionalFormProps {
  onSubmit: (
    dados: ProfissionalFormData & { documentos: DocumentoUpload[] }
  ) => Promise<void>;
  loading: boolean;
}

// Validadores atualizados
const validators = {
  nome: (value: string) => {
    if (!value?.trim()) return "Nome é obrigatório.";
    if (value.trim().length < 2)
      return "Nome deve ter pelo menos 2 caracteres.";
    return undefined;
  },
  sobrenome: (value: string) => {
    if (!value?.trim()) return "Sobrenome é obrigatório.";
    if (value.trim().length < 2)
      return "Sobrenome deve ter pelo menos 2 caracteres.";
    return undefined;
  },
  cpf: (value: string) => {
    if (!value?.trim()) return "CPF é obrigatório.";
    if (!validateCPF(value)) return "CPF inválido.";
    return undefined;
  },
  telefone: (value: string) => {
    if (!value?.trim()) return "Telefone é obrigatório.";
    if (!validatePhone(value)) return "Telefone inválido.";
    return undefined;
  },
  dataNascimento: (value: string) => {
    if (!value) return "Data de nascimento é obrigatória.";
    const birthDate = new Date(value);
    const today = new Date();
    if (isNaN(birthDate.getTime()) || birthDate >= today) {
      return "Data de nascimento inválida.";
    }
    return undefined;
  },
  email: (value: string) => {
    if (!value?.trim()) return "Email é obrigatório.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Email inválido.";
    return undefined;
  },
  cep: (value: string) => {
    if (!value?.trim()) return "CEP é obrigatório.";
    const cepRegex = /^\d{5}-?\d{3}$/;
    if (!cepRegex.test(value)) return "CEP inválido.";
    return undefined;
  },
  rua: (value: string) => {
    if (!value?.trim()) return "Rua é obrigatória.";
    return undefined;
  },
  numero: (value: string) => {
    if (!value?.trim()) return "Número é obrigatório.";
    return undefined;
  },
  bairro: (value: string) => {
    if (!value?.trim()) return "Bairro é obrigatório.";
    return undefined;
  },
  cidade: (value: string) => {
    if (!value?.trim()) return "Cidade é obrigatória.";
    return undefined;
  },
  estado: (value: string) => {
    if (!value?.trim()) return "Estado é obrigatório.";
    return undefined;
  },
  tipoProfissional: (value: string) => {
    if (!value?.trim()) return "Tipo de profissional é obrigatório.";
    return undefined;
  },
  // Registro é obrigatório APENAS para psicólogos - validação dinâmica no componente
  especialidades: (value: string) => {
    if (!value?.trim()) return "Especialidades são obrigatórias.";
    return undefined;
  },
  precoConsulta: (value: string) => {
    if (!value?.trim()) return "Preço da consulta é obrigatório.";
    const numValue = parseFloat(value.replace(",", "."));
    if (isNaN(numValue) || numValue <= 0)
      return "Preço deve ser um número válido maior que zero.";
    return undefined;
  },
};

// Utilitários de validação
const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0,
    remainder;
  for (let i = 1; i <= 9; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf.substring(10, 11));
};

const validatePhone = (phone: string): boolean => {
  phone = phone.replace(/\D/g, "");
  return phone.length === 10 || phone.length === 11;
};

// Máscaras
const formatPhone = (value: string): string => {
  value = value.replace(/\D/g, "");
  if (value.length > 11) value = value.substring(0, 11);
  if (value.length > 10) {
    return value.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (value.length > 6) {
    return value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (value.length > 2) {
    return value.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
  } else {
    return value.replace(/^(\d*)/, "($1");
  }
};

const formatCPF = (value: string): string => {
  value = value.replace(/\D/g, "");
  if (value.length > 11) value = value.substring(0, 11);
  return value
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export default function ProfissionalForm({
  onSubmit,
  loading,
}: ProfissionalFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [documentos, setDocumentos] = useState<DocumentoUpload[]>([]);
  const { buscarCep, loading: loadingCep, error: errorCep } = useCep();

  const initialData: ProfissionalFormData = {
    nome: "",
    sobrenome: "",
    cpf: "",
    telefone: "",
    dataNascimento: "",
    email: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    tipoProfissional: "",
    numeroRegistro: "",
    especialidades: "",
    anosExperiencia: "",
    linkLattes: "",
    miniBiografia: "",
    fotoPerfilUrl: "",
    linkLinkedin: "",
    linkInstagram: "",
    precoConsulta: "",
    disponibilidade: "",
  };

  const {
    data: formData,
    errors,
    touched,
    setValue,
    setTouched: markTouched,
    validateField,
    validateAll,
  } = useFormValidation(initialData, validators);

  const steps = [
    {
      id: 1,
      title: "Dados Pessoais",
      subtitle: "Informações básicas",
      icon: "📋",
    },
    {
      id: 2,
      title: "Endereço",
      subtitle: "Localização",
      icon: "📍",
    },
    {
      id: 3,
      title: "Profissional",
      subtitle: "Formação e Documentos",
      icon: "🎓",
    },
    {
      id: 4,
      title: "Perfil",
      subtitle: "Especialidades e Valores",
      icon: "⭐",
    },
  ];

  // Buscar CEP automaticamente
  const handleCepChange = async (cleanCep: string) => {
    const formattedCep = cleanCep.replace(/(\d{5})(\d{3})/, "$1-$2");
    setValue("cep", formattedCep);

    if (cleanCep.length === 8) {
      const endereco = await buscarCep(cleanCep);
      if (endereco) {
        setValue("rua", endereco.rua);
        setValue("bairro", endereco.bairro);
        setValue("cidade", endereco.cidade);
        setValue("estado", endereco.estado);
      }
    }
  };

  const validateCurrentStep = (): boolean => {
    const stepFields = {
      1: [
        "nome",
        "sobrenome",
        "cpf",
        "telefone",
        "dataNascimento",
        "email",
      ] as const,
      2: ["cep", "rua", "numero", "bairro", "cidade", "estado"] as const,
      3: ["tipoProfissional", "especialidades"] as const,
      4: ["precoConsulta"] as const,
    };

    const fieldsToValidate = stepFields[currentStep as keyof typeof stepFields];
    let isValid = true;

    fieldsToValidate.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
      markTouched(field);
    });

    // Validação especial para registro profissional (obrigatório só para psicólogos)
    if (currentStep === 3 && formData.tipoProfissional === "psicologo") {
      if (!formData.numeroRegistro?.trim()) {
        markTouched("numeroRegistro");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev: number) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev: number) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (validateAll()) {
      // Validação final dos documentos
      if (documentos.length === 0) {
        alert("É necessário adicionar pelo menos um documento comprobatório.");
        return;
      }

      await onSubmit({ ...formData, documentos });
    }
  };

  const tiposProfissional: { value: TipoProfissional; label: string }[] = [
    { value: "psicologo", label: "Psicólogo" },
    { value: "psicanalista", label: "Psicanalista" },
    { value: "heike", label: "Terapeuta Heike" },
    { value: "holistico", label: "Terapeuta Holístico" },
    { value: "coach_mentor", label: "Coach ou Mentor" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <FormProgressIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
        allowStepNavigation={true}
      />

      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">{steps[currentStep - 1].icon}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-lg text-gray-600">
            {steps[currentStep - 1].subtitle}
          </p>
        </div>

        <form className="space-y-8">
          {/* ETAPA 1: DADOS PESSOAIS */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InputField
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={(value) => setValue("nome", value)}
                onBlur={() => markTouched("nome")}
                placeholder="Digite seu nome"
                required
                error={touched.nome ? errors.nome : undefined}
                icon="✏️"
              />

              <InputField
                label="Sobrenome"
                name="sobrenome"
                value={formData.sobrenome}
                onChange={(value) => setValue("sobrenome", value)}
                onBlur={() => markTouched("sobrenome")}
                placeholder="Digite seu sobrenome"
                required
                error={touched.sobrenome ? errors.sobrenome : undefined}
                icon="✏️"
              />

              <InputField
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={(value) => setValue("cpf", value)}
                onBlur={() => markTouched("cpf")}
                placeholder="000.000.000-00"
                mask={formatCPF}
                required
                error={touched.cpf ? errors.cpf : undefined}
                icon="📄"
              />

              <InputField
                label="Telefone"
                name="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(value) => setValue("telefone", value)}
                onBlur={() => markTouched("telefone")}
                placeholder="(00) 00000-0000"
                mask={formatPhone}
                required
                error={touched.telefone ? errors.telefone : undefined}
                icon="📱"
              />

              <InputField
                label="Data de Nascimento"
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(value) => setValue("dataNascimento", value)}
                onBlur={() => markTouched("dataNascimento")}
                required
                error={
                  touched.dataNascimento ? errors.dataNascimento : undefined
                }
                icon="📅"
              />

              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(value) => setValue("email", value)}
                onBlur={() => markTouched("email")}
                placeholder="seu@email.com"
                required
                error={touched.email ? errors.email : undefined}
                icon="✉️"
              />
            </div>
          )}

          {/* ETAPA 2: ENDEREÇO COM CEP AUTOMÁTICO */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  CEP <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MaskedInput
                    mask="99999-999"
                    value={formData.cep}
                    onChange={handleCepChange}
                    onBlur={() => markTouched("cep")}
                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:border-orange-500 focus:ring-0 transition-all duration-300 text-lg placeholder-gray-400 hover:border-gray-300 ${
                      touched.cep && errors.cep
                        ? "border-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="00000-000"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-2xl">📮</span>
                  </div>
                  {loadingCep && (
                    <div className="absolute inset-y-0 right-12 pr-4 flex items-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {touched.cep && errors.cep && (
                  <p className="mt-2 text-sm text-red-500">{errors.cep}</p>
                )}
                {errorCep && (
                  <p className="mt-2 text-sm text-red-500">{errorCep}</p>
                )}
              </div>

              <InputField
                label="Rua"
                name="rua"
                value={formData.rua}
                onChange={(value) => setValue("rua", value)}
                onBlur={() => markTouched("rua")}
                placeholder="Ex: Av. Paulista"
                required
                error={touched.rua ? errors.rua : undefined}
                icon="🛣️"
              />

              <InputField
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={(value) => setValue("numero", value)}
                onBlur={() => markTouched("numero")}
                placeholder="123"
                required
                error={touched.numero ? errors.numero : undefined}
                icon="🔢"
              />

              <InputField
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={(value) => setValue("complemento", value)}
                placeholder="Ex: Apt 101 (Opcional)"
                icon="🚪"
              />

              <InputField
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={(value) => setValue("bairro", value)}
                onBlur={() => markTouched("bairro")}
                placeholder="Ex: Centro"
                required
                error={touched.bairro ? errors.bairro : undefined}
                icon="🏘️"
              />

              <InputField
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={(value) => setValue("cidade", value)}
                onBlur={() => markTouched("cidade")}
                placeholder="Ex: São Paulo"
                required
                error={touched.cidade ? errors.cidade : undefined}
                icon="🏙️"
              />

              <InputField
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={(value) => setValue("estado", value)}
                onBlur={() => markTouched("estado")}
                placeholder="Ex: SP"
                required
                error={touched.estado ? errors.estado : undefined}
                icon="🗺️"
              />
            </div>
          )}

          {/* ETAPA 3: PROFISSIONAL COM UPLOAD DE DOCUMENTOS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SelectField
                  label="Tipo de Profissional"
                  name="tipoProfissional"
                  value={formData.tipoProfissional}
                  onChange={(value) =>
                    setValue("tipoProfissional", value as TipoProfissional)
                  }
                  options={tiposProfissional}
                  placeholder="Selecione seu tipo"
                  required
                  error={
                    touched.tipoProfissional
                      ? errors.tipoProfissional
                      : undefined
                  }
                  icon="🏛️"
                />

                {/* Registro obrigatório apenas para psicólogos */}
                <InputField
                  label={`Número de Registro ${
                    formData.tipoProfissional === "psicologo"
                      ? "*"
                      : "(Opcional)"
                  }`}
                  name="numeroRegistro"
                  value={formData.numeroRegistro}
                  onChange={(value) => setValue("numeroRegistro", value)}
                  onBlur={() => markTouched("numeroRegistro")}
                  placeholder={
                    formData.tipoProfissional === "psicologo"
                      ? "Ex: CRP 06/123456"
                      : "Se houver"
                  }
                  required={formData.tipoProfissional === "psicologo"}
                  error={
                    touched.numeroRegistro &&
                    formData.tipoProfissional === "psicologo" &&
                    !formData.numeroRegistro?.trim()
                      ? "Número de registro é obrigatório para psicólogos"
                      : undefined
                  }
                  icon="🆔"
                />

                <InputField
                  label="Anos de Experiência"
                  name="anosExperiencia"
                  type="number"
                  value={formData.anosExperiencia}
                  onChange={(value) => setValue("anosExperiencia", value)}
                  placeholder="Ex: 5"
                  icon="🗓️"
                />

                <InputField
                  label="Link para Currículo Lattes"
                  name="linkLattes"
                  type="url"
                  value={formData.linkLattes}
                  onChange={(value) => setValue("linkLattes", value)}
                  placeholder="https://lattes.cnpq.br/... (Opcional)"
                  icon="🔗"
                />
              </div>

              <TextAreaField
                label="Especialidade(s)"
                name="especialidades"
                value={formData.especialidades}
                onChange={(value) => setValue("especialidades", value)}
                onBlur={() => markTouched("especialidades")}
                placeholder="Descreva suas especialidades e abordagens terapêuticas..."
                rows={3}
                required
                error={
                  touched.especialidades ? errors.especialidades : undefined
                }
                icon="🧠"
              />

              {/* Upload de Documentos */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Documentos Comprobatórios *
                </h3>
                <p className="text-gray-600 mb-6">
                  Anexe seus diplomas, certificados e comprovantes de registro
                  profissional. Estes documentos serão analisados pela nossa
                  equipe.
                </p>
                <DocumentUpload
                  documentos={documentos}
                  onChange={setDocumentos}
                  maxFiles={15}
                  maxSizePerFile={10}
                />
              </div>
            </div>
          )}

          {/* ETAPA 4: PERFIL */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <TextAreaField
                label="Mini Biografia (Opcional)"
                name="miniBiografia"
                value={formData.miniBiografia}
                onChange={(value) => setValue("miniBiografia", value)}
                placeholder="Conte um pouco sobre você e sua abordagem profissional..."
                rows={4}
                error={touched.miniBiografia ? errors.miniBiografia : undefined}
                icon="✏️"
              />

              <InputField
                label="Foto de Perfil (URL)"
                name="fotoPerfilUrl"
                type="url"
                value={formData.fotoPerfilUrl}
                onChange={(value) => setValue("fotoPerfilUrl", value)}
                placeholder="Cole a URL da sua foto de perfil aqui"
                icon="📸"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InputField
                  label="LinkedIn"
                  name="linkLinkedin"
                  type="url"
                  value={formData.linkLinkedin}
                  onChange={(value) => setValue("linkLinkedin", value)}
                  placeholder="https://linkedin.com/in/seu-perfil (Opcional)"
                  icon="💼"
                />

                <InputField
                  label="Instagram"
                  name="linkInstagram"
                  type="url"
                  value={formData.linkInstagram}
                  onChange={(value) => setValue("linkInstagram", value)}
                  placeholder="https://instagram.com/seu-perfil (Opcional)"
                  icon="📸"
                />

                <InputField
                  label="Preço da Consulta (R$)"
                  name="precoConsulta"
                  value={formData.precoConsulta}
                  onChange={(value) => setValue("precoConsulta", value)}
                  onBlur={() => markTouched("precoConsulta")}
                  placeholder="Ex: 150,00"
                  required
                  error={
                    touched.precoConsulta ? errors.precoConsulta : undefined
                  }
                  icon="💰"
                />

                <InputField
                  label="Disponibilidade"
                  name="disponibilidade"
                  value={formData.disponibilidade}
                  onChange={(value) => setValue("disponibilidade", value)}
                  placeholder="Ex: Seg a Sex, 9h-18h (Opcional)"
                  icon="⏰"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      <FormNavigationControls
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevious={handlePrevStep}
        onNext={handleNextStep}
        onSubmit={handleSubmit}
        loading={loading}
        canGoNext={true}
        canGoPrevious={true}
        nextLabel="Próximo"
        previousLabel="Anterior"
        submitLabel="Finalizar Cadastro"
      />
    </div>
  );
}
