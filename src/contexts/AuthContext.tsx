// src/contexts/AuthContext.tsx
// 🔧 VERSÃO CORRIGIDA - Detecção correta de tipo após onboarding

"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/database";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  // 🔧 FUNÇÃO CORRIGIDA - Buscar perfil com fallback
  const fetchUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      console.log("🔍 Buscando perfil para usuário:", userId);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      let tipoUsuario = authUser?.user_metadata?.tipo_usuario;

      console.log("📋 Tipo detectado nos metadados:", tipoUsuario);

      // 🔧 FALLBACK: Se não tem tipo nos metadados, buscar em todas as tabelas
      if (!tipoUsuario) {
        console.log(
          "⚠️ Tipo não encontrado nos metadados, buscando nas tabelas..."
        );

        const tabelas = [
          { nome: "perfis_pacientes", tipo: "paciente" },
          { nome: "perfis_profissionais", tipo: "profissional" },
          { nome: "perfis_clinicas", tipo: "clinica" },
          { nome: "perfis_empresas", tipo: "empresa" },
        ];

        for (const tabela of tabelas) {
          const { data, error } = await supabase
            .from(tabela.nome)
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (!error && data) {
            console.log(`✅ Perfil encontrado na tabela ${tabela.nome}`);
            tipoUsuario = tabela.tipo;

            // 🔧 ATUALIZAR METADADOS DO USUÁRIO
            try {
              await supabase.auth.updateUser({
                data: { tipo_usuario: tipoUsuario },
              });
              console.log("✅ Metadados atualizados com tipo:", tipoUsuario);
            } catch (updateError) {
              console.warn(
                "⚠️ Não foi possível atualizar metadados:",
                updateError
              );
            }
            break;
          }
        }
      }

      if (!tipoUsuario) {
        console.log("❌ Tipo de usuário não encontrado em lugar nenhum");
        return null;
      }

      // 🔧 BUSCAR DADOS DO PERFIL
      const tabelas: Record<string, string> = {
        paciente: "perfis_pacientes",
        profissional: "perfis_profissionais",
        clinica: "perfis_clinicas",
        empresa: "perfis_empresas",
      };

      const tableName = tabelas[tipoUsuario];
      if (!tableName) {
        console.error("❌ Tipo de usuário inválido:", tipoUsuario);
        return null;
      }

      console.log("🔍 Buscando dados na tabela:", tableName);

      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("❌ Erro ao buscar perfil:", error);
        return null;
      }

      if (!data) {
        console.log("❌ Perfil não encontrado na tabela:", tableName);
        return null;
      }

      console.log("✅ Perfil carregado:", tipoUsuario, data);

      return {
        tipo: tipoUsuario as
          | "paciente"
          | "profissional"
          | "clinica"
          | "empresa",
        dados: data,
        verificado: data.verificado || false,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar perfil do usuário:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log("🔄 Refreshing profile...");
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      try {
        console.log("🚀 Inicializando autenticação...");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao obter sessão:", error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log("👤 Usuário encontrado na sessão:", session.user.email);
          setUser(session.user);

          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        } else {
          console.log("❌ Nenhuma sessão ativa encontrada");
        }
      } catch (error) {
        console.error("Erro na inicialização da auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 🔧 LISTENER CORRIGIDO - Refresh profile em mudanças
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      } else if (event === "USER_UPDATED" && session?.user) {
        // 🔧 IMPORTANTE: Refresh profile quando usuário é atualizado
        console.log("🔄 Usuário atualizado, refreshing profile...");
        setUser(session.user);
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
