import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/routes/api.ts';
import { createRateLimiter } from './server/security/rateLimit.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Basic security and parsing middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Disable x-powered-by header
  app.disable('x-powered-by');

  // Serve public assets (favicons, manifests, etc.)
  const publicPath = path.resolve(__dirname, 'public');
  app.use(express.static(publicPath));

  // Rate Limiting: 60 requests per minute per IP
  const limiter = createRateLimiter({
    maxRequests: 60,
    windowMs: 60 * 1000,
  });
  app.use('/api', limiter);

  // Mount API routes
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  if (isProduction) {
    // In production, serve the built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // In development, integrate Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MediaFetch Server] Running at http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[MediaFetch Server] Failed to start:', err);
  process.exit(1);
});
