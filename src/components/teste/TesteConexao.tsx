// components/teste/TesteConexao.tsx
"use client";
import { useAuth } from "../../hooks/useSupabase";

export default function TesteConexao() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-2">Teste de Conexão Supabase</h2>

      {user ? (
        <div className="text-green-600">
          ✅ Conectado!
          <p>ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p>Tipo: {user.user_metadata?.tipo_usuario || "Não definido"}</p>
        </div>
      ) : (
        <div className="text-orange-600">⚠️ Usuário não logado</div>
      )}
    </div>
  );
}
