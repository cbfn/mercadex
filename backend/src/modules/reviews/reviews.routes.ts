import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import { reviewsController } from './reviews.controller';

export const reviewsRouter = Router();

reviewsRouter.get('/products/:id/reviews', reviewsController.listByProduct);
reviewsRouter.post('/products/:id/reviews', authenticate, reviewsController.create);
reviewsRouter.delete('/reviews/:id', authenticate, reviewsController.remove);
