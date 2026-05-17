import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

jest.mock('../auth/auth.middleware', () => ({
  authenticate: (req: any, _res: unknown, next: () => void) => {
    req.user = { id: 'admin-1', role: 'ADMIN' };
    next();
  },
  requireAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock('./products.service', () => ({
  productsService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    listCategories: jest.fn(),
    createCategory: jest.fn(),
  },
}));

jest.mock('../orders/orders.routes', () => {
  const express = require('express') as typeof import('express');
  return { ordersRouter: express.Router() };
});

import app from '../../server';
import { productsService } from './products.service';

const mockedProductsService = productsService as jest.Mocked<typeof productsService>;

function buildProduct(overrides: Record<string, unknown> = {}): any {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Notebook Gamer',
    description: 'Produto teste',
    price: 3999.9,
    condition: 'NOVO',
    images: [],
    stock: 3,
    active: true,
    viewsCount: 0,
    stripeProductId: null,
    stripePriceId: null,
    sellerId: '22222222-2222-2222-2222-222222222222',
    categoryId: '33333333-3333-4333-8333-333333333333',
    createdAt: new Date(),
    updatedAt: new Date(),
    seller: { id: '22222222-2222-2222-2222-222222222222', name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    category: { id: '33333333-3333-3333-3333-333333333333', name: 'Notebooks', description: null },
    ...overrides,
  };
}

describe('Products routes', () => {
  beforeEach(() => {
    mockedProductsService.list.mockReset();
    mockedProductsService.getById.mockReset();
    mockedProductsService.create.mockReset();
    mockedProductsService.update.mockReset();
    mockedProductsService.remove.mockReset();
    mockedProductsService.listCategories.mockReset();
    mockedProductsService.createCategory.mockReset();
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
  });

  it('lista produtos publicados', async () => {
    mockedProductsService.list.mockResolvedValue({
      items: [buildProduct()],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    } as any);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(mockedProductsService.list).toHaveBeenCalled();
  });

  it('busca produto por id', async () => {
    mockedProductsService.getById.mockResolvedValue(buildProduct() as any);

    const res = await request(app).get('/api/products/11111111-1111-1111-1111-111111111111');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockedProductsService.getById).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
    );
  });

  it('cria produto para admin', async () => {
    mockedProductsService.create.mockResolvedValue({
      ...buildProduct({
        seller: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', avatarUrl: null },
      }),
    } as any);

    const res = await request(app)
      .post('/api/products')
      .send({
        title: 'Notebook Gamer',
        description: 'Produto teste',
        price: 3999.9,
        condition: 'NOVO',
        categoryId: '33333333-3333-4333-8333-333333333333',
        stock: 3,
        images: [],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockedProductsService.create).toHaveBeenCalled();
  });

  it('atualiza produto para admin', async () => {
    mockedProductsService.update.mockResolvedValue({
      ...buildProduct({
        title: 'Notebook Gamer 2',
        description: 'Produto teste atualizado',
        price: 4299.9,
        stock: 2,
        seller: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', avatarUrl: null },
      }),
    } as any);

    const res = await request(app)
      .put('/api/products/11111111-1111-1111-1111-111111111111')
      .send({
        title: 'Notebook Gamer 2',
        price: 4299.9,
        stock: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockedProductsService.update).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
      expect.objectContaining({ title: 'Notebook Gamer 2', price: 4299.9, stock: 2 }),
      expect.any(Object),
    );
  });

  it('remove produto para admin', async () => {
    mockedProductsService.remove.mockResolvedValue({
      ...buildProduct({
        active: false,
        seller: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', avatarUrl: null },
      }),
    } as any);

    const res = await request(app).delete('/api/products/11111111-1111-1111-1111-111111111111');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockedProductsService.remove).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
      expect.any(Object),
    );
  });

  it('lista categorias publicamente', async () => {
    mockedProductsService.listCategories.mockResolvedValue([
      { id: 'category-1', name: 'Notebooks', description: null },
    ] as any);

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('cria categoria para admin', async () => {
    mockedProductsService.createCategory.mockResolvedValue({
      id: 'category-1',
      name: 'Notebooks',
      description: 'Categoria teste',
    } as any);

    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Notebooks', description: 'Categoria teste' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockedProductsService.createCategory).toHaveBeenCalledWith(
      { name: 'Notebooks', description: 'Categoria teste' },
      undefined,
    );
  });
});
