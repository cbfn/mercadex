import { z } from 'zod';

export const CreateOrderDto = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1).max(99),
    })
  ).min(1, 'Carrinho não pode estar vazio'),
  shippingAddress: z.object({
    cep: z.string().length(8),
    street: z.string().min(3),
    number: z.string().min(1),
    complement: z.string().optional(),
    city: z.string().min(2),
    state: z.string().length(2),
  }),
});