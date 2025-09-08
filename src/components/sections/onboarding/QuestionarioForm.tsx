// viaa\src\components\sections\onboarding\QuestionarioForm.tsx

"use client";
import { useState } from "react";

interface Props {
  onSubmit: (dados: any) => void;
  onSkip: () => void;
  loading: boolean;
}

export default function QuestionarioForm({ onSubmit, onSkip, loading }: Props) {
  const [formData, setFormData] = useState({
    motivacao: "",
    tempo_necessidade: "",
    terapia_anterior: "",
    tempo_terapia_anterior: "",
    motivo_interrupcao: "",
    dificuldades_sono: "",
    apoio_familiar: "",
    areas_trabalhar: [] as string[],
    areas_trabalhar_outros: "",
    preferencia_genero: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      areas_trabalhar: prev.areas_trabalhar.includes(area)
        ? prev.areas_trabalhar.filter((a) => a !== area)
        : [...prev.areas_trabalhar, area],
    }));
  };

  const areasDisponiveis = [
    "Ansiedade",
    "Depressão",
    "Relacionamentos",
    "Autoestima",
    "Trabalho/Carreira",
    "Família",
    "Luto",
    "Trauma",
    "Sono",
    "Outros",
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Questionário de Avaliação
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Motivação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            O que te motiva a buscar terapia? *
          </label>
          <textarea
            value={formData.motivacao}
            onChange={(e) => handleInputChange("motivacao", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Descreva sua motivação..."
            required
          />
        </div>

        {/* Tempo de necessidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Há quanto tempo sente essa necessidade? *
          </label>
          <select
            value={formData.tempo_necessidade}
            onChange={(e) =>
              handleInputChange("tempo_necessidade", e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Selecione uma opção</option>
            <option value="menos_1_mes">Menos de 1 mês</option>
            <option value="1_3_meses">1 a 3 meses</option>
            <option value="3_6_meses">3 a 6 meses</option>
            <option value="6_12_meses">6 meses a 1 ano</option>
            <option value="mais_1_ano">Mais de 1 ano</option>
          </select>
        </div>

        {/* Terapia anterior */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Já fez terapia antes? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="terapia_anterior"
                value="sim"
                checked={formData.terapia_anterior === "sim"}
                onChange={(e) =>
                  handleInputChange("terapia_anterior", e.target.value)
                }
                className="mr-2"
              />
              Sim
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="terapia_anterior"
                value="nao"
                checked={formData.terapia_anterior === "nao"}
                onChange={(e) =>
                  handleInputChange("terapia_anterior", e.target.value)
                }
                className="mr-2"
              />
              Não
            </label>
          </div>
        </div>

        {/* Campos condicionais se já fez terapia */}
        {formData.terapia_anterior === "sim" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Por quanto tempo fez terapia?
              </label>
              <input
                type="text"
                value={formData.tempo_terapia_anterior}
                onChange={(e) =>
                  handleInputChange("tempo_terapia_anterior", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 1 ano, 6 meses..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Por que parou a terapia anterior?
              </label>
              <input
                type="text"
                value={formData.motivo_interrupcao}
                onChange={(e) =>
                  handleInputChange("motivo_interrupcao", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva o motivo..."
              />
            </div>
          </>
        )}

        {/* Dificuldades de sono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tem dificuldades para dormir? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="dificuldades_sono"
                value="sim"
                checked={formData.dificuldades_sono === "sim"}
                onChange={(e) =>
                  handleInputChange("dificuldades_sono", e.target.value)
                }
                className="mr-2"
              />
              Sim
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="dificuldades_sono"
                value="nao"
                checked={formData.dificuldades_sono === "nao"}
                onChange={(e) =>
                  handleInputChange("dificuldades_sono", e.target.value)
                }
                className="mr-2"
              />
              Não
            </label>
          </div>
        </div>

        {/* Apoio familiar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sente que tem apoio familiar? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="apoio_familiar"
                value="sim"
                checked={formData.apoio_familiar === "sim"}
                onChange={(e) =>
                  handleInputChange("apoio_familiar", e.target.value)
                }
                className="mr-2"
              />
              Sim
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="apoio_familiar"
                value="nao"
                checked={formData.apoio_familiar === "nao"}
                onChange={(e) =>
                  handleInputChange("apoio_familiar", e.target.value)
                }
                className="mr-2"
              />
              Não
            </label>
          </div>
        </div>

        {/* Áreas para trabalhar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quais áreas gostaria de trabalhar? (Selecione todas que se aplicam)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {areasDisponiveis.map((area) => (
              <label key={area} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.areas_trabalhar.includes(area)}
                  onChange={() => handleCheckboxChange(area)}
                  className="mr-2"
                />
                {area}
              </label>
            ))}
          </div>
        </div>

        {/* Campo adicional se selecionou "Outros" */}
        {formData.areas_trabalhar.includes("Outros") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especifique outras áreas:
            </label>
            <input
              type="text"
              value={formData.areas_trabalhar_outros}
              onChange={(e) =>
                handleInputChange("areas_trabalhar_outros", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva outras áreas..."
            />
          </div>
        )}

        {/* Preferência de gênero */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tem preferência pelo gênero do terapeuta?
          </label>
          <select
            value={formData.preferencia_genero}
            onChange={(e) =>
              handleInputChange("preferencia_genero", e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Não tenho preferência</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="nao_binario">Não-binário</option>
          </select>
        </div>

        {/* Botões */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onSkip}
            disabled={loading}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Pular por agora
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Finalizar"}
          </button>
        </div>
      </form>
    </div>
  );
}
