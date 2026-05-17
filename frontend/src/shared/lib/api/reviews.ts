/**
 * Módulo de API para reviews de produtos.
 * Encapsula os endpoints de avaliações do backend.
 */

import { apiRequest } from '../api-client';

/** Dados de uma avaliação retornada pela API. */
export interface ApiReview {
  id: string;
  title: string;
  body: string;
  rating: number;
  user: { id: string; name: string | null };
  createdAt: string;
}

/**
 * Módulo de chamadas HTTP para reviews.
 *
 * @example
 * const { data } = await reviewsApi.list('product-id');
 */
export const reviewsApi = {
  /**
   * Lista todas as avaliações de um produto.
   * @param productId - ID do produto.
   */
  list: (productId: string) =>
    apiRequest<{ success: boolean; data: ApiReview[] }>(
      `/api/products/${productId}/reviews`,
      { skipAuth: true },
    ),

  /**
   * Cria uma avaliação para o produto (requer autenticação).
   * @param productId - ID do produto avaliado.
   * @param data - Título, corpo e nota da avaliação.
   */
  create: (productId: string, data: { title: string; body: string; rating: number }) =>
    apiRequest<{ success: boolean; data: ApiReview }>(
      `/api/products/${productId}/reviews`,
      { method: 'POST', body: JSON.stringify(data) },
    ),

  /**
   * Remove uma avaliação do usuário autenticado.
   * @param reviewId - ID da avaliação a remover.
   */
  delete: (reviewId: string) =>
    apiRequest(`/api/reviews/${reviewId}`, { method: 'DELETE' }),
};
