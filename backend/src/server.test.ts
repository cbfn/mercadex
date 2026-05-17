import type { Response } from 'express';

process.env.NODE_ENV = 'test';

jest.mock('./modules/auth/auth.middleware', () => ({
  authenticate: (_req: unknown, _res: unknown, next: () => void) => next(),
  requireAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock('./modules/auth/auth.service', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
  },
}));

jest.mock('./modules/products/products.service', () => ({
  productsService: {
    list: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    listCategories: jest.fn().mockResolvedValue([]),
    createCategory: jest.fn(),
  },
}));

jest.mock('./modules/orders/orders.routes', () => {
  const express = require('express') as typeof import('express');
  return { ordersRouter: express.Router() };
});

jest.mock('./modules/reviews/reviews.routes', () => {
  const express = require('express') as typeof import('express');
  return { reviewsRouter: express.Router() };
});

import { healthHandler } from './server';

function createRes() {
  return {
    json: jest.fn(),
  } as unknown as Response & {
    json: jest.Mock;
  };
}

describe('server', () => {
  it('/health retorna status ok', () => {
    const res = createRes();

    healthHandler({} as never, res);

    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      timestamp: expect.any(String),
    });
  });
});
