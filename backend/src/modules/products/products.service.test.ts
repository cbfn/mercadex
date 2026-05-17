import type { AuthRequest } from '../auth/auth.middleware';
import { productsRepository } from './products.repository';
import { productsService } from './products.service';

jest.mock('./products.repository', () => ({
  productsRepository: {
    findMany: jest.fn(),
    findById: jest.fn(),
    findCategoryById: jest.fn(),
    findCategoryByName: jest.fn(),
    findAdminUser: jest.fn(),
    listCategories: jest.fn(),
    createCategory: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    softDelete: jest.fn(),
  },
}));

const mockedRepo = productsRepository as jest.Mocked<typeof productsRepository>;

function adminUser(): NonNullable<AuthRequest['user']> {
  return { id: 'admin-1', role: 'ADMIN' };
}

describe('productsService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('lista produtos com paginacao', async () => {
    mockedRepo.findMany.mockResolvedValue({ items: [], total: 0 } as never);

    await expect(
      productsService.list({ sort: 'newest', page: 1, limit: 20 } as never),
    ).resolves.toEqual({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });
  });

  it('getById retorna produto mapeado', async () => {
    mockedRepo.findById.mockResolvedValue({
      id: 1,
      price: 10,
      seller: { id: 2, name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    } as never);

    await expect(productsService.getById('product-1')).resolves.toMatchObject({
      id: 1,
      price: 10,
      seller: expect.objectContaining({ id: 2 }),
    });
  });

  it('getById retorna erro quando nao encontra', async () => {
    mockedRepo.findById.mockResolvedValue(null);
    await expect(productsService.getById('product-1')).rejects.toThrow('PRODUCT_NOT_FOUND');
  });

  it('create rejeita categoria inexistente', async () => {
    mockedRepo.findCategoryById.mockResolvedValue(null);
    mockedRepo.findAdminUser.mockResolvedValue({ id: 1, role: 'ADMIN' } as never);

    await expect(
      productsService.create({
        title: 'Notebook',
        price: 10,
        condition: 'NOVO',
        categoryId: 'category-1',
        stock: 1,
        images: [],
      } as never),
    ).rejects.toThrow('CATEGORY_NOT_FOUND');
  });

  it('create cria produto para admin', async () => {
    mockedRepo.findCategoryById.mockResolvedValue({ id: 1 } as never);
    mockedRepo.findAdminUser.mockResolvedValue({
      id: 'admin-1',
      role: 'ADMIN',
      name: 'Admin',
      email: 'admin@test.com',
      avatarUrl: null,
    } as never);
    mockedRepo.createProduct.mockResolvedValue({
      id: 1,
      price: 10,
      seller: { id: 1, name: 'Admin', email: 'admin@test.com', avatarUrl: null },
      category: { id: 1, name: 'Notebooks', description: null },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    await expect(
      productsService.create({
        title: 'Notebook',
        price: 10,
        condition: 'NOVO',
        categoryId: 'category-1',
        stock: 1,
        images: [],
      } as never),
    ).resolves.toHaveProperty('id', 1);
  });

  it('update rejeita produto inexistente', async () => {
    mockedRepo.findById.mockResolvedValue(null);

    await expect(
      productsService.update(
        'product-1',
        { title: 'Novo nome' } as never,
        adminUser(),
      ),
    ).rejects.toThrow('PRODUCT_NOT_FOUND');
  });

  it('update rejeita categoria inexistente', async () => {
    mockedRepo.findById.mockResolvedValue({
      id: 1,
      price: 10,
      seller: { id: 2, name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    } as never);
    mockedRepo.findCategoryById.mockResolvedValue(null);

    await expect(
      productsService.update(
        'product-1',
        { categoryId: 'category-1' } as never,
        adminUser(),
      ),
    ).rejects.toThrow('CATEGORY_NOT_FOUND');
  });

  it('update altera produto para admin', async () => {
    mockedRepo.findById.mockResolvedValue({
      id: 1,
      price: 10,
      seller: { id: 2, name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    } as never);
    mockedRepo.updateProduct.mockResolvedValue({
      id: 1,
      price: 12,
      seller: { id: 2, name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    } as never);

    await expect(
      productsService.update(
        'product-1',
        { title: 'Novo nome' } as never,
        adminUser(),
      ),
    ).resolves.toHaveProperty('price', 12);
  });

  it('remove rejeita usuario sem permissao', async () => {
    await expect(productsService.remove('product-1', { id: 'user-2', role: 'CUSTOMER' })).rejects.toThrow('FORBIDDEN');
  });

  it('remove rejeita produto inexistente', async () => {
    mockedRepo.findById.mockResolvedValue(null);

    await expect(productsService.remove('product-1', adminUser())).rejects.toThrow('PRODUCT_NOT_FOUND');
  });

  it('remove desativa produto', async () => {
    mockedRepo.findById.mockResolvedValue({
      id: 1,
      price: 10,
      seller: { id: 2, name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    } as never);
    mockedRepo.softDelete.mockResolvedValue({
      id: 1,
      price: 10,
      seller: { id: 2, name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    } as never);

    await expect(productsService.remove('product-1', adminUser())).resolves.toHaveProperty('id', 1);
  });

  it('listCategories retorna resultado do repository', async () => {
    mockedRepo.listCategories.mockResolvedValue([{ id: 1, name: 'Notebooks' }] as never);

    await expect(productsService.listCategories()).resolves.toEqual([{ id: 1, name: 'Notebooks' }]);
  });

  it('createCategory rejeita usuario sem permissao', async () => {
    await expect(
      productsService.createCategory({ name: 'Notebooks' } as never, {
        id: 'user-2',
        role: 'CUSTOMER',
      }),
    ).rejects.toThrow('FORBIDDEN');
  });

  it('createCategory rejeita categoria duplicada', async () => {
    mockedRepo.findCategoryByName.mockResolvedValue({ id: 1 } as never);

    await expect(productsService.createCategory({ name: 'Notebooks' } as never, adminUser())).rejects.toThrow(
      'CATEGORY_ALREADY_EXISTS',
    );
  });

  it('lista produtos com itens reais e converte preco numerico', async () => {
    mockedRepo.findMany.mockResolvedValue({
      items: [
        {
          id: 'product-1',
          price: 199.9,
          seller: { id: 's1', name: 'Seller', email: 'seller@test.com', avatarUrl: null },
        },
      ],
      total: 1,
    } as never);

    const result = await productsService.list({ sort: 'newest', page: 1, limit: 20 } as never);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].price).toBe(199.9);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('lista produtos com multiplas paginas', async () => {
    mockedRepo.findMany.mockResolvedValue({ items: [], total: 25 } as never);

    const result = await productsService.list({ sort: 'newest', page: 1, limit: 10 } as never);

    expect(result.pagination.totalPages).toBe(3);
  });

  it('getById converte preco do tipo Decimal (objeto com toNumber)', async () => {
    mockedRepo.findById.mockResolvedValue({
      id: 'product-1',
      price: { toNumber: () => 99.9 },
      seller: { id: 'seller-1', name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    } as never);

    const result = await productsService.getById('product-1');

    expect(result?.price).toBe(99.9);
  });

  it('lista produtos converte preco do tipo Decimal', async () => {
    mockedRepo.findMany.mockResolvedValue({
      items: [
        {
          id: 'product-1',
          price: { toNumber: () => 49.9 },
          seller: { id: 's1', name: 'Seller', email: 'seller@test.com', avatarUrl: null },
        },
      ],
      total: 1,
    } as never);

    const result = await productsService.list({ sort: 'newest', page: 1, limit: 20 } as never);

    expect(result.items[0].price).toBe(49.9);
  });

  it('create retorna null quando repositorio retorna null inesperadamente', async () => {
    mockedRepo.findCategoryById.mockResolvedValue({ id: 'category-1' } as never);
    mockedRepo.findAdminUser.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' } as never);
    mockedRepo.createProduct.mockResolvedValue(null as never);

    const result = await productsService.create(
      {
        title: 'Notebook',
        price: 10,
        condition: 'NOVO',
        categoryId: 'category-1',
        stock: 1,
        images: [],
      } as never,
    );

    expect(result).toBeNull();
  });

  it('createCategory cria categoria para admin', async () => {
    mockedRepo.findCategoryByName.mockResolvedValue(null);
    mockedRepo.createCategory.mockResolvedValue({ id: 1, name: 'Notebooks' } as never);

    await expect(productsService.createCategory({ name: 'Notebooks' } as never, adminUser())).resolves.toEqual({
      id: 1,
      name: 'Notebooks',
    });
  });
});
