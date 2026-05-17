import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { categoriesRouter, productsRouter } from './modules/products/products.routes';
import { swaggerUiMiddleware } from './shared/swagger/swagger';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use('/api-docs', ...swaggerUiMiddleware);
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Backend rodando em http://localhost:${port}`);
  });

  // Mantém o processo vivo no ambiente de desenvolvimento.
  // Em runtime normal, o servidor HTTP já faria isso sozinho.
  process.stdin.resume();
}

export default app;
