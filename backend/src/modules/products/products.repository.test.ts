var mockPrisma = {
  $transaction: jest.fn(),
  product: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('../../shared/db/prisma', () => ({
  prisma: mockPrisma,
}));

import { productsRepository } from './products.repository';

describe('productsRepository', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('findMany retorna itens e total', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.$transaction.mockResolvedValue([[], 0]);

    await productsRepository.findMany({
      sort: 'newest',
      page: 1,
      limit: 20,
    } as never);

    expect(mockPrisma.product.findMany).toHaveBeenCalled();
    expect(mockPrisma.product.count).toHaveBeenCalled();
  });

  it('findMany monta filtros complexos e ordena por preco crescente', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.$transaction.mockResolvedValue([[], 0]);

    await productsRepository.findMany({
      category: 'Notebooks',
      search: 'mac',
      condition: 'NOVO',
      minPrice: 100,
      maxPrice: 1000,
      sort: 'price_asc',
      page: 2,
      limit: 10,
    } as never);

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { price: 'asc' },
        skip: 10,
        take: 10,
        where: expect.objectContaining({
          category: { is: { name: 'Notebooks' } },
          OR: expect.arrayContaining([
            expect.objectContaining({
              title: expect.objectContaining({ contains: 'mac', mode: 'insensitive' }),
            }),
            expect.objectContaining({
              description: expect.objectContaining({ contains: 'mac', mode: 'insensitive' }),
            }),
          ]),
          condition: 'NOVO',
          price: { gte: 100, lte: 1000 },
        }),
      }),
    );
  });

  it('findMany ordena por preco decrescente', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.$transaction.mockResolvedValue([[], 0]);

    await productsRepository.findMany({
      sort: 'price_desc',
      page: 1,
      limit: 20,
    } as never);

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { price: 'desc' },
      }),
    );
  });

  it('findById consulta o produto', async () => {
    mockPrisma.product.findFirst.mockResolvedValue(null);
    await productsRepository.findById('product-1');

    expect(mockPrisma.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'product-1', active: true },
      }),
    );
  });

  it('findCategoryById consulta categoria por id', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    await productsRepository.findCategoryById('category-1');

    expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
      where: { id: 'category-1' },
    });
  });

  it('findCategoryByName consulta categoria por nome', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);

    await productsRepository.findCategoryByName('Notebooks');

    expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
      where: { name: 'Notebooks' },
    });
  });

  it('listCategories retorna categorias ordenadas', async () => {
    mockPrisma.category.findMany.mockResolvedValue([]);

    await productsRepository.listCategories();

    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });

  it('createCategory cria categoria', async () => {
    mockPrisma.category.create.mockResolvedValue({ id: 1 });

    await productsRepository.createCategory({ name: 'Notebooks' });

    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: { name: 'Notebooks' },
    });
  });

  it('createProduct cria produto com include', async () => {
    mockPrisma.product.create.mockResolvedValue({ id: 1 });

    await productsRepository.createProduct({
      sellerId: 'seller-1',
      categoryId: 'category-1',
      title: 'Notebook',
      price: 10,
      condition: 'NOVO',
      stock: 1,
      images: [],
    } as never);

    expect(mockPrisma.product.create).toHaveBeenCalled();
  });

  it('updateProduct atualiza produto', async () => {
    mockPrisma.product.update.mockResolvedValue({ id: '1' });
    mockPrisma.product.update.mockResolvedValue({ id: 1 });

    await productsRepository.updateProduct('product-1', { title: 'Novo nome' } as never);

    expect(mockPrisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'product-1' } }),
    );
  });

  it('softDelete desativa produto', async () => {
    mockPrisma.product.update.mockResolvedValue({ id: 1 });

    await productsRepository.softDelete('product-1');

    expect(mockPrisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'product-1' }, data: { active: false } }),
    );
  });

  it('findMany com apenas minPrice (sem maxPrice)', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.$transaction.mockResolvedValue([[], 0]);

    await productsRepository.findMany({
      minPrice: 100,
      sort: 'newest',
      page: 1,
      limit: 20,
    } as never);

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          price: { gte: 100 },
        }),
      }),
    );
  });

  it('findMany com apenas maxPrice (sem minPrice)', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.$transaction.mockResolvedValue([[], 0]);

    await productsRepository.findMany({
      maxPrice: 1000,
      sort: 'newest',
      page: 1,
      limit: 20,
    } as never);

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          price: { lte: 1000 },
        }),
      }),
    );
  });

  it('updateProduct preserva campos opcionais quando presentes', async () => {
    mockPrisma.product.update.mockResolvedValue({ id: 1 });

    await productsRepository.updateProduct('product-1', {
      title: 'Novo nome',
      price: 25,
      images: ['https://example.com/foto.jpg'],
    } as never);

    expect(mockPrisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'product-1' },
        data: expect.objectContaining({
          price: 25,
          images: ['https://example.com/foto.jpg'],
        }),
      }),
    );
  });
});
