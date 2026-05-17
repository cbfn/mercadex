import type { Request, Response } from 'express';
import type { AuthRequest } from '../auth/auth.middleware';
import { CreateReviewDto } from './reviews.dto';
import { reviewsService } from './reviews.service';

function getAuthUserId(req: Request) {
  return (req as AuthRequest).user?.id ?? null;
}

function getRouteId(req: Request) {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

function getErrorResponse(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'Você já avaliou este produto') {
      return {
        status: 409,
        body: {
          success: false,
          error: { code: 'CONFLICT', message: 'Você já avaliou este produto' },
        },
      };
    }

    if (error.message === 'Review não encontrada ou sem permissão') {
      return {
        status: 404,
        body: {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Review não encontrada' },
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

export const reviewsController = {
  /**
   * Lista as avaliações de um produto.
   */
  async listByProduct(req: Request, res: Response) {
    try {
      const data = await reviewsService.listReviews(getRouteId(req));
      return res.json({ success: true, data });
    } catch (error) {
      const response = getErrorResponse(error);
      return res.status(response.status).json(response.body);
    }
  },

  /**
   * Cria uma avaliação para o produto informado na rota.
   */
  async create(req: Request, res: Response) {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' },
      });
    }

    const parsed = CreateReviewDto.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos para review',
          details: parsed.error.flatten(),
        },
      });
    }

    try {
      const data = await reviewsService.createReview(userId, getRouteId(req), parsed.data);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      const response = getErrorResponse(error);
      return res.status(response.status).json(response.body);
    }
  },

  /**
   * Remove uma avaliação do usuário autenticado.
   */
  async remove(req: Request, res: Response) {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Usuário não autenticado' },
      });
    }

    try {
      const data = await reviewsService.deleteReview(getRouteId(req), userId);
      return res.json({ success: true, data });
    } catch (error) {
      const response = getErrorResponse(error);
      return res.status(response.status).json(response.body);
    }
  },
};
