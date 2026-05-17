const mockPrisma = {
  product: {
    findMany: jest.fn(),
  },
  order: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockTx = {
  order: {
    create: jest.fn(),
  },
  product: {
    update: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

import { ordersService } from './orders.service';

describe('ordersService', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockPrisma.$transaction.mockImplementation(async (callback: (tx: typeof mockTx) => unknown) =>
      callback(mockTx),
    );
  });

  it('createOrder cria pedido e decrementa estoque', async () => {
    const input = {
      items: [{ productId: 'product-1', quantity: 2 }],
      shippingAddress: {
        cep: '12345678',
        street: 'Rua Teste',
        number: '123',
        city: 'Sao Paulo',
        state: 'SP',
      },
    } as any;

    mockPrisma.product.findMany.mockResolvedValueOnce([
      { id: 'product-1', stock: 5, price: 100, title: 'Produto 1' },
    ]);
    mockTx.order.create.mockResolvedValueOnce({ id: 'order-1' });
    mockTx.product.update.mockResolvedValueOnce({ id: 'product-1', stock: 3 });

    const result = await ordersService.createOrder('user-1', input);

    expect(mockTx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          buyerId: 'user-1',
          totalPrice: 200,
        }),
      }),
    );
    expect(mockTx.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { stock: { decrement: 2 } },
    });
    expect(result).toEqual({ id: 'order-1' });
  });

  it('createOrder retorna erro quando ha produto ausente ou inativo', async () => {
    const input = {
      items: [
        { productId: 'product-1', quantity: 1 },
        { productId: 'product-2', quantity: 1 },
      ],
      shippingAddress: {
        cep: '12345678',
        street: 'Rua Teste',
        number: '123',
        city: 'Sao Paulo',
        state: 'SP',
      },
    } as any;

    mockPrisma.product.findMany.mockResolvedValueOnce([{ id: 'product-1', stock: 5, price: 10 }]);

    await expect(ordersService.createOrder('user-1', input)).rejects.toThrow(
      'Um ou mais produtos não encontrados ou inativos',
    );
  });

  it('createOrder retorna erro quando estoque e insuficiente', async () => {
    const input = {
      items: [{ productId: 'product-1', quantity: 3 }],
      shippingAddress: {
        cep: '12345678',
        street: 'Rua Teste',
        number: '123',
        city: 'Sao Paulo',
        state: 'SP',
      },
    } as any;

    mockPrisma.product.findMany.mockResolvedValueOnce([
      { id: 'product-1', stock: 1, price: 100, title: 'Produto 1' },
    ]);

    await expect(ordersService.createOrder('user-1', input)).rejects.toThrow(
      'Estoque insuficiente para: Produto 1',
    );
  });

  it('listOrders lista pedidos por buyerId em ordem desc', async () => {
    mockPrisma.order.findMany.mockResolvedValueOnce([{ id: 'order-1' }]);

    const result = await ordersService.listOrders('user-1');

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
      where: { buyerId: 'user-1' },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([{ id: 'order-1' }]);
  });

  it('getOrder retorna pedido quando pertence ao usuario', async () => {
    mockPrisma.order.findFirst.mockResolvedValueOnce({ id: 'order-1', buyerId: 'user-1' });

    const result = await ordersService.getOrder('order-1', 'user-1');

    expect(mockPrisma.order.findFirst).toHaveBeenCalledWith({
      where: { id: 'order-1', buyerId: 'user-1' },
      include: { items: { include: { product: true } } },
    });
    expect(result).toEqual({ id: 'order-1', buyerId: 'user-1' });
  });

  it('getOrder retorna erro quando pedido nao pertence ao usuario', async () => {
    mockPrisma.order.findFirst.mockResolvedValueOnce(null);

    await expect(ordersService.getOrder('order-1', 'user-2')).rejects.toThrow('Pedido não encontrado');
  });
});
