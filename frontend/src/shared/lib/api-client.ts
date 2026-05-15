/**
 * Cliente HTTP centralizado com suporte a JWT e refresh automático.
 * Todas as chamadas à API devem usar este módulo.
 *
 * Segurança: access token armazenado apenas em memória (nunca em localStorage).
 * O refresh token trafega via cookie HTTP-only gerenciado pelo backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/** Access token em memória — limpo ao recarregar a página (seguro por design). */
let accessToken: string | null = null;

/**
 * Define o access token em memória.
 * @param token - Token JWT ou null para limpar.
 */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/**
 * Retorna o access token atual armazenado em memória.
 * @returns Token JWT ou null se não autenticado.
 */
export function getAccessToken(): string | null {
  return accessToken;
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
 * Faz uma requisição autenticada para a API.
 * Em caso de 401, tenta renovar o access token via refresh token (cookie)
 * e repete a requisição automaticamente uma vez.
 *
 * @param path - Caminho relativo do endpoint (ex: `/api/auth/me`).
 * @param options - Opções de fetch estendidas com `skipAuth`.
 * @returns Dados da resposta deserializados como `T`.
 * @throws {ApiError} Quando a resposta não é OK após todas as tentativas.
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
    credentials: 'include',
  });

  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryHeaders = buildHeaders(fetchOptions.headers, false);
      const retryRes = await fetch(`${API_URL}${path}`, {
        ...fetchOptions,
        headers: retryHeaders,
        credentials: 'include',
      });
      if (!retryRes.ok) throw new ApiError(retryRes.status, await retryRes.json());
      return retryRes.json() as T;
    }
    throw new ApiError(401, { error: { code: 'SESSION_EXPIRED' } });
  }

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

  if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { data: { accessToken: string } };
    setAccessToken(data.data.accessToken);
    return true;
  } catch {
    return false;
  }
}
