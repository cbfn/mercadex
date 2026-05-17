'use client';

/**
 * Contexto de autenticação da aplicação.
 * Gerencia estado do usuário, login, logout, registro e restauração de sessão.
 *
 * Estratégia de sessão (ADR-004 MVP Lean):
 * Sessão restaurada de forma síncrona a partir de localStorage no primeiro mount.
 * Sem chamada de rede para restaurar sessão — token de 7 dias em localStorage.
 */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getToken } from '@/shared/lib/api-client';
import { authApi, getCachedUser, type ApiUser } from '@/shared/lib/api/auth';

interface AuthContextValue {
  /** Usuário autenticado ou null quando não há sessão ativa. */
  user: ApiUser | null;
  /** True apenas no primeiro render, antes de ler o localStorage. */
  isLoading: boolean;
  /**
   * Autentica o usuário com email e senha.
   * @throws {ApiError} 401 se as credenciais forem inválidas.
   */
  login: (email: string, password: string) => Promise<void>;
  /** Encerra a sessão atual e limpa localStorage. */
  logout: () => Promise<void>;
  /**
   * Registra um novo usuário.
   * @throws {ApiError} 409 se o email já estiver cadastrado.
   */
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provedor de autenticação. Deve envolver toda a aplicação no layout raiz.
 * Restaura sessão de forma síncrona a partir do localStorage na inicialização.
 *
 * @example
 * <AuthProvider>{children}</AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura sessão sincronamente a partir do localStorage — sem chamada de rede.
  useEffect(() => {
    const token = getToken();
    const cached = getCachedUser();
    if (token && cached) setUser(cached);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const userData = await authApi.login(email, password);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await authApi.register(name, email, password);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de autenticação.
 * Deve ser usado dentro de um componente filho de {@link AuthProvider}.
 *
 * @throws {Error} Se usado fora do AuthProvider.
 *
 * @example
 * const { user, login, logout } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
