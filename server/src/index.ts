import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import categoriesRoutes from './routes/categories.js';
import ordersRoutes from './routes/orders.js';
import profilesRoutes from './routes/profiles.js';
import postsRoutes from './routes/posts.js';
import contactRoutes from './routes/contact.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api', (_req, res) => {
  res.json({ status: 'ok', message: 'Texhaus B2B API' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/contact', contactRoutes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Erro interno do servidor' });
  void next;
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Texhaus B2B API rodando em http://0.0.0.0:${PORT}`);
});
