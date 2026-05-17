import { z } from 'zod';

export const CreateProductDto = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  condition: z.enum(['NOVO', 'EXCELENTE', 'BOM', 'USADO']),
  categoryId: z.number().int().positive(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).default([]),
});

export const UpdateProductDto = CreateProductDto.partial();

export const ProductFiltersDto = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  condition: z.enum(['NOVO', 'EXCELENTE', 'BOM', 'USADO']).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const CreateCategoryDto = z.object({
  name: z.string().min(2).max(120),
  description: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductDto>;
export type UpdateProductInput = z.infer<typeof UpdateProductDto>;
export type ProductFiltersInput = z.infer<typeof ProductFiltersDto>;
export type CreateCategoryInput = z.infer<typeof CreateCategoryDto>;
