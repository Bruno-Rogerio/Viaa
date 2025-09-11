// viaa/src/app/dashboard/profissionais/[id]/page.tsx
// Exemplo de como um profissional visualiza a agenda de outro profissional

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Agenda from "@/components/dashboard/common/Agenda";
import type { Consulta } from "@/types/agenda";

interface ProfissionalPageProps {
  params: {
    id: string; // ID do profissional sendo visualizado
  };
}

export default function ProfissionalPage({ params }: ProfissionalPageProps) {
  const { user, profile } = useAuth();
  const [profissionalInfo, setProfissionalInfo] = useState<{
    nome: string;
    sobrenome: string;
    especialidades: string;
    foto_perfil_url?: string;
    valor_sessao?: number;
    crp?: string;
    verificado?: boolean;
  } | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Carregar informações do profissional
  useEffect(() => {
    const carregarProfissional = async () => {
      try {
        const response = await fetch(`/api/profissionais/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfissionalInfo(data);
        }
      } catch (error) {
        console.error("Erro ao carregar profissional:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarProfissional();
  }, [params.id]);

  if (!user || !profile) {
    return <div>Carregando...</div>;
  }

  if (carregando) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-600">
          Carregando informações do profissional...
        </p>
      </div>
    );
  }

  if (!profissionalInfo) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-red-600">Profissional não encontrado.</p>
      </div>
    );
  }

  // Callbacks para as ações da agenda
  const handleConsultaClick = (consulta: Consulta) => {
    console.log("Consulta clicada:", consulta);
  };

  const handleCancelarConsulta = (consulta: Consulta) => {
    console.log("Cancelar consulta:", consulta);
    // TODO: Abrir modal de confirmação de cancelamento
  };

  const handleSolicitarConsulta = (data: Date, horario: string) => {
    console.log("Solicitar consulta:", {
      data,
      horario,
      profissional: params.id,
    });
    // TODO: Modal já implementado no componente Agenda
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb ou botão voltar */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => window.history.back()}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Voltar
        </button>
        <span className="text-gray-500">/</span>
        <span className="text-gray-900">
          {profissionalInfo.nome} {profissionalInfo.sobrenome}
        </span>
      </div>

      {/* Indicador de contexto para profissionais */}
      {profile.tipo === "profissional" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-blue-800 font-medium">
              Visualizando como paciente
            </p>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Você pode solicitar consultas com este profissional. As solicitações
            aparecerão como vindas de você como paciente.
          </p>
        </div>
      )}

      {/* Componente da agenda - COMPORTAMENTO INTELIGENTE */}
      <Agenda
        tipoUsuario={profile.tipo as "profissional" | "paciente"}
        usuarioId={user.id}
        profissionalId={params.id} // ID do profissional sendo visualizado
        profissionalInfo={profissionalInfo}
        modoVisualizacao="mes"
        altura="h-[700px]"
        onConsultaClick={handleConsultaClick}
        onCancelarConsulta={handleCancelarConsulta}
        onSolicitarConsulta={handleSolicitarConsulta}
        className="shadow-lg"
      />
    </div>
  );
}
