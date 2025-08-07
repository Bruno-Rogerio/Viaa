// src/hooks/useOnboarding.ts
import { useState } from "react";
import { supabase } from "../lib/supabase/client";

type TipoUsuario = "paciente" | "profissional" | "clinica" | "empresa";

export const useOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const salvarTipoUsuario = async (tipo: TipoUsuario) => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuário não encontrado");

      const { error } = await supabase.auth.updateUser({
        data: { tipo_usuario: tipo },
      });

      if (error) throw error;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const criarPerfilPaciente = async (dados: any) => {
    setLoading(true);
    setError(null);

    try {
      console.log("=== INÍCIO DEBUG ===");
      console.log("Dados recebidos:", JSON.stringify(dados, null, 2));

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Erro ao buscar usuário:", userError);
        throw userError;
      }

      if (!user) {
        console.error("Usuário não encontrado");
        throw new Error("Usuário não encontrado");
      }

      // VERIFICAR SE JÁ EXISTE PERFIL
      const { data: perfilExistente } = await supabase
        .from("perfis_pacientes")
        .select("id")
        .eq("id", user.id)
        .single();

      if (perfilExistente) {
        console.log("Perfil já existe, redirecionando...");
        return true; // Retorna sucesso para continuar o fluxo
      }

      console.log("Usuário encontrado:", user.id, user.email);

      const nomeCompleto = dados.nome_completo?.trim() || "";
      const partesNome = nomeCompleto.split(" ");
      const nome = partesNome[0] || "";
      const sobrenome = partesNome.slice(1).join(" ") || "";

      // Adicione os novos campos no dadosInsert:
      const dadosInsert = {
        id: user.id,
        nome: nome,
        sobrenome: sobrenome,
        genero: dados.genero,
        cidade: dados.cidade,
        estado: dados.estado,
        data_nascimento: dados.data_nascimento,
        cpf: dados.cpf,
        telefone: dados.telefone,
        verificado: false,
        aceita_notificacoes: true,
        privacidade: "public",
      };

      console.log(
        "Dados que vamos inserir:",
        JSON.stringify(dadosInsert, null, 2)
      );

      const resultado = await supabase
        .from("perfis_pacientes")
        .insert([dadosInsert])
        .select();

      if (resultado.error) {
        console.error("ERRO DETALHADO DO SUPABASE:");
        console.error("Code:", resultado.error.code);
        console.error("Message:", resultado.error.message);
        throw resultado.error;
      }

      console.log("=== SUCESSO ===");
      return true;
    } catch (err: unknown) {
      console.error("=== ERRO CAPTURADO ===");
      console.error("Erro completo:", JSON.stringify(err, null, 2));

      setError(err instanceof Error ? err.message : "Erro ao criar perfil");
      return false;
    } finally {
      setLoading(false);
      console.log("=== FIM DEBUG ===");
    }
  };

  return {
    loading,
    error,
    salvarTipoUsuario,
    criarPerfilPaciente,
  };
};
