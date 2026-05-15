'use client';

/**
 * Hook de gerenciamento de produtos para o painel administrativo.
 * Consome a API real de produtos (GET /api/products, DELETE /api/products/:id, etc).
 * Requer que o usuário esteja autenticado com role ADMIN.
 */

import { useCallback, useEffect, useState } from 'react';
import { productsApi, type ApiProduct, type ProductPayload } from '@/shared/lib/api/products';

interface UseProductsAdminResult {
  products: ApiProduct[];
  isLoading: boolean;
  /** Mensagem de erro ou null quando não há erro. */
  error: string | null;
  /** Recarrega a lista do servidor. */
  refetch: () => Promise<void>;
  /** Remove um produto pelo ID (soft-delete). */
  deleteProduct: (id: string) => Promise<void>;
  /** Cria um novo produto e adiciona à lista local. */
  createProduct: (payload: ProductPayload) => Promise<ApiProduct>;
  /** Atualiza um produto existente e reflete na lista local. */
  updateProduct: (id: string, payload: Partial<ProductPayload>) => Promise<ApiProduct>;
}

/**
 * Hook para gestão de produtos no painel admin.
 * Busca todos os produtos paginados (limit=100) e expõe ações de CRUD.
 *
 * @example
 * const { products, isLoading, deleteProduct } = useProductsAdmin();
 */
export function useProductsAdmin(): UseProductsAdminResult {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productsApi.list({ limit: 100, sort: 'newest' });
      setProducts(res.data.items);
    } catch {
      setError('Não foi possível carregar os produtos. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    await productsApi.delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const createProduct = useCallback(async (payload: ProductPayload): Promise<ApiProduct> => {
    const res = await productsApi.create(payload);
    setProducts((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  const updateProduct = useCallback(
    async (id: string, payload: Partial<ProductPayload>): Promise<ApiProduct> => {
      const res = await productsApi.update(id, payload);
      setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      return res.data;
    },
    [],
  );

  return { products, isLoading, error, refetch: fetchProducts, deleteProduct, createProduct, updateProduct };
}
