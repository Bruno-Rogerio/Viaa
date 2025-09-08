// viaa\src\components\forms\PacienteForm.tsx

"use client";
import { useState, useEffect } from "react";
import FormProgressIndicator from "../ui/form/FormProgressIndicator";
import {
  InputField,
  SelectField,
  useFormValidation,
} from "../ui/form/FormField";
import FormNavigationControls from "../ui/form/FormNavigationControls";

interface FormData {
  nome_completo: string;
  genero: string;
  cpf: string;
  telefone: string;
  estado: string;
  cidade: string;
  data_nascimento: string;
}

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

interface Props {
  onSubmit: (dados: FormData) => Promise<void>;
  loading: boolean;
}

// Validadores
const validators = {
  nome_completo: (value: string) => {
    if (!value?.trim()) return "Nome completo é obrigatório.";
    if (value.trim().length < 2)
      return "Nome deve ter pelo menos 2 caracteres.";
    return undefined;
  },
  genero: (value: string) => {
    if (!value) return "Gênero é obrigatório.";
    return undefined;
  },
  data_nascimento: (value: string) => {
    if (!value) return "Data de nascimento é obrigatória.";
    const birthDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(birthDate.getTime()) || birthDate >= today) {
      return "Data de nascimento inválida ou no futuro.";
    }
    return undefined;
  },
  cpf: (value: string) => {
    if (!value?.trim()) return "CPF é obrigatório.";
    if (!validateCPF(value)) return "CPF inválido.";
    return undefined;
  },
  telefone: (value: string) => {
    if (!value?.trim()) return "Telefone é obrigatório.";
    if (!validatePhone(value))
      return "Telefone inválido (DDD + 8 ou 9 dígitos).";
    return undefined;
  },
  estado: (value: string) => {
    if (!value) return "Estado é obrigatório.";
    return undefined;
  },
  cidade: (value: string) => {
    if (!value) return "Cidade é obrigatória.";
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

export default function PacienteForm({ onSubmit, loading }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const initialData: FormData = {
    nome_completo: "",
    genero: "",
    cpf: "",
    telefone: "",
    estado: "",
    cidade: "",
    data_nascimento: "",
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
      icon: "👤",
    },
    {
      id: 2,
      title: "Contato e Localização",
      subtitle: "Endereço e contato",
      icon: "📍",
    },
  ];

  // Carregar estados
  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    )
      .then((response) => response.json())
      .then((data: Estado[]) => setEstados(data))
      .catch((error) => console.error("Erro ao carregar estados:", error));
  }, []);

  // Carregar cidades quando estado muda
  useEffect(() => {
    if (formData.estado) {
      setLoadingCidades(true);
      setCidades([]);
      setValue("cidade", "");

      fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios?orderBy=nome`
      )
        .then((response) => response.json())
        .then((data: Cidade[]) => setCidades(data))
        .catch((error) => console.error("Erro ao carregar cidades:", error))
        .finally(() => setLoadingCidades(false));
    }
  }, [formData.estado, setValue]);

  const validateCurrentStep = (): boolean => {
    const step1Fields = ["nome_completo", "genero", "data_nascimento"] as const;
    const step2Fields = ["cpf", "telefone", "estado", "cidade"] as const;

    const fieldsToValidate = currentStep === 1 ? step1Fields : step2Fields;

    let isValid = true;
    fieldsToValidate.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
      markTouched(field);
    });

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
      try {
        await onSubmit(formData);
        setSuccessMessage("Cadastro realizado com sucesso!");
      } catch (error) {
        console.error("Erro ao enviar formulário:", error);
      }
    }
  };

  const generoOptions = [
    { value: "masculino", label: "Masculino" },
    { value: "feminino", label: "Feminino" },
    { value: "outro", label: "Outro" },
    { value: "prefiro_nao_informar", label: "Prefiro não informar" },
  ];

  const estadoOptions = estados.map((estado: Estado) => ({
    value: estado.sigla,
    label: estado.nome,
  }));

  const cidadeOptions = cidades.map((cidade: Cidade) => ({
    value: cidade.nome,
    label: cidade.nome,
  }));

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
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InputField
                label="Nome Completo"
                name="nome_completo"
                type="text"
                value={formData.nome_completo}
                onChange={(value) => setValue("nome_completo", value)}
                onBlur={() => markTouched("nome_completo")}
                placeholder="Digite seu nome completo"
                required
                error={touched.nome_completo ? errors.nome_completo : undefined}
                icon="✏️"
              />

              <SelectField
                label="Gênero"
                name="genero"
                value={formData.genero}
                onChange={(value) => setValue("genero", value)}
                options={generoOptions}
                placeholder="Selecione seu gênero"
                required
                error={touched.genero ? errors.genero : undefined}
                icon="🚻"
              />

              <div className="lg:col-span-2">
                <InputField
                  label="Data de Nascimento"
                  name="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(value) => setValue("data_nascimento", value)}
                  onBlur={() => markTouched("data_nascimento")}
                  required
                  error={
                    touched.data_nascimento ? errors.data_nascimento : undefined
                  }
                  icon="📅"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InputField
                label="CPF"
                name="cpf"
                type="text"
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

              <SelectField
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={(value) => setValue("estado", value)}
                options={estadoOptions}
                placeholder="Selecione um estado"
                required
                error={touched.estado ? errors.estado : undefined}
                icon="🗺️"
              />

              <SelectField
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={(value) => setValue("cidade", value)}
                options={cidadeOptions}
                placeholder={
                  !formData.estado
                    ? "Selecione um estado primeiro"
                    : loadingCidades
                    ? "Carregando cidades..."
                    : "Selecione uma cidade"
                }
                loading={loadingCidades}
                disabled={!formData.estado || loadingCidades}
                required
                error={touched.cidade ? errors.cidade : undefined}
                icon="🏙️"
              />
            </div>
          )}
        </form>

        {successMessage && (
          <div className="mt-8 mb-6 text-center font-bold text-green-600 text-lg bg-green-100 px-6 py-4 rounded-2xl">
            {successMessage}
          </div>
        )}
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
        submitLabel="Finalizar"
      />
    </div>
  );
}
