import type { Request, Response } from 'express';

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

const { reviewsController } = require('./reviews.controller') as typeof import('./reviews.controller');
const { reviewsService } = require('./reviews.service') as typeof import('./reviews.service');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
}

describe('Reviews controller', () => {
  beforeEach(() => {
    (reviewsService.listReviews as jest.Mock).mockReset();
    (reviewsService.createReview as jest.Mock).mockReset();
    (reviewsService.deleteReview as jest.Mock).mockReset();
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
  });

  it('lista reviews para um produto', async () => {
    (reviewsService.listReviews as jest.Mock).mockResolvedValueOnce([
      {
        id: 'review-1',
        title: 'Produto excelente',
        body: 'Gostei muito da durabilidade e do desempenho geral.',
        rating: 5,
      },
    ]);

    const req = { params: { id: 'product-1' } } as unknown as Request;
    const res = createRes();

    await reviewsController.listByProduct(req, res);

    expect(reviewsService.listReviews).toHaveBeenCalledWith('product-1');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.arrayContaining([expect.objectContaining({ id: 'review-1' })]),
      }),
    );
  });

  it('cria review quando payload e valido e usuario esta autenticado', async () => {
    (reviewsService.createReview as jest.Mock).mockResolvedValueOnce({ id: 'review-1' });

    const req = {
      params: { id: 'product-1' },
      body: {
        title: 'Excelente compra',
        body: 'Produto com bom acabamento e performance consistente no uso diario.',
        rating: 5,
      },
      user: { id: 'user-1', role: 'CUSTOMER' },
    } as unknown as Request;
    const res = createRes();

    await reviewsController.create(req, res);

    expect(reviewsService.createReview).toHaveBeenCalledWith('user-1', 'product-1', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('retorna erro de validacao quando payload da review e invalido', async () => {
    const req = {
      params: { id: 'product-1' },
      body: {
        title: 'ab',
        body: 'curto',
        rating: 8,
      },
      user: { id: 'user-1', role: 'CUSTOMER' },
    } as unknown as Request;
    const res = createRes();

    await reviewsController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      }),
    );
  });

  it('remove review quando ela pertence ao usuario autenticado', async () => {
    (reviewsService.deleteReview as jest.Mock).mockResolvedValueOnce({ id: 'review-1' });

    const req = {
      params: { id: 'review-1' },
      user: { id: 'user-1', role: 'CUSTOMER' },
    } as unknown as Request;
    const res = createRes();

    await reviewsController.remove(req, res);

    expect(reviewsService.deleteReview).toHaveBeenCalledWith('review-1', 'user-1');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 'review-1' }),
      }),
    );
  });

  it('retorna not found quando review nao pode ser removida pelo usuario autenticado', async () => {
    (reviewsService.deleteReview as jest.Mock).mockRejectedValueOnce(
      new Error('Review não encontrada ou sem permissão'),
    );

    const req = {
      params: { id: 'review-1' },
      user: { id: 'user-1', role: 'CUSTOMER' },
    } as unknown as Request;
    const res = createRes();

    await reviewsController.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'NOT_FOUND',
        }),
      }),
    );
  });
});
