// hooks/useSupabase.ts
import { useState, useEffect } from "react";
import { supabase, AuthUser } from "../lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar usuário atual
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user as AuthUser | null);
      setLoading(false);
    };

    getUser();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user as AuthUser | null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};

// Adicionar no final do hooks/useSupabase.ts

import {
  PerfilPaciente,
  PerfilProfissional,
  PerfilClinica,
  PerfilEmpresa,
} from "../types/database";

// Hook para gerenciar perfis
export const usePerfis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar perfil do paciente
  const buscarPerfilPaciente = async (
    userId: string
  ): Promise<PerfilPaciente | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("perfis_pacientes")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar perfil");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Criar perfil do paciente
  const criarPerfilPaciente = async (perfil: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("perfis_pacientes")
        .insert([perfil])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar perfil");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    buscarPerfilPaciente,
    criarPerfilPaciente,
  };
};
