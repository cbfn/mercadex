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

import { productsController } from './products.controller';
import { productsService } from './products.service';

const mockedProductsService = productsService as jest.Mocked<typeof productsService>;

function buildProduct(overrides: Record<string, unknown> = {}): any {
  return {
    id: 1,
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
    sellerId: 2,
    categoryId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    seller: { id: 2, name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    category: { id: 3, name: 'Notebooks', description: null },
    ...overrides,
  };
}

function createMockRes() {
  const res: Record<string, any> = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
    setHeader(name: string, value: unknown) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
  };

  return res;
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
  });

  it('lista produtos publicados', async () => {
    mockedProductsService.list.mockResolvedValue({
      items: [buildProduct()],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    } as any);

    const req = { query: {} } as any;
    const res = createMockRes();

    await productsController.list(req, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(mockedProductsService.list).toHaveBeenCalled();
  });

  it('busca produto por id', async () => {
    mockedProductsService.getById.mockResolvedValue(buildProduct() as any);

    const req = { params: { id: '1' } } as any;
    const res = createMockRes();

    await productsController.getById(req, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockedProductsService.getById).toHaveBeenCalledWith(1);
  });

  it('cria produto para admin', async () => {
    mockedProductsService.create.mockResolvedValue({
      ...buildProduct({
        seller: { id: 1, name: 'Admin', email: 'admin@test.com', avatarUrl: null },
      }),
    } as any);

    const req = {
      body: {
        title: 'Notebook Gamer',
        description: 'Produto teste',
        price: 3999.9,
        condition: 'NOVO',
        categoryId: 3,
        stock: 3,
        images: [],
      },
      user: { id: 1, role: 'ADMIN' },
    } as any;
    const res = createMockRes();

    await productsController.create(req, res as any);

    expect(res.statusCode).toBe(201);
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
        seller: { id: 1, name: 'Admin', email: 'admin@test.com', avatarUrl: null },
      }),
    } as any);

    const req = {
      params: { id: '1' },
      body: {
        title: 'Notebook Gamer 2',
        price: 4299.9,
        stock: 2,
      },
      user: { id: 1, role: 'ADMIN' },
    } as any;
    const res = createMockRes();

    await productsController.update(req, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockedProductsService.update).toHaveBeenCalledWith(
      1,
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

    const req = {
      params: { id: '1' },
      user: { id: 1, role: 'ADMIN' },
    } as any;
    const res = createMockRes();

    await productsController.remove(req, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockedProductsService.remove).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('lista categorias publicamente', async () => {
    mockedProductsService.listCategories.mockResolvedValue([
      { id: 1, name: 'Notebooks', description: null },
    ] as any);

    const req = {} as any;
    const res = createMockRes();

    await productsController.listCategories(req, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('cria categoria para admin', async () => {
    mockedProductsService.createCategory.mockResolvedValue({
      id: 1,
      name: 'Notebooks',
      description: 'Categoria teste',
    } as any);

    const req = {
      body: { name: 'Notebooks', description: 'Categoria teste' },
      user: { id: 1, role: 'ADMIN' },
    } as any;
    const res = createMockRes();

    await productsController.createCategory(req, res as any);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockedProductsService.createCategory).toHaveBeenCalledWith(
      { name: 'Notebooks', description: 'Categoria teste' },
      expect.any(Object),
    );
  });
});
