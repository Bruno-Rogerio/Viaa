// src/utils/connections.ts
// 🔗 Funções utilitárias para o sistema de conexões (follow/unfollow)

import { createClient } from "@supabase/supabase-js";

// ============================================================
// 🔐 CLIENTE SUPABASE
// ============================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
// 📋 TIPOS
// ============================================================

interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  tipo: "profissional" | "paciente";
  foto_perfil_url?: string;
  especialidades?: string;
}

interface FollowResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface ListResult {
  followers?: UserProfile[];
  following?: UserProfile[];
  total: number;
  error?: string;
}

// ============================================================
// ✅ VALIDAÇÕES
// ============================================================

/**
 * Verifica se um usuário pode seguir outro
 * Regras:
 * - Não pode seguir a si mesmo
 * - Profissional NÃO pode seguir paciente
 * - Paciente pode seguir qualquer profissional
 * - Profissional pode seguir outro profissional
 */
export async function canFollow(
  followerId: string,
  followingId: string
): Promise<{ canFollow: boolean; reason?: string }> {
  try {
    // Não pode seguir a si mesmo
    if (followerId === followingId) {
      return {
        canFollow: false,
        reason: "Você não pode seguir a si mesmo",
      };
    }

    // Buscar perfil de quem está tentando seguir
    const { data: followerProfile } = await supabase
      .from("perfis_profissionais")
      .select("user_id, tipo")
      .eq("user_id", followerId)
      .single();

    // Se não encontrou em profissionais, buscar em pacientes
    let followerType: "profissional" | "paciente" = "paciente";
    if (followerProfile) {
      followerType = "profissional";
    }

    // Buscar perfil de quem será seguido
    const { data: followingProfProfile } = await supabase
      .from("perfis_profissionais")
      .select("user_id, tipo")
      .eq("user_id", followingId)
      .single();

    let followingType: "profissional" | "paciente" = "paciente";
    if (followingProfProfile) {
      followingType = "profissional";
    }

    // REGRA: Profissional NÃO pode seguir paciente
    if (followerType === "profissional" && followingType === "paciente") {
      return {
        canFollow: false,
        reason: "Profissionais não podem seguir pacientes",
      };
    }

    // Verificar se já está seguindo
    const { data: existingFollow } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .single();

    if (existingFollow) {
      return {
        canFollow: false,
        reason: "Você já segue este usuário",
      };
    }

    return { canFollow: true };
  } catch (error: any) {
    console.error("Erro ao verificar se pode seguir:", error);
    return {
      canFollow: false,
      reason: "Erro ao verificar permissões",
    };
  }
}

// ============================================================
// ➕ CRIAR CONEXÃO (FOLLOW)
// ============================================================

/**
 * Cria uma nova conexão (follow)
 */
