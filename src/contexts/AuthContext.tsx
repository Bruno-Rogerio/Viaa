// src/contexts/AuthContext.tsx
// 🔧 VERSÃO CORRIGIDA - SignOut funcional

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

  // 🔧 FUNÇÃO ORIGINAL RESTAURADA
  const fetchUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const tipoUsuario = authUser?.user_metadata?.tipo_usuario;

      if (!tipoUsuario) {
        console.log("Tipo de usuário não encontrado nos metadados");
        return null;
      }

      let tableName: string;
      switch (tipoUsuario) {
        case "paciente":
          tableName = "perfis_pacientes";
          break;
        case "profissional":
          tableName = "perfis_profissionais";
          break;
        case "clinica":
          tableName = "perfis_clinicas";
          break;
        case "empresa":
          tableName = "perfis_empresas";
          break;
        default:
          console.log("Tipo de usuário inválido:", tipoUsuario);
          return null;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao buscar perfil:", error);
        return null;
      }

      if (!data) {
        console.log("Perfil não encontrado na tabela:", tableName);
        return null;
      }

      console.log("Perfil carregado:", tipoUsuario, data);

      return {
        tipo: tipoUsuario,
        dados: data,
        verificado: data.verificado || false,
      };
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    }
  };

  // 🔧 FUNÇÃO SIGNOUT CORRIGIDA
  const signOut = async () => {
    try {
      console.log("🚪 Iniciando logout...");

      // Limpar estado local primeiro
      setUser(null);
      setProfile(null);

      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Erro ao fazer logout:", error);
        throw error;
      }

      console.log("✅ Logout realizado com sucesso");

      // Limpar qualquer cache/storage local se necessário
      if (typeof window !== "undefined") {
        localStorage.removeItem("signup_user_type");
        // Limpar outros items se necessário
      }
    } catch (error) {
      console.error("❌ Erro no processo de logout:", error);
      // Mesmo com erro, limpar estado local
      setUser(null);
      setProfile(null);
      throw error;
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      try {
        console.log("Inicializando autenticação...");

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
          console.log("Usuário encontrado na sessão:", session.user.email);
          setUser(session.user);

          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        } else {
          console.log("Nenhuma sessão ativa encontrada");
        }
      } catch (error) {
        console.error("Erro na inicialização da auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 🔧 LISTENER CORRIGIDO
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 User signed out - clearing state");
        setUser(null);
        setProfile(null);
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
