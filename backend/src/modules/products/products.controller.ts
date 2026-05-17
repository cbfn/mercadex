import type { Request, Response } from 'express';
import type { AuthRequest } from '../auth/auth.middleware';
import {
  CreateCategoryDto,
  CreateProductDto,
  ProductFiltersDto,
  UpdateProductDto,
} from './products.dto';
import { productsService } from './products.service';
import { SearchProductsDto } from './search-products.dto';
import { searchProductsService } from './search-products.service';

function getAuthUser(req: Request) {
  return (req as AuthRequest).user;
}

function getRouteId(req: Request) {
  const { id } = req.params;
  const raw = Array.isArray(id) ? id[0] : id;
  return raw ? Number(raw) : NaN;
}

function getErrorResponse(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'FORBIDDEN') {
      return {
        status: 403,
        body: {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Acesso restrito a administradores' },
        },
      };
    }

    if (error.message === 'PRODUCT_NOT_FOUND') {
      return {
        status: 404,
        body: {
          success: false,
          error: { code: 'PRODUCT_NOT_FOUND', message: 'Produto não encontrado' },
        },
      };
    }

    if (error.message === 'CATEGORY_NOT_FOUND') {
      return {
        status: 404,
        body: {
          success: false,
          error: { code: 'CATEGORY_NOT_FOUND', message: 'Categoria não encontrada' },
        },
      };
    }

    if (error.message === 'CATEGORY_ALREADY_EXISTS') {
      return {
        status: 409,
        body: {
          success: false,
          error: { code: 'CATEGORY_ALREADY_EXISTS', message: 'Categoria já existe' },
        },
      };
    }

    if (error.message === 'ADMIN_USER_NOT_FOUND') {
      return {
        status: 500,
        body: {
          success: false,
          error: { code: 'ADMIN_USER_NOT_FOUND', message: 'Usuário ADMIN não encontrado' },
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

export const productsController = {
  async search(req: Request, res: Response) {
    const parsed = SearchProductsDto.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Busca inválida',
          details: parsed.error.flatten(),
        },
      });
    }

    const data = await searchProductsService.execute(parsed.data);
    return res.json({ success: true, data });
  },

  async list(req: Request, res: Response) {
    if ('id' in req.query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_QUERY_PARAM',
          message: 'Use /api/products/:id para buscar um produto específico',
        },
      });
    }

    const parsed = ProductFiltersDto.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Filtros inválidos',
          details: parsed.error.flatten(),
        },
      });
    }

    const data = await productsService.list(parsed.data);
    return res.json({ success: true, data });
  },

  async getById(req: Request, res: Response) {
    try {
      const data = await productsService.getById(getRouteId(req));
      return res.json({ success: true, data });
    } catch (error) {
      const response = getErrorResponse(error);
      return res.status(response.status).json(response.body);
    }
  },

  async create(req: Request, res: Response) {
    const parsed = CreateProductDto.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos para produto',
          details: parsed.error.flatten(),
        },
      });
    }

    try {
      const data = await productsService.create(parsed.data);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      const response = getErrorResponse(error);
      return res.status(response.status).json(response.body);
    }
  },

  async update(req: Request, res: Response) {
    const parsed = UpdateProductDto.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos para atualização',
          details: parsed.error.flatten(),
        },
      });
    }

    try {
      const data = await productsService.update(getRouteId(req), parsed.data, getAuthUser(req));
      return res.json({ success: true, data });
    } catch (error) {
      const response = getErrorResponse(error);
      return res.status(response.status).json(response.body);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const data = await productsService.remove(getRouteId(req), getAuthUser(req));
      return res.json({ success: true, data });
    } catch (error) {
      const response = getErrorResponse(error);
      return res.status(response.status).json(response.body);
    }
  },

  async listCategories(_req: Request, res: Response) {
    const data = await productsService.listCategories();
    return res.json({ success: true, data });
  },

  async createCategory(req: Request, res: Response) {
    const parsed = CreateCategoryDto.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos para categoria',
          details: parsed.error.flatten(),
        },
      });
    }

    try {
      const data = await productsService.createCategory(parsed.data, getAuthUser(req));
      return res.status(201).json({ success: true, data });
    } catch (error) {
      const response = getErrorResponse(error);
      return res.status(response.status).json(response.body);
    }
  },
};
