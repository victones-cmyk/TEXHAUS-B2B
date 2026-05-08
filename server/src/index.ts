import 'dotenv/config';
import express from 'express';
import cors, { CorsOptions } from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import categoriesRoutes from './routes/categories.js';
import ordersRoutes from './routes/orders.js';
import profilesRoutes from './routes/profiles.js';
import postsRoutes from './routes/posts.js';
import contactRoutes from './routes/contact.js';
import shippingRoutes from './routes/shipping.js';
import paymentsRoutes from './routes/payments.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5100', 10);

const envOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const allowedOrigins = envOrigins.length > 0 ? envOrigins : ['http://localhost:5173'];

const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

const rateLimitWindow = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '', 10);
const rateLimitMax = Number.parseInt(process.env.RATE_LIMIT_MAX ?? '', 10);

const apiLimiter = rateLimit({
  windowMs: Number.isFinite(rateLimitWindow) && rateLimitWindow > 0 ? rateLimitWindow : 15 * 60 * 1000,
  limit: Number.isFinite(rateLimitMax) && rateLimitMax > 0 ? rateLimitMax : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Limite de requisições excedido. Tente novamente mais tarde.' },
  skip: (req) => req.method === 'OPTIONS',
});

app.use('/api', apiLimiter);

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
app.use('/api/shipping-methods', shippingRoutes);
app.use('/api/payment-methods', paymentsRoutes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Erro interno do servidor' });
  void next;
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Texhaus B2B API rodando em http://0.0.0.0:${PORT}`);
});
