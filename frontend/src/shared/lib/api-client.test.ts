import { setToken, getToken, apiRequest, ApiError } from '@/shared/lib/api-client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  localStorage.clear();
  mockFetch.mockReset();
});

describe('setToken / getToken', () => {
  it('retorna null quando localStorage está vazio', () => {
    expect(getToken()).toBeNull();
  });

  it('armazena e retorna o token via localStorage', () => {
    setToken('meu-token');
    expect(getToken()).toBe('meu-token');
    expect(localStorage.getItem('mercadex_token')).toBe('meu-token');
  });

  it('remove o token do localStorage quando null é passado', () => {
    setToken('tok');
    setToken(null);
    expect(getToken()).toBeNull();
    expect(localStorage.getItem('mercadex_token')).toBeNull();
  });
});

describe('ApiError', () => {
  it('cria instância com status e body', () => {
    const err = new ApiError(404, { message: 'Not found' });
    expect(err.status).toBe(404);
    expect(err.body).toEqual({ message: 'Not found' });
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('ApiError 404');
    expect(err instanceof Error).toBe(true);
  });

  it('funciona como instanceof ApiError', () => {
    const err = new ApiError(500, {});
    expect(err instanceof ApiError).toBe(true);
  });
});

describe('apiRequest', () => {
  it('retorna dados em requisição bem-sucedida', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'hello' }),
    });

    const result = await apiRequest<{ data: string }>('/api/test');
    expect(result).toEqual({ data: 'hello' });
  });

  it('envia URL correta', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });
    await apiRequest('/api/test');
    expect(mockFetch.mock.calls[0][0]).toContain('/api/test');
  });

  it('não envia credentials: include', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });
    await apiRequest('/api/test');
    expect(mockFetch.mock.calls[0][1].credentials).toBeUndefined();
  });

  it('envia header Authorization quando token está no localStorage', async () => {
    setToken('test-token');
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

    await apiRequest('/api/test');
    expect(mockFetch.mock.calls[0][1].headers['Authorization']).toBe('Bearer test-token');
  });

  it('não envia header Authorization quando localStorage está vazio', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

    await apiRequest('/api/test');
    expect(mockFetch.mock.calls[0][1].headers['Authorization']).toBeUndefined();
  });

  it('não envia Authorization quando skipAuth é true mesmo com token', async () => {
    setToken('test-token');
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

    await apiRequest('/api/test', { skipAuth: true });
    expect(mockFetch.mock.calls[0][1].headers['Authorization']).toBeUndefined();
  });

  it('lança ApiError em resposta não-ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' }),
    });

    await expect(apiRequest('/api/test')).rejects.toBeInstanceOf(ApiError);
  });

  it('lança ApiError com status correto', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ error: 'Unprocessable' }),
    });

    await expect(apiRequest('/api/test')).rejects.toMatchObject({ status: 422 });
  });

  it('em 401, lança ApiError diretamente sem tentar refresh', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: 'UNAUTHORIZED' } }),
    });

    await expect(apiRequest('/api/test')).rejects.toMatchObject({ status: 401 });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('com skipAuth e 401, lança ApiError sem chamadas adicionais', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    });

    await expect(apiRequest('/api/test', { skipAuth: true })).rejects.toBeInstanceOf(ApiError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
