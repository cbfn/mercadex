import { productsApi } from '@/shared/lib/api/products';

const mockApiRequest = jest.fn();

jest.mock('@/shared/lib/api-client', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

beforeEach(() => {
  mockApiRequest.mockReset();
});

const mockProduct = {
  id: 'prod-1',
  title: 'iPhone 15',
  description: 'Great phone',
  price: 4999,
  condition: 'NOVO' as const,
  images: ['image.jpg'],
  stock: 10,
  active: true,
  viewsCount: 100,
  category: { id: 'cat-1', name: 'Smartphones', description: null },
  seller: { id: 'seller-1', name: 'TechStore', email: 'tech@store.com', avatarUrl: null },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('productsApi.list', () => {
  it('chama endpoint sem filtros', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: { items: [], pagination: {} } });

    await productsApi.list();
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({ skipAuth: true }),
    );
  });

  it('adiciona parâmetros de filtro na URL', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: { items: [], pagination: {} } });

    await productsApi.list({ search: 'iphone', sort: 'price_asc', limit: 20 });
    const url = mockApiRequest.mock.calls[0][0] as string;
    expect(url).toContain('search=iphone');
    expect(url).toContain('sort=price_asc');
    expect(url).toContain('limit=20');
  });

  it('não adiciona parâmetros undefined', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: { items: [], pagination: {} } });

    await productsApi.list({ search: 'iphone', category: undefined });
    const url = mockApiRequest.mock.calls[0][0] as string;
    expect(url).not.toContain('category');
  });

  it('retorna resposta da API', async () => {
    const mockResponse = { success: true, data: { items: [mockProduct], pagination: { page: 1, total: 1 } } };
    mockApiRequest.mockResolvedValueOnce(mockResponse);

    const result = await productsApi.list();
    expect(result).toEqual(mockResponse);
  });
});

describe('productsApi.get', () => {
  it('chama endpoint correto', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: mockProduct });

    await productsApi.get('prod-1');
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/products/prod-1',
      expect.objectContaining({ skipAuth: true }),
    );
  });

  it('retorna produto', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: mockProduct });
    const result = await productsApi.get('prod-1');
    expect(result.data).toEqual(mockProduct);
  });
});

describe('productsApi.create', () => {
  const payload = {
    title: 'New Product',
    price: 999,
    condition: 'NOVO' as const,
    categoryId: 'cat-1',
    stock: 5,
    images: [],
  };

  it('chama endpoint POST', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: mockProduct });

    await productsApi.create(payload);
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('serializa payload no body', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: mockProduct });

    await productsApi.create(payload);
    const body = JSON.parse(mockApiRequest.mock.calls[0][1].body);
    expect(body.title).toBe('New Product');
  });
});

describe('productsApi.update', () => {
  it('chama endpoint PUT', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: mockProduct });

    await productsApi.update('prod-1', { price: 4000 });
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/products/prod-1',
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('serializa payload parcial no body', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: mockProduct });

    await productsApi.update('prod-1', { price: 4000 });
    const body = JSON.parse(mockApiRequest.mock.calls[0][1].body);
    expect(body.price).toBe(4000);
  });
});

describe('productsApi.delete', () => {
  it('chama endpoint DELETE', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: mockProduct });

    await productsApi.delete('prod-1');
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/products/prod-1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

describe('productsApi.listCategories', () => {
  it('chama endpoint de categorias', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true, data: [] });

    await productsApi.listCategories();
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/categories',
      expect.objectContaining({ skipAuth: true }),
    );
  });

  it('retorna lista de categorias', async () => {
    const cats = [{ id: 'cat-1', name: 'Smartphones', description: null }];
    mockApiRequest.mockResolvedValueOnce({ success: true, data: cats });

    const result = await productsApi.listCategories();
    expect(result.data).toEqual(cats);
  });
});

describe('productsApi.createCategory', () => {
  it('chama endpoint POST de categorias', async () => {
    mockApiRequest.mockResolvedValueOnce({
      success: true,
      data: { id: 'cat-2', name: 'New Cat', description: 'desc' },
    });

    await productsApi.createCategory('New Cat', 'desc');
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/api/categories',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('funciona sem descrição', async () => {
    mockApiRequest.mockResolvedValueOnce({
      success: true,
      data: { id: 'cat-2', name: 'New Cat', description: null },
    });

    await productsApi.createCategory('New Cat');
    const body = JSON.parse(mockApiRequest.mock.calls[0][1].body);
    expect(body.name).toBe('New Cat');
    expect(body.description).toBeUndefined();
  });
});
