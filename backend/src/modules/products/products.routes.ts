import { Router } from 'express';
import { authenticate, requireAdmin } from '../auth/auth.middleware';
import { productsController } from './products.controller';

export const productsRouter = Router();
export const categoriesRouter = Router();

productsRouter.get('/', productsController.list);
productsRouter.get('/:id', productsController.getById);
productsRouter.post('/', authenticate, requireAdmin, productsController.create);
productsRouter.put('/:id', authenticate, requireAdmin, productsController.update);
productsRouter.delete('/:id', authenticate, requireAdmin, productsController.remove);

categoriesRouter.get('/', productsController.listCategories);
categoriesRouter.post('/', authenticate, requireAdmin, productsController.createCategory);
