import request from 'supertest';

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

import app from './server';

describe('server', () => {
  it('/health retorna status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});
