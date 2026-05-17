import { reviewsApi, type ApiReview } from '@/shared/lib/api/reviews';

const mockApiRequest = jest.fn();

jest.mock('@/shared/lib/api-client', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

beforeEach(() => {
  mockApiRequest.mockReset();
});

describe('reviewsApi.list', () => {
  it('chama endpoint de reviews com skipAuth', async () => {
    const response = {
      success: true,
      data: [] as ApiReview[],
    };
    mockApiRequest.mockResolvedValueOnce(response);

    await reviewsApi.list('prod-1');

    expect(mockApiRequest).toHaveBeenCalledWith('/api/products/prod-1/reviews', {
      skipAuth: true,
    });
  });

  it('retorna lista de reviews', async () => {
    const response = {
      success: true,
      data: [
        {
          id: 'rev-1',
          title: 'Excelente',
          body: 'Produto impecavel',
          rating: 5,
          user: { id: 'user-1', name: 'Ana' },
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ] as ApiReview[],
    };
    mockApiRequest.mockResolvedValueOnce(response);

    const result = await reviewsApi.list('prod-1');

    expect(result).toEqual(response);
  });
});

describe('reviewsApi.create', () => {
  it('chama endpoint de criacao com metodo POST e body serializado', async () => {
    const payload = {
      title: 'Muito bom',
      body: 'Recomendo',
      rating: 4,
    };
    mockApiRequest.mockResolvedValueOnce({ success: true, data: {} });

    await reviewsApi.create('prod-1', payload);

    expect(mockApiRequest).toHaveBeenCalledWith('/api/products/prod-1/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });
});

describe('reviewsApi.delete', () => {
  it('chama endpoint de remocao com metodo DELETE', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });

    await reviewsApi.delete('rev-1');

    expect(mockApiRequest).toHaveBeenCalledWith('/api/reviews/rev-1', {
      method: 'DELETE',
    });
  });
});
