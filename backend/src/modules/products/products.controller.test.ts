import type { Request, Response } from 'express';

process.env.NODE_ENV = 'test';

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

jest.mock('./search-products.service', () => ({
  searchProductsService: {
    execute: jest.fn(),
  },
}));

const { productsController } = require('./products.controller') as typeof import('./products.controller');
const { productsService } = require('./products.service') as typeof import('./products.service');
const { searchProductsService } = require('./search-products.service') as typeof import('./search-products.service');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
}

describe('productsController', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('list rejeita filtros invalidos', async () => {
    const req = { query: { page: '0' } } as unknown as Request;
    const res = createRes();

    await productsController.list(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('search rejeita busca invalida', async () => {
    const req = { query: { q: '' } } as unknown as Request;
    const res = createRes();

    await productsController.search(req, res);

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

  it('search retorna itens', async () => {
    const req = { query: { q: 'notebook', page: '1', limit: '20' } } as unknown as Request;
    const res = createRes();

    (searchProductsService.execute as jest.Mock).mockResolvedValueOnce({
      query: 'notebook',
      found: true,
      total: 1,
      message: 'Encontrei 1 produto para "notebook".',
      items: [],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      filtersApplied: {
        search: 'notebook',
        category: null,
        minPrice: null,
        maxPrice: null,
        condition: null,
      },
    });

    await productsController.search(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          query: 'notebook',
          found: true,
        }),
      }),
    );
  });

  it('list rejeita id na query', async () => {
    const req = { query: { id: '1' } } as unknown as Request;
    const res = createRes();

    await productsController.list(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'UNSUPPORTED_QUERY_PARAM',
        }),
      }),
    );
  });

  it('list retorna itens', async () => {
    const req = { query: { page: '1', limit: '20', sort: 'newest' } } as unknown as Request;
    const res = createRes();
    (productsService.list as jest.Mock).mockResolvedValueOnce({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });

    await productsController.list(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          pagination: expect.objectContaining({ totalPages: 1 }),
        }),
      }),
    );
  });

  it('getById mapeia erro de produto nao encontrado', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = createRes();
    (productsService.getById as jest.Mock).mockRejectedValueOnce(new Error('PRODUCT_NOT_FOUND'));

    await productsController.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getById usa fallback para erro desconhecido', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = createRes();
    (productsService.getById as jest.Mock).mockRejectedValueOnce('boom');

    await productsController.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('create rejeita payload invalido', async () => {
    const req = { body: { title: 'ab' } } as unknown as Request;
    const res = createRes();

    await productsController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('create cadastra produto', async () => {
    const req = {
      body: {
        title: 'Notebook',
        price: 10,
        condition: 'NOVO',
        categoryId: 3,
        stock: 1,
        images: [],
      },
    } as unknown as Request;
    const res = createRes();
    (productsService.create as jest.Mock).mockResolvedValueOnce({ id: 1 });

    await productsController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(productsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Notebook',
        price: 10,
        condition: 'NOVO',
        categoryId: 3,
        stock: 1,
        images: [],
      }),
    );
  });

  it('update mapeia categoria inexistente', async () => {
    const req = {
      params: { id: '1' },
      body: { categoryId: 3 },
    } as unknown as Request;
    const res = createRes();
    (productsService.update as jest.Mock).mockRejectedValueOnce(new Error('CATEGORY_NOT_FOUND'));

    await productsController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('update rejeita payload invalido', async () => {
    const req = {
      params: { id: '1' },
      body: { title: 'ab' },
    } as unknown as Request;
    const res = createRes();

    await productsController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('remove retorna sucesso', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = createRes();
    (productsService.remove as jest.Mock).mockResolvedValueOnce({ id: 1 });

    await productsController.remove(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 1 },
    });
  });

  it('remove usa fallback para erro desconhecido', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = createRes();
    (productsService.remove as jest.Mock).mockRejectedValueOnce('boom');

    await productsController.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('listCategories retorna categorias', async () => {
    const req = {} as unknown as Request;
    const res = createRes();
    (productsService.listCategories as jest.Mock).mockResolvedValueOnce([{ id: 1 }]);

    await productsController.listCategories(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: 1 }],
    });
  });

  it('createCategory mapeia categoria duplicada', async () => {
    const req = { body: { name: 'Notebooks' } } as unknown as Request;
    const res = createRes();
    (productsService.createCategory as jest.Mock).mockRejectedValueOnce(
      new Error('CATEGORY_ALREADY_EXISTS'),
    );

    await productsController.createCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('createCategory rejeita payload invalido', async () => {
    const req = { body: { name: 'a' } } as unknown as Request;
    const res = createRes();

    await productsController.createCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
