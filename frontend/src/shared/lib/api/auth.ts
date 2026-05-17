/**
 * Módulo de API para autenticação.
 * Encapsula todos os endpoints de auth do backend.
 *
 * Estratégia de sessão (ADR-004 MVP Lean):
 * - JWT único de 7 dias armazenado em localStorage via setToken/getToken.
 * - Dados públicos do usuário cacheados em localStorage para restauração de sessão.
 * - Sem refresh token, sem cookie de sessão.
 */

import { apiRequest, setToken } from '../api-client';

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

function saveUserToCache(user: ApiUser): void {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    // Ignora falha no localStorage (ex: modo privado restrito)
  }
}

/**
 * Lê os dados do usuário do cache em localStorage.
 * Retorna null quando não há sessão salva ou em ambiente SSR.
 */
export function getCachedUser(): ApiUser | null {
  if (typeof window === 'undefined') return null;
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
 * const user = await authApi.login('user@example.com', 'senha123');
 */
export const authApi = {
  /**
   * Autentica o usuário, persiste o JWT e o perfil em localStorage.
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
    setToken(res.data.accessToken);
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
   * Encerra a sessão: limpa o JWT e o cache do usuário em localStorage.
   * Notifica o backend de forma best-effort (sem cookie a invalidar).
   */
  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      setToken(null);
      clearUserCache();
    }
  },
};
