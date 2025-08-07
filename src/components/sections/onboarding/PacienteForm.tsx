// components/onboarding/PacienteForm.tsx
"use client";
import { useState, useEffect } from "react";

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
  onSubmit: (dados: FormData) => void;
  loading: boolean;
}

export default function PacienteForm({ onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<FormData>({
    nome_completo: "",
    genero: "",
    cpf: "",
    telefone: "",
    estado: "",
    cidade: "",
    data_nascimento: "",
  });

  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);

  // Carregar estados ao montar o componente
  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    )
      .then((response) => response.json())
      .then((data) => setEstados(data))
      .catch((error) => console.error("Erro ao carregar estados:", error));
  }, []);

  // Carregar cidades quando estado mudar
  useEffect(() => {
    if (formData.estado) {
      setLoadingCidades(true);
      setCidades([]);
      setFormData((prev) => ({ ...prev, cidade: "" })); // Limpar cidade selecionada

      fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios?orderBy=nome`
      )
        .then((response) => response.json())
        .then((data) => setCidades(data))
        .catch((error) => console.error("Erro ao carregar cidades:", error))
        .finally(() => setLoadingCidades(false));
    }
  }, [formData.estado]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome Completo */}
      <div>
        <label className="block text-sm font-medium mb-1">Nome Completo</label>
        <input
          type="text"
          name="nome_completo"
          value={formData.nome_completo}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Gênero */}
      <div>
        <label className="block text-sm font-medium mb-1">Gênero</label>
        <select
          name="genero"
          value={formData.genero}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          required
        >
          <option value="">Selecione seu gênero</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outro">Outro</option>
          <option value="prefiro_nao_informar">Prefiro não informar</option>
        </select>
      </div>

      {/* Data de Nascimento */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Data de Nascimento
        </label>
        <input
          type="date"
          name="data_nascimento"
          value={formData.data_nascimento}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* CPF */}
      <div>
        <label className="block text-sm font-medium mb-1">CPF</label>
        <input
          type="text"
          name="cpf"
          value={formData.cpf}
          onChange={handleChange}
          placeholder="000.000.000-00"
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Telefone */}
      <div>
        <label className="block text-sm font-medium mb-1">Telefone</label>
        <input
          type="tel"
          name="telefone"
          value={formData.telefone}
          onChange={handleChange}
          placeholder="(11) 99999-9999"
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Estado e Cidade na mesma linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          >
            <option value="">Selecione um estado</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.sigla}>
                {estado.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cidade</label>
          <select
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            disabled={!formData.estado || loadingCidades}
            required
          >
            <option value="">
              {!formData.estado
                ? "Selecione um estado primeiro"
                : loadingCidades
                ? "Carregando cidades..."
                : "Selecione uma cidade"}
            </option>
            {cidades.map((cidade) => (
              <option key={cidade.id} value={cidade.nome}>
                {cidade.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Completar Cadastro"}
      </button>
    </form>
  );
}
