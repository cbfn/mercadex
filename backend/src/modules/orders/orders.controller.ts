import type { Request, Response } from 'express';
import type { AuthRequest } from '../auth/auth.middleware';
import { CreateOrderDto } from './orders.dto';
import { ordersService } from './orders.service';

function getAuthUserId(req: Request) {
  return (req as AuthRequest).user?.id ?? null;
}

function getRouteId(req: Request) {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

function getErrorResponse(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'Um ou mais produtos não encontrados ou inativos') {
      return {
        status: 404,
        body: {
          success: false,
          error: { code: 'PRODUCT_NOT_FOUND', message: 'Um ou mais produtos não encontrados' },
        },
      };
    }

    if (error.message.startsWith('Estoque insuficiente para:')) {
      return {
        status: 409,
        body: {
          success: false,
          error: { code: 'INSUFFICIENT_STOCK', message: error.message },
        },
      };
    }

    if (error.message === 'Pedido não encontrado') {
      return {
        status: 404,
        body: {
          success: false,
          error: { code: 'ORDER_NOT_FOUND', message: 'Pedido não encontrado' },
        },
      };
    }
  }

  return {
    status: 500,
    body: {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno' },
    },
  };
}

export const ordersController = {
  async create(req: Request, res: Response) {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' },
      });
    }

    const parsed = CreateOrderDto.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos para criação do pedido',
          details: parsed.error.flatten(),
        },
      });
    }

    try {
      const data = await ordersService.createOrder(userId, parsed.data);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      const response = getErrorResponse(error);
      return res.status(response.status).json(response.body);
    }
  },

  async list(req: Request, res: Response) {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' },
      });
    }

    try {
      const data = await ordersService.listOrders(userId);
      return res.json({ success: true, data });
    } catch (error) {
      const response = getErrorResponse(error);
      return res.status(response.status).json(response.body);
    }
  },

  async getById(req: Request, res: Response) {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' },
      });
    }

    try {
      const data = await ordersService.getOrder(getRouteId(req), userId);
      return res.json({ success: true, data });
    } catch (error) {
      const response = getErrorResponse(error);
      return res.status(response.status).json(response.body);
    }
  },
};
