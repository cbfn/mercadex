import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductsAdmin } from '@/features/admin/model/use-products-admin';
import type { ApiProduct } from '@/shared/lib/api/products';

const mockList = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/shared/lib/api/products', () => ({
  productsApi: {
    list: (...args: unknown[]) => mockList(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

beforeEach(() => {
  mockList.mockReset();
  mockCreate.mockReset();
  mockUpdate.mockReset();
  mockDelete.mockReset();
});

const mockApiProduct: ApiProduct = {
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

describe('useProductsAdmin', () => {
  it('inicia em carregamento e busca produtos', async () => {
    mockList.mockResolvedValueOnce({ data: { items: [mockApiProduct], pagination: {} } });

    const { result } = renderHook(() => useProductsAdmin());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0]).toEqual(mockApiProduct);
  });

  it('error é null em caso de sucesso', async () => {
    mockList.mockResolvedValueOnce({ data: { items: [], pagination: {} } });

    const { result } = renderHook(() => useProductsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
  });

  it('define mensagem de erro quando fetch falha', async () => {
    mockList.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useProductsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.error).toContain('Não foi possível carregar');
  });

  it('refetch recarrega lista de produtos', async () => {
    mockList.mockResolvedValueOnce({ data: { items: [], pagination: {} } });

    const { result } = renderHook(() => useProductsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockList.mockResolvedValueOnce({ data: { items: [mockApiProduct], pagination: {} } });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.products).toHaveLength(1);
  });

  it('refetch limpa erro anterior em caso de sucesso', async () => {
    mockList.mockRejectedValueOnce(new Error('err'));

    const { result } = renderHook(() => useProductsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).not.toBeNull();

    mockList.mockResolvedValueOnce({ data: { items: [], pagination: {} } });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
  });

  it('deleteProduct remove produto da lista', async () => {
    mockList.mockResolvedValueOnce({ data: { items: [mockApiProduct], pagination: {} } });
    mockDelete.mockResolvedValueOnce({});

    const { result } = renderHook(() => useProductsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteProduct('prod-1');
    });

    expect(result.current.products).toHaveLength(0);
  });

  it('createProduct adiciona produto ao início da lista', async () => {
    mockList.mockResolvedValueOnce({ data: { items: [], pagination: {} } });
    const newProduct = { ...mockApiProduct, id: 'prod-2', title: 'New Phone' };
    mockCreate.mockResolvedValueOnce({ data: newProduct });

    const { result } = renderHook(() => useProductsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const payload = {
      title: 'New Phone',
      price: 1000,
      condition: 'NOVO' as const,
      categoryId: 'cat-1',
      stock: 5,
      images: [],
    };

    let created: typeof newProduct | undefined;
    await act(async () => {
      created = await result.current.createProduct(payload);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].title).toBe('New Phone');
    expect(created).toEqual(newProduct);
  });

  it('updateProduct atualiza produto na lista', async () => {
    mockList.mockResolvedValueOnce({ data: { items: [mockApiProduct], pagination: {} } });
    const updated = { ...mockApiProduct, price: 3999 };
    mockUpdate.mockResolvedValueOnce({ data: updated });

    const { result } = renderHook(() => useProductsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let updatedResult: typeof mockApiProduct | undefined;
    await act(async () => {
      updatedResult = await result.current.updateProduct('prod-1', { price: 3999 });
    });

    expect(result.current.products[0].price).toBe(3999);
    expect(updatedResult?.price).toBe(3999);
  });

  it('expõe função refetch no resultado', async () => {
    mockList.mockResolvedValueOnce({ data: { items: [], pagination: {} } });

    const { result } = renderHook(() => useProductsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(typeof result.current.refetch).toBe('function');
  });
});
