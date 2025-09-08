// viaa\src\hooks\useCep.ts

import { useState, useCallback } from "react";

interface EnderecoViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string; // estado
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface EnderecoFormatado {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export const useCep = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limparCep = (cep: string): string => {
    return cep.replace(/\D/g, "");
  };

  const validarCep = (cep: string): boolean => {
    const cepLimpo = limparCep(cep);
    return cepLimpo.length === 8;
  };

  const buscarCep = useCallback(
    async (cep: string): Promise<EnderecoFormatado | null> => {
      if (!validarCep(cep)) {
        setError("CEP inválido. Digite um CEP com 8 números.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const cepLimpo = limparCep(cep);
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`
        );

        if (!response.ok) {
          throw new Error("Erro na consulta do CEP");
        }

        const data: EnderecoViaCep = await response.json();

        if (data.erro) {
          throw new Error("CEP não encontrado");
        }

        // Formatar dados para o formulário
        const enderecoFormatado: EnderecoFormatado = {
          rua: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
          cep: data.cep || cep,
        };

        return enderecoFormatado;
      } catch (err: any) {
        const errorMessage = err.message || "Erro ao buscar CEP";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    buscarCep,
    loading,
    error,
    clearError,
    validarCep,
  };
};
