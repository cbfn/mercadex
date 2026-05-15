'use client';

/**
 * Contexto de autenticação da aplicação.
 * Gerencia estado do usuário, login, logout, registro e restauração de sessão.
 */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, type ApiUser } from '@/shared/lib/api/auth';

interface AuthContextValue {
  /** Usuário autenticado ou null quando não há sessão ativa. */
  user: ApiUser | null;
  /** True enquanto a sessão está sendo verificada no carregamento inicial. */
  isLoading: boolean;
  /**
   * Autentica o usuário com email e senha.
   * @throws {ApiError} 401 se as credenciais forem inválidas.
   */
  login: (email: string, password: string) => Promise<void>;
  /** Encerra a sessão atual. */
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
 * Tenta restaurar sessão via refresh token (cookie HTTP-only) na inicialização.
 *
 * @example
 * <AuthProvider>{children}</AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura sessão ao montar — usa o refresh token (HTTP-only cookie)
  useEffect(() => {
    authApi
      .me()
      .then((restored) => setUser(restored))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
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
