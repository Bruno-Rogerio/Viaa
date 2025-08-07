// components/forms/CadastroProfissionalForm.tsx
"use client";
import { useState } from "react";
import { z } from "zod";
import { cpf as cpfValidator } from "cpf-cnpj-validator";

// Tipos de profissionais
export const TIPOS_PROFISSIONAIS = [
  { value: "psicologo", label: "Psicólogo" },
  { value: "psicanalista", label: "Psicanalista" },
  { value: "terapeuta_holistico", label: "Terapeuta Holístico" },
  { value: "terapeuta_transpessoal", label: "Terapeuta Transpessoal" },
  { value: "constelador_familiar", label: "Constelador Familiar" },
  { value: "coach", label: "Coach" },
  { value: "hipnoterapeuta", label: "Hipnoterapeuta" },
  { value: "reikiano", label: "Reikiano" },
  { value: "fitoterapeuta", label: "Fitoterapeuta" },
] as const;

// Schema de validação
const profissionalSchema = z
  .object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    sobrenome: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
    data_nascimento: z.string().refine((date) => {
      const nascimento = new Date(date);
      const hoje = new Date();
      const idade = hoje.getFullYear() - nascimento.getFullYear();
      return idade >= 18 && idade <= 100;
    }, "Idade deve estar entre 18 e 100 anos"),
    telefone: z
      .string()
      .min(10, "Telefone deve ter pelo menos 10 dígitos")
      .max(15, "Telefone inválido"),
    cpf: z
      .string()
      .transform((val) => val.replace(/[^\d]/g, ""))
      .refine(cpfValidator.isValid, "CPF inválido"),
    tipo: z.enum([
      "psicologo",
      "psicanalista",
      "terapeuta_holistico",
      "terapeuta_transpessoal",
      "constelador_familiar",
      "coach",
      "hipnoterapeuta",
      "reikiano",
      "fitoterapeuta",
    ]),
    especialidades: z
      .string()
      .min(10, "Descreva suas especialidades com pelo menos 10 caracteres"),
    crp: z.string().optional(),
  })
  .refine(
    (data) => {
      // CRP é obrigatório apenas para psicólogos
      if (data.tipo === "psicologo" && (!data.crp || data.crp.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "CRP é obrigatório para psicólogos",
      path: ["crp"],
    }
  );

type ProfissionalFormData = z.infer<typeof profissionalSchema>;

export function CadastroProfissionalForm({
  onSubmit,
}: {
  onSubmit: (data: ProfissionalFormData) => void;
}) {
  const [formData, setFormData] = useState<Partial<ProfissionalFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof ProfissionalFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Remove erro do campo quando usuário digita
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedData = profissionalSchema.parse(formData);
      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          // Mudança aqui: error.issues em vez de error.errors
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verifica se o tipo selecionado é psicólogo
  const isPsicologo = formData.tipo === "psicologo";

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Cadastro de Profissional
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Dados Pessoais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={formData.nome || ""}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nome ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Seu nome"
              />
              {errors.nome && (
                <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sobrenome *
              </label>
              <input
                type="text"
                value={formData.sobrenome || ""}
                onChange={(e) => handleInputChange("sobrenome", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.sobrenome ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Seu sobrenome"
              />
              {errors.sobrenome && (
                <p className="text-red-500 text-sm mt-1">{errors.sobrenome}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={formData.data_nascimento || ""}
                onChange={(e) =>
                  handleInputChange("data_nascimento", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.data_nascimento ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.data_nascimento && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.data_nascimento}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                value={formData.cpf || ""}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cpf ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {errors.cpf && (
                <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <input
              type="tel"
              value={formData.telefone || ""}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.telefone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="(11) 99999-9999"
            />
            {errors.telefone && (
              <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>
            )}
          </div>
        </div>

        {/* Dados Profissionais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Dados Profissionais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Profissional *
              </label>
              <select
                value={formData.tipo || ""}
                onChange={(e) => handleInputChange("tipo", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tipo ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Selecione...</option>
                {TIPOS_PROFISSIONAIS.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              {errors.tipo && (
                <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>
              )}
            </div>

            {isPsicologo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CRP *{" "}
                  <span className="text-xs text-gray-500">
                    (obrigatório para psicólogos)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.crp || ""}
                  onChange={(e) => handleInputChange("crp", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.crp ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: 12/34567"
                />
                {errors.crp && (
                  <p className="text-red-500 text-sm mt-1">{errors.crp}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidades *
            </label>
            <textarea
              value={formData.especialidades || ""}
              onChange={(e) =>
                handleInputChange("especialidades", e.target.value)
              }
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.especialidades ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Descreva suas especialidades, abordagens terapêuticas, formações complementares, etc..."
            />
            {errors.especialidades && (
              <p className="text-red-500 text-sm mt-1">
                {errors.especialidades}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Ex: Terapia Cognitivo-Comportamental, ansiedade, depressão,
              relacionamentos, etc.
            </p>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">
            📋 Próximos passos:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Seu cadastro passará por verificação da equipe Viaa</li>
            <li>• Você receberá um e-mail quando for aprovado</li>
            <li>
              • Após aprovação, poderá configurar seu perfil e começar a atender
            </li>
          </ul>
        </div>

        {/* Botão de Envio */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting
              ? "Enviando cadastro..."
              : "Criar Conta de Profissional"}
          </button>
        </div>
      </form>
    </div>
  );
}
