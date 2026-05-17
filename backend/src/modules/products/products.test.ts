import type { Request, Response } from 'express';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

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

const { productsController } = require('./products.controller') as typeof import('./products.controller');
const { productsService } = require('./products.service') as typeof import('./products.service');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
}

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
    seller: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Seller',
      email: 'seller@test.com',
      avatarUrl: null,
    },
    category: {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Notebooks',
      description: null,
    },
    ...overrides,
  };
}

describe('Products controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('lista produtos publicados', async () => {
    (productsService.list as jest.Mock).mockResolvedValueOnce({
      items: [buildProduct()],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    const req = { query: {} } as unknown as Request;
    const res = createRes();

    await productsController.list(req, res);

    expect(productsService.list).toHaveBeenCalledWith({ page: 1, limit: 20, sort: 'newest' });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          items: expect.arrayContaining([expect.objectContaining({ id: '11111111-1111-1111-1111-111111111111' })]),
        }),
      }),
    );
  });

  it('busca produto por id', async () => {
    (productsService.getById as jest.Mock).mockResolvedValueOnce(buildProduct());

    const req = { params: { id: '11111111-1111-1111-1111-111111111111' } } as unknown as Request;
    const res = createRes();

    await productsController.getById(req, res);

    expect(productsService.getById).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: '11111111-1111-1111-1111-111111111111' }),
      }),
    );
  });

  it('cria produto para admin', async () => {
    (productsService.create as jest.Mock).mockResolvedValueOnce({
      ...buildProduct({
        seller: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', avatarUrl: null },
      }),
    });

    const req = {
      body: {
        title: 'Notebook Gamer',
        description: 'Produto teste',
        price: 3999.9,
        condition: 'NOVO',
        categoryId: '33333333-3333-4333-8333-333333333333',
        stock: 3,
        images: [],
      },
    } as unknown as Request;
    const res = createRes();

    await productsController.create(req, res);

    expect(productsService.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('atualiza produto para admin', async () => {
    (productsService.update as jest.Mock).mockResolvedValueOnce({
      ...buildProduct({
        title: 'Notebook Gamer 2',
        description: 'Produto teste atualizado',
        price: 4299.9,
        stock: 2,
        seller: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', avatarUrl: null },
      }),
    });

    const req = {
      user: { id: 'admin-1', role: 'ADMIN' },
      params: { id: '11111111-1111-1111-1111-111111111111' },
      body: {
        title: 'Notebook Gamer 2',
        price: 4299.9,
        stock: 2,
      },
    } as unknown as Request;
    const res = createRes();

    await productsController.update(req, res);

    expect(productsService.update).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
      expect.objectContaining({ title: 'Notebook Gamer 2', price: 4299.9, stock: 2 }),
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('remove produto para admin', async () => {
    (productsService.remove as jest.Mock).mockResolvedValueOnce({
      ...buildProduct({
        active: false,
        seller: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', avatarUrl: null },
      }),
    });

    const req = {
      user: { id: 'admin-1', role: 'ADMIN' },
      params: { id: '11111111-1111-1111-1111-111111111111' },
    } as unknown as Request;
    const res = createRes();

    await productsController.remove(req, res);

    expect(productsService.remove).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('lista categorias publicamente', async () => {
    (productsService.listCategories as jest.Mock).mockResolvedValueOnce([
      { id: 'category-1', name: 'Notebooks', description: null },
    ]);

    const req = {} as Request;
    const res = createRes();

    await productsController.listCategories(req, res);

    expect(productsService.listCategories).toHaveBeenCalledWith();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.arrayContaining([expect.objectContaining({ id: 'category-1' })]),
      }),
    );
  });

  it('cria categoria para admin', async () => {
    (productsService.createCategory as jest.Mock).mockResolvedValueOnce({
      id: 'category-1',
      name: 'Notebooks',
      description: 'Categoria teste',
    });

    const req = {
      user: { id: 'admin-1', role: 'ADMIN' },
      body: { name: 'Notebooks', description: 'Categoria teste' },
    } as unknown as Request;
    const res = createRes();

    await productsController.createCategory(req, res);

    expect(productsService.createCategory).toHaveBeenCalledWith(
      { name: 'Notebooks', description: 'Categoria teste' },
      expect.objectContaining({ id: 'admin-1', role: 'ADMIN' }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 'category-1' }),
      }),
    );
  });
});
