import type { Request, Response } from 'express';

process.env.NODE_ENV = 'test';

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

describe('reviewsController', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns product reviews when listing by product id', async () => {
    const req = { params: { id: 'product-1' } } as unknown as Request;
    const res = createRes();
    (reviewsService.listReviews as jest.Mock).mockResolvedValueOnce([{ id: 'review-1' }]);

    await reviewsController.listByProduct(req, res);

    expect(reviewsService.listReviews).toHaveBeenCalledWith('product-1');
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'review-1' }] });
  });

  it('uses first route id value when params id comes as array', async () => {
    const req = { params: { id: ['product-1', 'product-2'] } } as unknown as Request;
    const res = createRes();
    (reviewsService.listReviews as jest.Mock).mockResolvedValueOnce([]);

    await reviewsController.listByProduct(req, res);

    expect(reviewsService.listReviews).toHaveBeenCalledWith('product-1');
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
  });

  it('returns unauthorized when creating review without authenticated user', async () => {
    const req = {
      params: { id: 'product-1' },
      body: { title: 'Muito bom', body: 'Produto excelente para o dia a dia', rating: 5 },
    } as unknown as Request;
    const res = createRes();

    await reviewsController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      }),
    );
  });

  it('returns validation error when review payload is invalid', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      params: { id: 'product-1' },
      body: { title: 'ab', rating: 8 },
    } as unknown as Request;
    const res = createRes();

    await reviewsController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      }),
    );
  });

  it('creates review when payload is valid and user is authenticated', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      params: { id: 'product-1' },
      body: {
        title: 'Excelente custo-beneficio',
        body: 'Bateria dura bastante e o desempenho atende bem ao esperado.',
        rating: 5,
      },
    } as unknown as Request;
    const res = createRes();
    (reviewsService.createReview as jest.Mock).mockResolvedValueOnce({ id: 'review-1' });

    await reviewsController.create(req, res);

    expect(reviewsService.createReview).toHaveBeenCalledWith(
      'user-1',
      'product-1',
      expect.objectContaining({
        title: 'Excelente custo-beneficio',
        rating: 5,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'review-1' } });
  });

  it('returns conflict when user has already reviewed product', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      params: { id: 'product-1' },
      body: {
        title: 'Produto muito bom',
        body: 'Achei excelente para uso diario e cumpriu o que prometeu.',
        rating: 5,
      },
    } as unknown as Request;
    const res = createRes();
    (reviewsService.createReview as jest.Mock).mockRejectedValueOnce(
      new Error('Você já avaliou este produto'),
    );

    await reviewsController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'CONFLICT' }),
      }),
    );
  });

  it('returns unauthorized when removing review without authenticated user', async () => {
    const req = { params: { id: 'review-1' } } as unknown as Request;
    const res = createRes();

    await reviewsController.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      }),
    );
  });

  it('removes review when it belongs to authenticated user', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      params: { id: 'review-1' },
    } as unknown as Request;
    const res = createRes();
    (reviewsService.deleteReview as jest.Mock).mockResolvedValueOnce({ id: 'review-1' });

    await reviewsController.remove(req, res);

    expect(reviewsService.deleteReview).toHaveBeenCalledWith('review-1', 'user-1');
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'review-1' } });
  });

  it('returns not found when review does not belong to authenticated user', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      params: { id: 'review-1' },
    } as unknown as Request;
    const res = createRes();
    (reviewsService.deleteReview as jest.Mock).mockRejectedValueOnce(
      new Error('Review não encontrada ou sem permissão'),
    );

    await reviewsController.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'NOT_FOUND' }),
      }),
    );
  });

  it('returns internal error when service throws unknown error', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      params: { id: 'review-1' },
    } as unknown as Request;
    const res = createRes();
    (reviewsService.deleteReview as jest.Mock).mockRejectedValueOnce(new Error('RANDOM_FAILURE'));

    await reviewsController.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      }),
    );
  });
});
