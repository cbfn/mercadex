/**
 * Módulo de API para carrinho de compras.
 * Interface para os endpoints que serão implementados na Trilha 3 (backend).
 *
 * Endpoints esperados (prefixo: /api/cart):
 * - GET    /api/cart              → retorna o carrinho do usuário autenticado
 * - POST   /api/cart/items        → adiciona item ao carrinho
 * - PUT    /api/cart/items/:id    → atualiza quantidade de um item
 * - DELETE /api/cart/items/:id    → remove um item do carrinho
 * - DELETE /api/cart              → limpa todos os itens do carrinho
 *
 * Schema Prisma de referência:
 * - Cart: { id, userId, sessionId, updatedAt, items[] }
 * - CartItem: { id, cartId, productId, quantity }
 */

import { apiRequest } from '../api-client';

/** Item do carrinho retornado pela API (com produto embutido). */
export interface ApiCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    condition: 'NOVO' | 'EXCELENTE' | 'BOM' | 'USADO';
    stock: number;
  };
}

/** Carrinho completo retornado pela API. */
export interface ApiCart {
  id: string;
  userId: string;
  items: ApiCartItem[];
  total: number;
}

interface CartResponse {
  success: boolean;
  data: ApiCart;
}

interface CartItemResponse {
  success: boolean;
  data: ApiCartItem;
}

/**
 * Módulo de chamadas HTTP para o carrinho de compras.
 * Todos os endpoints requerem autenticação (access token em memória).
 *
 * @example
 * const cart = await cartApi.get();
 * await cartApi.addItem('product-uuid', 2);
 */
export const cartApi = {
  /**
   * Retorna o carrinho do usuário autenticado com todos os itens.
   */
  get(): Promise<CartResponse> {
    return apiRequest<CartResponse>('/api/cart');
  },

  /**
   * Adiciona um produto ao carrinho ou incrementa a quantidade se já existir.
   *
   * @param productId - UUID do produto.
   * @param quantity - Quantidade a adicionar (padrão: 1).
   */
  addItem(productId: string, quantity: number = 1): Promise<CartItemResponse> {
    return apiRequest<CartItemResponse>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  /**
   * Atualiza a quantidade de um item específico no carrinho.
   *
   * @param itemId - UUID do CartItem.
   * @param quantity - Nova quantidade absoluta (mínimo 1).
   */
  updateItem(itemId: string, quantity: number): Promise<CartItemResponse> {
    return apiRequest<CartItemResponse>(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  /**
   * Remove um item do carrinho pelo ID do CartItem.
   *
   * @param itemId - UUID do CartItem.
   */
  removeItem(itemId: string): Promise<CartResponse> {
    return apiRequest<CartResponse>(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Limpa todos os itens do carrinho do usuário autenticado.
   */
  clear(): Promise<CartResponse> {
    return apiRequest<CartResponse>('/api/cart', { method: 'DELETE' });
  },
};
