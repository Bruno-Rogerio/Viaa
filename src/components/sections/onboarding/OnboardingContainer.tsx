// viaa\src\components\sections\onboarding\OnboardingContainer.tsx

"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TipoUsuarioStep from "./TipoUsuarioStep";
import PacienteForm from "../../forms/PacienteForm";
import ProfissionalForm from "../../forms/ProfissionalForm";
import QuestionarioForm from "./QuestionarioForm";
import AguardandoAprovacao from "./AguardandoAprovacao";
import { useOnboarding } from "../../../hooks/useOnboarding";
import { useQuestionario } from "../../../hooks/useQuestionario";
import { supabase } from "../../../lib/supabase/client";

type TipoUsuario = "paciente" | "profissional" | "clinica" | "empresa";

interface DocumentoUpload {
  id: string;
  arquivo: File;
  tipo: any;
  descricao?: string;
  preview?: string;
}

export default function OnboardingContainer() {
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoUsuario | null>(
    null
  );
  const [perfilPacienteCompleto, setPerfilPacienteCompleto] = useState(false);
  const [perfilProfissionalCompleto, setPerfilProfissionalCompleto] =
    useState(false);
  const [questionarioCompleto, setQuestionarioCompleto] = useState(false);
  const [aguardandoAprovacao, setAguardandoAprovacao] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);

  const {
    loading,
    error: onboardingHookError,
    salvarTipoUsuario,
    criarPerfilPaciente,
    criarPerfilProfissional,
  } = useOnboarding();

  const { salvarQuestionario, loading: loadingQuestionario } =
    useQuestionario();

  const router = useRouter();
  const searchParams = useSearchParams();

  const checkOnboardingStatus = useCallback(
    async (userId: string, userType: TipoUsuario) => {
      let isProfileComplete = false;
      let isQuestionnaireComplete = false;
      let isPendingApproval = false;

      switch (userType) {
        case "paciente":
          const { data: pacienteProfile, error: pacienteError } = await supabase
            .from("perfis_pacientes")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (pacienteError && pacienteError.code !== "PGRST116") {
            setOnboardingError("Erro ao carregar seu perfil de paciente.");
          } else {
            isProfileComplete = !!pacienteProfile;
            setPerfilPacienteCompleto(isProfileComplete);
          }

          if (isProfileComplete) {
            const { data: questionarioData, error: questionarioError } =
              await supabase
                .from("questionarios")
                .select("id")
                .eq("user_id", userId)
                .maybeSingle();

            if (questionarioError && questionarioError.code !== "PGRST116") {
              setOnboardingError("Erro ao carregar seu questionário.");
            } else {
              isQuestionnaireComplete = !!questionarioData;
              setQuestionarioCompleto(isQuestionnaireComplete);
            }
          }
          break;

        case "profissional":
          const { data: profissionalProfile, error: profissionalError } =
            await supabase
              .from("perfis_profissionais")
              .select("id, status_verificacao")
              .eq("user_id", userId)
              .maybeSingle();

          if (profissionalError && profissionalError.code !== "PGRST116") {
            console.error(
              "Erro ao buscar perfil profissional:",
              profissionalError
            );
            setOnboardingError("Erro ao carregar seu perfil de profissional.");
          } else if (profissionalProfile) {
            isProfileComplete = true;
            setPerfilProfissionalCompleto(true);

            // Verificar status de aprovação
            if (profissionalProfile.status_verificacao === "pendente") {
              isPendingApproval = true;
              setAguardandoAprovacao(true);
            } else if (profissionalProfile.status_verificacao === "aprovado") {
              // Perfil aprovado - pode ir para dashboard
              setAguardandoAprovacao(false);
            } else if (profissionalProfile.status_verificacao === "rejeitado") {
              // Perfil rejeitado - precisa refazer cadastro
              isProfileComplete = false;
              setPerfilProfissionalCompleto(false);
              setOnboardingError(
                "Seu cadastro foi rejeitado. Entre em contato com o suporte para mais informações."
              );
            }
          }
          break;

        case "clinica":
        case "empresa":
          const tabela =
            userType === "clinica" ? "perfis_clinicas" : "perfis_empresas";
          const { data: perfilData, error: perfilError } = await supabase
            .from(tabela)
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (perfilError && perfilError.code !== "PGRST116") {
            setOnboardingError(`Erro ao carregar perfil de ${userType}.`);
          } else {
            isProfileComplete = !!perfilData;
            if (userType === "clinica") {
              // Adicionar lógica específica para clínicas se necessário
            }
          }
          break;
      }

      return { isProfileComplete, isQuestionnaireComplete, isPendingApproval };
    },
    []
  );

  useEffect(() => {
    const initializeOnboarding = async () => {
      setLoadingInitial(true);
      setOnboardingError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/auth");
        return;
      }

      let detectedUserType: TipoUsuario | null = searchParams.get(
        "type"
      ) as TipoUsuario | null;

      if (!detectedUserType) {
        detectedUserType = user.user_metadata
          ?.tipo_usuario as TipoUsuario | null;
      }

      if (detectedUserType) {
        setTipoSelecionado(detectedUserType);
        const {
          isProfileComplete,
          isQuestionnaireComplete,
          isPendingApproval,
        } = await checkOnboardingStatus(user.id, detectedUserType);

        // Lógica de redirecionamento baseada no status
        if (detectedUserType === "profissional") {
          if (isPendingApproval) {
            // Profissional aguardando aprovação - mostrar página de espera
            setLoadingInitial(false);
            return;
          } else if (isProfileComplete) {
            // Profissional aprovado - ir para dashboard
            router.replace("/dashboard");
            return;
          }
        } else if (
          detectedUserType === "paciente" &&
          isProfileComplete &&
          isQuestionnaireComplete
        ) {
          router.replace("/dashboard");
          return;
        } else if (
          (detectedUserType === "clinica" || detectedUserType === "empresa") &&
          isProfileComplete
        ) {
          router.replace("/dashboard");
          return;
        }
      }
      setLoadingInitial(false);
    };
    initializeOnboarding();
  }, [router, searchParams, checkOnboardingStatus]);

  useEffect(() => {
    // Redirecionamento automático quando status mudar
    if (
      tipoSelecionado === "paciente" &&
      perfilPacienteCompleto &&
      questionarioCompleto
    ) {
      router.push("/dashboard");
    } else if (
      tipoSelecionado === "profissional" &&
      perfilProfissionalCompleto &&
      !aguardandoAprovacao
    ) {
      router.push("/dashboard");
    } else if (tipoSelecionado === "clinica") {
      router.push("/dashboard");
    } else if (tipoSelecionado === "empresa") {
      router.push("/dashboard");
    }
  }, [
    tipoSelecionado,
    perfilPacienteCompleto,
    perfilProfissionalCompleto,
    questionarioCompleto,
    aguardandoAprovacao,
    router,
  ]);

  const handleTipoSelect = async (tipo: TipoUsuario) => {
    const sucesso = await salvarTipoUsuario(tipo);
    if (sucesso) {
      setTipoSelecionado(tipo);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await checkOnboardingStatus(user.id, tipo);
      }
    }
  };

  const handlePerfilPacienteSubmit = async (dados: any) => {
    const sucesso = await criarPerfilPaciente(dados);
    if (sucesso) {
      setPerfilPacienteCompleto(true);
    }
  };

  const handlePerfilProfissionalSubmit = async (
    dados: any & { documentos: DocumentoUpload[] }
  ) => {
    const { documentos, ...dadosPerfil } = dados;
    const sucesso = await criarPerfilProfissional(dadosPerfil, documentos);
    if (sucesso) {
      setPerfilProfissionalCompleto(true);
      setAguardandoAprovacao(true);
    }
  };

  const handleQuestionarioSubmit = async (dados: any) => {
    const resultado = await salvarQuestionario(dados);
    if (resultado.success) {
      setQuestionarioCompleto(true);
    }
  };

  const handleQuestionarioSkip = () => {
    setQuestionarioCompleto(true);
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-6">Carregando...</h1>
          <p className="text-gray-600">Verificando seu status de onboarding.</p>
        </div>
      </div>
    );
  }

  // Se profissional aguardando aprovação
  if (tipoSelecionado === "profissional" && aguardandoAprovacao) {
    return <AguardandoAprovacao />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center p-4">
      {onboardingError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 p-3 rounded mb-4 text-sm z-50">
          {onboardingError}
        </div>
      )}
      {onboardingHookError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 p-3 rounded mb-4 text-sm z-50">
          {onboardingHookError}
        </div>
      )}

      {!tipoSelecionado ? (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6">Bem-vindo ao Viaa!</h1>
          <p className="text-gray-600 mb-4">
            Selecione seu tipo de usuário para continuar.
          </p>
          <TipoUsuarioStep onSelect={handleTipoSelect} />
        </div>
      ) : tipoSelecionado === "paciente" ? (
        !perfilPacienteCompleto ? (
          <PacienteForm
            onSubmit={handlePerfilPacienteSubmit}
            loading={loading}
          />
        ) : !questionarioCompleto ? (
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-6">Quase lá, paciente!</h1>
            <p className="text-gray-600 mb-4">
              Por favor, responda a algumas perguntas para personalizarmos sua
              experiência.
            </p>
            <QuestionarioForm
              onSubmit={handleQuestionarioSubmit}
              onSkip={handleQuestionarioSkip}
              loading={loadingQuestionario}
            />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-6">
              Cadastro de Paciente Concluído!
            </h1>
            <p className="text-gray-600">
              Redirecionando para o seu dashboard...
            </p>
            {(loading || loadingQuestionario) && (
              <div className="text-center mt-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}
          </div>
        )
      ) : tipoSelecionado === "profissional" ? (
        !perfilProfissionalCompleto ? (
          <ProfissionalForm
            onSubmit={handlePerfilProfissionalSubmit}
            loading={loading}
          />
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-6">Cadastro Enviado!</h1>
            <p className="text-gray-600">
              Seus documentos estão sendo analisados...
            </p>
            {loading && (
              <div className="text-center mt-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}
          </div>
        )
      ) : tipoSelecionado === "clinica" || tipoSelecionado === "empresa" ? (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6">Bem-vindo ao Viaa!</h1>
          <p className="text-gray-600 mb-6">
            Formulário para <strong>{tipoSelecionado}</strong> em breve...
          </p>
          <div className="text-4xl mb-4">🚧</div>
          <p className="text-sm text-gray-500">
            Esta funcionalidade está em desenvolvimento.
          </p>
          {loading && (
            <div className="text-center mt-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
