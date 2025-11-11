// src/contexts/AuthContext.tsx
// ✅ VERSÃO CORRIGIDA - Com helpers de identificação

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
  getUserType: () => "paciente" | "profissional" | "clinica" | "empresa" | null;
  getProfileId: () => string | null;
  getAuthId: () => string | null;
  isProfessional: () => boolean;
  isPatient: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const fetchUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const tipoUsuario = authUser?.user_metadata?.tipo_usuario;

      if (!tipoUsuario) return null;

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
          return null;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) return null;

      return { tipo: tipoUsuario, dados: data };
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const userProfile = await fetchUserProfile(user.id);
    setProfile(userProfile);
  };

  const getUserType = () =>
    profile?.tipo || user?.user_metadata?.tipo_usuario || null;
  const getProfileId = () => profile?.dados?.id || null;
  const getAuthId = () => user?.id || null;
  const isProfessional = () => getUserType() === "profissional";
  const isPatient = () => getUserType() === "paciente";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
        getUserType,
        getProfileId,
        getAuthId,
        isProfessional,
        isPatient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
