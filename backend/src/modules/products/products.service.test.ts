import type { AuthRequest } from '../auth/auth.middleware';
import { productsRepository } from './products.repository';
import { productsService } from './products.service';

jest.mock('./products.repository', () => ({
  productsRepository: {
    findMany: jest.fn(),
    findById: jest.fn(),
    findCategoryById: jest.fn(),
    findCategoryByName: jest.fn(),
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
      id: 'product-1',
      price: 10,
      seller: { id: 'seller-1', name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    } as never);

    await expect(productsService.getById('product-1')).resolves.toMatchObject({
      id: 'product-1',
      price: 10,
      seller: expect.objectContaining({ id: 'seller-1' }),
    });
  });

  it('getById retorna erro quando nao encontra', async () => {
    mockedRepo.findById.mockResolvedValue(null);

    await expect(productsService.getById('product-1')).rejects.toThrow('PRODUCT_NOT_FOUND');
  });

  it('create rejeita usuario sem permissao', async () => {
    await expect(
      productsService.create(
        {
          title: 'Notebook',
          price: 10,
          condition: 'NOVO',
          categoryId: 'category-1',
          stock: 1,
          images: [],
        } as never,
        { id: 'user-1', role: 'CUSTOMER' },
      ),
    ).rejects.toThrow('FORBIDDEN');
  });

  it('create rejeita categoria inexistente', async () => {
    mockedRepo.findCategoryById.mockResolvedValue(null);

    await expect(
      productsService.create(
        {
          title: 'Notebook',
          price: 10,
          condition: 'NOVO',
          categoryId: 'category-1',
          stock: 1,
          images: [],
        } as never,
        adminUser(),
      ),
    ).rejects.toThrow('CATEGORY_NOT_FOUND');
  });

  it('create cria produto para admin', async () => {
    mockedRepo.findCategoryById.mockResolvedValue({ id: 'category-1' } as never);
    mockedRepo.createProduct.mockResolvedValue({
      id: 'product-1',
      price: 10,
      seller: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', avatarUrl: null },
      category: { id: 'category-1', name: 'Notebooks', description: null },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    await expect(
      productsService.create(
        {
          title: 'Notebook',
          price: 10,
          condition: 'NOVO',
          categoryId: 'category-1',
          stock: 1,
          images: [],
        } as never,
        adminUser(),
      ),
    ).resolves.toHaveProperty('id', 'product-1');
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
      id: 'product-1',
      price: 10,
      seller: { id: 'seller-1', name: 'Seller', email: 'seller@test.com', avatarUrl: null },
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
      id: 'product-1',
      price: 10,
      seller: { id: 'seller-1', name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    } as never);
    mockedRepo.updateProduct.mockResolvedValue({
      id: 'product-1',
      price: 12,
      seller: { id: 'seller-1', name: 'Seller', email: 'seller@test.com', avatarUrl: null },
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
    await expect(productsService.remove('product-1', { id: 'user-1', role: 'CUSTOMER' })).rejects.toThrow(
      'FORBIDDEN',
    );
  });

  it('remove rejeita produto inexistente', async () => {
    mockedRepo.findById.mockResolvedValue(null);

    await expect(productsService.remove('product-1', adminUser())).rejects.toThrow('PRODUCT_NOT_FOUND');
  });

  it('remove desativa produto', async () => {
    mockedRepo.findById.mockResolvedValue({
      id: 'product-1',
      price: 10,
      seller: { id: 'seller-1', name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    } as never);
    mockedRepo.softDelete.mockResolvedValue({
      id: 'product-1',
      price: 10,
      seller: { id: 'seller-1', name: 'Seller', email: 'seller@test.com', avatarUrl: null },
    } as never);

    await expect(productsService.remove('product-1', adminUser())).resolves.toHaveProperty(
      'id',
      'product-1',
    );
  });

  it('listCategories retorna resultado do repository', async () => {
    mockedRepo.listCategories.mockResolvedValue([{ id: '1', name: 'Notebooks' }] as never);

    await expect(productsService.listCategories()).resolves.toEqual([
      { id: '1', name: 'Notebooks' },
    ]);
  });

  it('createCategory rejeita usuario sem permissao', async () => {
    await expect(
      productsService.createCategory({ name: 'Notebooks' } as never, {
        id: 'user-1',
        role: 'CUSTOMER',
      }),
    ).rejects.toThrow('FORBIDDEN');
  });

  it('createCategory rejeita categoria duplicada', async () => {
    mockedRepo.findCategoryByName.mockResolvedValue({ id: 'category-1' } as never);

    await expect(
      productsService.createCategory({ name: 'Notebooks' } as never, adminUser()),
    ).rejects.toThrow('CATEGORY_ALREADY_EXISTS');
  });

  it('createCategory cria categoria para admin', async () => {
    mockedRepo.findCategoryByName.mockResolvedValue(null);
    mockedRepo.createCategory.mockResolvedValue({ id: 'category-1', name: 'Notebooks' } as never);

    await expect(productsService.createCategory({ name: 'Notebooks' } as never, adminUser())).resolves.toEqual({
      id: 'category-1',
      name: 'Notebooks',
    });
  });
});
