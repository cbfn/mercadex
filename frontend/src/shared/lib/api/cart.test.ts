import { cartApi } from '@/shared/lib/api/cart';

const mockApiRequest = jest.fn();

jest.mock('@/shared/lib/api-client', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

beforeEach(() => {
  mockApiRequest.mockReset();
});

const mockCart = {
  id: 'cart-1',
  userId: 'user-1',
  items: [],
  total: 0,
};

describe('cartApi.get', () => {
  it('chama GET /api/cart', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: mockCart });
    await cartApi.get();
    expect(mockApiRequest).toHaveBeenCalledWith('/api/cart');
  });

  it('retorna resposta da API', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: mockCart });
    const result = await cartApi.get();
    expect(result.data).toEqual(mockCart);
  });
});

describe('cartApi.addItem', () => {
  it('chama POST /api/cart/items com productId e quantity', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: {} });
    await cartApi.addItem('prod-1', 2);
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/cart/items',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(mockApiRequest.mock.calls[0][1].body);
    expect(body).toEqual({ productId: 'prod-1', quantity: 2 });
  });

  it('usa quantity padrão 1 quando não informada', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: {} });
    await cartApi.addItem('prod-1');
    const body = JSON.parse(mockApiRequest.mock.calls[0][1].body);
    expect(body.quantity).toBe(1);
  });
});

describe('cartApi.updateItem', () => {
  it('chama PUT /api/cart/items/:id', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: {} });
    await cartApi.updateItem('item-1', 3);
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/cart/items/item-1',
      expect.objectContaining({ method: 'PUT' }),
    );
    const body = JSON.parse(mockApiRequest.mock.calls[0][1].body);
    expect(body).toEqual({ quantity: 3 });
  });
});

describe('cartApi.removeItem', () => {
  it('chama DELETE /api/cart/items/:id', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: mockCart });
    await cartApi.removeItem('item-1');
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/cart/items/item-1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

describe('cartApi.clear', () => {
  it('chama DELETE /api/cart', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: mockCart });
    await cartApi.clear();
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/cart',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
