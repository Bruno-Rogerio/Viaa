// components/forms/CadastroPacienteForm.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { cpf as cpfValidator } from "cpf-cnpj-validator";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useSupabase";

// Schema ajustado para bater com o banco
const pacienteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  sobrenome: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  data_nascimento: z.string().refine((date) => {
    const nascimento = new Date(date);
    const hoje = new Date();
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    return idade >= 16 && idade <= 100;
  }, "Idade deve estar entre 16 e 100 anos"),
  telefone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone inválido"),
  cpf: z
    .string()
    .transform((val) => val.replace(/[^\d]/g, ""))
    .refine(cpfValidator.isValid, "CPF inválido"),
  // Campos opcionais que existem no banco
  contato_emergencia_nome: z.string().optional(),
  contato_emergencia_telefone: z.string().optional(),
  contato_emergencia_parentesco: z.string().optional(),
  aceita_notificacoes: z.boolean().default(true),
  privacidade: z.enum(["public", "private"]).default("private"),
});

type PacienteFormData = z.infer<typeof pacienteSchema>;

interface Props {
  onSubmit: (data: PacienteFormData) => Promise<void>;
}

export function CadastroPacienteForm({ onSubmit }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<PacienteFormData>>({
    aceita_notificacoes: true,
    privacidade: "private",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof PacienteFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrors({ geral: "Você precisa estar logado para se cadastrar" });
      return;
    }

    setIsSubmitting(true);

    try {
      const validatedData = pacienteSchema.parse(formData);
      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ geral: "Erro ao criar conta. Tente novamente." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Complete seu Perfil de Paciente
      </h2>

      {errors.geral && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errors.geral}
        </div>
      )}

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

        {/* Contato de Emergência */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Contato de Emergência (Opcional)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Contato
              </label>
              <input
                type="text"
                value={formData.contato_emergencia_nome || ""}
                onChange={(e) =>
                  handleInputChange("contato_emergencia_nome", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parentesco
              </label>
              <input
                type="text"
                value={formData.contato_emergencia_parentesco || ""}
                onChange={(e) =>
                  handleInputChange(
                    "contato_emergencia_parentesco",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Mãe, Pai, Irmão..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone do Contato
            </label>
            <input
              type="tel"
              value={formData.contato_emergencia_telefone || ""}
              onChange={(e) =>
                handleInputChange("contato_emergencia_telefone", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        {/* Configurações */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Configurações</h3>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.aceita_notificacoes || false}
                onChange={(e) =>
                  handleInputChange("aceita_notificacoes", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
              />
              <span className="ml-2 text-sm text-gray-700">
                Aceito receber notificações sobre consultas e conteúdos
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacidade do Perfil
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacidade"
                    value="private"
                    checked={formData.privacidade === "private"}
                    onChange={(e) =>
                      handleInputChange(
                        "privacidade",
                        e.target.value as "public" | "private"
                      )
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Privado - Apenas profissionais podem me encontrar
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacidade"
                    value="public"
                    checked={formData.privacidade === "public"}
                    onChange={(e) =>
                      handleInputChange(
                        "privacidade",
                        e.target.value as "public" | "private"
                      )
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Público - Posso aparecer em buscas da plataforma
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Envio */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting
              ? "Criando seu perfil..."
              : "Criar Perfil de Paciente"}
          </button>
        </div>
      </form>
    </div>
  );
}
