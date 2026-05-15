/**
 * Módulo de API para produtos e categorias.
 * Encapsula os endpoints do backend (prefixo: /api/products e /api/categories).
 *
 * Endpoints:
 * - GET  /api/products              → lista paginada (público)
 * - GET  /api/products/:id          → detalhe (público)
 * - POST /api/products              → criação (admin)
 * - PUT  /api/products/:id          → atualização parcial (admin)
 * - DELETE /api/products/:id        → soft-delete (admin)
 * - GET  /api/categories            → lista de categorias (público)
 * - POST /api/categories            → criação de categoria (admin)
 */

import { apiRequest } from '../api-client';

/** Categoria de produto. */
export interface ApiCategory {
  id: string;
  name: string;
  description: string | null;
}

/** Vendedor resumido incluído no objeto de produto. */
export interface ApiProductSeller {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

/** Produto completo retornado pela API. */
export interface ApiProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  condition: 'NOVO' | 'EXCELENTE' | 'BOM' | 'USADO';
  images: string[];
  stock: number;
  active: boolean;
  viewsCount: number;
  category: ApiCategory;
  seller: ApiProductSeller;
  createdAt: string;
  updatedAt: string;
}

/** Metadados de paginação retornados nas listagens. */
export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Filtros aceitos pelo endpoint GET /api/products. */
export interface ProductFilters {
  /** ID ou nome da categoria. */
  category?: string;
  /** Texto de busca (title ou description). */
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: 'NOVO' | 'EXCELENTE' | 'BOM' | 'USADO';
  /** Padrão: 'newest'. */
  sort?: 'price_asc' | 'price_desc' | 'newest';
  /** Padrão: 1. */
  page?: number;
  /** Padrão: 20 (máx: 100). */
  limit?: number;
}

/** Payload para criar ou atualizar um produto. */
export interface ProductPayload {
  title: string;
  description?: string;
  price: number;
  condition: 'NOVO' | 'EXCELENTE' | 'BOM' | 'USADO';
  categoryId: string;
  stock: number;
  images: string[];
}

interface ProductListResponse {
  success: boolean;
  data: { items: ApiProduct[]; pagination: ApiPagination };
}

interface ProductResponse {
  success: boolean;
  data: ApiProduct;
}

interface CategoryListResponse {
  success: boolean;
  data: ApiCategory[];
}

interface CategoryResponse {
  success: boolean;
  data: ApiCategory;
}

/**
 * Módulo de chamadas HTTP para produtos e categorias.
 *
 * @example
 * const res = await productsApi.list({ search: 'iphone', sort: 'price_asc' });
 * console.log(res.data.items, res.data.pagination);
 */
export const productsApi = {
  /**
   * Lista produtos com filtros opcionais.
   * Endpoint público — não exige autenticação.
   *
   * @param filters - Filtros de busca, condição, preço, categoria e ordenação.
   */
  list(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) params.set(key, String(value));
    }
    const query = params.toString();
    return apiRequest<ProductListResponse>(
      `/api/products${query ? `?${query}` : ''}`,
      { skipAuth: true },
    );
  },

  /**
   * Busca um produto pelo UUID.
   * Endpoint público — não exige autenticação.
   *
   * @param id - UUID do produto.
   * @throws {ApiError} 404 se o produto não existir ou não estiver ativo.
   */
  get(id: string): Promise<ProductResponse> {
    return apiRequest<ProductResponse>(`/api/products/${id}`, { skipAuth: true });
  },

  /**
   * Cria um produto. Requer role ADMIN.
   *
   * @param payload - Dados completos do produto.
   * @throws {ApiError} 403 se não for admin; 404 se categoryId não existir.
   */
  create(payload: ProductPayload): Promise<ProductResponse> {
    return apiRequest<ProductResponse>('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Atualiza campos de um produto. Requer role ADMIN.
   *
   * @param id - UUID do produto.
   * @param payload - Campos a atualizar (todos opcionais).
   * @throws {ApiError} 403 se não for admin; 404 se produto não existir.
   */
  update(id: string, payload: Partial<ProductPayload>): Promise<ProductResponse> {
    return apiRequest<ProductResponse>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Faz soft-delete de um produto (active = false). Requer role ADMIN.
   *
   * @param id - UUID do produto.
   * @throws {ApiError} 403 se não for admin; 404 se produto não existir.
   */
  delete(id: string): Promise<ProductResponse> {
    return apiRequest<ProductResponse>(`/api/products/${id}`, { method: 'DELETE' });
  },

  /**
   * Lista todas as categorias. Endpoint público.
   */
  listCategories(): Promise<CategoryListResponse> {
    return apiRequest<CategoryListResponse>('/api/categories', { skipAuth: true });
  },

  /**
   * Cria uma categoria. Requer role ADMIN.
   *
   * @param name - Nome único da categoria (2–120 caracteres).
   * @param description - Descrição opcional.
   * @throws {ApiError} 409 se o nome já existir.
   */
  createCategory(name: string, description?: string): Promise<CategoryResponse> {
    return apiRequest<CategoryResponse>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },
};
