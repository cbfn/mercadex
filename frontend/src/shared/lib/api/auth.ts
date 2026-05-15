/**
 * Módulo de API para autenticação.
 * Encapsula todos os endpoints de auth do backend.
 *
 * Estratégia de sessão:
 * - Access token em memória (via api-client).
 * - Refresh token em cookie HTTP-only (gerenciado pelo backend).
 * - Dados públicos do usuário cacheados em localStorage para restauração de sessão.
 */

import { apiRequest, setAccessToken } from '../api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const USER_CACHE_KEY = 'mercadex:auth-user';

/** Dados públicos do usuário retornados pela API. */
export interface ApiUser {
  id: string;
  name: string | null;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface LoginResponse {
  success: boolean;
  data: { accessToken: string; user: ApiUser };
}

interface RefreshResponse {
  success: boolean;
  data: { accessToken: string };
}

function saveUserToCache(user: ApiUser): void {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    // Ignora falha no localStorage (ex: modo privado restrito)
  }
}

function readUserFromCache(): ApiUser | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as ApiUser) : null;
  } catch {
    return null;
  }
}

function clearUserCache(): void {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    // Ignora falha
  }
}

/**
 * Módulo de chamadas HTTP para autenticação.
 *
 * @example
 * const { user } = await authApi.login('user@example.com', 'senha123');
 */
export const authApi = {
  /**
   * Autentica o usuário, armazena o access token em memória
   * e faz cache dos dados públicos do usuário em localStorage.
   *
   * @param email - Email do usuário.
   * @param password - Senha do usuário.
   * @returns Dados públicos do usuário autenticado.
   */
  async login(email: string, password: string): Promise<ApiUser> {
    const res = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    setAccessToken(res.data.accessToken);
    saveUserToCache(res.data.user);
    return res.data.user;
  },

  /**
   * Cadastra um novo usuário.
   *
   * @param name - Nome completo (2–100 caracteres).
   * @param email - Email válido.
   * @param password - Senha (mínimo 8 caracteres).
   */
  async register(name: string, email: string, password: string): Promise<void> {
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      skipAuth: true,
    });
  },

  /**
   * Encerra a sessão: limpa o access token em memória, o cache do usuário
   * e invalida o refresh token cookie via backend.
   */
  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
      clearUserCache();
    }
  },

  /**
   * Restaura a sessão do usuário usando o refresh token (cookie HTTP-only).
   * Obtém um novo access token e lê os dados do usuário do cache local.
   *
   * Retorna null se não houver sessão ativa.
   *
   * @remarks
   * Quando o backend implementar GET /api/auth/me, esta função poderá
   * ser simplificada para usar apiRequest diretamente (o api-client
   * já trata o refresh 401 automaticamente).
   */
  async me(): Promise<ApiUser | null> {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        clearUserCache();
        return null;
      }
      const data = (await res.json()) as RefreshResponse;
      setAccessToken(data.data.accessToken);
      return readUserFromCache();
    } catch {
      return null;
    }
  },
};
