import { Router } from 'express';
import { authenticate, requireAdmin } from '../auth/auth.middleware';
import { productsController } from './products.controller';

export const productsRouter = Router();
export const categoriesRouter = Router();

productsRouter.get('/search', productsController.search);
productsRouter.get('/', productsController.list);
productsRouter.get('/test', (_req, res) => {
    return res.json({ teste: 'Teste Funcionando dentro de Products' });
});
productsRouter.get('/:id', productsController.getById);
productsRouter.post('/', productsController.create);
productsRouter.put('/:id', authenticate, requireAdmin, productsController.update);
productsRouter.delete('/:id', authenticate, requireAdmin, productsController.remove);

categoriesRouter.get('/', productsController.listCategories);
categoriesRouter.post('/', productsController.createCategory);
categoriesRouter.get('/test', (_req, res) => {
    return res.json({ teste: 'Teste Funcionando dentro de Categories' });
});
