// viaa\src\hooks\useOnboarding.ts

import { useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase/client";
import type {
  UserType,
  CriarPerfilPaciente,
  CriarPerfilProfissional,
  CriarPerfilClinica,
  CriarPerfilEmpresa,
  TipoProfissional,
  CriarDocumentoProfissional,
  TipoDocumento,
} from "../types/database";

interface DocumentoUpload {
  id: string;
  arquivo: File;
  tipo: TipoDocumento;
  descricao?: string;
  preview?: string;
}

interface OnboardingState {
  loading: boolean;
  error: string | null;
  currentStep:
    | "tipo"
    | "perfil"
    | "questionario"
    | "aguardando_aprovacao"
    | "completo";
}

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>({
    loading: false,
    error: null,
    currentStep: "tipo",
  });

  const abortController = useRef<AbortController | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setCurrentStep = useCallback((step: OnboardingState["currentStep"]) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const getCurrentUser = useCallback(async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error("Usuário não encontrado");
    }
    return user;
  }, []);

  const verificarPerfilExistente = useCallback(
    async (tabela: string, userId: string) => {
      const { data } = await supabase
        .from(tabela)
        .select("id, status_verificacao")
        .eq("user_id", userId)
        .maybeSingle();

      return data;
    },
    []
  );

  // Upload de arquivo para o Supabase Storage
  const uploadDocumento = useCallback(
    async (
      arquivo: File,
      profissionalId: string,
      tipo: TipoDocumento
    ): Promise<string> => {
      const fileExt = arquivo.name.split(".").pop();
      const fileName = `${profissionalId}/${tipo}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("documentos-profissionais")
        .upload(fileName, arquivo);

      if (error) throw error;

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("documentos-profissionais")
        .getPublicUrl(fileName);

      return publicUrl;
    },
    []
  );

  // Salvar documentos no banco
  const salvarDocumentos = useCallback(
    async (documentos: DocumentoUpload[], profissionalId: string) => {
      const documentosData: CriarDocumentoProfissional[] = [];

      // Upload de cada arquivo
      for (const doc of documentos) {
        try {
          const urlArquivo = await uploadDocumento(
            doc.arquivo,
            profissionalId,
            doc.tipo
          );

          documentosData.push({
            profissional_id: profissionalId,
            tipo: doc.tipo,
            nome_arquivo: doc.arquivo.name,
            url_arquivo: urlArquivo,
            observacoes: doc.descricao,
          });
        } catch (error) {
          console.error(
            `Erro ao fazer upload do documento ${doc.arquivo.name}:`,
            error
          );
          throw new Error(`Falha no upload do documento: ${doc.arquivo.name}`);
        }
      }

      // Inserir no banco
      const { error: insertError } = await supabase
        .from("profissional_documentos")
        .insert(documentosData);

      if (insertError) throw insertError;
    },
    [uploadDocumento]
  );

  const criarPerfil = useCallback(
    async (tipo: UserType, dados: any, documentos?: DocumentoUpload[]) => {
      // Cancelar operação anterior se existir
      if (abortController.current) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const user = await getCurrentUser();

        const tabelasConfig = {
          paciente: {
            tabela: "perfis_pacientes",
            campos: (dados: any): CriarPerfilPaciente => ({
              id: user.id,
              user_id: user.id,
              nome: dados.nome || dados.nome_completo?.split(" ")[0] || "",
              sobrenome:
                dados.sobrenome ||
                dados.nome_completo?.split(" ").slice(1).join(" ") ||
                "",
              data_nascimento: dados.data_nascimento,
              telefone: dados.telefone,
              cpf: dados.cpf,
              genero: dados.genero,
              cidade: dados.cidade,
              estado: dados.estado,
              aceita_notificacoes: true,
              privacidade: "public",
            }),
          },
          profissional: {
            tabela: "perfis_profissionais",
            campos: (dados: any): CriarPerfilProfissional => ({
              id: user.id,
              user_id: user.id,
              nome: dados.nome,
              sobrenome: dados.sobrenome,
              data_nascimento: dados.dataNascimento || dados.data_nascimento,
              telefone: dados.telefone,
              cpf: dados.cpf,
              tipo: dados.tipoProfissional as TipoProfissional,
              especialidades: dados.especialidades || "",
              email: dados.email,
              endereco_cep: dados.cep,
              endereco_logradouro: dados.rua,
              endereco_numero: dados.numero,
              endereco_complemento: dados.complemento,
              endereco_bairro: dados.bairro,
              endereco_cidade: dados.cidade,
              endereco_estado: dados.estado,
              registro_profissional: dados.numeroRegistro,
              experiencia_anos: dados.anosExperiencia
                ? parseInt(dados.anosExperiencia)
                : undefined,
              bio_profissional: dados.miniBiografia,
              valor_sessao: dados.precoConsulta
                ? parseFloat(dados.precoConsulta.replace(",", "."))
                : undefined,
              abordagem_terapeutica: dados.disponibilidade,
              formacao_principal: dados.linkLattes,
              foto_perfil_url: dados.fotoPerfilUrl,
              link_linkedin: dados.linkLinkedin,
              link_instagram: dados.linkInstagram,
              // CRP apenas para psicólogos
              crp:
                dados.tipoProfissional === "psicologo"
                  ? dados.numeroRegistro
                  : undefined,
            }),
          },
          clinica: {
            tabela: "perfis_clinicas",
            campos: (dados: any): Partial<CriarPerfilClinica> => ({
              id: user.id,
              user_id: user.id,
              nome_fantasia: dados.nome_fantasia || "A definir",
              razao_social: dados.razao_social || "A definir",
              cnpj: dados.cnpj || "00.000.000/0001-00",
              telefone: dados.telefone || "(00) 0000-0000",
              endereco_cep: dados.endereco_cep || "00000-000",
              endereco_logradouro: dados.endereco_logradouro || "A definir",
              endereco_numero: dados.endereco_numero || "0",
              endereco_bairro: dados.endereco_bairro || "A definir",
              endereco_cidade: dados.endereco_cidade || "A definir",
              endereco_estado: dados.endereco_estado || "SP",
              responsavel_tecnico_nome:
                dados.responsavel_tecnico_nome || "A definir",
              responsavel_tecnico_crp:
                dados.responsavel_tecnico_crp || "00/00000",
            }),
          },
          empresa: {
            tabela: "perfis_empresas",
            campos: (dados: any): Partial<CriarPerfilEmpresa> => ({
              id: user.id,
              user_id: user.id,
              nome_fantasia: dados.nome_fantasia || "A definir",
              razao_social: dados.razao_social || "A definir",
              cnpj: dados.cnpj || "00.000.000/0001-00",
              telefone: dados.telefone || "(00) 0000-0000",
              endereco_cep: dados.endereco_cep || "00000-000",
              endereco_logradouro: dados.endereco_logradouro || "A definir",
              endereco_numero: dados.endereco_numero || "0",
              endereco_bairro: dados.endereco_bairro || "A definir",
              endereco_cidade: dados.endereco_cidade || "A definir",
              endereco_estado: dados.endereco_estado || "SP",
              responsavel_nome: dados.responsavel_nome || "A definir",
            }),
          },
        };

        const config = tabelasConfig[tipo];
        if (!config) {
          throw new Error(`Tipo de usuário inválido: ${tipo}`);
        }

        const perfilExiste = await verificarPerfilExistente(
          config.tabela,
          user.id
        );

        if (perfilExiste) {
          // Verificar status para profissionais
          if (tipo === "profissional") {
            if (perfilExiste.status_verificacao === "pendente") {
              setCurrentStep("aguardando_aprovacao");
            } else if (perfilExiste.status_verificacao === "aprovado") {
              setCurrentStep("completo");
            }
          } else {
            setCurrentStep(tipo === "paciente" ? "questionario" : "completo");
          }
          return true;
        }

        const dadosInsert = config.campos(dados);

        const { error: insertError } = await supabase
          .from(config.tabela)
          .insert([dadosInsert])
          .abortSignal(abortController.current.signal);

        if (insertError) throw insertError;

        // Para profissionais, salvar documentos
        if (tipo === "profissional" && documentos && documentos.length > 0) {
          await salvarDocumentos(documentos, user.id);
          setCurrentStep("aguardando_aprovacao"); // Status pendente de aprovação
        } else {
          setCurrentStep(tipo === "paciente" ? "questionario" : "completo");
        }

        return true;
      } catch (err: any) {
        if (err.name === "AbortError") return false;

        setError(err.message || `Erro ao criar perfil de ${tipo}`);
        return false;
      } finally {
        setLoading(false);
        abortController.current = null;
      }
    },
    [
      getCurrentUser,
      verificarPerfilExistente,
      salvarDocumentos,
      setLoading,
      setError,
      setCurrentStep,
    ]
  );

  const salvarTipoUsuario = useCallback(
    async (tipo: UserType) => {
      setLoading(true);
      setError(null);

      try {
        const user = await getCurrentUser();

        const { error } = await supabase.auth.updateUser({
          data: { tipo_usuario: tipo },
        });

        if (error) throw error;

        setCurrentStep("perfil");
        return true;
      } catch (err: any) {
        setError(err.message || "Erro ao salvar tipo de usuário");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getCurrentUser, setLoading, setError, setCurrentStep]
  );

  const verificarStatusOnboarding = useCallback(async () => {
    setLoading(true);

    try {
      const user = await getCurrentUser();
      const tipoUsuario = user.user_metadata?.tipo_usuario as UserType;

      if (!tipoUsuario) {
        setCurrentStep("tipo");
        return { necessitaOnboarding: true, etapa: "tipo" };
      }

      const tabelas = {
        paciente: "perfis_pacientes",
        profissional: "perfis_profissionais",
        clinica: "perfis_clinicas",
        empresa: "perfis_empresas",
      };

      const perfilData = await verificarPerfilExistente(
        tabelas[tipoUsuario],
        user.id
      );

      if (!perfilData) {
        setCurrentStep("perfil");
        return { necessitaOnboarding: true, etapa: "perfil", tipoUsuario };
      }

      // Para profissionais, verificar status de aprovação
      if (tipoUsuario === "profissional") {
        if (perfilData.status_verificacao === "pendente") {
          setCurrentStep("aguardando_aprovacao");
          return {
            necessitaOnboarding: false,
            aguardandoAprovacao: true,
            tipoUsuario,
          };
        } else if (perfilData.status_verificacao === "rejeitado") {
          setCurrentStep("perfil");
          return {
            necessitaOnboarding: true,
            etapa: "perfil",
            tipoUsuario,
            rejeitado: true,
          };
        }
      }

      if (tipoUsuario === "paciente") {
        const questionarioExiste = await verificarPerfilExistente(
          "questionarios",
          user.id
        );

        if (!questionarioExiste) {
          setCurrentStep("questionario");
          return {
            necessitaOnboarding: true,
            etapa: "questionario",
            tipoUsuario,
          };
        }
      }

      setCurrentStep("completo");
      return { necessitaOnboarding: false, tipoUsuario };
    } catch (err: any) {
      setError(err.message || "Erro ao verificar status");
      return { necessitaOnboarding: true, etapa: "tipo" };
    } finally {
      setLoading(false);
    }
  }, [
    getCurrentUser,
    verificarPerfilExistente,
    setLoading,
    setError,
    setCurrentStep,
  ]);

  // Cleanup ao desmontar
  const cleanup = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
  }, []);

  return {
    ...state,
    salvarTipoUsuario,
    criarPerfilPaciente: useCallback(
      (dados: any) => criarPerfil("paciente", dados),
      [criarPerfil]
    ),
    criarPerfilProfissional: useCallback(
      (dados: any, documentos?: DocumentoUpload[]) =>
        criarPerfil("profissional", dados, documentos),
      [criarPerfil]
    ),
    criarPerfilClinica: useCallback(
      (dados: any) => criarPerfil("clinica", dados),
      [criarPerfil]
    ),
    criarPerfilEmpresa: useCallback(
      (dados: any) => criarPerfil("empresa", dados),
      [criarPerfil]
    ),
    verificarStatusOnboarding,
    cleanup,
  };
};
