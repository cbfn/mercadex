import { z } from 'zod';

export const SearchProductsDto = z.object({
  q: z.string().min(1).max(255),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export type SearchProductsInput = z.infer<typeof SearchProductsDto>;
