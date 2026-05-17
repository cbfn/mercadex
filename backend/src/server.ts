import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import "dotenv/config";
import authRoutes from './modules/auth/auth.routes';
import { categoriesRouter, productsRouter } from './modules/products/products.routes';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  }),
);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend rodando em http://localhost:${port}`);
  });

  // Mantém o processo vivo no ambiente de desenvolvimento.
  // Em runtime normal, o servidor HTTP já faria isso sozinho.
  process.stdin.resume();
}

export default app;
