import type { z } from 'zod';
import { prisma } from '../../shared/db/prisma';
import type { CreateReviewDto } from './reviews.dto';

export const reviewsService = {
  /**
   * Lista todas as reviews de um produto com dados do autor.
   * @param productId - ID do produto
   */
  async listReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Cria uma review. Garante unicidade (1 review por usuário por produto).
   * @param userId - ID do usuário autenticado
   * @param productId - ID do produto avaliado
   * @param input - DTO com título, corpo e nota
   */
  async createReview(userId: string, productId: string, input: z.infer<typeof CreateReviewDto>) {
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new Error('Você já avaliou este produto');
    return prisma.review.create({ data: { userId, productId, ...input } });
  },

  /**
   * Deleta uma review. Verifica que pertence ao usuário.
   * @param reviewId - ID da review
   * @param userId - ID do usuário autenticado
   */
  async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
    if (!review) throw new Error('Review não encontrada ou sem permissão');
    return prisma.review.delete({ where: { id: reviewId } });
  },
};
