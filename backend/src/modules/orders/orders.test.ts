import type { Request, Response } from 'express';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

jest.mock('./orders.service', () => ({
  ordersService: {
    createOrder: jest.fn(),
    listOrders: jest.fn(),
    getOrder: jest.fn(),
  },
}));

const { ordersController } = require('./orders.controller') as typeof import('./orders.controller');
const { ordersService } = require('./orders.service') as typeof import('./orders.service');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
}

describe('Orders controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('retorna 401 quando create e chamado sem usuario autenticado', async () => {
    const req = { body: {} } as unknown as Request;
    const res = createRes();

    await ordersController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      }),
    );
  });

  it('retorna 400 quando payload de create e invalido', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      body: { items: [], shippingAddress: {} },
    } as unknown as Request;
    const res = createRes();

    await ordersController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      }),
    );
  });

  it('retorna 201 quando cria pedido com dados validos', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      body: {
        items: [{ productId: '11111111-1111-4111-8111-111111111111', quantity: 2 }],
        shippingAddress: {
          cep: '12345678',
          street: 'Rua Teste',
          number: '123',
          city: 'Sao Paulo',
          state: 'SP',
        },
      },
    } as unknown as Request;
    const res = createRes();
    (ordersService.createOrder as jest.Mock).mockResolvedValueOnce({ id: 'order-1' });

    await ordersController.create(req, res);

    expect(ordersService.createOrder).toHaveBeenCalledWith('user-1', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'order-1' } });
  });

  it('retorna 404 quando create recebe produto inexistente', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      body: {
        items: [{ productId: '11111111-1111-4111-8111-111111111111', quantity: 1 }],
        shippingAddress: {
          cep: '12345678',
          street: 'Rua Teste',
          number: '123',
          city: 'Sao Paulo',
          state: 'SP',
        },
      },
    } as unknown as Request;
    const res = createRes();
    (ordersService.createOrder as jest.Mock).mockRejectedValueOnce(
      new Error('Um ou mais produtos não encontrados ou inativos'),
    );

    await ordersController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'PRODUCT_NOT_FOUND' }),
      }),
    );
  });

  it('retorna 409 quando create recebe erro de estoque insuficiente', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      body: {
        items: [{ productId: '11111111-1111-4111-8111-111111111111', quantity: 2 }],
        shippingAddress: {
          cep: '12345678',
          street: 'Rua Teste',
          number: '123',
          city: 'Sao Paulo',
          state: 'SP',
        },
      },
    } as unknown as Request;
    const res = createRes();
    (ordersService.createOrder as jest.Mock).mockRejectedValueOnce(
      new Error('Estoque insuficiente para: Produto X'),
    );

    await ordersController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'INSUFFICIENT_STOCK' }),
      }),
    );
  });

  it('retorna 500 quando create recebe erro desconhecido', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      body: {
        items: [{ productId: '11111111-1111-4111-8111-111111111111', quantity: 1 }],
        shippingAddress: {
          cep: '12345678',
          street: 'Rua Teste',
          number: '123',
          city: 'Sao Paulo',
          state: 'SP',
        },
      },
    } as unknown as Request;
    const res = createRes();
    (ordersService.createOrder as jest.Mock).mockRejectedValueOnce(new Error('RANDOM_ERROR'));

    await ordersController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('retorna lista de pedidos do usuario autenticado', async () => {
    const req = { user: { id: 'user-1', role: 'CUSTOMER' } } as unknown as Request;
    const res = createRes();
    (ordersService.listOrders as jest.Mock).mockResolvedValueOnce([{ id: 'order-1' }]);

    await ordersController.list(req, res);

    expect(ordersService.listOrders).toHaveBeenCalledWith('user-1');
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'order-1' }] });
  });

  it('retorna 401 quando list e chamado sem usuario autenticado', async () => {
    const req = {} as unknown as Request;
    const res = createRes();

    await ordersController.list(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      }),
    );
  });

  it('retorna detalhe de pedido por id', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      params: { id: 'order-1' },
    } as unknown as Request;
    const res = createRes();
    (ordersService.getOrder as jest.Mock).mockResolvedValueOnce({ id: 'order-1' });

    await ordersController.getById(req, res);

    expect(ordersService.getOrder).toHaveBeenCalledWith('order-1', 'user-1');
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'order-1' } });
  });

  it('retorna 401 quando getById e chamado sem usuario autenticado', async () => {
    const req = { params: { id: 'order-1' } } as unknown as Request;
    const res = createRes();

    await ordersController.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      }),
    );
  });

  it('retorna 404 quando pedido nao existe no getById', async () => {
    const req = {
      user: { id: 'user-1', role: 'CUSTOMER' },
      params: { id: 'order-1' },
    } as unknown as Request;
    const res = createRes();
    (ordersService.getOrder as jest.Mock).mockRejectedValueOnce(new Error('Pedido não encontrado'));

    await ordersController.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'ORDER_NOT_FOUND' }),
      }),
    );
  });
});
