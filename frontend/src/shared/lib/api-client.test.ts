import { setAccessToken, getAccessToken, apiRequest, ApiError } from '@/shared/lib/api-client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  setAccessToken(null);
  mockFetch.mockReset();
});

describe('setAccessToken / getAccessToken', () => {
  it('retorna null inicialmente', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('armazena e retorna o token', () => {
    setAccessToken('meu-token');
    expect(getAccessToken()).toBe('meu-token');
  });

  it('limpa o token quando null é passado', () => {
    setAccessToken('tok');
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
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

  it('envia credentials: include', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });
    await apiRequest('/api/test');
    expect(mockFetch.mock.calls[0][1].credentials).toBe('include');
  });

  it('envia header Authorization quando token está definido', async () => {
    setAccessToken('test-token');
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

    await apiRequest('/api/test');
    expect(mockFetch.mock.calls[0][1].headers['Authorization']).toBe('Bearer test-token');
  });

  it('não envia header Authorization quando não há token', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

    await apiRequest('/api/test');
    expect(mockFetch.mock.calls[0][1].headers['Authorization']).toBeUndefined();
  });

  it('não envia Authorization quando skipAuth é true mesmo com token', async () => {
    setAccessToken('test-token');
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

  it('em 401, tenta refresh e repete requisição com sucesso', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { accessToken: 'new-token' } }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'retried' }),
    });

    const result = await apiRequest<{ data: string }>('/api/test');
    expect(result).toEqual({ data: 'retried' });
    expect(getAccessToken()).toBe('new-token');
  });

  it('em 401, lança SESSION_EXPIRED quando refresh falha', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    await expect(apiRequest('/api/test')).rejects.toMatchObject({ status: 401 });
  });

  it('em 401, lança quando refresh lança erro de rede', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(apiRequest('/api/test')).rejects.toMatchObject({ status: 401 });
  });

  it('em 401, lança ApiError quando a requisição repetida falha', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { accessToken: 'new-token' } }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Forbidden' }),
    });

    await expect(apiRequest('/api/test')).rejects.toBeInstanceOf(ApiError);
  });

  it('com skipAuth e 401, não tenta refresh e lança ApiError', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    });

    await expect(apiRequest('/api/test', { skipAuth: true })).rejects.toBeInstanceOf(ApiError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
