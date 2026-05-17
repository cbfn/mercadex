import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

jest.mock('../auth/auth.middleware', () => ({
  authenticate: (req: any, _res: unknown, next: () => void) => {
    req.user = { id: 'user-1', role: 'CUSTOMER' };
    next();
  },
  requireAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock('./reviews.service', () => ({
  reviewsService: {
    listReviews: jest.fn(),
    createReview: jest.fn(),
    deleteReview: jest.fn(),
  },
}));

jest.mock('../orders/orders.routes', () => {
  const express = require('express') as typeof import('express');
  return { ordersRouter: express.Router() };
});

import app from '../../server';
import { reviewsService } from './reviews.service';

const mockedReviewsService = reviewsService as jest.Mocked<typeof reviewsService>;

describe('Reviews routes', () => {
  beforeEach(() => {
    mockedReviewsService.listReviews.mockReset();
    mockedReviewsService.createReview.mockReset();
    mockedReviewsService.deleteReview.mockReset();
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
  });

  it('returns reviews list for a product without requiring authentication', async () => {
    mockedReviewsService.listReviews.mockResolvedValueOnce([
      {
        id: 'review-1',
        title: 'Produto excelente',
        body: 'Gostei muito da durabilidade e do desempenho geral.',
        rating: 5,
      },
    ] as any);

    const res = await request(app).get('/api/products/product-1/reviews');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(mockedReviewsService.listReviews).toHaveBeenCalledWith('product-1');
  });

  it('creates review when payload is valid and user is authenticated', async () => {
    mockedReviewsService.createReview.mockResolvedValueOnce({ id: 'review-1' } as any);

    const res = await request(app).post('/api/products/product-1/reviews').send({
      title: 'Excelente compra',
      body: 'Produto com bom acabamento e performance consistente no uso diario.',
      rating: 5,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockedReviewsService.createReview).toHaveBeenCalledWith(
      'user-1',
      'product-1',
      expect.any(Object),
    );
  });

  it('returns validation error when create review payload is invalid', async () => {
    const res = await request(app).post('/api/products/product-1/reviews').send({
      title: 'ab',
      body: 'curto',
      rating: 8,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns conflict when user already reviewed product', async () => {
    mockedReviewsService.createReview.mockRejectedValueOnce(new Error('Você já avaliou este produto'));

    const res = await request(app).post('/api/products/product-1/reviews').send({
      title: 'Muito bom mesmo',
      body: 'Atendeu minhas expectativas e funcionou muito bem em todos os cenarios.',
      rating: 5,
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('deletes review when it belongs to authenticated user', async () => {
    mockedReviewsService.deleteReview.mockResolvedValueOnce({ id: 'review-1' } as any);

    const res = await request(app).delete('/api/reviews/review-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockedReviewsService.deleteReview).toHaveBeenCalledWith('review-1', 'user-1');
  });

  it('returns not found when review cannot be deleted by authenticated user', async () => {
    mockedReviewsService.deleteReview.mockRejectedValueOnce(
      new Error('Review não encontrada ou sem permissão'),
    );

    const res = await request(app).delete('/api/reviews/review-1');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
