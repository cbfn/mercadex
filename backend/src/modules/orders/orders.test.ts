import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

jest.mock('../auth/auth.middleware', () => ({
  authenticate: (req: any, _res: unknown, next: () => void) => {
    req.user = { id: 'user-1', role: 'CUSTOMER' };
    next();
  },
  requireAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock('./orders.service', () => ({
  ordersService: {
    createOrder: jest.fn(),
    listOrders: jest.fn(),
    getOrder: jest.fn(),
  },
}));

import app from '../../server';
import { ordersService } from './orders.service';

const mockedOrdersService = ordersService as jest.Mocked<typeof ordersService>;

describe('Orders routes', () => {
  beforeEach(() => {
    mockedOrdersService.createOrder.mockReset();
    mockedOrdersService.listOrders.mockReset();
    mockedOrdersService.getOrder.mockReset();
  });

  it('cria pedido autenticado com payload valido', async () => {
    mockedOrdersService.createOrder.mockResolvedValueOnce({ id: 'order-1' } as any);

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId: '11111111-1111-4111-8111-111111111111', quantity: 1 }],
        shippingAddress: {
          cep: '12345678',
          street: 'Rua Teste',
          number: '123',
          city: 'Sao Paulo',
          state: 'SP',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockedOrdersService.createOrder).toHaveBeenCalledWith('user-1', expect.any(Object));
  });

  it('retorna 400 quando payload de criacao e invalido', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('lista pedidos do usuario autenticado', async () => {
    mockedOrdersService.listOrders.mockResolvedValueOnce([{ id: 'order-1' }] as any);

    const res = await request(app).get('/api/orders');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(mockedOrdersService.listOrders).toHaveBeenCalledWith('user-1');
  });

  it('retorna pedido por id para o usuario autenticado', async () => {
    mockedOrdersService.getOrder.mockResolvedValueOnce({ id: 'order-1' } as any);

    const res = await request(app).get('/api/orders/order-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockedOrdersService.getOrder).toHaveBeenCalledWith('order-1', 'user-1');
  });

  it('retorna 404 quando pedido nao e encontrado', async () => {
    mockedOrdersService.getOrder.mockRejectedValueOnce(new Error('Pedido não encontrado'));

    const res = await request(app).get('/api/orders/order-inexistente');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ORDER_NOT_FOUND');
  });
});
