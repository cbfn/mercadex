import type { AuthRequest } from '../auth/auth.middleware';
import type {
  CreateCategoryInput,
  CreateProductInput,
  ProductFiltersInput,
  UpdateProductInput,
} from './products.dto';
import { productsRepository } from './products.repository';

function assertAdminUser(user: AuthRequest['user']): asserts user is NonNullable<AuthRequest['user']> {
  if (!user || user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
}

function toNumber(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return Number((value as { toNumber: () => number }).toNumber());
  }

  return Number(value);
}

function mapProduct(product: Awaited<ReturnType<typeof productsRepository.findById>>) {
  if (!product) {
    return null;
  }

  return {
    ...product,
    price: toNumber(product.price),
    seller: {
      ...product.seller,
    },
  };
}

export const productsService = {
  async list(filters: ProductFiltersInput) {
    const result = await productsRepository.findMany(filters);

    return {
      items: result.items.map((product: (typeof result.items)[number]) => ({
        ...product,
        price: toNumber(product.price),
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / filters.limit)),
      },
    };
  },

  async getById(id: string) {
    const product = await productsRepository.findById(id);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    return mapProduct(product);
  },

  async create(input: CreateProductInput, user: AuthRequest['user']) {
    assertAdminUser(user);

    const category = await productsRepository.findCategoryById(input.categoryId);
    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    const product = await productsRepository.createProduct({
      ...input,
      sellerId: user.id,
    });

    return mapProduct(product);
  },

  async update(id: string, input: UpdateProductInput, user: AuthRequest['user']) {
    assertAdminUser(user);

    const existing = await productsRepository.findById(id);
    if (!existing) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    if (input.categoryId) {
      const category = await productsRepository.findCategoryById(input.categoryId);
      if (!category) {
        throw new Error('CATEGORY_NOT_FOUND');
      }
    }

    const product = await productsRepository.updateProduct(id, input);
    return mapProduct(product);
  },

  async remove(id: string, user: AuthRequest['user']) {
    assertAdminUser(user);

    const existing = await productsRepository.findById(id);
    if (!existing) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const product = await productsRepository.softDelete(id);
    return mapProduct(product);
  },

  async listCategories() {
    return productsRepository.listCategories();
  },

  async createCategory(input: CreateCategoryInput, user: AuthRequest['user']) {
    assertAdminUser(user);

    const existing = await productsRepository.findCategoryByName(input.name);
    if (existing) {
      throw new Error('CATEGORY_ALREADY_EXISTS');
    }

    return productsRepository.createCategory(input);
  },
};
