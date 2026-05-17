import { z } from 'zod';

export const CreateReviewDto = z.object({
  title: z.string().min(3).max(100),
  body: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
});