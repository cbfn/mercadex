import { prisma } from '../../shared/db/prisma';
import type {
  CreateCategoryInput,
  CreateProductInput,
  ProductFiltersInput,
  UpdateProductInput,
} from './products.dto';

const productInclude = {
  seller: {
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  },
  category: true,
} as const;

function buildCategoryFilter(category: string) {
  return {
    is: {
      OR: [{ id: category }, { name: category }],
    },
  };
}

function buildProductWhere(filters: ProductFiltersInput) {
  return {
    active: true,
    ...(filters.category
      ? { category: buildCategoryFilter(filters.category) }
      : {}),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' as const } },
            { description: { contains: filters.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(filters.condition ? { condition: filters.condition } : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          price: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
  };
}

function buildOrderBy(sort: ProductFiltersInput['sort']) {
  if (sort === 'price_asc') {
    return { price: 'asc' as const };
  }

  if (sort === 'price_desc') {
    return { price: 'desc' as const };
  }

  return { createdAt: 'desc' as const };
}

export const productsRepository = {
  async findMany(filters: ProductFiltersInput) {
    const where = buildProductWhere(filters);
    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: buildOrderBy(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string) {
    return prisma.product.findFirst({
      where: { id, active: true },
      include: productInclude,
    });
  },

  findCategoryById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },

  findCategoryByName(name: string) {
    return prisma.category.findUnique({ where: { name } });
  },

  listCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  },

  createCategory(data: CreateCategoryInput) {
    return prisma.category.create({ data });
  },

  createProduct(data: CreateProductInput & { sellerId: string }) {
    return prisma.product.create({
      data: {
        ...data,
        price: data.price,
        sellerId: data.sellerId,
        images: data.images,
      },
      include: productInclude,
    });
  },

  updateProduct(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.images ? { images: data.images } : {}),
      },
      include: productInclude,
    });
  },

  softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { active: false },
      include: productInclude,
    });
  },
};
