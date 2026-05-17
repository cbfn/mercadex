const mockPrisma = {
  review: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('../../shared/db/prisma', () => ({
  prisma: mockPrisma,
}));

import { reviewsService } from './reviews.service';

describe('reviewsService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('lista reviews de um produto', async () => {
    mockPrisma.review.findMany.mockResolvedValueOnce([{ id: 'review-1' }]);

    const result = await reviewsService.listReviews('product-1');

    expect(mockPrisma.review.findMany).toHaveBeenCalledWith({
      where: { productId: 'product-1' },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([{ id: 'review-1' }]);
  });

  it('cria review quando nao existe review previa do usuario', async () => {
    mockPrisma.review.findUnique.mockResolvedValueOnce(null);
    mockPrisma.review.create.mockResolvedValueOnce({ id: 'review-1' });

    const result = await reviewsService.createReview('user-1', 'product-1', {
      title: 'Muito bom',
      body: 'Gostei bastante',
      rating: 5,
    } as never);

    expect(mockPrisma.review.findUnique).toHaveBeenCalledWith({
      where: { userId_productId: { userId: 'user-1', productId: 'product-1' } },
    });
    expect(mockPrisma.review.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        productId: 'product-1',
        title: 'Muito bom',
        body: 'Gostei bastante',
        rating: 5,
      },
    });
    expect(result).toEqual({ id: 'review-1' });
  });

  it('remove review quando pertence ao usuario', async () => {
    mockPrisma.review.findFirst.mockResolvedValueOnce({ id: 'review-1' });
    mockPrisma.review.delete.mockResolvedValueOnce({ id: 'review-1' });

    const result = await reviewsService.deleteReview('review-1', 'user-1');

    expect(mockPrisma.review.findFirst).toHaveBeenCalledWith({
      where: { id: 'review-1', userId: 'user-1' },
    });
    expect(mockPrisma.review.delete).toHaveBeenCalledWith({
      where: { id: 'review-1' },
    });
    expect(result).toEqual({ id: 'review-1' });
  });
});
