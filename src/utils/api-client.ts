// src/utils/api-client.ts
// Cliente API centralizado com autenticação automática

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // Em Next.js com Supabase, o cookie de sessão é gerenciado automaticamente
    // Mas vamos garantir que sempre enviamos os headers corretos
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Se estivermos no cliente, podemos tentar pegar o token do localStorage
    if (typeof window !== "undefined") {
      const {
        data: { session },
      } = (await (window as any).supabase?.auth?.getSession()) || { data: {} };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options;

    try {
      const authHeaders = requiresAuth ? await this.getAuthHeaders() : {};

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...restOptions,
        headers: {
          ...authHeaders,
          ...headers,
        },
        // CRÍTICO: sempre incluir credentials para enviar cookies de sessão
        credentials: "include",
      });

      // Log para debug em desenvolvimento
      if (process.env.NODE_ENV === "development") {
        console.log(
          `API ${options.method || "GET"} ${endpoint}:`,
          response.status
        );
      }

      // Tratar erro 401 especificamente
      if (response.status === 401) {
        // Em vez de tentar renovar o token aqui,
        // vamos deixar o erro propagar para o componente tratar
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details || errorData.error || "Não autenticado"
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Erro na requisição: ${response.status}`
        );
      }

      // Retornar resposta parseada
      return await response.json();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Erro na API ${endpoint}:`, error);
      }
      throw error;
    }
  }

  // Métodos convenientes
  get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  patch<T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Exportar instância única
export const apiClient = new ApiClient();

// Helpers específicos para consultas
export const consultasApi = {
  // Criar nova consulta
  criar: (dados: any) => apiClient.post("/api/consultas", dados),

  // Buscar consultas do profissional
  listarPorProfissional: (profissionalId: string, params?: URLSearchParams) => {
    const queryString = params ? `?${params.toString()}` : "";
    return apiClient.get(
      `/api/consultas/profissional/${profissionalId}${queryString}`
    );
  },

  // Confirmar consulta
  confirmar: (consultaId: string) =>
    apiClient.post(`/api/consultas/${consultaId}/confirmar`),

  // Rejeitar consulta
  rejeitar: (consultaId: string, motivo?: string) =>
    apiClient.post(`/api/consultas/${consultaId}/rejeitar`, { motivo }),

  // Cancelar consulta
  cancelar: (consultaId: string, motivo?: string) =>
    apiClient.post(`/api/consultas/${consultaId}/cancelar`, { motivo }),

  // Buscar slots disponíveis
  buscarSlots: (profissionalId: string, data: string) =>
    apiClient.get(
      `/api/consultas/profissional/${profissionalId}/slots?data=${data}`
    ),
};