export async function createFollow(
  followerId: string,
  followingId: string
): Promise<FollowResult> {
  try {
    // Validar se pode seguir
    const validation = await canFollow(followerId, followingId);
    if (!validation.canFollow) {
      return {
        success: false,
        error: validation.reason,
      };
    }

    // Criar conexão
    const { data, error } = await supabase
      .from("connections")
      .insert([
        {
          follower_id: followerId,
          following_id: followingId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar follow:", error);
      return {
        success: false,
        error: "Erro ao seguir usuário",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Erro ao criar follow:", error);
    return {
      success: false,
      error: error.message || "Erro inesperado ao seguir",
    };
  }
}

// ============================================================
// ➖ REMOVER CONEXÃO (UNFOLLOW)
// ============================================================

/**
 * Remove uma conexão (unfollow)
 */
export async function removeFollow(
  followerId: string,
  followingId: string
): Promise<FollowResult> {
  try {
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) {
      console.error("Erro ao remover follow:", error);
      return {
        success: false,
        error: "Erro ao deixar de seguir",
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Erro ao remover follow:", error);
    return {
      success: false,
      error: error.message || "Erro inesperado ao deixar de seguir",
    };
  }
}

// ============================================================
// 🔍 VERIFICAR SE ESTÁ SEGUINDO
// ============================================================

/**
 * Verifica se um usuário está seguindo outro
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("connections")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao verificar follow:", error);
    return false;
  }
}

// ============================================================
// 📊 CONTADORES
// ============================================================

/**
 * Conta quantos seguidores um usuário tem
 */
export async function getFollowerCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    if (error) {
      console.error("Erro ao contar followers:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Erro ao contar followers:", error);
    return 0;
  }
}

/**
 * Conta quantos usuários um usuário está seguindo
 */
export async function getFollowingCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (error) {
      console.error("Erro ao contar following:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Erro ao contar following:", error);
    return 0;
  }
}

// ============================================================
// 📋 LISTAS
// ============================================================

/**
 * Lista os seguidores de um usuário
 */
export async function getFollowersList(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ListResult> {
  try {
    // Buscar conexões
    const { data: connections, error: connectionsError } = await supabase
      .from("connections")
      .select("follower_id")
      .eq("following_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (connectionsError) {
      console.error("Erro ao buscar connections:", connectionsError);
      return {
        followers: [],
        total: 0,
        error: "Erro ao buscar seguidores",
      };
    }

    if (!connections || connections.length === 0) {
      return {
        followers: [],
        total: 0,
      };
    }

    // Extrair IDs dos seguidores
    const followerIds = connections.map((c) => c.follower_id);

    // Buscar perfis dos seguidores (profissionais)
    const { data: profProfiles } = await supabase
      .from("perfis_profissionais")
      .select("id, user_id, nome, sobrenome, foto_perfil_url, especialidades")
      .in("user_id", followerIds);

    // Buscar perfis dos seguidores (pacientes)
    const { data: patProfiles } = await supabase
      .from("perfis_pacientes")
      .select("id, user_id, nome, sobrenome, foto_perfil_url")
      .in("user_id", followerIds);

    // Combinar perfis
    const followers: UserProfile[] = [];

    if (profProfiles) {
      followers.push(
        ...profProfiles.map((p) => ({
          ...p,
          tipo: "profissional" as const,
        }))
      );
    }

    if (patProfiles) {
      followers.push(
        ...patProfiles.map((p) => ({
          ...p,
          tipo: "paciente" as const,
          especialidades: undefined,
        }))
      );
    }

    // Contar total
    const { count } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    return {
      followers,
      total: count || 0,
    };
  } catch (error: any) {
    console.error("Erro ao buscar lista de followers:", error);
    return {
      followers: [],
      total: 0,
      error: error.message || "Erro ao buscar seguidores",
    };
  }
}

/**
 * Lista os usuários que um usuário está seguindo
 */
export async function getFollowingList(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ListResult> {
  try {
    // Buscar conexões
    const { data: connections, error: connectionsError } = await supabase
      .from("connections")
      .select("following_id")
      .eq("follower_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (connectionsError) {
      console.error("Erro ao buscar connections:", connectionsError);
      return {
        following: [],
        total: 0,
        error: "Erro ao buscar seguindo",
      };
    }

    if (!connections || connections.length === 0) {
      return {
        following: [],
        total: 0,
      };
    }

    // Extrair IDs de quem está sendo seguido
    const followingIds = connections.map((c) => c.following_id);

    // Buscar perfis (profissionais)
    const { data: profProfiles } = await supabase
      .from("perfis_profissionais")
      .select("id, user_id, nome, sobrenome, foto_perfil_url, especialidades")
      .in("user_id", followingIds);

    // Buscar perfis (pacientes)
    const { data: patProfiles } = await supabase
      .from("perfis_pacientes")
      .select("id, user_id, nome, sobrenome, foto_perfil_url")
      .in("user_id", followingIds);

    // Combinar perfis
    const following: UserProfile[] = [];

    if (profProfiles) {
      following.push(
        ...profProfiles.map((p) => ({
          ...p,
          tipo: "profissional" as const,
        }))
      );
    }

    if (patProfiles) {
      following.push(
        ...patProfiles.map((p) => ({
          ...p,
          tipo: "paciente" as const,
          especialidades: undefined,
        }))
      );
    }

    // Contar total
    const { count } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    return {
      following,
      total: count || 0,
    };
  } catch (error: any) {
    console.error("Erro ao buscar lista de following:", error);
    return {
      following: [],
      total: 0,
      error: error.message || "Erro ao buscar seguindo",
    };
  }
}

// ============================================================
// 🎯 SUGESTÕES DE USUÁRIOS PARA SEGUIR
// ============================================================

/**
 * Sugere profissionais para um usuário seguir
 * Baseado em: especialidade, localização, engajamento
 */
export async function getSuggestedProfiles(
  userId: string,
  limit: number = 10
): Promise<UserProfile[]> {
  try {
    // Buscar perfil do usuário
    const { data: userProfile } = await supabase
      .from("perfis_pacientes")
      .select("estado, cidade")
      .eq("user_id", userId)
      .single();

    // Buscar quem o usuário já está seguindo
    const { data: alreadyFollowing } = await supabase
      .from("connections")
      .select("following_id")
      .eq("follower_id", userId);

    const followingIds = alreadyFollowing?.map((f) => f.following_id) || [];

    // Buscar profissionais que o usuário NÃO está seguindo
    let query = supabase
      .from("perfis_profissionais")
      .select(
        "id, user_id, nome, sobrenome, foto_perfil_url, especialidades, endereco_estado, endereco_cidade"
      )
      .eq("verificado", true)
      .neq("user_id", userId);

    if (followingIds.length > 0) {
      query = query.not("user_id", "in", `(${followingIds.join(",")})`);
    }

    const { data: profiles } = await query.limit(limit * 2); // Buscar mais para filtrar

    if (!profiles || profiles.length === 0) {
      return [];
    }

    // Calcular score de relevância
    const scoredProfiles = profiles.map((profile) => {
      let score = 0;

      // Bonus por mesma localização
      if (userProfile?.estado === profile.endereco_estado) {
        score += 30;
      }
      if (userProfile?.cidade === profile.endereco_cidade) {
        score += 20;
      }

      // Bonus aleatório para diversificar
      score += Math.random() * 50;

      return {
        ...profile,
        tipo: "profissional" as const,
        score,
      };
    });

    // Ordenar por score e limitar
    const suggested = scoredProfiles
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...profile }) => profile);

    return suggested;
  } catch (error) {
    console.error("Erro ao buscar sugestões:", error);
    return [];
  }
}
