// src/app/api/profissionais/sugestoes/route.ts
// 🎯 API para sugerir profissionais para seguir (versão corrigida)

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Tipagem para interfaces do banco de dados
interface PerfilPaciente {
  id: string;
  cidade?: string | null;
  estado?: string | null;
  interesses?: string | null;
}

interface ConnectionData {
  following_id: string;
}

// Formato de dados retornado pelo Supabase para perfil de profissional
interface PerfilProfissionalDB {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  especialidades?: string | null;
  bio_profissional?: string | null;
  foto_perfil_url?: string | null;
  endereco_cidade?: string | null;
  endereco_estado?: string | null;
  verificado: boolean;
  created_at: string;
  connections?: unknown; // Tipo genérico para lidar com diferentes formatos
}

// Interface estendida com score para algoritmo de recomendação
interface PerfilProfissionalComScore extends PerfilProfissionalDB {
  score: number;
}

export async function GET(req: NextRequest) {
  try {
    console.log("📊 API de Sugestões: Iniciando processamento");

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    console.log("📊 API de Sugestões: Parâmetros", { limit });

    // Validação básica
    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: "Limite inválido (1-20)" },
        { status: 400 }
      );
    }

    // Obter usuário autenticado - correção na forma de passar cookies
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log(
      "📊 API de Sugestões: Status da sessão",
      session ? "Autenticado" : "Não autenticado"
    );

    if (!session?.user) {
      console.error(
        "❌ API de Sugestões: Erro de autenticação - Usuário não encontrado"
      );
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("📊 API de Sugestões: Usuário", userId);

    // 1. Verificar se o usuário é paciente
    const { data: perfilPaciente } = await supabase
      .from("perfis_pacientes")
      .select("id, cidade, estado, interesses")
      .eq("user_id", userId)
      .single();

    if (!perfilPaciente) {
      console.error("❌ API de Sugestões: Perfil de paciente não encontrado");
      return NextResponse.json(
        { error: "Perfil de paciente não encontrado" },
        { status: 404 }
      );
    }

    console.log("📊 API de Sugestões: Perfil encontrado", {
      cidade: perfilPaciente.cidade,
      estado: perfilPaciente.estado,
      temInteresses: !!perfilPaciente.interesses,
    });

    // 2. Obter profissionais que o usuário já segue
    const { data: seguindo } = await supabase
      .from("connections")
      .select("following_id")
      .eq("follower_id", userId);

    const seguindoIds: string[] = (seguindo || []).map(
      (s: ConnectionData) => s.following_id
    );

    console.log(
      `📊 API de Sugestões: Usuário segue ${seguindoIds.length} profissionais`
    );

    // 3. Obter profissionais verificados que o usuário não segue
    console.log("📊 API de Sugestões: Buscando profissionais verificados");

    let query = supabase
      .from("perfis_profissionais")
      .select(
        `
        id,
        user_id,
        nome,
        sobrenome,
        especialidades,
        bio_profissional,
        foto_perfil_url,
        endereco_cidade,
        endereco_estado,
        verificado,
        created_at,
        connections(count)
      `
      )
      .eq("verificado", true);

    if (seguindoIds.length > 0) {
      query = query.not("user_id", "in", seguindoIds);
    }

    // 4. Implementar algoritmo de relevância
    console.log("📊 API de Sugestões: Aplicando filtros de relevância");

    // a. Filtrar por localização se disponível
    if (perfilPaciente.cidade) {
      query = query.eq("endereco_cidade", perfilPaciente.cidade);
    } else if (perfilPaciente.estado) {
      query = query.eq("endereco_estado", perfilPaciente.estado);
    }

    // b. Ordenar por número de conexões (seguidores)
    query = query.order("connections.count", { ascending: false });

    // c. Limitar resultados
    query = query.limit(limit * 3); // Buscar mais para depois filtrar

    // Executar a query
    console.log("📊 API de Sugestões: Executando query");
    const { data: profissionaisData, error } = await query;

    if (error) {
      console.error("❌ API de Sugestões: Erro ao buscar sugestões:", error);
      return NextResponse.json(
        {
          error: "Erro ao buscar sugestões de profissionais",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Garantir que temos um array (mesmo vazio) para trabalhar
    const profissionaisBrutos = profissionaisData || [];
    console.log(
      `📊 API de Sugestões: Encontrados ${profissionaisBrutos.length} profissionais`
    );

    // 5. Algoritmo de ranking (pontuação)
    console.log("📊 API de Sugestões: Aplicando algoritmo de ranking");

    // Processar interesses do paciente para comparação
    const interessesArray: string[] = [];
    if (perfilPaciente.interesses) {
      const partes = perfilPaciente.interesses.split(",");
      for (const parte of partes) {
        const interesse = parte.trim().toLowerCase();
        if (interesse) {
          interessesArray.push(interesse);
        }
      }
    }

    console.log(
      `📊 API de Sugestões: Paciente tem ${interessesArray.length} interesses`
    );

    // Calcular score para cada profissional
    const profissionaisComScore: PerfilProfissionalComScore[] = [];

    for (const profBruto of profissionaisBrutos) {
      // Extrair os dados com tipagem segura
      const prof: PerfilProfissionalDB = {
        id: profBruto.id,
        user_id: profBruto.user_id,
        nome: profBruto.nome,
        sobrenome: profBruto.sobrenome,
        especialidades: profBruto.especialidades,
        bio_profissional: profBruto.bio_profissional,
        foto_perfil_url: profBruto.foto_perfil_url,
        endereco_cidade: profBruto.endereco_cidade,
        endereco_estado: profBruto.endereco_estado,
        verificado: profBruto.verificado,
        created_at: profBruto.created_at,
        connections: profBruto.connections,
      };

      let score = 0;

      // a. Pontos por localização
      if (
        prof.endereco_cidade &&
        perfilPaciente.cidade &&
        prof.endereco_cidade === perfilPaciente.cidade
      ) {
        score += 100; // Prioridade alta: mesma cidade
      } else if (
        prof.endereco_estado &&
        perfilPaciente.estado &&
        prof.endereco_estado === perfilPaciente.estado
      ) {
        score += 50; // Prioridade média: mesmo estado
      }

      // b. Pontos por especialidade
      if (interessesArray.length > 0 && prof.especialidades) {
        const especialidadesArray: string[] = [];
        const partes = prof.especialidades.split(",");

        for (const parte of partes) {
          const especialidade = parte.trim().toLowerCase();
          if (especialidade) {
            especialidadesArray.push(especialidade);
          }
        }

        for (const especialidade of especialidadesArray) {
          for (const interesse of interessesArray) {
            if (
              especialidade.includes(interesse) ||
              interesse.includes(especialidade)
            ) {
              score += 75; // Especialidade correspondente
              break; // Evitar pontuação duplicada por interesse
            }
          }
        }
      }

      // c. Pontos por popularidade - extrair count de forma segura
      let connectionsCount = 0;

      // Tratar connections de forma segura, independente da estrutura
      // No Supabase, pode vir como array ou objeto com estruturas diferentes
      if (prof.connections) {
        if (Array.isArray(prof.connections) && prof.connections.length > 0) {
          // Se for um array, pegar o primeiro elemento que deve ter count
          if (
            prof.connections[0] &&
            typeof prof.connections[0] === "object" &&
            prof.connections[0] !== null &&
            "count" in prof.connections[0]
          ) {
            connectionsCount = Number(prof.connections[0].count) || 0;
          }
        } else if (
          typeof prof.connections === "object" &&
          prof.connections !== null
        ) {
          // Se for um objeto com count diretamente
          if ("count" in prof.connections) {
            connectionsCount = Number(prof.connections.count) || 0;
          }
        }
      }

      if (connectionsCount > 100) {
        score += 40;
      } else if (connectionsCount > 50) {
        score += 30;
      } else if (connectionsCount > 10) {
        score += 20;
      } else {
        score += 10;
      }

      // Adicionar profissional com score ao array
      profissionaisComScore.push({
        ...prof,
        score,
      });
    }

    // 6. Ordenar por score e pegar os primeiros `limit`
    console.log("📊 API de Sugestões: Ordenando por relevância");
    profissionaisComScore.sort((a, b) => b.score - a.score);
    const sugestoes = profissionaisComScore.slice(0, limit);

    // 7. Remover campos internos antes de retornar
    const resultado = sugestoes.map((prof) => {
      // Extrair e excluir connections e score para não enviá-los
      const { connections, score, ...restoDados } = prof;
      return restoDados;
    });

    console.log(
      `📊 API de Sugestões: Retornando ${resultado.length} sugestões`
    );

    return NextResponse.json({
      profissionais: resultado,
      total: resultado.length,
    });
  } catch (error: any) {
    console.error("❌ API de Sugestões: Erro inesperado:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}
