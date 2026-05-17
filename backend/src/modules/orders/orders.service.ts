import type { z } from 'zod';
import { prisma } from '../../shared/db/prisma';
import type { CreateOrderDto } from './orders.dto';

export const ordersService = {
  /**
   * Cria um pedido a partir dos itens enviados pelo frontend (localStorage).
   * Valida estoque de cada produto e calcula o total antes de persistir.
   *
   * @param userId - ID do usuário autenticado
   * @param input - DTO com array de itens e endereço de entrega
   */
  async createOrder(userId: string, input: z.infer<typeof CreateOrderDto>) {
    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    if (products.length !== productIds.length) {
      throw new Error('Um ou mais produtos não encontrados ou inativos');
    }

    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para: ${product.title}`);
      }
    }

    const totalPrice = input.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyerId: userId,
          totalPrice,
          shippingAddress: input.shippingAddress,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: products.find((p) => p.id === item.productId)!.price,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of input.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });
  },

  /** Lista pedidos do usuário. @param userId - ID do usuário */
  async listOrders(userId: string) {
    return prisma.order.findMany({
      where: { buyerId: userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  /** Retorna detalhe de um pedido verificando ownership. */
  async getOrder(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, buyerId: userId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new Error('Pedido não encontrado');
    return order;
  },
};