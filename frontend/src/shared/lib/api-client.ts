/**
 * Cliente HTTP centralizado com suporte a JWT.
 * Todas as chamadas à API devem usar este módulo.
 *
 * Estratégia de sessão (ADR-004 MVP Lean):
 * Token único com expiração de 7 dias armazenado em localStorage.
 * Sem refresh token, sem cookie de sessão.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const TOKEN_KEY = 'mercadex_token';

/**
 * Persiste o JWT em localStorage ou o remove quando null.
 * @param token - Token JWT ou null para encerrar sessão.
 */
export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Lê o JWT do localStorage.
 * Retorna null em ambiente SSR ou quando não há sessão ativa.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Opções de fetch com flag para pular autenticação (ex: login/register). */
export interface ApiOptions extends RequestInit {
  /** Quando true, não envia o header Authorization. */
  skipAuth?: boolean;
}

/**
 * Erro tipado retornado pela API.
 * Carrega o status HTTP e o corpo da resposta de erro.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`ApiError ${status}`);
    this.name = 'ApiError';
  }
}

/**
 * Faz uma requisição para a API.
 * Envia o JWT via header Authorization quando disponível.
 * Em caso de 401, lança ApiError diretamente (sem retry).
 *
 * @param path - Caminho relativo do endpoint (ex: `/api/products`).
 * @param options - Opções de fetch estendidas com `skipAuth`.
 * @returns Dados da resposta deserializados como `T`.
 * @throws {ApiError} Quando a resposta não é OK.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers = buildHeaders(fetchOptions.headers, skipAuth);

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.json());
  }

  return res.json() as T;
}

function buildHeaders(
  extra: RequestInit['headers'],
  skipAuth: boolean,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}
